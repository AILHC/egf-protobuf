#! /usr/bin/env node

var cmd = require('commander');
var script = require('./index');
cmd
.command("generate")
.alias('g')
.description("生成protojs")
.action(async option=>{
    console.log("生成protojs");
    await script.generate(".");
});
cmd
.command("init")
.alias('i')
.description("初始化项目")
.action(async (...arg)=>{
    console.log("初始化项目");
    await script.initProj(".",arg[0]);
})
cmd.parse(process.argv);