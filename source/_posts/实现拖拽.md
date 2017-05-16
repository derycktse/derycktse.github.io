---
title: 实现拖拽
date: 2017-04-27 00:17:10
tags:
---

今天在写一个拖拽效果，其实实现原理比较简单

通过`mousedown`, `mousemove`, `mouseup`加信号量，获取在移动中鼠标的位置clientX, clientY，从而修改元素的相对位置即可。

<!-- more -->

```javascript
function createDraggable(ele){
	/*mousedown
	mousemove
	mouseup*/
	var moveFlag = false
	on(ele,'mousedown',function(){

		moveFlag = true
		console.log('touch start')
		return true
	})
	on(ele,'mousemove',function(e){
		console.log('moving')
		if(!moveFlag) return 
			var event = e || window.event
		var offsetX = e.clientX - 50
		, offsetY = e.clientY - 50
		
		ele.style.left = offsetX + 'px',
		ele.style.top = offsetY + 'px'
	
	})
	on(ele,'mouseup',function(){
		moveFlag = false
		console.log('touch end')
	})
}
```

原本我的代码都是绑定在目标dom上，这个时候会发现当鼠标甩动过快的时候，焦点会在目标dom外，导致这个时候行为看起来很卡

接着修改
```javascript
on(window,'mousemove',function(e){
		console.log('moving')
		if(!moveFlag) return 
			var event = e || window.event
		var offsetX = e.clientX - 50
		, offsetY = e.clientY - 50
		
		ele.style.left = offsetX + 'px',
		ele.style.top = offsetY + 'px'
	
	})
```

主流浏览器看起来正常了，却发现IE8移动不了！！！

最终发现应该是`mousemove`时间并没有冒泡到`window`对象上, 改为
```javascript
on(document,'mousemove',function(e){
		console.log('moving')
		if(!moveFlag) return 
			var event = e || window.event
		var offsetX = e.clientX - 50
		, offsetY = e.clientY - 50
		
		ele.style.left = offsetX + 'px',
		ele.style.top = offsetY + 'px'
	
	})
```

效果终于看起来OK啦
见[demo](/code-demo/draggable%20object/index1.html)