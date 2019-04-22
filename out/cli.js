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
.command("add")
.alias('a')
.description("初始化项目")
.action(async (...arg)=>{
    console.log("初始化项目");
    await script.initEgretProj(".",arg[0]);
})
cmd.parse(process.argv);