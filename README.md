# Exif-es6

Port the library `exif-js` in EcmaScript 2015

A JavaScript library for reading [EXIF meta data](https://en.wikipedia.org/wiki/Exchangeable_image_file_format) from image files.

You can use it on images in the browser, either from an image or a file input element. 
Both EXIF and IPTC metadata are retrieved.
This package can be used as a ES6 module.
<s>This package can also be used in AMD or CommonJS environments.</s> (Not sure, if I can implement it)

**Note**: The EXIF standard applies only to `.jpg` and `.tiff` images. EXIF logic in this package is based on the EXIF standard v2.2 ([JEITA CP-3451, included in this repo](/spec/Exif2-2.pdf)).

## Install

Install `exif-es6` through [NPM](https://www.npmjs.com/#getting-started):

    npm install exif-es --save 

Then you can import it in your JavaScript:

```javascript
import {EXIF} from './node_modules/exif-es6/lib/exif.js'
```

## Usage

Start with calling the `EXIF.getData` function. You pass it an image as a parameter:
- either an image from a `<img src="image.jpg">`

```javascript
window.addEventListener("load", async () => {
    const image = document.getElementById("image.jpeg");
    const imageData = await EXIF.getData(image);
    console.log(imageData.exifdata);
    const make = EXIF.getTag(imageData, "Make");
    const model = EXIF.getTag(imageData, "Model");
    console.log({make, model});
});
```

- OR a user selected image in a `<input type="file" id="user-file">` element on your page.

```javascript
const fileInput = document.getElementById("user-file");
fileInput.addEventListener("change", async function (){
    if(this.files.length > 0) {
        const file = this.files[0];
        const imageData = await EXIF.getData(file);
    }
});
```

