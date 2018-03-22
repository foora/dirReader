import fs = require('fs');
import path = require('path');

interface ReadDir {
    (root: string, dir: string): Promise<string[]>
}
// 读取目录，返回所有目录文件相对于root的路径
const readDir: ReadDir = (root: string, dir: string): Promise<string[]> => {
    let dirPath = path.join(root, dir);
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        })
    }).then((result) => {
        return (result as string[]).map((name) => path.join(dir, name));
    })
}

interface GetFileStats {
    (path: string): Promise<fs.Stats>
}
// 获取文件stats信息
const getFileStats: GetFileStats = (path: string): Promise<fs.Stats> => {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        })
    })
}

interface NeedExclude {
    (file:string): boolean
}
// 忽略node_modules文件夹和.xxx类型文件
const needExclude: NeedExclude = (file: string) => {
    if(/\/\.|^\.|node_modules/.test(file)) {
        return true;
    }
    return false;
}

interface dirReaderOpts {
    root?: string
    dirName?: string[]
    extName?: string[]
}
interface DirReader {
    (opts?: dirReaderOpts): Promise<string[]>
}
const dirReader: DirReader = async ({root = '', dirName = [''], extName = ['.js']}: dirReaderOpts = {}): Promise<string[]> => {
    let rootUrl: string = path.resolve(process.cwd(), root);
    let result: string[] = []; // 遍历结果

    let PromiseGroup: Promise<string[]>[] = dirName.map((dir) => {
        return readDir(rootUrl, dir);
    });
    let dirResult: string[][]
    try {
        dirResult = await Promise.all(PromiseGroup);
    } catch(e) {
        throw e;
    }
    let files: string[] = Array.prototype.concat.apply([], dirResult); // 拉平数组
    let subDir: string[] = []; // 子目录集合
    for (let file of files) {
        let fileUrl = path.join(rootUrl, file);
        let stats: fs.Stats = await getFileStats(fileUrl);
        let ext = path.extname(file);
        if (stats.isFile()) {
            if (extName.length === 0) {
                result.push(file);
            } else {
                extName.indexOf(ext) !== -1 && result.push(file);
            }
        } else if (stats.isDirectory() && !needExclude(file)) {
            subDir.push(file);
        }
    }
    let subDirResult: string[] = [];
    if (subDir.length !== 0) {
        try {
            subDirResult = await dirReader({root: rootUrl, dirName: subDir, extName});
        } catch(e) {
            throw e;
        }
    }
    return Array.prototype.concat.call([], result, subDirResult);
}

export = dirReader;