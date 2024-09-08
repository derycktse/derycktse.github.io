---
tags:
  - AWS
  - 对象存储
title: 使用AWS SDK操作阿里云OSS
date: 2024-08-17 11:21:04
description: 本文介绍如何使用AWS SDK操作阿里云OSS，通过兼容API简化跨云存储管理，以实现高效的对象存储。
keywords: AWS SDK, 腾讯云, 阿里云, 对象存储, S3, OSS, 多区域部署, 云服务商
---
在架构设计上，一些容灾做的比较好的网站可能会采用多区域部署。

有的服务采用同一个云服务商的不同区域的服务。而有一些解决方案，在综合可用性，费用等实际情况考量下，可能会选用不同的云服务商。

在实际实践中，我就遇到了不同区域选用不同的云服务商的场景: 网站使用对象存储来管理。海外使用的云服务商是AWS, 中国区域使用的是阿里云。
两家云服务商分别有自己的对象存储服务，分别是：aws s3 与 阿里云OSS。

| 区域  | 云服务商 | 对象存储服务                                    |
| --- | ---- | ----------------------------------------- |
| 中国区 | 阿里云  | [OSS](https://www.aliyun.com/product/oss) |
| 海外区 | 亚马逊  | [S3](https://aws.amazon.com/s3/)          |


![image](https://github.com/user-attachments/assets/c8da10a4-1369-41cb-b153-339c098362b6)


在代码实现上，我们往往需要同时引入aws跟aliyun 对象存储的sdk。
部署在海外的服务，上传文件到s3。部署在国内的服务，上传文件到阿里云oss。

所以，在服务里，往往需要同时引用双方的SDK，并针对性进行内容上传。

```js
const AWS = require('aws-sdk');
const OSS = require('ali-oss')

// 如果是海外，则操作AWS S3, 否则使用阿里云 SS
if (isOversea) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: bucket,
    Key: key,
    Body: file,
  };
  s3.upload(params, (err, data) => {
    if (err) {
      return reject(new Error('upload failed!'));
    }
    return resolve();
  });
} else {
  const client = new OSS({
    "region": "oss-cn-hangzhou",
    "accessKeyId": "",
    "accessKeySecret": "",
    "bucket": ""
  })

  client.put(key, file)
    .then(data => {
      return resolve()
    }).catch(ex => {
      console.log('err', ex)
    })
}
```

最近在做功能对接的时候，阅读阿里云官方文档，发现阿里云官方声明支持使用aws的sdk进行操作oss。

> 对象存储OSS提供了兼容Amazon S3的API。当您将数据从Amazon S3迁移到OSS后，只需简单的配置修改，即可让您的客户端应用轻松兼容OSS服务。本文主要介绍如何通过不同开发平台的S3 SDK完成初始化配置，然后使用S3 SDK接口访问OSS资源。

需要将上传的`endpoint`进行调整即可，阿里云已经在数据层面对AWS的SDK进行了兼容。

# 代码同构
```js
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: "OSS_AccessKeyId",
    secretAccessKey: "OSS_AccessKeySecret",
    region: "oss-cn-hangzhou",
    endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
});

s3 = new AWS.S3({apiVersion: '2006-03-01'});
```

# 踩坑
使用此种代码同构的方式，在测试过程中出现了异常。
这个异常出现的场景：如果同一个应用，同时操作S3与OSS，就会出现操作对象存储失败。
原因则是因为，使用构建函数的配置update enpoint的方式, 会切换所有对象存储的`endpoint` , 结果让数据要么统一到aws, 要么统一到阿里云

```js
AWS.config.update({
    accessKeyId: "OSS_AccessKeyId",
    secretAccessKey: "OSS_AccessKeySecret",
    region: "oss-cn-hangzhou",
    endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',  // 出现问题的地方
});
```

# 优化
在AWS SDK的文档可以看到，S3的客户端支持实例化的方式，只需要在实例的时候，针对实例进行初始化配置即可。即**使用工厂模式而非单例模式**
重新调整代码：
```js
const AWS = require('aws-sdk');

/**
 * 针对性传入aliyun 或者 aws的配置，如果有多个客户端，那就初始化多个实例
 */
const initConfiguration = {
  apiVersion: '',
  accessKeyId: '',
  accessKeySecret: '',
  region: '',
  endpoint: '',
};

// 每次初始化一个实例并指定endpoint.
this.client = new AWS.S3({
  apiVersion: initConfiguration.apiVersion,
  accessKeyId: initConfiguration.accessKeyId,
  secretAccessKey: initConfiguration.accessKeySecret,
  region: initConfiguration.region,
  endpoint: initConfiguration.endpoint,
});
```

如此一份兼容S3 与 OSS的 代码片段便大功告成了

横向对比可以发现，现在业界许多对象存储，除了阿里云OSS，腾讯云COS，同样都能使用 AWS 的SDK来操作他们的对象存储，因为他们都遵循AWS的 Simple Storage Service规范。
# 参考
- [使用Amazon S3 SDK访问OSS](https://www.alibabacloud.com/help/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss#section-2ri-suq-pb3)
- [使用 AWS S3 SDK 访问 COS](https://cloud.tencent.com/document/product/436/37421)