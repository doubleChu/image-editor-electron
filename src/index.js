const sharp = require('sharp')
const showContent = document.getElementById('show_file_content')

async function outputMeta() {
    const metadata = await sharp("src/pkgkkp.jpg").metadata()
    console.log(metadata);
    showContent.innerText = metadata;
}