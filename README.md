# node项目打包工具

## 前言

使用前请先安装以下依赖

1. ncc 用于将项目打包为单个js文件(npm install -g ncc)
2. javascript-obfuscator 用于混淆代码(npm install -g javascript-obfuscator)
3. bytenode 用于编译jsc(npm install -g bytenode)

## 注意事项

1. **请保持编译使用的node版本与生产环境一致**
2. **请保持编译系统与生产环境一致,不要在win10下编译,然后丢到linux上跑,会报错(建议win10在WSL环境下编译)**,
3. 编译后的jsc文件将不在通过node启动,而改为  **bytenode app.jsc config.js XXX 或 node ./bytenode/cli.js app.jsc(将node_modules下的bytenode包丢到build_pack目录下即可)** 
4. ncc会将单个js相关的所有依赖全部打包,故建议给项目提供一个统一的入口 ,即将各个app.js整合进一个app.js,通过传参启动不同服**(此项我已经做了,可参考我提供的app.js进行修改)**
5. 基于ncc的特性,请尽量不要使用require.resolve这个函数获取路径信息,ncc会将获取的文件独立提取出来,这样做不影响使用,不过不美观~~,因为这样打包后会存在打包文件及resolve获取的文件多个文件在文件夹中**(会有泄密风险,我只会加密打包文件)**,如socket.io 1.4.6版本中使用到了require.resolve函数,获取socket.io.js文件路径,可以自行修改,**当然没有强迫症的话可以不用管**

## 步骤

1. 根据自身情况整合出统一入口app.js
2. 将config.js/bat/sh等静态文件复制进build.js中config.copyDir配置的文件夹中
3. 调整build.js中config的相关配置以适应自身项目
4. 运行**build.js**