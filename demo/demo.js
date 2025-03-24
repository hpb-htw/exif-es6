import {EXIF} from "../dist/exif-es6.js";

window.addEventListener("load", () => {
    const img = document.getElementById("demo1");
    const imgData = EXIF.getData(img);
});
