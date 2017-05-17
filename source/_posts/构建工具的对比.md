---
title: 构建工具的对比
date: 2015-12-24 14:36:18
tags: [构建]
---

grunt与gulp同为构建工具，而webpack本身则为打包工具，定位不同，所以，下面比价的是grunt跟gulp

### Gulp和Grunt的比较 ###
- Gulp相比Grunt更简洁，而且遵循代码优于配置策略，维护Gulp更像是写代码。
- Gulp相比Grunt更有设计感，核心设计基于Unix流的概念，通过管道连接，不需要写**中间文件**。
- Gulp的核心API只有5个，掌握了5个API就学会了Gulp，之后便可以通过管道流组合自己想要的任务。

所以相对grunt来说， gulp的性能更加高效，所以grunt我们直接无视

<!-- more -->
### gulp ###
Gulp 的定位是 Task Runner, 就是用来跑一个一个任务的。gulp是通过一系列插件将原本复杂繁琐的任务自动化，是一个纯粹的工具，并不能将你的css等非js资源模块化，但是webpack可以做到这些。总的来说，gulp是一个自动化任务的工具，所以你可以通过gulp来配置webpack的文件。

Gulp侧重于前端开发的整个过程的控制管理（像是流水线），我们可以通过给gulp配置不通的task（通过Gulp中的gulp.task()方法配置，比如启动server、sass/less预编译、文件的合并压缩等等）来让gulp实现不同的功能，从而构建整个前端开发流程。
特点：
1. 配置较为简单，学习成本相对低点
2. 不能将css等非js资源模块化
3. 压缩，sourcemap等需要借助插件
4. 定位为task runner

### webpack ###
webpack只是具有前端构建的功能而已，其实本质来说webpack是一种模块化的解决方案类似require.js一样，只不过通过插件实现了构建工具的一些功能，例如通过less－loader可以编译less为css并作为模块可以被调用。

Webpack更侧重于模块打包，当然我们可以把开发中的所有资源（图片、js文件、css文件等）都可以看成模块，最初Webpack本身就是为前端JS代码打包而设计的，后来被扩展到其他资源的打包处理。Webpack是通过loader（加载器）和plugins（插件）对资源进行处理的

特点：
1. webpack 遵循commonJS 的形式，但对 AMD/CMD 的支持也很全面，方便旧项目进行代码迁移。
2. 能被模块化的不仅仅是 JS ，所有的静态资源，例如css，图片等都能模块化，即以require的方式引入。
3. 开发便捷，能替代部分 grunt/gulp 的工作，比如打包、压缩混淆、图片转base64等
4. 主要定位还是module bundler，在实际开发过程中比如上传ftp等，则无法做到
