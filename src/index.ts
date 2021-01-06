import * as child_process from 'child_process';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as UglifyJS from 'uglify-js';
import * as os from 'os';
import rimraf = require('rimraf');
const root = path.resolve(__filename, '../../');
import * as pbjs from "protobufjs/cli/pbjs"
import * as pbts from "protobufjs/cli/pbts"
function shell(command: string, args: string[]) {
    return new Promise<string>((resolve, reject) => {

        const cmd = command + " " + args.join(" ");
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`检查是否安装了protobufjs`)
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
    outputFileType: 0,
    dtsOutDir: "protofile",
    outFileName: "proto_bundle",
    sourceRoot: "protofile",
    outputDir: "bundles"
} as ProtobufConfig, null, '\t');
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
export async function generate(rootDir: string) {

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
    const tempfile = path.join(rootDir, 'pbtemp.js');
    await fs.mkdirpAsync(path.dirname(tempfile)).catch(function (res) {
        console.log(res);
    });
    await fs.writeFileAsync(tempfile, "");

    const pbjsFile = path.join(rootDir, pbconfig.outputDir + "/" + pbconfig.outFileName + ".js");
    const dirname = path.dirname(pbjsFile);
    await new Promise<void>((res, rej) => {
        rimraf(dirname, function () {
            res();
        })
    })

    await fs.mkdirpAsync(dirname).catch(function (res) {
        console.log(res);
    });
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

    const args = ['-t', 'static', '--keep-case', '-p', protoRoot].concat(protoList);
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
    console.log("[egf-protobuf]解析proto文件");
    // await shell('./node_modules/protobufjs/bin/pbjs', args).catch(function (res) {
    //     console.log(res);
    // });
    // let pbjsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) });


    const pbjsResult = await new Promise<string>((res) => {
        pbjs.main(args, (err, output) => {
            if (err) {
                console.error(err);
            }
            res(output);
            return {}
        })
    })
    let pbjsLib = await fs.readFileAsync(path.join(root, 'pblib/protobuf-library.min.js')).catch(function (res) { console.log(res) });
    let outPbj = pbjsLib + 'var $protobuf = window.protobuf;\n$protobuf.roots.default=window;\n' + pbjsResult;
    console.log("[egf-protobuf]解析proto文件->完成" + pbjsFile);
    if (pbconfig.outputFileType === 0 || pbconfig.outputFileType === 1) {
        console.log("[egf-protobuf]生成js文件");
        await fs.writeFileAsync(pbjsFile, outPbj, 'utf-8').catch(function (res) { console.log(res) });;
        console.log("[egf-protobuf]生成js文件->完成");
    }
    if (pbconfig.outputFileType === 0 || pbconfig.outputFileType === 2) {
        console.log("[egf-protobuf]生成.min.js文件");
        const minjs = UglifyJS.minify(outPbj);
        await fs.writeFileAsync(pbjsFile.replace('.js', '.min.js'), minjs.code, 'utf-8');
        console.log("[egf-protobuf]生成.min.js文件->完成");
    }
    console.log("[egf-protobuf]解析js文件生成.d.ts中");
    // await shell('pbts', ['--main', output, '-o', tempfile]).catch(function (res) {
    //     console.error(`检查是否安装了protobufjs`)
    //     console.log(res);
    // });
    // let pbtsResult: string = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;

    let pbtsResult = await new Promise<string>((res) => {
        pbts.main(['--main', pbjsFile], (err, output) => {
            if (err) {
                console.error(err);
            }
            res(output);
            return {}
        })
    })
    // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;

    pbtsResult = pbtsResult.replace(/\$protobuf/gi, "protobuf").replace(/export namespace/gi, 'declare namespace');
    pbtsResult = 'type Long = protobuf.Long;\n' + pbtsResult;
    let dtsOut = path.join(rootDir, pbconfig.dtsOutDir, pbconfig.outFileName + ".d.ts");
    console.log("[egf-protobuf]解析js文件->完成");
    const isExit_dts = await fs.existsAsync(dtsOut);
    if (isExit_dts) {
        console.log(`[egf-protobuf]删除旧.d.ts文件:${dtsOut}`);
        await new Promise<void>((res, rej) => {
            rimraf(dtsOut, function () {
                res();
            })
        })
    }
    const dtsOutDirPath = path.dirname(dtsOut)
    if (rootDir !== dtsOutDirPath) {
        const isExit_dtsOutDir = await fs.existsAsync(dtsOutDirPath);
        if (!isExit_dtsOutDir) {
            //
            console.log(`[egf-protobuf]创建.d.ts 的文件夹:${dtsOutDirPath}->`);
            await fs.mkdirAsync(dtsOutDirPath);
        }
    }
    console.log("[egf-protobuf]生成.d.ts文件->");
    await fs.writeFileAsync(dtsOut, pbtsResult, 'utf-8').catch(function (res) { console.log(res) });;
    console.log("[egf-protobuf]生成.d.ts文件->完成");
    await fs.removeAsync(tempfile).catch(function (res) { console.log(res) });;

}



export async function initProj(projRoot: string = ".", projType: string) {
    console.log('正在将 protobuf 源码拷贝至项目中...');
    await fs.copyAsync(path.join(root, 'pblib'), path.join(projRoot, 'protobuf/library')).catch(function (res) { console.log(res) });;
    await fs.mkdirpSync(path.join(projRoot, 'protobuf/protofile'));
    await fs.mkdirpSync(path.join(projRoot, 'protobuf/bundles'));
    await fs.writeFileAsync((path.join(projRoot, 'protobuf/pbconfig.json')), pbconfigContent, 'utf-8').catch(function (res) { console.log(res) });;
    if (projType === "egret") {
        const egretPropertiesPath = path.join(projRoot, 'egretProperties.json');
        if (await fs.existsAsync(egretPropertiesPath)) {
            console.log('正在将 protobuf 添加到 egretProperties.json 中...');
            const egretProperties = await fs.readJSONAsync(egretPropertiesPath);
            egretProperties.modules.push({ name: 'protobuf-library', path: 'protobuf/library' });
            egretProperties.modules.push({ name: 'protobuf-bundles', path: 'protobuf/bundles' });
            await fs.writeFileAsync(path.join(projRoot, 'egretProperties.json'), JSON.stringify(egretProperties, null, '\t\t'));
            console.log('正在将 protobuf 添加到 tsconfig.json 中...');
            const tsconfig = await fs.readJSONAsync(path.join(projRoot, 'tsconfig.json'));
            tsconfig.include.push('protobuf/**/*.d.ts');
            await fs.writeFileAsync(path.join(projRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, '\t\t')).catch(function (res) { console.log(res) });;
        }
        else {
            console.log('输入的文件夹不是白鹭引擎项目')
        }
    }



}

