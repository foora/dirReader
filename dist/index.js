"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require("fs");
const path = require("path");
// 读取目录，返回所有目录文件相对于root的路径
const readDir = (root, dir) => {
    let dirPath = path.join(root, dir);
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    }).then((result) => {
        return result.map((name) => path.join(dir, name));
    });
};
// 获取文件stats信息
const getFileStats = (path) => {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
};
// 忽略node_modules文件夹和.xxx类型文件
const needExclude = (file) => {
    if (/\/\.|^\.|node_modules/.test(file)) {
        return true;
    }
    return false;
};
const dirReader = ({ root = '', dirName = [''], extName = ['.js'] } = {}) => __awaiter(this, void 0, void 0, function* () {
    let rootUrl = path.resolve(process.cwd(), root);
    let result = []; // 遍历结果
    let PromiseGroup = dirName.map((dir) => {
        return readDir(rootUrl, dir);
    });
    let dirResult;
    try {
        dirResult = yield Promise.all(PromiseGroup);
    }
    catch (e) {
        throw e;
    }
    let files = Array.prototype.concat.apply([], dirResult); // 拉平数组
    let subDir = []; // 子目录集合
    for (let file of files) {
        let fileUrl = path.join(rootUrl, file);
        let stats = yield getFileStats(fileUrl);
        let ext = path.extname(file);
        if (stats.isFile()) {
            if (extName.length === 0) {
                result.push(file);
            }
            else {
                extName.indexOf(ext) !== -1 && result.push(file);
            }
        }
        else if (stats.isDirectory() && !needExclude(file)) {
            subDir.push(file);
        }
    }
    let subDirResult = [];
    if (subDir.length !== 0) {
        try {
            subDirResult = yield dirReader({ root: rootUrl, dirName: subDir, extName });
        }
        catch (e) {
            throw e;
        }
    }
    return Array.prototype.concat.call([], result, subDirResult);
});
module.exports = dirReader;
