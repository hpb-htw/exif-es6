# Exif-es6

Port the library [*exif-js*](https://github.com/exif-js/exif-js) in EcmaScript 2020

A JavaScript library for reading [EXIF meta data](https://en.wikipedia.org/wiki/Exchangeable_image_file_format) from image files.

You can use it on images in the browser, either from an image or a file input element. 
Both EXIF and IPTC metadata are retrieved.
This package can be used as a ES6 module.


**Note**: The EXIF standard applies only to `.jpg` and `.tiff` images. 
EXIF logic in this package is based on the EXIF standard v2.2 ([JEITA CP-3451, included in this repo](/specification/Exif2-2.pdf)).

## Install

Install `exif-es6` through [NPM](https://www.npmjs.com/#getting-started):

```shell
npm install exif-es6 --save
```
 

Then you can import it in your JavaScript:

```javascript
import {EXIF} from './node_modules/exif-es6/dist/exif-es6.js'
```

If you use TypeScript, you can import TypeScript-module in your own file:

```typescript
import {EXIF} from "./node_modules/exif-es6/lib/exif-es6.(j|c)s"; // ← 
// which extension you use, depends on your TypeScript compiler/version etc.
```

There is no JavaScript Distribution in UMD form. 
If you need it, you can transpile the TypeScript files by yourself. 

## Usage

### Exif data from a regular HTML img-Tag

* JavaScript:

```javascript
async function testNormalImageElement() {
    const img = document.getElementById("demo1");
    const imageInfo = await EXIF.getData(img);
    console.log('testNormalImageElement', EXIF.getAllTags(imageInfo));
    document.getElementById("demo1-exif").textContent = EXIF.pretty(imageInfo);
}
document.addEventListener('load', () => {
    testNormalImageElement();
})
```

* HTML:
 
```html
<img id="demo1" src="some-image.jpg" />
<pre id="demo1-exif"></pre>
```

### Exif data from a HTML img-Tag with base64 src

* JavaScript

```javascript
async function testBase64Image() {
    const img = document.getElementById("demo2");
    const imageInfo = await EXIF.getData(img);
    console.log('testBase64Image', EXIF.getAllTags(imageInfo));
    document.getElementById("demo2-exif").textContent = EXIF.pretty(imageInfo);
}
document.addEventListener('load', () => {
    testBase64Image();
})
```

* HTML

```html
<img id="demo2" src="data:image/jpeg;base64, .... "/>
<pre id="demo2-exif"></pre>
```

### Exif data from an Object URL

#### Example 1: Fetch an image over internet

```javascript
async function testObjectUrl() {
    const src = 'dsc_09827.jpg';
    const response = await fetch(src, {method: "GET"});
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const testImage = new Image();
    testImage.src = objectUrl;
    const imageInfo = await EXIF.getData(testImage);
    console.log("testObjectUrl", EXIF.getAllTags(imageInfo) );
    document.getElementById("demo3-container").prepend(testImage);
    document.getElementById("demo3-exif").textContent = EXIF.pretty(imageInfo);
    // if we don't need objectUrl anymore, we can free memory from it
    URL.revokeObjectURL(objectUrl);
}
```

```html
<div id="demo3-container">
    <pre id="demo3-exif"></pre>
</div>
```

#### Example 2: Uploaded image from user

* JavaScript

```javascript
function initTestUploadFile() {
    const fileSelect = document.getElementById("fileSelect");
    const fileElem = document.getElementById("fileElem");
    fileSelect.addEventListener("click", (e) => {
            if (fileElem) { fileElem.click(); }
            e.preventDefault(); // prevent navigating to href-address
        }
    );
    const createImgElement = (file) => {
        const img = document.createElement("img");
        img.classList.add("menu-image");
        img.src = URL.createObjectURL(file);
        return img;
    }
    fileElem.addEventListener("change", async (event) => {
        const files = event.target.files;
        if(files.length === 1) {
            const img = createImgElement(files[0]);
            const imageInfo = await EXIF.getData(img);
            console.log(EXIF.getAllTags(imageInfo));
            document.getElementById('demo4-container').prepend(img);
            document.getElementById('demo4-exif').textContent = EXIF.pretty(imageInfo)
        }
    });
}
document.addEventListener('load', () => {
    initTestUploadFile();
})
```

* HTML

```html
<input type="file" id="fileElem" accept="image/*" style="display:none" />
<a class="button-like" href="#" id="fileSelect">upload an image</a>
<div id="demo4-container">
    <pre id="demo4-exif"></pre>
</div>
```

### Low-level

This library exposes experimentally three functions in module `byte-seeker.ts`.
See API for their usage.

## Caching


This library does not cache metadata (Exif, IPTC, if applicable Xmp) into the Image Element,
as [exif-js](https://github.com/exif-js/exif-js) does.

If you need to cache the result, just do it in your code. One way to do it:

```javascript
const img = document.getElementById("image");
const imgInfo = await EXIF.getData(img);
Object.assign(img, imgInfo); 
```

Now your img object has also three properties:

* `img.exifdata`
* `img.iptcdata`
* `img.xmpdata`


