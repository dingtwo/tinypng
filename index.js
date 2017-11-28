#!/usr/bin/env node

const chalkAnimation = require('chalk-animation');
let tinify = require("tinify"),
    yargs = require('yargs'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path');
tinify.key = "6Z9kSwJupSrTcWyv60xV6XD5He8SFOzQ";

const miniTypes = ["jpg", "jpeg", "png"]
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
        fs.readdir(path.resolve(__dirname, imgPath), (error, files) => {
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
                let index = miniTypes.findIndex(type => path.extname(file).includes(type))

                if (index > 0) {
                    tinyStr += file + " | "

                    let toPath = path.resolve(__dirname, imgPath, "tiny");
                    !fs.existsSync(toPath) && fs.mkdirSync(toPath)
                    // Add a new dot every second
                    promiseArr.push(new Promise((resolve, reject) => {
                        tiny(path.resolve(__dirname, imgPath, file), path.resolve(__dirname, imgPath, "tiny", file), (err) => {
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
    })
    .help().argv;

let tiny = (fromPath, toPath, cb) => {
    var source = tinify.fromFile(fromPath);
    source.toFile(toPath, cb);
}