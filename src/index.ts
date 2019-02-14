import * as child_process from 'child_process';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as UglifyJS from 'uglify-js';
import * as os from 'os';
import rimraf = require('rimraf');
const root = path.resolve(__filename, '../../');

function shell(command: string, args: string[]) {
    return new Promise<string>((resolve, reject) => {

        const cmd = command + " " + args.join(" ");
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout)
            }
        })
    })
}


type ProtobufConfig = {

    options: {
        "no-create": boolean,
        "no-verify": boolean,
        "no-convert": boolean,
        "no-delimited": boolean
    },
    outputFileType: number,
    dtsOutDir: string,
    outFileName: string,
    sourceRoot: string,
    outputDir: string


}

const pbconfigContent = JSON.stringify({
    options: {
        "no-create": false,
        "no-verify": false,
        "no-convert": true,
        "no-delimited": false
    },
    outputFileType:0,
	dtsOutDir:"protofile",
	outFileName:"proto_bundle",
    sourceRoot: "protofile",
    outputDir: "bundles/protobuf-bundles.js"
} as ProtobufConfig, null, '\t');

async function generate(rootDir: string) {

    const pbconfigPath = path.join(rootDir, 'pbconfig.json');
    if (!(await fs.existsAsync(pbconfigPath))) {
        if (await fs.existsAsync(path.join(rootDir, 'protobuf'))) {
            const pbconfigPath = path.join(rootDir, 'protobuf', 'pbconfig.json')
            if (!await (fs.existsAsync(pbconfigPath))) {
                await fs.writeFileAsync(pbconfigPath, pbconfigContent, 'utf-8');
            }
            await generate(path.join(rootDir, 'protobuf'));
        }
        else {
            throw '请首先执行 pb-egf add 命令'
        }
        return;
    }
    const pbconfig: ProtobufConfig = await fs.readJSONAsync(path.join(rootDir, 'pbconfig.json'));
    const tempfile = path.join(os.tmpdir(), 'pbegf', 'temp.js');
    await fs.mkdirpAsync(path.dirname(tempfile));
    
    const output = path.join(rootDir, pbconfig.outputDir+"/"+pbconfig.outFileName+".js");
    const dirname = path.dirname(output);
    await new Promise((res,rej)=>{
        rimraf(dirname,function(){
            res();
        })
    })
    
    await fs.mkdirpAsync(dirname);
    const protoRoot = path.join(rootDir, pbconfig.sourceRoot);
    const fileList = await fs.readdirAsync(protoRoot);
    const protoList = fileList.filter(item => path.extname(item) === '.proto')
    if (protoList.length == 0) {
        throw ' protofile 文件夹中不存在 .proto 文件'
    }
    await Promise.all(protoList.map(async (protofile) => {
        const content = await fs.readFileAsync(path.join(protoRoot, protofile), 'utf-8')
        if (content.indexOf('package') == -1) {
            throw `${protofile} 中必须包含 package 字段`
        }
    }))




    const args = ['-t', 'static', '--keep-case', '-p', protoRoot, protoList.join(" "), '-o', tempfile]
    if (pbconfig.options['no-create']) {
        args.unshift('--no-create');
    }
    if (pbconfig.options['no-verify']) {
        args.unshift('--no-verify');
    }
    if (pbconfig.options['no-convert']) {
        args.unshift('--no-convert')
    }
    if (pbconfig.options["no-delimited"]) {
        args.unshift("--no-delimited")
    }
    await shell('pbjs', args);
    console.log("[egf-protobuf]解析proto文件");
    let pbjsResult = await fs.readFileAsync(tempfile, 'utf-8');
    let pbjsLib = await fs.readFileAsync(path.join(root, 'pblib/protobuf-library.min.js'))
    let outPbj = pbjsLib+'var $protobuf = window.protobuf;\n$protobuf.roots.default=window;\n' + pbjsResult;
    console.log("[egf-protobuf]解析proto文件->完成"+output);
    if(pbconfig.outputFileType===0||pbconfig.outputFileType===1){
        console.log("[egf-protobuf]生成js文件");
        await fs.writeFileAsync(output, outPbj, 'utf-8');
        console.log("[egf-protobuf]生成js文件->完成");
    }
    if(pbconfig.outputFileType===0||pbconfig.outputFileType===2){
        console.log("[egf-protobuf]生成.min.js文件");
        const minjs = UglifyJS.minify(outPbj);
        await fs.writeFileAsync(output.replace('.js', '.min.js'), minjs.code, 'utf-8');
        console.log("[egf-protobuf]生成.min.js文件->完成");
    }
    await shell('pbts', ['--main', output, '-o', tempfile]);
    console.log("[egf-protobuf]解析js文件");
    let pbtsResult = await fs.readFileAsync(tempfile, 'utf-8');
    pbtsResult = pbtsResult.replace(/\$protobuf/gi, "protobuf").replace(/export namespace/gi, 'declare namespace');
    pbtsResult = 'type Long = protobuf.Long;\n' + pbtsResult;
    let dtsOut = path.join(rootDir, pbconfig.dtsOutDir+"/"+pbconfig.outFileName+".d.ts");
    console.log("[egf-protobuf]解析js文件->完成");
    console.log("[egf-protobuf]生成.d.ts文件->");
    await fs.writeFileAsync(dtsOut, pbtsResult, 'utf-8');
    console.log("[egf-protobuf]生成.d.ts文件->完成");
    await fs.removeAsync(tempfile);

}



async function initEgretProj(egretProjectRoot: string) {
    console.log('正在将 protobuf 源码拷贝至项目中...');
    await fs.copyAsync(path.join(root, 'lib'), path.join(egretProjectRoot, 'protobuf/library'));
    await fs.mkdirpSync(path.join(egretProjectRoot, 'protobuf/protofile'));
    await fs.mkdirpSync(path.join(egretProjectRoot, 'protobuf/bundles'));
    await fs.writeFileAsync((path.join(egretProjectRoot, 'protobuf/pbconfig.json')), pbconfigContent, 'utf-8');

    const egretPropertiesPath = path.join(egretProjectRoot, 'egretProperties.json');
    if (await fs.existsAsync(egretPropertiesPath)) {
        console.log('正在将 protobuf 添加到 egretProperties.json 中...');
        const egretProperties = await fs.readJSONAsync(egretPropertiesPath);
        egretProperties.modules.push({ name: 'protobuf-library', path: 'protobuf/library' });
        egretProperties.modules.push({ name: 'protobuf-bundles', path: 'protobuf/bundles' });
        await fs.writeFileAsync(path.join(egretProjectRoot, 'egretProperties.json'), JSON.stringify(egretProperties, null, '\t\t'));
        console.log('正在将 protobuf 添加到 tsconfig.json 中...');
        const tsconfig = await fs.readJSONAsync(path.join(egretProjectRoot, 'tsconfig.json'));
        tsconfig.include.push('protobuf/**/*.d.ts');
        await fs.writeFileAsync(path.join(egretProjectRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, '\t\t'));
    }
    else {
        console.log('输入的文件夹不是白鹭引擎项目')
    }


}


export function run(command: string, projRoot: string) {
    run_1(command, projRoot).catch(e => console.log(e))
}

async function run_1(command: string, projRoot: string) {

    if (command == "add") {
        await initEgretProj(projRoot);
    }
    else if (command == "generate") {
        await generate(projRoot)
    }
    else {
        console.error('请输入命令: add / generate')
    }

}