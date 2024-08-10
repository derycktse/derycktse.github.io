---
tags:
  - network
title: 什么是OCSP
date: 2024-07-28 20:58
---

最近公司的服务遇到了个问题，一些内容在iOS里面需要十几二十秒的白屏之后才能显示正常。定位到最后发现是OCSP的问题。

# OCSP是什么
OCSP（Online Certificate Status Protocol，在线证书状态协议）是一种用于检查数字证书状态的网络协议。OCSP的主要功能是验证证书的有效性，以确定其是否被吊销。

OCSP是作为证书吊销列表CRL而出现的。 CRL是一个维护已撤销证书的列表，由浏览器下载，检查客户端访问的网站证书是否被撤销。但随着证书越来越多，这种黑名单机制势必性能会变差，因此有了OCSP协议。

## OCSP的工作流程
OCSP的工作流程大致如下：
1. **客户端请求**：客户端向OCSP服务器发送一个请求，包含需要验证的证书的标识信息。
2. **OCSP服务器响应**：OCSP服务器查询其数据库，返回该证书的状态信息。
3. **客户端处理**：客户端根据OCSP服务器的响应，决定是否信任该证书。

![image](https://github.com/user-attachments/assets/551e6b2b-eb17-4d73-91c9-8d03ccba87ff)
[图片来源](https://www.ssl.com/faqs/faq-digital-certificate-revocation/)

OCSP的优点包括：
- **实时性**：OCSP提供了实时的证书状态信息，而CRL可能会有延迟。
- **效率**：OCSP请求通常比下载整个CRL文件要小得多，节省了带宽和时间。

OCSP有一些潜在的缺点，例如：

- **隐私问题**：每次验证证书时，客户端需要与OCSP服务器通信，这可能会暴露用户的浏览行为。
- **可用性问题**：如果OCSP服务器不可用，客户端可能无法验证证书的状态。

# OCSP Stapling
OCSP Stapling（OCSP 封套），是指服务端在证书链中包含颁发机构对证书的 OCSP 查询结果。这是一种向浏览器提供撤销信息的技术。证书stapling过程涉及将当前的OCSP响应附加到HTTPS连接中。这样，服务器和浏览器之间的流量就会减少，因为浏览器不再需要自行请求OCSP。这有助于解决上述的隐私和性能问题。

# 问题所在
OCSP一个最大的问题就是实时查询的时候，会影响到性能
公司使用的证书是Godaddy，Godaddy并没有中国区，所以中国iOS区域的用户在OCSP这一步出现了访问的时间延长。

<img width="548" alt="image" src="https://github.com/user-attachments/assets/9641c3ea-f6f1-4c6b-8134-1401644ac179">

# 查看网站证书概要
```sh
echo | openssl s_client -servername example.com -connect example.com:443 | openssl x509 -noout -issuer
```

<img width="1243" alt="image" src="https://github.com/user-attachments/assets/1f955a07-d568-4f07-aa56-a3f669800ce3">

# 处理方案
考虑到国内用户的体量与部署，我们最终将网站的证书切换到了有国内部署的global sign

# reference
- [What Is Online Certificate Status Protocol (OCSP)?](https://www.fortinet.com/resources/cyberglossary/ocsp)
- [FAQ: Digital Certificate Revocation](https://www.ssl.com/faqs/faq-digital-certificate-revocation/)