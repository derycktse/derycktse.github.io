---
title: javascript深浅拷贝
date: 2016-05-05 19:47:09
tags: [javascript]
---

javascript中分为基本类型跟引用类型两种，对于引用类型来说，变量实际上储存的是指针，对于变量的赋值，实际上也是复制指针地址，赋值后，我们对于变量的修改，也同样会影响到原来的变量

例如下面例子
```javascript
var object = { a: 1, b: 2 } ;  
var copy = object ;  
object.a = 3 ;  
console.log( copy.a ) ;  
```

### 浅拷贝 ###

遍历对象的属性，将属性赋值给新创建的对象

```javascript
function shallowCopy(source){

    var cloneObj = {}

    for(var key in source){
        cloneObj[key] = source[key]
    }
    return cloneObj
}
```
是不是很简单，不过，上面的代码有几个问题:
- 克隆出来的对象跟原本的对象原型链是不同的
- 原本原型链上的属性，被克隆到了新对象上作为自有属性了
- 只有可被枚举(`emuerable`)的属性被克隆了
- 属性的`descriptor`并没有被克隆，比如原本为只读的访问属性，被克隆成可读写的属性了
- 浅拷贝最重要的一个问题，如果属性本身是一个对象，那么克隆的对象以及原本的对象将共享这个属性

为了完善上面的问题，我们可以使用`Object.getOwnPropertyNames()`来配合完善, `Object.keys`只能返回可枚举的属性

我们看下面的改良版
```javascript
function shallowCopyOfProperties(source){
    var cloneObj = {}

    var keys = Object.getOwnPropertyNames(source)
    for(var i = 0; i < keys.length ; i ++){
        cloneObj[keys[i]] = source[keys[i]] 
    }
    return cloneObj
}
```

### 深拷贝 ###

```javascript
```


### 参考 ###
[understanding-object-cloning-in-javascript-part-i](http://blog.soulserv.net/understanding-object-cloning-in-javascript-part-i/)