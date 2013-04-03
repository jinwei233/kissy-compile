// -*- coding: utf-8; -*-
var Path = require('path')

module.exports = function(plugin_cfg,silly_config,silly){
  var Q = silly.Q
    , Mustache = silly.Mustache
    , commontask = silly.asynctasks
    , matchfiles = silly.matchfiles
    , mkdirp = silly.mkdirp
    , sillyTool = silly.tool
    , deptool = silly.deptool
    , _ = silly._

  var defer = Q.defer()
    , promise = defer.promise
    , stream
    , kissmetasks = []
    , opts = {
      pkgpath:silly_config.pkgroot,
      pkgname:silly_config.pkgname
    }

  stream = matchfiles(silly_config.root,plugin_cfg.src,plugin_cfg.exclude)

  stream.on('file',function(abs,filename,extname,$){
    kissmetasks.push(
      commontask.getdeps(abs)
      .then(function(filepathslist){
        return Q.all(filepathslist.map(function(abs){
                       return commontask.read(abs)
                     }))
               .then(function(buffers){
                 var allfilecontent = ''

                 // TODO fixmodname 只调用一次
                 buffers.forEach(function(buffer,key){
                   var filecontent = buffer.toString()
                     , fullpath = filepathslist[key]
                   filecontent = deptool.fixmodname(filecontent,fullpath,opts)
                   filecontent = deptool.fixrequirename(fullpath,opts.pkgpath,opts.pkgname,filecontent)

                   allfilecontent = allfilecontent + ";" + filecontent
                 })

                 console.log('>>>uglify info:')
                 var compressed_code = sillyTool.compress(allfilecontent)
                 console.log('>>>uglify info end')

                 var code = compressed_code

                 var lastfile = filepathslist[filepathslist.length-1]
                   , data = _.extend({
                     filename:filename,
                     basename:Path.basename(abs,'.js'),
                     extname:Path.extname(abs,'.js')
                   },silly_config.var)
                   , filename
                   , modname_org
                   , modname_res

                 filename = sillyTool.makemoney(plugin_cfg.dest,$)
                 filename = Mustache.render(filename,data)
                 filename = Path.resolve(silly_config.root,filename)

                 modname_org = deptool.getModName(lastfile,Path.dirname(silly_config.pkgroot))
                 modname_res = deptool.getModName(filename,Path.dirname(silly_config.pkgroot))

                 if(modname_org != modname_res){
                   code = code.replace(new RegExp(modname_org,'g'),modname_res)
                 }
                 mkdirp(Path.dirname(filename),function(err){
                   if(err) throw err
                   commontask.write(filename,code)
                   .then(function(){
                     console.log('ksmin>>>写入文件')
                     console.log(filename)
                     buildInitFile(modname_org,modname_res)
                   })
                   .fail(function(err){
                     console.log('ksmin>>>写入文件'+filename+'失败')
                     console.log(err)
                   })

                   if(plugin_cfg.dest_uncompress){
                     commontask.write(plugin_cfg.dest_uncompress,allfilecontent)
                     .then(function(){
                       console.log('ksmin>>>写入文件'+plugin_cfg.dest_uncompress+'成功')
                     })
                     .fail(function(err){
                       console.log('ksmin>>>写入文件'+plugin_cfg.dest_uncompress+'失败:')
                       console.log(err)
                     })
                   }

                 })
               })
      })
    )
  })
  stream.on('end',function(){
    Q.all(kissmetasks)
    .then(function(){
      defer.resolve(silly_config)
    })
    .fail(function(err){
      defer.reject(err)
    })
  })
  stream.on('error',function(err){
    defer.reject(err)
  })

  function buildInitFile(initmodname,initmodname_fixed){
    // module template data
    var path = plugin_cfg.path
      , charset = plugin_cfg.charset || 'utf-8'
      , tag = plugin_cfg.tag || ''
      , name = silly_config.pkgroot.split('/').pop()

    var local = ''
      , online = ''
      , daily = ''

    var output = '//local test\n'
      , tpl = 'KISSY.config({\n'
              + '    packages:[{name:"{{name}}",path:"{{{path}}}",charset:"{{charset}}",tag:"{{tag}}"}]\n'
            + '});\n'
            + 'KISSY.use("{{{main}}}",function(S,init){init();});\n'

    if(plugin_cfg.local_path){
      local = Mustache.render(tpl,{
        path:plugin_cfg.local_path,
        name:name,
        charset:charset,
        tag:tag,
        main:initmodname_fixed
      })
    }
    if(plugin_cfg.path){
      online = Mustache.render(tpl,{
        path:plugin_cfg.path,
        name:name,
        charset:charset,
        tag:tag,
        main:initmodname
      })
    }
    if(plugin_cfg.daily_path){
      daily = Mustache.render(tpl,{
        path:plugin_cfg.daily_path,
        name:name,
        charset:charset,
        tag:tag,
        main:initmodname
      })
    }
    console.log(local+online+daily)
  }
  return promise
}