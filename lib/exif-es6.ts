import {findEXIFinJPEG, findIPTCinJPEG, findXMPinJPEG} from "./byte-seeker.js";
import type {ImageInfo, Fraction, LiteralMap} from "./types.js";


function base64ToArrayBuffer(base64:string):ArrayBuffer {
    base64 = base64.replace(/^data:([^;]+);base64,/gmi, '');
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}

/**
 * export for testing only
 * */
async function fetchURLToBlob(url:string):Promise<Blob> {
    const response = await fetch(url, {
        method: "GET",
    });
    return await response.blob();
}

/**
 * export for testing only
 * */
async function fetchImageData(img:HTMLImageElement|Blob|File):Promise<ImageInfo> {
    // @ts-ignore
    const src = img?.src;
    if(src) {
        if (/^data:/i.test(src)) { // Data URI
            const arrayBuffer = base64ToArrayBuffer(src);
            return findInfoFromBinary(arrayBuffer);
        } else if (/^blob:/i.test(src)) { // Object URL
            const blob = await fetchURLToBlob(src);
            return readBlob(blob);
        } else { // common HTTP(S)
            const response = await fetch(src, {
                method: 'GET'
            });
            const blob = await response.blob();
            return readBlob(blob);
        }
    } else if(img instanceof Blob || img instanceof File) {
        return await readBlob(img);
    } else {
        throw new TypeError(`Argument ${img} is not an image.`);
    }
}

function readBlob(blob:Blob|File) : Promise<ImageInfo> {
    return new Promise<ImageInfo>((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.addEventListener('load', (event)=> {
            // @ts-ignore
            const arrayBuffer = event.target.result as ArrayBuffer;
            const imageInfo = findInfoFromBinary(arrayBuffer);
            resolve(imageInfo);
        });
    });
}


function findInfoFromBinary(binFile:ArrayBuffer):ImageInfo {
    const result:ImageInfo = {
        exifdata: undefined,
        iptcdata: undefined,
        xmpdata: undefined
    };
    const data = findEXIFinJPEG(binFile);
    result.exifdata = (data || {}) as LiteralMap;
    const iptcdata = findIPTCinJPEG(binFile);
    result.iptcdata = (iptcdata || {}) as LiteralMap;
    if (EXIF.isXmpEnabled) {
        const xmpdata= findXMPinJPEG(binFile);
        result.xmpdata = xmpdata || {};
    }
    return result;
}

export class EXIF {
    private static _isXmpEnabled = true;

    static get isXmpEnabled() {
        return EXIF._isXmpEnabled;
    }

    private constructor() {
        //"prevent to use `new EXIF()`"
        // Nothing to do
    }

    /**
     * enable XMP data
     * */
    static enableEmp = () => {
        EXIF._isXmpEnabled = true;
    }

    /**
     * get Exif-data from an image.
     * If the image has not been processed yet, it is processed. Exif-data is cached in image itselft for next use.
     * @param img one of:
     *
     * - a regular HTML <img>-Element
     * - an image with base64 encoding in src-attribute
     * - an image with Object URL data in src-attribute
     * - a Blob-object
     * - a File-object
     *
     * @return a Promise which is resolved to an object with following properties:
     *
     * - `exifdata`,
     * - `iptcdata`
     * - `xmpdata`
     * */
    static getData = async (img: HTMLImageElement|Blob|File): Promise<ImageInfo> => {
        return fetchImageData(img);
    };

    /**
     * get value of an Exif-tag, if the image exists.
     * {@link EXIF.showExifTags()} returns the list of valid Exif tags
     *
     * @param img ImageInfo
     * @param tag a valid Exif tag.
     *
     * @return the value of the Exif-tag, or undefined if the tag does not exist.
     * */
    static getTag = (img:ImageInfo, tag:string): any => {
        return img?.exifdata?.[tag];
    }

    /**
     * get value of a IPTC tag
     * @param img ImageInfo
     * @param tag a valid IPTC tag
     * */
    static getIptcTag =(img:ImageInfo, tag:string): any => {
        return img?.iptcdata?.[tag];
    }

    /**
     * TODO: rewrite this method to get other metadata
     * */
    static getAllTags = (img: ImageInfo):LiteralMap=> {
        const data = img.exifdata || {},
            tags:LiteralMap = {};
        for(let [key, value] of Object.entries(data)) {
            tags[key] = value;
        }
        return tags;
    }

    /**
     * prettifies ImageData in human-readable string
     * TODO: parse the blob
     * @param img
     * @return string
    * */
    static pretty = (img:ImageInfo):string => {
        const data = img.exifdata || {};
        let strPretty = "";
        for(const [key, value] of Object.entries(data)) {
            if(typeof value === "object") {
                if (value instanceof Number) {
                    const val = value as Fraction
                    strPretty += `${key} : ${val} [${val.numerator}/${val.denominator}]\r\n`;
                } else {
                    strPretty += `${key} : [${value.length} values]\r\n`;
                }
            } else {
                strPretty += `${key} : ${value}\r\n`;
            }
        }
        return strPretty;
    }

    /**
     * Low-level function to get Exif and other information directly from an {@link ArrayBuffer}
     * @param binFile binary data (for example from a file)
     * @return an object that contains Exif data, IPTC data, and if enabled, also Xpm data.
     * */
    static readFromBinaryFile = (binFile:ArrayBuffer): ImageInfo => {
        return findInfoFromBinary(binFile);
    }

    static showExifTags = ():any => {
        throw new Error("Not implemented now");
    }
}
