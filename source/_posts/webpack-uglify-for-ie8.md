---
title: 在webpack中使UglifyPlugin支持IE8
date: 2017-05-18 23:27:11
tags:
---

Uglify默认把screw_ie8默认为true，将screw_ie8配置为false:
```
new webpack.optimize.UglifyJsPlugin({
compress: {
        warnings: false,
        screw_ie8 : false
    },
    mangle: {
        screw_ie8: false
    },
    output: { screw_ie8: false }
})
```