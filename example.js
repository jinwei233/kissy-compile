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
