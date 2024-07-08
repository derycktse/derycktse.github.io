---
date: 2024-07-06 16:43:30
title: 使用Nginx Server Side Includes
---

# 什么是Server Side Includes
我们来看看维基百科是怎么解释的:
> **服务器端内嵌**（**Server Side Includes，亦简称为SSI**）是一种大多数仅应用于[互联网](https://zh.wikipedia.org/wiki/%E4%BA%92%E8%81%94%E7%BD%91 "互联网")上的简单解释性[服务器端脚本](https://zh.wikipedia.org/wiki/%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E8%84%9A%E6%9C%AC "服务器端脚本")语言。
> SSI最常见的用法是将一个或多个文件的内容包含在[网页服务器](https://zh.wikipedia.org/wiki/%E7%BD%91%E9%A1%B5%E6%9C%8D%E5%8A%A1%E5%99%A8 "网页服务器")的页面上。例如，一张包含每日报价的页面可以通过下面一段代码将报价单包含在页面中：

```html
<!--#include virtual="../quote.txt" -->
```

**SSI 简称代码片段，通过特殊的语法糖，服务器在响应的时候遇到相关指令，会发起另外的请求（subrequest）去请求对应的代码片段之后嵌入到父页面中，从而实现页面在服务端拼接**

### SSI 的运作机制
```
   [Client]
      |
      | HTTP Request
      v
 [NGINX Server]
      |
      |--- [SSI Parser]
      |        |
      |        |----- [Include Header.html] // SSI 片段
      |        |
      |        |----- [Include Menu.html] // SSI 片段
      |        |
      |        |----- [Include Footer.html] // SSI 片段
      |
      v
 [HTML Page]
      |
      | HTTP Response
      v
   [Client]
```

# 如何使用Server Side Includes
使用nginx ssi指令即可开启服务
```nginx
http {
	ssi on;
} 
```

 我们以nginx为例实现一个ssi 服务, 使用nginx 代理到 nodejs(这里我们称为upstream服务), 然后在nginx上面开启ssi 服务。
 
 链路如下：
```
 [Client]
     |
     | HTTP Request
     v
 [NGINX Proxy]
     |
     | HTTP Request
     v
 [Upstream Server (Node.js)]
     |
     | HTTP Response
     v
 [NGINX Proxy]
     |
     | HTTP Response
     v
 [Client]
```


## nginx设置代理
nginx 设置代理并开启ssi
```nginx
error_log logs/error.log debug;

events {
    worker_connections 10;
}

http {
    ssi on; # 这个指令表示开启ssi

    upstream to_node {
        server localhost:3000;
    }

    server {
        listen 8080;
        server_name localhost;

        # proxy all request to node server
        location / {
            proxy_pass http://to_node;
        }
    }
}
```

upstream 服务直接响应html内容
```html
<!-- index-static.html 内容 -->
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <!--#include virtual="./header-block.html" -->
    <h3>Hello world!</h3>
    <!--#include virtual="./footer-block.html" -->
</body>
</html>

<!-- header-block.html 内容 --> 
<header>
    <h1>footer block from ssi</h1>
</header>

<!-- footer-block.html 内容 --> 
<footer>
    <div>footer block from ssi</div>
</footer>
```

然后打开页面
![](https://github.com/community/community/assets/3389862/934e4705-e5fb-49ae-9b2e-ea0d7960b515)

是不是很简单？
## 异常的出现 ##
那么，对于SSI的使用数量，是否有上限呢？让我们往页面里面再添加SSI

修改如下
```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <!--#include virtual="./header-block.html" -->
    <h3>Hello world!</h3>
    <!--#include virtual="./footer-block.html" -->
    <!--#include virtual="./footer-block.html" -->
    <!--#include virtual="./footer-block.html" -->
    <!--#include virtual="./footer-block.html" -->
    <!--#include virtual="./footer-block.html" -->
</body>
</html>
```

访问结果

![](https://github.com/community/community/assets/3389862/57ca58ad-40a8-4832-a7a6-df6547c7e60d)

### oops 发生了什么事？

在nginx 的 error log里，我们发现问题所在
```nginx
2024/06/24 19:41:34 [warn] 67237#15146903: 10 worker_connections are not enough, reusing connections
2024/06/24 19:41:34 [alert] 67237#15146903: *82 10 worker_connections are not enough while connecting to upstream, client: 127.0.0.1, server: localhost, request: "GET /html/index-static.html HTTP/1.1", subrequest: "/html/./footer-block.html", upstream: "http://127.0.0.1:3000/html/./footer-block.html", host: "localhost:8080"
2024/06/24 19:41:34 [alert] 67237#15146903: *82 10 worker_connections are not enough while connecting to upstream, client: 127.0.0.1, server: localhost, request: "GET /html/index-static.html HTTP/1.1", subrequest: "/html/./footer-block.html", upstream: "http://[::1]:3000/html/./footer-block.html", host: "localhost:8080"
```

`worker_connections are not enough while connecting to upstream` 

### 小结 
这里体现了ssi 的第一个特性: **subrequest 同样也会消耗worker的数量**
所以，ssi同样也会跟我们的父请求抢占worker资源，每个页面的SSI数量也需要严格进行限制。

# 对upstream的挑战
既然父请求与SSI都会占用worker数量的话，我们很容易想到，使用SSI的技术，对后端的流量会造成放大

## 实验
假设我们在页面里面请求m个SSI，而upstream server的最大支撑请求数为n, 且`m > n`, 这个时候会发生什么事？

我们按照下面的表格对服务进行改造

| 请求数 | server-side include file | upstream max connection |
| --- | ------------------------ | ----------------------- |
| 1   | 10                       | 3                       |

如上面的请求，我们在一个父文件里面设置10个ssi，而upstream服务我们设置限流3个请求，请求父文件之后看看会发生什么：

在html文件上设置多个SSI片段
```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello world!</h1>
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
    <!--#include virtual="./block.html" -->
</body>
</html>
```

对upstream server增加限流逻辑，使得SSI请求触发限流
```js
// 我们在node服务里面进行一个限流
const ratelimit = require('koa-ratelimit');
const db = new Map();
const app = new Koa();
app.use(logger())

app.use(ratelimit({
    driver: 'memory',
    db: db,
    duration: 10000,
    errorMessage: 'Oops! 你被限流了!',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: 3,
  }));
```

响应结果
```http
HTTP/1.1 200 OK
Server: openresty/1.21.4.1
Date: Mon, 24 Jun 2024 12:07:27 GMT
Content-Type: text/html; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
Rate-Limit-Remaining: 2
Rate-Limit-Reset: 1719230857.668981
Rate-Limit-Total: 3
Cache-Control: max-age=0

<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello world!</h1>
    <div>ssi from block content</div>
    <div>ssi from block content</div>
    <div>ssi from block content</div>
    <div>ssi from block content</div>
    <div>ssi from block content</div>
    Oops! 你被限流了!
    Oops! 你被限流了!
    Oops! 你被限流了!
    Oops! 你被限流了!
    Oops! 你被限流了!
</body>
</html>%
```

### 小结 
**使用SSI 会对源站请求的数量放大，对源站产生更大的压力挑战**

# 同一个请求, SSI subrequest是并行还是串行的
有没有发现，上述的SSI subrequest ，前面的请求都是好的，而被限流的ssi subrequest ，都是排在后面。

这里我们有个疑问：SSI的请求是串行的吗？

其实从前文worker connection限制来看，这个行为应该是倾向于并行请求。如果是串行请求的话，那么worker connection应该没有那么容易就消耗完。我们推测：
1. 先请求完父请求
2. 解析html之后，收集所有的子请求
3. 并行所有的子请求。


上面仅仅只是猜测，真实情况下，到底是并行请求，还是串行请求，还是要实验了才知道。
## 设计实验

对于我们的node server，我们进行如下改造，设置动态路由
```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get('/dynamic/sleep/:time', async (ctx) => {
    const { time } = ctx.params;
    await sleep(time);
    ctx.type = 'text/html';
    ctx.body = `Hello, world! your path is /dynamic/sleep/${time}`;
})
```
如果请求upstream 服务，`/dynamic/sleep/1000` 则会等待1s才响应，`/dynamic/sleep/2000` 则是2s才响应

接着设置我们的主html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello world!</h1>
    <!--#include virtual="/dynamic/sleep/10000" -->
    <!--#include virtual="/dynamic/sleep/8000" -->
    <!--#include virtual="/dynamic/sleep/5000" -->
</body>
</html>
```

如果请求index.html文件，则会解析到3个server-side include file, 3个子请求加载时间分别为10s, 8s, 5s.

如果是串行，那么时间应超过 10 + 8 + 5 = 23s; 
如果是并行，时间应该接近10s

请求页面，我们看看会发生什么
在浏览器请求的timelime上我们可以很清楚的看到，请求的时间约为10s
![](https://github.com/community/community/assets/3389862/3510e89b-e734-4195-a225-82e1b557b46b)

在node server的日志
```nginx
<-- GET /html/index.html
--> GET /html/index.html 200 15ms 271b
<-- GET /dynamic/sleep/10000
<-- GET /dynamic/sleep/8000
<-- GET /dynamic/sleep/5000
--> GET /dynamic/sleep/5000 200 5,002ms 46b
--> GET /dynamic/sleep/8000 200 8,003ms 46b
--> GET /dynamic/sleep/10000 200 10s 47b
```
我们可以看到：
1. 服务端接受到了父请求, 并成功响应
2. 同时接受到了3个子请求，并按照响应时间先后返回

### 小结
所以，我们可以得出以下结论
1. subrequest 是并发请求的
2. 即使是并发请求，子请求也会按照引入的顺序从先到后进行请求。

# 总结
SSI在实际应用中可以帮我们解决一些页面内容共用的问题，但是
1. SSI技术会让用户得到请求的时间更长（父请求时间 + 页面解析时间 + SSI 请求时间 ）
2. SSI subrequest会占用worker connection数量，需要我们对代理服务器的worker数量进行合理评估
3. 采用SSI 技术，也会对upstream server带来成倍以上的压力挑战

总而言之, **SSI是一把双刃剑，在带给我们便利的同时，也要谨慎使用！**