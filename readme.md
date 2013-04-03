## 打包工具 silly 的第一个第三方插件
   用于给kissy模块依赖分析、合并、打包

## 安装
```sh
$ cd third-party				# 进入你的kissy包的顶级目录
$ npm install kissy-compile		# 安装kissy-compile到本地
```
## 使用实例
   假设一个前端工程的目录，以及文件内容如下所示，要打包的文件是index.js
### 目录结构 
```text
third-party
		 ├── app.json
		 ├── index.js
		 └── mods
			 ├── moda.js
			 ├── modb.js
			 └── modc.js
```
### app.json内容为
```javascript
{
  "config" : {
    "kissy-compile" : {//测试一个未安装过的第三方插件
      "a" : {
			  src:["main.js"],
			  dest:"main-min.js"
      }
    }
  }
}
```
### index.js

```javascript
KISSY.add(function(){

},{
  requires:['./mods/moda','./mods/modb']
})
```

### moda.js modb.js
```javascript
KISSY.add(function(){

});
```
### 执行kissy-compile任务

```shell
silly run # 会自动去app.json中读取任务配置。也可以制定配置文件silly run -c other-cfg-name.json
```
  silly-compile做了什么工作？app.json就是用来描述这些工作的：
  分析index.js的依赖关系，合并、压缩后，生一个新文件index-min.js：

```javascript
KISSY.add("third-party/mods/modb",function(){

}),
KISSY.add("third-party/mods/moda",function(){

}),
KISSY.add("third-party/index",function(){

},{
  requires:["third-party/mods/moda","third-party/mods/modb"]
});
```
  实例详见 https://github.com/WeweTom/silly/tree/master/examples/third-party

## 编写一个你自己的插件

   下面是一个简单的demo

```javascript
module.exports = function(plugin_cfg,silly_config,silly){
  var Q = silly.Q

  var defer = Q.defer()
    , promise = defer.promise

  // 插件调用成功后返回
  defer.resolve()

  // 插件调用出错
  // defer.reject('错误信息')

  // 举例:产生一个随机数，若这个随机数大于.5认为插件执行成功，否则认为失败
  /*
  setTimeout(function(){
    var n = Math.random()
    if(n>.5){
      // 这里必须将silly_config传入
      defer.resolve(silly_config)
    }else{
      defer.reject('n<.5')
    }
  },1000)
   */
  return promise
}
```
