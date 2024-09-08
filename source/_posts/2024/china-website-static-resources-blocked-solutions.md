---
tags:
  - 架构设计
title: 记网站静态资源国内区域回源海外被墙及解决方式
date: 2024-09-08 14:59:26
keywords: 对象存储, S3, OSS, 多区域部署, 云服务商
description: 本文记录了在网站多区域部署的情况下，中国区的静态资源回源到海外区失败以及解决方式
---

# 背景
目前管理的一个网站，主要用户群体是北美，欧洲，与中国地区。早之前选用的云服务商的亚马逊。静态资源原链路大概如下（从左往右）：

| 区域   | CDN            | 源站  |
| ---- | -------------- | --- |
| 全球用户 | AWS CloudFront | S3  |

但是通过监控来看中国区用户访问速度并不太理想。关于CDN的节点，我们看看

# CloudFront各州节点情况
## 北美区
![cloudfront 北美节点数](https://github.com/user-attachments/assets/9a79fce3-5976-4d9b-a334-b95649ce4cb9)

## 欧洲区
![CloudFront 欧洲区节点](https://github.com/user-attachments/assets/1d6da487-b167-448c-84b0-93acd284036a)

## 亚太区
![CloudFront 亚洲区节点](https://github.com/user-attachments/assets/cf9ed303-7e40-47b0-af01-d0fd182a3a54)

AWS主营业务在海外，中国区只有深圳、香港、北京、台北桃园、中卫几个节点。所以中国区的用户，静态资源下载的速度并不十分理想

# 优化链路 - 增加中国区云服务商
在国内的CDN，增加了阿里云云服务托管，并且选用了阿里云的对象存储，于是访问链路变成（从左往右）

| 区域   | CDN            | 源站           |
| ---- | -------------- | ------------ |
| 中国用户 | 阿里云CDN         | 阿里云对象存储（OSS） |
| 全球用户 | AWS CloudFront | AWS S3       |

由于阿里云在中国区的节点数量多，于是国内用户访问的速度就快了一个档次。

# 新问题 - 中国区访问资源偶尔失败
近期出现新上传的资源, 中国地区的用户访问失败

![resource error](https://github.com/user-attachments/assets/2f4d7ca2-4459-4923-b528-31e5d09a783e)

通过上面的信息初步可以推断出来是国内回源出现了问题。实际上，我们的静态资源链路拓扑图是这样的：


![站点拓扑图](https://github.com/user-attachments/assets/7cdf801d-f286-4d45-b2f9-722eda3902af)


中国区的架构是后面才新增的，原本的运营后台传输资源只是会上传在海外服务。
所以对于中国区的服务，配置的策略是：如果国内OSS没有资源，则会回源到海外去获取资源再缓存。
## 问题原因
本次出问题就出在红色的线路，海外回源的策略上。
阿里云OSS使用aws cloudfront的提供的默认CDN域名作为回源(xxx.cloudfront.com), 由于 \*.cloudfront.com 相关域名会被一些中国区认定灰产的内容所引用，所以xxx.cloudfront相关的域名容易被墙。

# 解决方式
知道问题之后就好办了，有两种方式可以解决
## 方式一：中国区回源海外域名备案
更换一个中国区备案的域名，用来做回源使用。
次解决方案，而且可以通过OSS资源预热的形式，让资源主动进入OSS里面缓存，如果网络抖动也可以通过增加重试的形式，基本能成功。

![image](https://github.com/user-attachments/assets/cc70d18f-3600-4995-acdf-7b2302947e20)

## 方式二: 主动写入中国区

用回源的方式一个问题为，国内的资源是采取被动的形式才生成的。那么可以采取主动写入的形式。即：同时往中国区写入内容。这个要求我们写入的服务访问中国以及海外的网络都稳定。所以，一个比较理想的部署方式是，运营后台迁移到香港地区。如此网站的拓扑变成：

![image](https://github.com/user-attachments/assets/9dee2979-ddbb-4d2f-8d64-fcf0de62851d)


# 总结
稳定性方面，方案二要比方案一稳定得多。因为方案一采取被动加重试来进行稳定保障，而方案二是主动掌握稳定性。
但是结合成本上来说，方案一只需要简单变更，而且不涉及链路调整，仅仅是修改回源别名。简单有效，所以本次解决被墙的问题采用了方案一，最终墙的问题顺利解决。

# reference
- [Amazon CloudFront Key Features](https://aws.amazon.com/cloudfront/features/?nc1=h_ls&whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc)