import {EXIF} from "../lib/exif-es6.ts";
import {expect, test} from "vitest";

import {URL} from "node:url";
import { openAsBlob } from 'node:fs';
import {JSDOM} from 'jsdom';

global.DOMParser = new JSDOM().window.DOMParser

test('Exif can process ArrayBuffer', async () => {
    const blob = await openAsBlob('./tests/Bush-dog.jpg');
    const buffer = await blob.arrayBuffer();
    const imgInfo = await  EXIF.readFromBinaryFile(buffer);
    const pretty = EXIF.pretty(imgInfo);
    console.log(pretty);
});

test('Exif can process image with Blob src', async () => {
    const blob = await openAsBlob('./tests/Bush-dog.jpg');
    const src = URL.createObjectURL(blob);
    const img = {src:src};
    const imgInfo = await EXIF.getData(img);
    const pretty = EXIF.pretty(imgInfo);
    console.log(pretty)
});

test('Exif can process blob directly', async () => {
    const blob = await openAsBlob('./tests/Bush-dog.jpg');
    const imgInfo = await EXIF.getData(blob);
    const pretty = EXIF.pretty(imgInfo);
    console.log(pretty);
});

