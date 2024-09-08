---
title: 使用obsidian编写博客
date: 2024-03-16 23:29:20
---

这一两年一直在obsidian记录东西，感觉非常不错。不过有一个问题就是，如果只是一味的记录给自己看，可能失去了和别人交流的机会。考虑到这个层面，还是决定以后得多写一些博客。记录自己在生活以及学习上的一些所得所悟，如果能有人看到我的文字有所共鸣或者收获，那将是非常有意义的事情。
考虑到博客使用hexo 生成，托管在github page 上，hexo有自己的一套文件夹命名格式，我还是比较喜欢在obsidian里面写东西。所以最简单的办法就是在obsidian里面写好文章直接同步到hexo 文件夹里面就行.

目前我的obsidian跟hexo文件夹的位置大概是这样：

| my note   | folder                                           |
| --------- | ------------------------------------------------ |
| obsidian  | ~/my-obsidian-folder/blog/_posts/                |
| hexo blog | ~/my-hexo-folder/myname.github.io/source/_posts/ |

每次写完之后，直接使用rsync 同步一下我的文件夹，再部署到github page 上即可
```sh
rsync -r --delete ~/my-obsidian-folder/blog/_posts/ ~/my-hexo-folder/myname.github.io/source/_posts/
hexo clean && hexo g && hexo deploy
```

当然还有很多更好的办法，比如使用软链等形式，不过觉得现在这个阶段已经够用了。毕竟写blog的频率当下还达不到非常高频。还是先让自己培养多写作的习惯，等习惯养成之后再进一步优化。

来自2024-08-17 补充，发现每次`rsync`后，未修改个文件，同样也被重新覆盖了，这里体现在文件的修改时间上，自然而然想到可以使用对比摘要不同再同步的方法，发现`rsync`已经有参数支持。可以基于摘要进行比对后再决定是否更新
```sh
-c, --checksum              skip based on checksum, not mod-time & size
```

修改版
```
rsync -r --checksum --delete ~/my-obsidian-folder/blog/_posts/ ~/my-hexo-folder/myname.github.io/source/_posts/
```