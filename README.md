# Exif-es6

Port the library [*exif-js*](https://github.com/exif-js/exif-js) in EcmaScript 2020

A JavaScript library for reading [EXIF meta data](https://en.wikipedia.org/wiki/Exchangeable_image_file_format) from image files.

You can use it on images in the browser, either from an image or a file input element. 
Both EXIF and IPTC metadata are retrieved.
This package can be used as a ES6 module.


**Note**: The EXIF standard applies only to `.jpg` and `.tiff` images. 
EXIF logic in this package is based on the EXIF standard v2.2 ([JEITA CP-3451, included in this repo](/spec/Exif2-2.pdf)).

## Install

Install `exif-es6` through [NPM](https://www.npmjs.com/#getting-started):

```shell
npm install exif-es --save
```
 

Then you can import it in your JavaScript:

```javascript
import {EXIF} from './node_modules/exif-es6/dist/exif-es.js'
```

## Usage

### Exif data from an regular <img>-Tag

* JavaScript:

```javascript
//TODO
```

* HTML:
 
```html
<img id="demo1" src="some-image.jpg" />
<pre id="demo1-exif"></pre>
```

### Exif data from an <img>-Tag with base64 src

* JavaScript

```javascript
//TODO
```

* HTML

```html
<img id="demo2" src="data:image/jpeg;base64, .... "/>
<pre id="demo2-exif"></pre>
```

### Exif data from a Object URL

#### Example 1: Fetch an image over internet

```javascript
// Todo
```


#### Example 2: Uploaded image from user

* JavaScript

```javascript
// To be done
```

* HTML

```html
<input type="file" id="fileElem" accept="image/*" style="display:none" />
<a class="button-like" href="#" id="fileSelect">upload an image</a>
```

### Caching


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


