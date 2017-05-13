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

<!-- more -->

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

我们来分析上面几个缺陷:

**克隆出来的对象跟原本的对象原型链是不同的**


我们可以通过获取原对象的原型对象(`Object.getPrototypeOf`)，再将克隆对象继承与该原型对象(`Object.create`)

**原本原型链上的属性，被克隆到了新对象上作为自有属性了**

**只有可被枚举(`emuerable`)的属性被克隆了**

在复制过程中，我们可以先判断属性是否为自由属性(`Object.prototype.hasOwnProperty`)，当然，我们可以更简单的使用`Object.getOwnPropertyNames`，它可返回所有的自有属性（包括不可枚举的）

**属性的`descriptor`并没有被克隆，比如原本为只读的访问属性，被克隆成可读写的属性了**

通过`Object.getOwnPropertyDescriptor`获取属性的descriptor之后使用`Object.defineProperty`定义到克隆对象中

我们看下面的改良版
```javascript
function shallowCopy(source){
    var cloneObj = Object.create(Object.getPrototypeOf(source))

    var keys = Object.getOwnPropertyNames(source) // `Object.keys`只能返回可枚举的属性
    for(var i = 0; i < keys.length ; i ++){
        Object.defineProperty(cloneObj, keys[i], 
            Object.getOwnPropetyDescriptor(source, keys[i]))
    }
    return cloneObj
}
```

### 深拷贝 ###

上面已经讲诉了浅拷贝，浅拷贝只克隆对象的第一层属性，而对于再深层的属性来说，只是复制，并不是克隆，所以深层的属性如果是对象的话，还是指着相同的对象

深拷也很简单，一个思想： 递归

当属性为对象时，利用浅拷贝的思想进行递归调用，即是深拷贝

```javascript
function deepCopy(source){
    var cloneObj = Object.create(Object.getPrototypeOf(source))

    var keys = Object.getOwnPropertyNames(source)

    for(var i=0, length = keys.length ; i < length; i++){
        var descriptor = Object.getOwnPropertyDescriptor(source, keys[i])

        if(descriptor.value && typeof descriptor.value === 'object'){//如果属性是访问属性（getter/setter）的话，这里的descriptor.value === 'undefined'
            descriptor.value = deepCopy(descriptor.value)
        }

         Object.defineProperty( cloneObj , keys[ i ] , descriptor ) ;
    }
    return cloneObj
}
```

好了，上面这个深拷贝完成了，但是还是有这几个问题:
- 循环指向的属性会使得内存泄漏
- 如果对象的方法引用到闭包中的变量，则无法克隆

#### 循环指向 ####
看下面的例子
```javascript
var o = {
    a : 'a'
}

o.loop = o

```
如果调用上述的`deepCopy`，则我们会陷入到o.loop.loop.loop.loop.loop.loop...这样的循环中去

#### 闭包 ####
我们看下面的例子
```javascript
function myConstructor()  
{
    var myPrivateVar = 'secret' ;

    return {
        myPublicVar: 'public!' ,
        getMyPrivateVar: function() {
            return myPrivateVar ;
        } ,
        setMyPrivateVar( value ) {
            myPrivateVar = value.toString() ;
        }
    } ;
}

var o = myContructor() ;  
```

### 参考 ###
[understanding-object-cloning-in-javascript-part-i](http://blog.soulserv.net/understanding-object-cloning-in-javascript-part-i/)