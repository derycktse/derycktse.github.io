---
title: 使用Vue全家桶开发知乎日报
date: 2017-04-27 15:41:33
tags: [Vue]
---

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