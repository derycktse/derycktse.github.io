---
date: 2025-04-01 12:13:00
title: 关于跨域cookie的传输-你需要知道的事
tags: 
  - network
description: 日常踩坑，跨域传输cookie的关键点：需设置Access-Control-Allow-Origin为具体域名，配置SameSite=None和Secure属性，并强调了安全性问题。

---
# 背景

今天在对接一个业务，涉及到跨域但是需要透传cookie，本来以为自己已经熟悉浏览器的运作机制了，没想到又踩了个坑，在此记录一下。
背景大概是我所负责的A团队业务，需要调用B团队的接口，这是两个不同二级域名的业务，其中，涉及到业务A需要透传cookie到业务B（这种设计本身存在不合理性和安全隐患）。

# 问题

假设现在业务的两个域名为：
业务A: www.example.com
业务B: api.example.org

为了验证调用正常，我提前在浏览器做了测试。

事先已经知道了肯定会有跨域问题，由于B团队还没有配置跨域白名单. 我使用抓包工具为 api.example.org 添加了所需的响应头。

```http
GET /data HTTP/1.1
Host: api.example.org
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```
然后我很快写了个异步测试代码

```javascript
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include', // 传输cookie
});
```

然而，浏览器仍然显示跨域请求失败。
![alt text](../../images/cross-domain-cookie-transmission.png)
<!-- ![](https://github.com/user-attachments/assets/d53e20e7-5c77-44e9-a03f-01223def2c54) -->

但我注意到，第一个请求preflight是200的，而第二个请求才报跨域错误。

# 分析
查阅了MDN文档，发现有一句话值得注意：

> Including credentials in cross-origin requests can make a site vulnerable to CSRF attacks, so even if credentials is set to include, the server must also agree to their inclusion by including the `Access-Control-Allow-Credentials` header in its response. Additionally, in this situation the server must explicitly specify the client's origin in the `Access-Control-Allow-Origin` response header (that is, `*` is not allowed).

这段说明直接指出了问题的根源，在跨域的请求中，携带凭证（在这里是cookie）存在CSRF攻击的风险，浏览器要求服务端除了需要设置`Access-Control-Allow-Credentials`为`true`，还需要设置`Access-Control-Allow-Origin`为客户端具体的host，不能设置为`*`。而我出现的问题就是因为设置了`*`导致。

# cookie的属性
同时，文档还提到一个需要注意的地方
> Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.

所以，即使我们设置好了`Access-Control-Allow-Origin`，还需要注意，不是所有的cookie都会被发送。只有cookie的`SameSite`属性设置为`None`，才会被发送。而`SameSite`属性设置为`None`，则需要设置`Secure`属性，表示该cookie只能在https协议下传输。
一般来说，chrome的cookie默认`SameSite`属性设置为`Lax`，因此，在这种场景下，还需要对想传输的cookie设置`SameSite=None`和`Secure`。

# 总结
1. 跨域请求，如果想透传cookie，需要设置`Access-Control-Allow-Origin`为客户端具体的host，不能设置为`*`。
2. cookie的`SameSite`属性设置为`None`，才会被发送。而`SameSite`属性设置为`None`，则需要设置`Secure`属性，表示该cookie只能在https协议下传输。
3. 另外，其实浏览器端做了这么多的限制，其实还是因为安全问题，那么对于业务A需要透传cookie到业务B，其实还是需要重新考虑业务的合理性。

# reference
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)