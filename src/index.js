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
            if (img.src.startsWith("data:image/png;base64,")) {
                sharp(Buffer.from(img.src.replace("data:image/png;base64,", ""), 'base64')).toFile(result.filePath)
            } else {
                let extname = path.extname(result.filePath).substring(1)
                if (extname == 'jpeg' || extname == 'jpg')
                    sharp('src' + img.getAttribute("src").substring(1)).toFormat('jpg').toFile(result.filePath)
                else {
                    sharp('src' + img.getAttribute("src").substring(1)).toFormat(extname).toFile(result.filePath)
                }
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
            this.querySelector('#editData').addEventListener('submit', event => {
                event.preventDefault()
                // 输入框内容赋值
                let crop_width = this.querySelector('[name="width"]').value
                let crop_height = this.querySelector('[name="height"]').value
                let crop_top = this.querySelector('[name="top"]').value
                let crop_left = this.querySelector('[name="left"]').value
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
                width: Number(w),
                height: Number(h),
                left: Number(t),
                top: Number(l)
            })
            .toFile('src/edited-' + img.getAttribute("src").substring(2))
        img.setAttribute("src", "./edited-" + img.getAttribute("src").substring(2))
    } catch (error) {
        console.log(error)
    }
}

const getSrcDestData = (data) => {
    const dataInt8 = new Uint8ClampedArray(data.buffer)
    const channelLength = dataInt8.length / 4
    const r = new Uint8ClampedArray(channelLength)
    const g = new Uint8ClampedArray(channelLength)
    const b = new Uint8ClampedArray(channelLength)
    const a = new Uint8ClampedArray(channelLength)
    const _r = new Uint8ClampedArray(channelLength)
    const _g = new Uint8ClampedArray(channelLength)
    const _b = new Uint8ClampedArray(channelLength)
    const _a = new Uint8ClampedArray(channelLength)
    for (let i = 0; i < channelLength; i++) {
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

function getGaussianKernels(sigma, n) {
    const wIdeal = Math.sqrt((12 * Math.pow(sigma, 2)) / n + 1)
    let w_l = Math.floor(wIdeal)
    if (w_l % 2 === 0) {
        w_l--
    }
    const wu = w_l + 2
    let m =
        (12 * Math.pow(sigma, 2) - n * Math.pow(w_l, 2) - 4 * n * w_l - 3 * n) /
        (-4 * w_l - 4)
    m = Math.round(m)
    const sizes = []
    for (let i = 0; i < n; i++) {
        sizes.push(i < m ? w_l : wu)
    }
    return sizes
}
const mergeChannels = ([r, g, b, a]) => {
    const channelLength = r.length
    const data = new Uint8ClampedArray(channelLength * 4)
    for (let i = 0; i < channelLength; i++) {
        data[4 * i] = r[i]
        data[4 * i + 1] = g[i]
        data[4 * i + 2] = b[i]
        data[4 * i + 3] = a[i]
    }
    return data
}

// horizontal fast motion blur
function horiFastMotionBlur(src, dest, width, height, radius) {
    for (let i = 0; i < height; i++) {
        let accumulation = radius * src[i * width]
        for (let j = 0; j <= radius; j++) {
            accumulation += src[i * width + j]
        }
        dest[i * width] = Math.round(accumulation / (2 * radius + 1))
        for (let j = 1; j < width; j++) {
            const left = Math.max(0, j - radius - 1)
            const right = Math.min(width - 1, j + radius)
            accumulation =
                accumulation + (src[i * width + right] - src[i * width + left])
            dest[i * width + j] = Math.round(accumulation / (2 * radius + 1))
        }
    }
}

// vertical fast motion blur
function vertiFastMotionBlur(src, dest, width, height, radius) {
    for (let i = 0; i < width; i++) {
        let accumulation = radius * src[i]
        for (let j = 0; j <= radius; j++) {
            accumulation += src[j * width + i]
        }
        dest[i] = Math.round(accumulation / (2 * radius + 1))
        for (let j = 1; j < height; j++) {
            const top = Math.max(0, j - radius - 1)
            const bottom = Math.min(height - 1, j + radius)
            accumulation =
                accumulation + src[bottom * width + i] - src[top * width + i]
            dest[j * width + i] = Math.round(accumulation / (2 * radius + 1))
        }
    }
}

function _fastBlur(src, dest, width, height, radius) {
    horiFastMotionBlur(dest, src, width, height, radius)
    vertiFastMotionBlur(src, dest, width, height, radius)
}

function fastBlur(src, dest, width, height, sigma) {
    const boxes = getGaussianKernels(sigma, 3)
    for (let i = 0; i < src.length; i++) {
        dest[i] = src[i]
    }
    _fastBlur(src, dest, width, height, (boxes[0] - 1) / 2)
    _fastBlur(src, dest, width, height, (boxes[1] - 1) / 2)
    _fastBlur(src, dest, width, height, (boxes[2] - 1) / 2)
}

function gaussianBlurH(src, dest, width, height, sigma) {
    const radius = Math.round(sigma * 3) // kernel size
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let accumulation = 0
            let weightSum = 0
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const x = Math.min(width - 1, Math.max(0, i + dx))
                    const y = Math.min(height - 1, Math.max(0, j + dy))
                    // calc weight
                    const weight =
                        Math.exp(
                            -(Math.pow(dx, 2) + Math.pow(dy, 2)) / (2 * Math.pow(sigma, 2))
                        ) /
                        (Math.PI * 2 * Math.pow(sigma, 2))
                    accumulation += src[y * width + x] * weight
                    weightSum += weight
                }
            }
            dest[j * width + i] = Math.round(accumulation / weightSum)
        }
    }
}

function simpBoxBlur(src, dest, width, height, radius) {
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let accumulation = 0
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const x = Math.min(width - 1, Math.max(0, i + dx))
                    const y = Math.min(height - 1, Math.max(0, j + dy))
                    accumulation += src[y * width + x]
                }
            }
            dest[j * width + i] = Math.round(
                accumulation / Math.pow(2 * radius + 1, 2)
            )
        }
    }
}

function boxBlur(src, dest, width, height, sigma) {
    const kernels = getGaussianKernels(sigma, 3)
    // radius * 2 + 1 = kernel size
    simpBoxBlur(src, dest, width, height, (kernels[0] - 1) / 2)
    // 注意这里要颠倒 src 和 dest 的顺序
    simpBoxBlur(dest, src, width, height, (kernels[1] - 1) / 2)
    simpBoxBlur(src, dest, width, height, (kernels[2] - 1) / 2)
}

function blur_c(type) {
    new Dialog({
        title: '确定模糊参数',
        content: `<form id="blurData">
        <label>Sigma：<input value="5" name="sigma" required></label>
        </form>`,
        buttons: [{
            value: '确定',
            form: 'blurData'
        }],
        onShow: function () {
            this.querySelector('#blurData').addEventListener('submit', event => {
                event.preventDefault()
                // 输入框内容赋值
                let sig = Number(this.querySelector('[name="sigma"]').value)
                // 弹框关闭
                this.remove()
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
                } = getSrcDestData(imageData.data)
                for (let i = 0; i < 3; i++) {
                    if (type == 0)
                        gaussianBlurH(srcRgba[i], destRgba[i], width, height, sig)
                    else if (type == 1)
                        simpBoxBlur(srcRgba[i], destRgba[i], width, height, sig)
                    else if (type == 2)
                        boxBlur(srcRgba[i], destRgba[i], width, height, sig)
                    else if (type == 3)
                        fastBlur(srcRgba[i], destRgba[i], width, height, sig)
                }
                const destData = mergeChannels(destRgba)
                imageData.data.set(destData)
                ctx.putImageData(imageData, 0, 0)
                img.src = canvas.toDataURL('image/png')
            })
        }
    });
}