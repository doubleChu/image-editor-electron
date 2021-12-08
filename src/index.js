const path = require('path')
const sharp = require('sharp')
const remote = require('@electron/remote')

const {
    extname
} = require('path/posix')
const {
    log
} = require('console')
const dialog = remote.dialog

let canvas = document.querySelector('#theimg')
let ctx = canvas.getContext('2d')
let img = new Image()
img.src = './z8dg.png'
img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(this, 0, 0)
}

function open_img() {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: '选择编辑图片',
        //默认路径,默认选择的文件
        defaultPath: '/home/doublechu/image-editor/src/pkgkkp.jpg',
        //过滤文件后缀
        filters: [{
                name: '图片',
                extensions: ['jpg', 'png', 'jpeg', 'webp']
            },
            {
                name: '所有文件',
                extensions: ['*']
            }
        ],
        //打开按钮
        buttonLabel: '打开',
        //回调结果渲染到img标签上
    }).then(result => {
        if (result.filePaths[0]) {
            img.setAttribute("src", result.filePaths[0])
        }
    }).catch(err => {
        console.log(err)
    })
}

function save_img() {
    dialog.showSaveDialog({
        title: '保存编辑图片',
        defaultPath: '/home/doublechu/image-editor/src/',
        // defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: '保存',

        filters: [{
                name: '图片',
                extensions: ['jpg', 'png', 'jpeg', 'webp']
            },
            {
                name: '所有文件',
                extensions: ['*']
            }
        ],
    }).then(result => {
        // Stating whether dialog operation was cancelled or not.
        console.log(result.canceled);
        if (!result.canceled) {
            console.log(result.filePath);
            let extname = path.extname(result.filePath).substring(1)
            if (extname == 'jpeg' || extname == 'jpg')
                sharp('src' + img.getAttribute("src").substring(1)).toFormat('jpg').toFile(result.filePath)
            else {
                sharp('src' + img.getAttribute("src").substring(1)).toFormat(extname).toFile(result.filePath)
            }
        }
    }).catch(err => {
        console.log(err)
    });
}

async function graysc() {
    try {
        await sharp('src' + img.getAttribute("src").substring(1))
            .grayscale()
            .toFile('src/edited-' + img.getAttribute("src").substring(2));
        img.setAttribute("src", "./edited-" + img.getAttribute("src").substring(2))
    } catch (error) {
        console.log(error);
    }
}

function cropImage() {
    new Dialog({
        title: '确定参数',
        content: `<form id="editData">
        <label>宽度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        ：<input value="500" name="width" required></label>
        <label>高度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        ：<input value="300" name="height" required></label>
        <br>
        <label>垂直距离：<input value="120" name="top" required></label>
        <label>水平距离：<input value="60" name="left" required></label>
        </form>`,
        buttons: [{
            value: '确定',
            form: 'editData'
        }],
        onShow: function () {
            this.querySelector('form').addEventListener('submit', event => {
                event.preventDefault()
                // 输入框内容赋值
                crop_width = this.querySelector('[name="width"]').value
                crop_height = this.querySelector('[name="height"]').value
                crop_top = this.querySelector('[name="top"]').value
                crop_left = this.querySelector('[name="left"]').value
                console.log(crop_width, crop_height, crop_top, crop_left)
                // 弹框关闭
                this.remove()
                cropImageS(crop_width, crop_height, crop_top, crop_left)
            })
        }
    });
}

async function cropImageS(w, h, t, l) {
    try {
        await sharp('src' + img.getAttribute("src").substring(1))
            .extract({
                width: Number(crop_width),
                height: Number(crop_height),
                left: Number(crop_left),
                top: Number(crop_top)
            })
            .toFile('src/edited-' + img.getAttribute("src").substring(2))
        img.setAttribute("src", "./edited-" + img.getAttribute("src").substring(2))
    } catch (error) {
        console.log(error)
    }
}

const genSrcAndDest = (data) => {
    const dataInt8 = new Uint8ClampedArray(data.buffer)
    const simpleChannelLength = dataInt8.length / 4
    const r = new Uint8ClampedArray(simpleChannelLength)
    const g = new Uint8ClampedArray(simpleChannelLength)
    const b = new Uint8ClampedArray(simpleChannelLength)
    const a = new Uint8ClampedArray(simpleChannelLength)
    const _r = new Uint8ClampedArray(simpleChannelLength)
    const _g = new Uint8ClampedArray(simpleChannelLength)
    const _b = new Uint8ClampedArray(simpleChannelLength)
    const _a = new Uint8ClampedArray(simpleChannelLength)
    for (let i = 0; i < simpleChannelLength; i++) {
        _r[i] = r[i] = dataInt8[i * 4]
        _g[i] = g[i] = dataInt8[i * 4 + 1]
        _b[i] = b[i] = dataInt8[i * 4 + 2]
        _a[i] = a[i] = dataInt8[i * 4 + 3]
    }
    return {
        src: [r, g, b, a],
        dest: [_r, _g, _b, _a]
    }
}

function genKernelsForGaussian(sigma, n) {
    const wIdeal = Math.sqrt((12 * Math.pow(sigma, 2)) / n + 1)
    let wl = Math.floor(wIdeal)
    if (wl % 2 === 0) {
        wl--
    }
    const wu = wl + 2
    let m =
        (12 * Math.pow(sigma, 2) - n * Math.pow(wl, 2) - 4 * n * wl - 3 * n) /
        (-4 * wl - 4)
    m = Math.round(m)
    const sizes = []
    for (let i = 0; i < n; i++) {
        sizes.push(i < m ? wl : wu)
    }
    return sizes
}

const imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
)
const {
    width,
    height
} = imageData
const {
    src: srcRgba,
    dest: destRgba
} = genSrcAndDest(imageData.data)

function gaussianBlur() {


}