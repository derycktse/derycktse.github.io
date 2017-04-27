(function(){
	var target = document.getElementById('target')


function on(ele, type,handler){
	
	if(ele.addEventListener){
		ele.addEventListener(type, handler )
	} else if(ele.attachEvent){
		ele.attachEvent('on'+type, handler)
	} else{
		ele['on'+type] = handler
	}
}

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
	on(document,'mousemove',function(e){
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


createDraggable(target)
})()