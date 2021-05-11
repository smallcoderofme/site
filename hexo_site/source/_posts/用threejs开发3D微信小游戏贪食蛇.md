---
title: 用threejs开发3D微信小游戏贪食蛇
date: 2020-08-14 16:08:35
categories: 
- Web
tags:
- Wexin
---

现在在github已经有现成的threejs的weapp-ddapter.js了。但我早前做得时候没有找到，只找到修改weapp-ddapter的方式。
### 修改 1：在变量document对象里增加以下函数：
``` javascript
createElementNS: function createElementNS(nameSpace, tagName){
	return this.createElement(tagName)
}
```
### 修改 2：在函数_createClass(XMLHTTPRequest, [{key:'abort'...}, ...])()参数中增加addEventListener函数：
``` javascript
{
  key: 'addEventListener',
  value: function addEventListener(type, listener) {
	if (typeof listener === 'function') {
	  let event = { target: this }
	  let that = this
	  this['on' + type] = function () {
		listener.call(that, event)
	  }
	}
  }
}
```
自此微信小游戏就可以支持threejs了，下面开始做个简单的小游戏。
这个游戏需要用到两个js库，用以辅助Threejs。
**1: Detector.js**
Detector用来检测threejs的兼容性。
**2: OrbitControls.js**
OrbitControls用来作为threejs的轨道控制器。
额外的，如果想监测threejs的性能帧数，可以用stats.js。这里的Demo比较简单，就不用它了。
初始化先检测webgl的兼容性

``` javascript
if (g.Detector.webgl) {
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 75, g.innerWidth/g.innerHeight, 0.1, 1000 );
	this.renderer = new THREE.WebGLRenderer();
	...
} else {
	//如果不兼容，需要显示出warning提示
	var warning = Detector.getWebGLErrorMessage();
	...
}
```
这里的小游戏场景，按钮，为了省事都以立方体cube代替。食物cube在场景随机产生，同时设置随机颜色。 在操作上，设定为在场景cube的6个面各有一个按钮cube，通过点击这6个按钮控制小蛇在空间的移动方向。为了方便观察，我们 设置食物cube，小蛇cube均有alpha = 0.4的透明度。
效果图如下：
<img src="/myblogs.github.io/2020/08/14/用threejs开发3D微信小游戏贪食蛇/threejs1.jpg">
<img src="/myblogs.github.io/2020/08/14/用threejs开发3D微信小游戏贪食蛇/threejs2.jpg">
需要改进：这里玩了几把，操作上需要不断的调整场景角度才能很好的操作小蛇，操作比较僵硬。暂时没有好的操作优化思路，暂时就到这吧，有空闲时间再研究。
