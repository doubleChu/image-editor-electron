const path = require('path')
const sharp = require('sharp')
const remote = require('@electron/remote')

const {
    extname
} = require('path/posix')
const dialog = remote.dialog

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
            let image = document.getElementById('theimg')
            image.setAttribute("src", result.filePaths[0])
        }
    }).catch(err => {
        console.log(err)
    })
}

function save_img() {
    let image = document.getElementById('theimg')
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
                sharp('src' + image.getAttribute("src").substring(1)).toFormat('jpg').toFile(result.filePath)
            else {
                sharp('src' + image.getAttribute("src").substring(1)).toFormat(extname).toFile(result.filePath)
            }
        }
    }).catch(err => {
        console.log(err)
    });
}

async function graysc() {
    let image = document.getElementById('theimg')
    try {
        await sharp('src' + image.getAttribute("src").substring(1))
            .grayscale()
            .toFile('src/edited-' + image.getAttribute("src").substring(2));
            image.setAttribute("src", "./edited-" + image.getAttribute("src").substring(2))
    } catch (error) {
        console.log(error);
    }
}

async function cropImage() {
    let image = document.getElementById('theimg')
    new Dialog({
        title: '修改昵称',
        content: `<form id="editForm">
            姓名：<input value="123" name="nickname" required>
        </form>`,
        buttons: [{
            value: '修改',
            form: 'editForm'
        }],
        onShow: function () {
            this.querySelector('form').addEventListener('submit', event => {
                event.preventDefault();
                // 输入框内容赋值
                eleOutput.textContent = this.querySelector('[name="nickname"]').value;
                // 弹框关闭
                this.remove();
            });
        }
    });
    // try {
    //   await sharp('src' + image.getAttribute("src").substring(1))
    //     .extract({ width: 500, height: 330, left: 120, top: 70  })
    //     .toFile('src/edited-' + image.getAttribute("src").substring(2));
    // } catch (error) {
    //   console.log(error);
    // }
  }