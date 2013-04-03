## silly 的第一个第三方插件
   用于给kissy模块依赖分析、合并、打包

## 使用实例

### 打包文件index.js
```text
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
// -*- coding: utf-8; -*-
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
### 执行

```shell
silly run
```
  分析index.js的依赖关系，并合并、压缩后，生一个新文件index-min.js：

```javascript
KISSY.add("third-party/mods/modc",function(){}),KISSY.add("third-party/mods/modb",function(){}),KISSY.add("third-party/mods/moda",function(){},{requires:["third-party/mods/modb","third-party/mods/modc"]}),KISSY.add("third-party/index",function(){},{requires:["third-party/mods/moda","third-party/mods/modb"]});
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
