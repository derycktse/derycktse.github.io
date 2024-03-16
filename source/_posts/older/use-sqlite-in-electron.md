---
title: electron使用sqlite
date: 2017-08-13 21:06:55
tags:
---

在electron使用sqlite3的时候，会出现错误:

```
Uncaught Error: Cannot find module ‘/…/node_modules/sqlite3/lib/binding/node-v51-darwin-x64/node_sqlite3.node’
```

可以使用electron-rebuild解决:
```
$ npm install --save-dev electron-rebuild
$ npm install --save sqlite3
```

在`package.json`加上
```
"rebuild": "electron-rebuild -f -w sqlite3"
```

执行:
```
npm run rebuild
```