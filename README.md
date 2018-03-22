# dirReader
文件夹文件遍历器

## 介绍
用于遍历获取文件夹中的文件，并返回文件相对于根目录的路径

## 要求
- node > 8 

## 安装
```
npm install foora/dirReader
或者
yarn add foora/dirReader
```

## 使用
注意： 默认不会遍历node_modules或者.xxx类型的目录
```
const dirReader = require('dirReader');

options = {
    root: './'
    dirName: ['src'],
    extName: ['.js', '.html']
}

dirReader(options).then((data) => {
    // do something
    });
```

##### options:
- root(string): 根目录地址      
内部计算实际根目录方法:
```
// root为绝对路径，则根目录就是该路径，若root为相对路径，则是相对于你执行代码的目录环境
path.resolve(process.cwd(), root);
```
- dirName(string[]): 需要遍历的目录名,若无则默认从根目录开始遍历（遍历出的文件包含根目录下的文件）

- extName(string[]): 遍历时要获取的文件的extname，默认为['.js']，获取js文件。

##### 遍历后返回的数据
data(string[]): 文件相对于根目录的地址      
例子：['src/index.ts', 'dist/index.js']