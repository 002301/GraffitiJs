### GraffitiJs 
基于javascript ES6版本编写的涂鸦和擦除功能,支持pc和移动端

demo:https://002301.github.io/GraffitiJs/src/

### 安装

>npm i @airmn/graffiti
### 使用方法
npm

```html
<script type="module">
import GraffitiJs from "@airmn/graffiti"

let drow = new GraffitiJs('.drow',{
    bg:"#253d39", 
    color: "#e3e3e3", 
    lineWidth: "10"
});
</script>
```
### 初始化参数
>GraffitiJs(dom,config)

dom:class|id

 config
 * bg : (color|URL)设置背景,可以是 rgba|#fff|imageUrl 图片地址
 * color:#fff 设置画笔颜色
 * lineWidth:30 设置画笔粗细
 * scratch:false 设置涂鸦还是擦除 
 * percent:0.5 设置擦除百分比，达到后执行结束回调函数
 * onComplete:function 设置结束回调
 
 例如:
 ```js
 //创建涂鸦板
 let scratch = new GraffitiJs('.scratch',{
  color:"#e3e3e3",
  percent:0.5,
  scratch:true,
  bg:"./images/bg.jpg",
  onComplete:()=>{
		console.log('scratch')
	}});
 ```
 ### 其他方法

重新设置画笔颜色 drow.setColor("#71717") 