#!/usr/bin/env node

const chalkAnimation = require('chalk-animation');
let tinify = require("tinify"),
    yargs = require('yargs'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path');
tinify.key = "6Z9kSwJupSrTcWyv60xV6XD5He8SFOzQ";

const miniTypes = ["jpg", "jpeg", "png"]
let checkImgType = (file) => {
    return miniTypes.findIndex(type => path.extname(file).includes(type)) > 0
}

let tiny = (fromPath, toPath, cb) => {
    var source = tinify.fromFile(fromPath);
    source.toFile(toPath, cb);
}
const tinyDir = (dir) => {
    fs.readdir(dir, (error, files) => {
        if (error) {
            console.log(chalk.bgRed(error))
            process.exit()
        }
        let promiseArr = [];
        let rainbow = chalkAnimation.neon('压缩中...');
        let str = "压缩中."
        let timer = setInterval(() => {
            console.log(str)
            str += "."
        }, 1000)
        let tinyStr = "以下文件即将开始压缩:"
        files.forEach(file => {
            // 类型是否符合
            if (checkImgType(file)) {
                tinyStr += file + " | "
                let toPath = path.join(dir, "tiny");
                !fs.existsSync(toPath) && fs.mkdirSync(toPath)
                promiseArr.push(new Promise((resolve, reject) => {
                    tiny(path.join(dir, file), path.join(toPath, file), (err) => {
                        if (err) {
                            console.log(chalk.bgRed(err))
                            reject(err)
                        }
                        resolve("success")
                    })
                }))
            }
        })
        console.log(chalk.yellow(tinyStr))
        Promise.all(promiseArr).then(res => {
            console.log(chalk.bgGreen("转换完成!"))
            // rainbow.stop()
            clearInterval(timer)
        })
    })
}

const tinyFile = (file) => {
    console.log(`开始压缩文件${file}`)
    if (checkImgType(file)) {
        let toPath = path.join(path.parse(file).dir, "tiny");
        !fs.existsSync(toPath) && fs.mkdirSync(toPath)
        console.log(path.join(toPath, path.basename(file)))
        tiny(file, path.join(toPath, path.basename(file)), (err) => {
            console.log(err)
        })
    } else {
        console.log(chalk.bgRed("不支持的类型"))
    }
}


yargs.command("path [img]", "选择需要压缩的图片路径", yarg => {
        yarg.positional('img', {
            alias: 'image',
            default: ".",
            demand: true,
            describe: '图片文件路径',
            type: 'string'
        })
    }, argv => {
        console.log(chalk.blue(argv.img))
        let imgPath = argv.img
        let pwd = process.cwd()
        let resultPath = path.join(pwd, imgPath)
        console.log(resultPath)
        let isFile = fs.statSync(resultPath).isFile()
        isFile ? tinyFile(resultPath) : tinyDir(resultPath)
    })
    .help().argv;