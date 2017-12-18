#!/usr/bin/env node

let tinify = require("tinify"),
    yargs = require('yargs'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path');
tinify.key = "6Z9kSwJupSrTcWyv60xV6XD5He8SFOzQ";
const ora = require('ora');
const miniTypes = ["jpg", "jpeg", "png"]
const spinner = ora('压缩中')
let checkImgType = (file) => {
    return miniTypes.findIndex(type => path.extname(file).includes(type)) > 0
}

let tiny = (fromPath, toPath, cb) => {
    var source = tinify.fromFile(fromPath);
    source.toFile(toPath, cb);
}

/**
 * 压缩目录下所有符合条件的图片
 * @param {string} dir 
 */
const tinyDir = (dir) => {
    fs.readdir(dir, (error, files) => {
        if (error) {
            console.log(chalk.bgRed(error))
            process.exit()
        }
        let promiseArr = [];
        let tinyStr = "以下文件即将开始压缩:"

        files.forEach(file => {
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
        spinner.start();
        Promise.all(promiseArr).then(res => {
            spinner.color = "green";
            spinner.text = "转换完成!"
            spinner.succeed()
        })
    })
}

/**
 * 压缩文件
 * @param {string} file 
 */
const tinyFile = (file) => {
    console.log(`开始压缩文件${file}`)
    spinner.start();
    if (checkImgType(file)) {
        let toPath = path.join(path.parse(file).dir, "tiny");
        !fs.existsSync(toPath) && fs.mkdirSync(toPath)
        tiny(file, path.join(toPath, path.basename(file)), (err) => {
            if (err) {
                console.log(chalk.bgRed(err))
                process.exit()
            }
            spinner.color = "green";
            spinner.text = "转换完成!"
            spinner.succeed()
        })
    } else {
        console.log(chalk.bgRed("不支持的类型"))
        process.exit()
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
        // FIXME: 绝对路径时path.join不对
        let pwd = process.cwd()
        let resultPath = path.join(pwd, imgPath)
        let isFile = fs.statSync(resultPath).isFile()
        isFile ? tinyFile(resultPath) : tinyDir(resultPath)
    })
    .help().argv;