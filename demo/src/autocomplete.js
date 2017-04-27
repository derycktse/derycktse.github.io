(function(){
var arr = ['messi', 'barcelona', 'suarez']

var target = document.getElementById('target')
var assist = document.getElementById('assist')
if(!target) return
/*
1, 用户输入获取
2， 匹配数组？遍历？tempObj?
3，补充完成
*/

function check() {
    var value = this.value
      , self = this

    
    assist.innerHTML = ''
      if(!value) return 
     var html = ''
    for (var i = 0, length = arr.length; i < length; i++) {

        if (arr[i].indexOf(value) > -1) {

           
            html += '<li>'+ arr[i]+'</li>'
            continue
        }

    }
    assist.innerHTML = html
}

on(target,'keyup',check)
on(target,'paste',check)
on(target,'change',check)
on(target,'blur',check)

function on(ele, type,handler){
	
	var fun = function(){
		 handler.apply(ele, arguments)	
	}
	if(ele.addEventListener){
		ele.addEventListener(type, fun )
	} else if(ele.attachEvent){
		ele.attachEvent('on'+type, fun)
	} else{
		ele['on'+type] = fun
	}
}

})()