const sharp = require('sharp')
const remote = require('electron').remote;

function open_img() {
    const dialog = remote.dialog
dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ["openFile", "multiSelections"]
}).then(result => {
    if (result.canceled === false) {
        console.log("Selected file paths:")
        console.log(result.filePaths)
    }
}).catch(err => {
    console.log(err)
})
}