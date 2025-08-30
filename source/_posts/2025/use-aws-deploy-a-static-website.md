---
title: 使用AWS部署一个静态网站
tags:
  - AWS
  - Serverless
date: 2025-08-17 21:00:00
description: 本文介绍了如何使用AWS S3和CloudFront结合lambda@edge 部署一个静态网站。
---
# 背景
最近准备部署一个纯静态的网站。考虑到一些业务合规上的要求，需要将站点部署在美国，于是选用了AWS服务。

之前也使用过AWS的静态托管服务`amplify`, 不过出于一些分工上的管理，最终决定直接使用`S3`加`CloudFront`来部署静态网站。

整个站点的链路非常之简单：
```
用户访问 -> CloudFront -> S3
```

这是一个非常简单的静态页面访问链路：
1. 使用AWS对象存储服务S3来存储静态页面
2. 使用CloudFront 用于边缘节点的加速访问和缓存。

# s3
## 权限设置
S3文件由于有条件开放，所以设置私有桶
```sh
# 查询桶权限
aws s3api get-public-access-block --bucket [bucket-name]

# 结果
{
    "PublicAccessBlockConfiguration": {
        "BlockPublicAcls": true,
        "IgnorePublicAcls": true,
        "BlockPublicPolicy": true,
        "RestrictPublicBuckets": true
    }
}
```

设置成私有桶可以有效做一些文件防护，防止外部直接通过 s3的endpoint访问到我们的源文件。

这样下来, 链路上的策略需要做一些调整
```
用户访问 -> CloudFront -> S3(私有桶)
```

由于目标S3已经设置成私有桶，那么对于目标cloudfront的访问，需要对其授权，我们通过对桶策略增加cloudfront的访问允许，保证cloudfront能够回源

```json
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject", // 对s3的只读权限
      "Resource": "arn:aws:s3:::[bucket-name]/*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": [ // 针对特定的cloudfront访问
            "arn:aws:cloudfront::[account-id]:distribution/[Cloudfrontid]",
          ]
        }
      }
    }
  ]
}
```

## 文件目录设计

出于管理的需要，实际上对应的s3目录，会有一些路径前缀，这样一个好处是以后可以继续拓展站点版本或者是多个业务放置在同一个s3目录里。比如前缀 `/test/v1/`

| 用户路径        | 实际s3路径              | http 状态码 | 说明                  |
| ----------- | ------------------- | -------- | ------------------- |
| /           | /test/v1/index      | 200      | 特殊，用户路径与S3文件不一样     |
| /page-1     | /test/v1/page-1     | 200      |                     |
| /page-2     | /test/v1/page-2     | 200      |                     |
| /blog/blog1 | /test/v1/blog/blog1 | 200      |                     |
| /blog/blog2 | /test/v1/blog/blog2 | 200      |                     |
| /404        | /test/v1/404        | 404      | 特殊，404页面，http 状态码特殊 |
如果以后网站需要做备份或者是内容升级，可以从使用 v2, v3 等进行，保证能快速迭代以及回滚

但是，CloudFront 并不支持路径重写，这个时候我们就必须引入云函数了。

# lambda
lambda是AWS提供的无服务器计算服务，在这里我们主要讨论的是lambda@edge

引入云函数，主要是希望云函数来实现这样的功能：
1. 希望基于用户请求的路径重写
2. 一些特殊的状态码
3. 可能后续鉴权拓展工作

注意：lambda关联在CloudFront上，lambda需要使用美国弗吉尼亚的us-east-1区域部署，才能生效
## 权限配置
这里比较麻烦的地方是配置权限。这里有一个经验：有多个函数的情况下，同一业务的多个函数可以分配统一的IAM role执行角色。
### 创建统一的role
譬如一个给博客网站所使用的lambda role : blog-lambda-role

![role-1](/images/lambda@edge-role-1.png)
![role-2](/images/lambda@edge-role-2.png)

注意：默认创建的lambda函数，创建的role角色里，不会认为是要关联给 CloudFront的，所以要手动添加信任域
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "lambda.amazonaws.com",
                    "edgelambda.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```
## 创建和发布lambda@edge
![](/images/image-use-aws-deploy-a-static-website-20250817204641.png)
![](/images/image-use-aws-deploy-a-static-website-20250817204804.png)

#  CloudFront

### 关联lambda
复制发布成功后的lambda 版本的arn，在CloudFront控制台行为关联即可
![](/images/image-use-aws-deploy-a-static-website-20250817204424.png)
## 设置默认的首页
一般网站默认首页根路径为 `/`，而源站如果S3里放置 `/` 文件，有时候会被忽略管理，在这里我们设为 `/index`, CloudFront提供自定义根文件的映射能力。即将 `/` 映射到源站的 `/index`文件。
![](/images/image-use-aws-deploy-a-static-website-20250817205635.png)
![](/images/image-use-aws-deploy-a-static-website-20250817205651.png)

## 自定义错误页面
此外，如果源站s3文件不存在，则可能响应 http status code `403` 或 `404`, 为了保证用户访问的友好， CloudFront提供自定义错误页面的能力，对此配置异常状态码时，响应我们配置好的错误页面 `/404`
![](/images/image-use-aws-deploy-a-static-website-20250817210043.png)
## JSON 示例
可通过aws cli获取 CloudFront配置
```sh
aws cloudfront get-distribution-config --id [CloudFront ID] --output json
```

结果示例
```json
{
    "DistributionConfig": {
        "Aliases": {
            "Quantity": 1,
            "Items": [
                "www.example"
            ]
        },
        "DefaultRootObject": "/index",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "xxx",
                    "DomainName": "your-bucket.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                        "Quantity": 0
                    },
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    },
                    "ConnectionAttempts": 3,
                    "ConnectionTimeout": 10,
                    "OriginShield": {
                        "Enabled": false
                    },
                    "OriginAccessControlId": "xxx"
                }
            ]
        },
        "DefaultCacheBehavior": {
            "LambdaFunctionAssociations": {
                "Quantity": 2,
                "Items": [
                    {
                        "LambdaFunctionARN": "arn:aws:lambda:us-east-1:account-id:function:lambda-edge-origin-request-test:1",
                        "EventType": "origin-request",
                        "IncludeBody": false
                    },
                    {
                        "LambdaFunctionARN": "arn:aws:lambda:us-east-1:account-id:function:lambda-edge-origin-response-test:1",
                        "EventType": "origin-response",
                        "IncludeBody": false
                    }
                ]
            }
        },
        "CustomErrorResponses": {
            "Quantity": 2,
            "Items": [
                {
                    "ErrorCode": 404,
                    "ResponseCode": "404",
                    "ResponsePagePath": "/404",
                    "ErrorCachingMinTTL": 0
                },
                {
                    "ErrorCode": 403,
                    "ResponseCode": "404",
                    "ResponsePagePath": "/404",
                    "ErrorCachingMinTTL": 0
                }
            ]
        }
    }
}
```


## 后续lambda函数更新流程
1. 更新函数
2. 发布新版本函数
3. 重新在CloudFront关联新函数