---
title: 'package.json中的main,jsnext:main,module分别是干什么用的'
date: 2017-06-30 11:16:08
tags:
---

## main ##
我们来看[npm](https://docs.npmjs.com/files/package.json#main)官方的定义:
```
The main field is a module ID that is the primary entry point to your program. That is, if your package is named foo, and a user installs it, and then does require("foo"), then your main module's exports object will be returned.

This should be a module ID relative to the root of your package folder.

For most modules, it makes the most sense to have a main script and often not much else.
```
简单说`main`字段定义了我们程序的主要入口，用户在`require`我们模块的时候，程序会从`main`字段中找到我们程序的主要入口，从而输出我们的代码依赖.


在这里,`main`字段用来指向commonjs的模块

## jsnext:main 与 module ##
`jsnext:main` 与 `module`的作用是一样的， 但是由于`module`更直白一点，所以现在使用`module`. 在这里我们讨论`module`

`module`字段会指向一个ES2015 模块的入口, 当使用`rollup`这些模块的bundler时，由于使用了ES2015 的模块，可以再做`tree shaking`优化




## 参考 ##
[http://shuheikagawa.com/blog/2017/01/05/main-jsnext-main-and-module/](http://shuheikagawa.com/blog/2017/01/05/main-jsnext-main-and-module/)
[https://github.com/jsforum/jsforum/issues/5](https://github.com/jsforum/jsforum/issues/5)
[https://www.reddit.com/r/javascript/comments/5jwg9c/confused_about_fields_module_and_jsnextmain_in/](https://www.reddit.com/r/javascript/comments/5jwg9c/confused_about_fields_module_and_jsnextmain_in/)
rollup wiki

[https://github.com/rollup/rollup/wiki/pkg.module](https://github.com/rollup/rollup/wiki/pkg.module)
[https://github.com/rollup/rollup/wiki/jsnext:main](https://github.com/rollup/rollup/wiki/jsnext:main)