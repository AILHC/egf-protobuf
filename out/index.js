"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProj = exports.generate = void 0;
var child_process = require("child_process");
var fs = require("fs-extra-promise");
var path = require("path");
var UglifyJS = require("uglify-js");
var rimraf = require("rimraf");
var root = path.resolve(__filename, '../../');
var pbjs = require("protobufjs/cli/pbjs");
var pbts = require("protobufjs/cli/pbts");
function shell(command, args) {
    return new Promise(function (resolve, reject) {
        var cmd = command + " " + args.join(" ");
        child_process.exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.error("\u68C0\u67E5\u662F\u5426\u5B89\u88C5\u4E86protobufjs");
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
var pbconfigContent = JSON.stringify({
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
}, null, '\t');
process.on('unhandledRejection', function (reason, p) {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
function generate(rootDir) {
    return __awaiter(this, void 0, void 0, function () {
        var pbconfigPath, pbconfigPath_1, pbconfig, tempfile, pbjsFile, dirname, protoRoot, fileList, protoList, args, pbjsResult, pbjsLib, outPbj, minjs, pbtsResult, dtsOut, isExit_dts, dtsOutDirPath, isExit_dtsOutDir;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pbconfigPath = path.join(rootDir, 'pbconfig.json');
                    return [4 /*yield*/, fs.existsAsync(pbconfigPath)];
                case 1:
                    if (!!(_a.sent())) return [3 /*break*/, 9];
                    return [4 /*yield*/, fs.existsAsync(path.join(rootDir, 'protobuf'))];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 7];
                    pbconfigPath_1 = path.join(rootDir, 'protobuf', 'pbconfig.json');
                    return [4 /*yield*/, (fs.existsAsync(pbconfigPath_1))];
                case 3:
                    if (!!(_a.sent())) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs.writeFileAsync(pbconfigPath_1, pbconfigContent, 'utf-8')];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, generate(path.join(rootDir, 'protobuf'))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7: throw '请首先执行 pb-egf add 命令';
                case 8: return [2 /*return*/];
                case 9: return [4 /*yield*/, fs.readJSONAsync(path.join(rootDir, 'pbconfig.json'))];
                case 10:
                    pbconfig = _a.sent();
                    tempfile = path.join(rootDir, 'pbtemp.js');
                    return [4 /*yield*/, fs.mkdirpAsync(path.dirname(tempfile)).catch(function (res) {
                            console.log(res);
                        })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFileAsync(tempfile, "")];
                case 12:
                    _a.sent();
                    pbjsFile = path.join(rootDir, pbconfig.outputDir + "/" + pbconfig.outFileName + ".js");
                    dirname = path.dirname(pbjsFile);
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            rimraf(dirname, function () {
                                res();
                            });
                        })];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, fs.mkdirpAsync(dirname).catch(function (res) {
                            console.log(res);
                        })];
                case 14:
                    _a.sent();
                    protoRoot = path.join(rootDir, pbconfig.sourceRoot);
                    return [4 /*yield*/, fs.readdirAsync(protoRoot)];
                case 15:
                    fileList = _a.sent();
                    protoList = fileList.filter(function (item) { return path.extname(item) === '.proto'; });
                    if (protoList.length == 0) {
                        throw ' protofile 文件夹中不存在 .proto 文件';
                    }
                    return [4 /*yield*/, Promise.all(protoList.map(function (protofile) { return __awaiter(_this, void 0, void 0, function () {
                            var content;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, fs.readFileAsync(path.join(protoRoot, protofile), 'utf-8')];
                                    case 1:
                                        content = _a.sent();
                                        if (content.indexOf('package') == -1) {
                                            throw protofile + " \u4E2D\u5FC5\u987B\u5305\u542B package \u5B57\u6BB5";
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 16:
                    _a.sent();
                    args = ['-t', 'static', '--keep-case', '-p', protoRoot].concat(protoList);
                    if (pbconfig.options['no-create']) {
                        args.unshift('--no-create');
                    }
                    if (pbconfig.options['no-verify']) {
                        args.unshift('--no-verify');
                    }
                    if (pbconfig.options['no-convert']) {
                        args.unshift('--no-convert');
                    }
                    if (pbconfig.options["no-delimited"]) {
                        args.unshift("--no-delimited");
                    }
                    console.log("[egf-protobuf]解析proto文件");
                    return [4 /*yield*/, new Promise(function (res) {
                            pbjs.main(args, function (err, output) {
                                if (err) {
                                    console.error(err);
                                }
                                res(output);
                                return {};
                            });
                        })];
                case 17:
                    pbjsResult = _a.sent();
                    return [4 /*yield*/, fs.readFileAsync(path.join(root, 'pblib/protobuf-library.min.js')).catch(function (res) { console.log(res); })];
                case 18:
                    pbjsLib = _a.sent();
                    outPbj = pbjsLib + 'var $protobuf = window.protobuf;\n$protobuf.roots.default=window;\n' + pbjsResult;
                    console.log("[egf-protobuf]解析proto文件->完成" + pbjsFile);
                    if (!(pbconfig.outputFileType === 0 || pbconfig.outputFileType === 1)) return [3 /*break*/, 20];
                    console.log("[egf-protobuf]生成js文件");
                    return [4 /*yield*/, fs.writeFileAsync(pbjsFile, outPbj, 'utf-8').catch(function (res) { console.log(res); })];
                case 19:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]生成js文件->完成");
                    _a.label = 20;
                case 20:
                    if (!(pbconfig.outputFileType === 0 || pbconfig.outputFileType === 2)) return [3 /*break*/, 22];
                    console.log("[egf-protobuf]生成.min.js文件");
                    minjs = UglifyJS.minify(outPbj);
                    return [4 /*yield*/, fs.writeFileAsync(pbjsFile.replace('.js', '.min.js'), minjs.code, 'utf-8')];
                case 21:
                    _a.sent();
                    console.log("[egf-protobuf]生成.min.js文件->完成");
                    _a.label = 22;
                case 22:
                    console.log("[egf-protobuf]解析js文件生成.d.ts中");
                    return [4 /*yield*/, new Promise(function (res) {
                            pbts.main(['--main', pbjsFile], function (err, output) {
                                if (err) {
                                    console.error(err);
                                }
                                res(output);
                                return {};
                            });
                        })
                        // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;
                    ];
                case 23:
                    pbtsResult = _a.sent();
                    // pbtsResult = await fs.readFileAsync(tempfile, 'utf-8').catch(function (res) { console.log(res) }) as any;
                    pbtsResult = pbtsResult.replace(/\$protobuf/gi, "protobuf").replace(/export namespace/gi, 'declare namespace');
                    pbtsResult = 'type Long = protobuf.Long;\n' + pbtsResult;
                    dtsOut = path.join(rootDir, pbconfig.dtsOutDir, pbconfig.outFileName + ".d.ts");
                    console.log("[egf-protobuf]解析js文件->完成");
                    return [4 /*yield*/, fs.existsAsync(dtsOut)];
                case 24:
                    isExit_dts = _a.sent();
                    if (!isExit_dts) return [3 /*break*/, 26];
                    console.log("[egf-protobuf]\u5220\u9664\u65E7.d.ts\u6587\u4EF6:" + dtsOut);
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            rimraf(dtsOut, function () {
                                res();
                            });
                        })];
                case 25:
                    _a.sent();
                    _a.label = 26;
                case 26:
                    dtsOutDirPath = path.dirname(dtsOut);
                    if (!(rootDir !== dtsOutDirPath)) return [3 /*break*/, 29];
                    return [4 /*yield*/, fs.existsAsync(dtsOutDirPath)];
                case 27:
                    isExit_dtsOutDir = _a.sent();
                    if (!!isExit_dtsOutDir) return [3 /*break*/, 29];
                    //
                    console.log("[egf-protobuf]\u521B\u5EFA.d.ts \u7684\u6587\u4EF6\u5939:" + dtsOutDirPath + "->");
                    return [4 /*yield*/, fs.mkdirAsync(dtsOutDirPath)];
                case 28:
                    _a.sent();
                    _a.label = 29;
                case 29:
                    console.log("[egf-protobuf]生成.d.ts文件->");
                    return [4 /*yield*/, fs.writeFileAsync(dtsOut, pbtsResult, 'utf-8').catch(function (res) { console.log(res); })];
                case 30:
                    _a.sent();
                    ;
                    console.log("[egf-protobuf]生成.d.ts文件->完成");
                    return [4 /*yield*/, fs.removeAsync(tempfile).catch(function (res) { console.log(res); })];
                case 31:
                    _a.sent();
                    ;
                    return [2 /*return*/];
            }
        });
    });
}
exports.generate = generate;
function initProj(projRoot, projType) {
    if (projRoot === void 0) { projRoot = "."; }
    return __awaiter(this, void 0, void 0, function () {
        var egretPropertiesPath, egretProperties, tsconfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('正在将 protobuf 源码拷贝至项目中...');
                    return [4 /*yield*/, fs.copyAsync(path.join(root, 'pblib'), path.join(projRoot, 'protobuf/library')).catch(function (res) { console.log(res); })];
                case 1:
                    _a.sent();
                    ;
                    return [4 /*yield*/, fs.mkdirpSync(path.join(projRoot, 'protobuf/protofile'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.mkdirpSync(path.join(projRoot, 'protobuf/bundles'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFileAsync((path.join(projRoot, 'protobuf/pbconfig.json')), pbconfigContent, 'utf-8').catch(function (res) { console.log(res); })];
                case 4:
                    _a.sent();
                    ;
                    if (!(projType === "egret")) return [3 /*break*/, 11];
                    egretPropertiesPath = path.join(projRoot, 'egretProperties.json');
                    return [4 /*yield*/, fs.existsAsync(egretPropertiesPath)];
                case 5:
                    if (!_a.sent()) return [3 /*break*/, 10];
                    console.log('正在将 protobuf 添加到 egretProperties.json 中...');
                    return [4 /*yield*/, fs.readJSONAsync(egretPropertiesPath)];
                case 6:
                    egretProperties = _a.sent();
                    egretProperties.modules.push({ name: 'protobuf-library', path: 'protobuf/library' });
                    egretProperties.modules.push({ name: 'protobuf-bundles', path: 'protobuf/bundles' });
                    return [4 /*yield*/, fs.writeFileAsync(path.join(projRoot, 'egretProperties.json'), JSON.stringify(egretProperties, null, '\t\t'))];
                case 7:
                    _a.sent();
                    console.log('正在将 protobuf 添加到 tsconfig.json 中...');
                    return [4 /*yield*/, fs.readJSONAsync(path.join(projRoot, 'tsconfig.json'))];
                case 8:
                    tsconfig = _a.sent();
                    tsconfig.include.push('protobuf/**/*.d.ts');
                    return [4 /*yield*/, fs.writeFileAsync(path.join(projRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, '\t\t')).catch(function (res) { console.log(res); })];
                case 9:
                    _a.sent();
                    ;
                    return [3 /*break*/, 11];
                case 10:
                    console.log('输入的文件夹不是白鹭引擎项目');
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.initProj = initProj;
//# sourceMappingURL=index.js.map