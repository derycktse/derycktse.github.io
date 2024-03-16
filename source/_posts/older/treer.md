---
title: 'treer:命令行生成目录结构的实用小工具'
date: 2017-04-23 11:12:58
tags: [node.js, npm]
---

有时候在写说明文档的时，需要列出文件的一个目录结构,几次手动拼接之后，写了一个cli小工具来自动生成。

### 安装方法： ###
```
$ npm install treer -g
```

如此我们便可以快速的生成目录结构啦！

### 生成结果 ###
```
$ treer

Desktop
├─.DS_Store
├─.localized
├─dir2
|  ├─file3
|  └file4
├─dir1
|  ├─dile2
|  └file1
```


#### 指定目录 ####
默认的目录为当前的路径，可以通过`-d` 传入指定的路径

```
$ treer -d <指定路径>
```

#### 导出结果 ####
可将结果导出到文件中

```
$ treer -e <导出路径>
```

#### 忽略指定的目录 ####
有时候我们需要忽略一些文件名，比如我们的`node_modules`文件夹

```
$ treer -i <"文件名，支持正则表达式/regex/哦">
```

如果觉得实用，不妨[Star](https://github.com/derycktse/treer)一下吧，[github地址](https://github.com/derycktse/treer)
