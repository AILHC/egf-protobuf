# egf protobuf

## 特性


1. 提供 protobuf.js 基础运行时库
2. 提供命令行脚本，将 protofile 生成 JavaScript 代码
3. 生成正确的 .d.ts 代码，以方便 TypeScript 项目使用
5. 理论上支持所有 HTML5 游戏引擎。欢迎使用 PIXI.js , Cocos2d-js , LayaAir 等其他引擎的开发者使用本库。

## 原理

封装了 protobufjs 库及命令行。使用 protobufjs 6.8.4 的运行时库。

protobufjs 自身存在着 pbts 命令，虽然也可以生成 .d.ts 文件，但是在全局模式而非 ES6 module 的情况下存在一些错误，本项目致力于解决这个问题，使 protobufjs 可以在非 ES6 模块项目中（比如白鹭引擎,LayaAir引擎，Cocoscreator引擎）中也可以使用 protobufjs 

protobufjs 提供了多种使用方式，由于微信小游戏禁止 eval , new Function 等动态代码形式，所以本项目只提供了生成代码的形式，不支持通过 ```protobuf.load('awesome.proto')``` 的方式（因为这种方式也无法在微信小游戏中运行）。


## 如何安装

```
npm install protobufjs@6.8.4 -g   //必须安装，如果有任何报错，可能就是这个没有安装的问题
npm install egf-pb -g
```

## 如何使用


+ 假设用户有个名为 project 的项目
    
    cd projectRoot
    
+ 将 protofile 文件放在 projectRoot/protobuf/protofile 文件夹中
+ 配置protobuf/pbconfig.json文件
```json
{
	"options": {
            "no-create": false,//不生成用于反射兼容性的create函数。
            "no-verify": false,//不生成验证函数。
            "no-convert": true,//不生成解码函数。
            "no-delimited": true,//不生成带分隔符的编码/解码函数。
            "no-encode":false,//没有生成像from/toObject这样的转换函数吗
            "no-decode":false//不生成编码函数。
	},
	
	"outputFileType":0,//导出文件类型 0 全部（js和.min.js）1(js) 2(.min.js)
	"dtsOutDir":"../",//定义文件输出目录
	"sourceRoot": "../priv",//proto文件目录
	"outFileName":"",//输出文件名
	"outputDir":"../assets/proto"//输出文件夹
}
```
+ 使用生成命令

    egf-pb generate


## 更新日志

### 1.0.2
修复和确认某些windows环境 生成报错的问题

### 1.0.1
命令行命令运行使用第三方库commander;
使用方式修改

    1. pb-egf g<或者generate>   //生成当前项目目录下的protojs
    2. pb-egf a<或者add>  <egret/空> //拷贝proto .d.ts定义文件，以及protojs的解析库，还有pb-egf的配置文件  可以传参数，egret 就是egret项目，不传则是通用初始化


### 1.0.0
初始版本，基于pb-egret改造，更加自由，protobuf的库文件和proto文件合并，兼容cocosCreator的使用

## 已知问题

proto 文件中的每一个协议一定要从属于一个 package，否则.d.ts生成会出现错误导致 ts 文件无法正确的找到这些类





