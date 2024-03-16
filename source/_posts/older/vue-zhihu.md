---
title: 使用Vue全家桶开发知乎日报
date: 2017-04-27 15:41:33
tags: [Vue]
---

使用Vue2 + vue-router + vuex 开发的知乎日报


[github地址](https://github.com/derycktse/zhihudaily-vue)，如果觉得还可以，不妨给个star吧

### 起因 ###
因为经常看知乎日报，萌生了自己撸一个的想法，于是有了这个项目，不过github上面也有很多人做出来了

<!-- more -->

### 过程 ###

直接使用vue-cli脚手架开撸

## 问题分析 ##

### 图片防盗链 ###

使用代理网站 [Images.weserv.nl](Images.weserv.nl)代理知乎图片

### 接口跨域问题 ###

~~在本地启一个代理服务器([request](https://github.com/request/request) )， 从而不会有跨域的问题~~

脚手架中已经集成了[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)作为代理，使用proxyTable即可代理接口，从而不会有跨域问题，用法见[Proxy](https://vuejs-templates.github.io/webpack/proxy.html)

代码结构(使用工具[treer](https://www.npmjs.com/package/treer)生成):
```
src
├─App.vue
├─main.js
├─store
|   └store.js
├─router
|   └index.js
├─components
|     ├─Carousel.vue
|     ├─List.vue
|     ├─NewsDetail.vue
|     └NewsList.vue
├─common
|   └util.js
├─assets
|   ├─logo.png
|   ├─top_logo.png
|   ├─css
|   |  ├─reset.css
|   |  └zhihu_base.css
├─api
|  └index.js
```

### 参考 ###
[知乎API分析](https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90)