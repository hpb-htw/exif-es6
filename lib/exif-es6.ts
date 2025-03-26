import {findEXIFinJPEG, findIPTCinJPEG, findXMPinJPEG} from "./byte-seeker.js";
import type {ImageData, ImageInfo, Fraction, LiteralMap} from "./types.js";

function imageHasData(img:ImageData):boolean {
    return !!(img.exifdata);
}

function base64ToArrayBuffer(base64:string, contentType:string=''):ArrayBuffer {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
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
export async function fetchURLToBlob(url:string):Promise<Blob> {
    const response = await fetch(url, {
        method: "GET",
    });
    return await response.blob();
}

/**
 * export for testing only
 * */
export async function fetchImageData(img:ImageData):Promise<ImageInfo> {
    if(img.src) {
        if (/^data\:/i.test(img.src)) { // Data URI
            const arrayBuffer = base64ToArrayBuffer(img.src);
            const imageInfo = findInfoFromBinary(arrayBuffer);
            return Promise.resolve(Object.assign(img, imageInfo));
        } else if (/^blob\:/i.test(img.src)) { // Object URL
            const blob = await fetchURLToBlob(img.src);
            const imgInfo = await readBlob(blob);
            return Promise.resolve(Object.assign(img, imgInfo));
        } else { // common HTTP(S)
            const response = await fetch(img.src, {
                method: 'GET'
            });
            const blob = await response.blob();
            const imgInfo = await readBlob(blob);
            return Promise.resolve(Object.assign(img, imgInfo));
        }
    } else if(img instanceof Blob || img instanceof File) {
        const imgInfo = await readBlob(img);
        return Promise.resolve(Object.assign(img, imgInfo));
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
     *      - a regular HTML <img>-Element
     *      - an image with base64 encoding in src-attribute
     *      - an image with Object URL data in src-attribute
     *
     * @return a Promise which is resolved to the same image as argument. The image now has an attribute `exifdata`.
     * */
    static getData = async (img: ImageData): Promise<ImageInfo> => {
        if(!imageHasData(img)) {
            return fetchImageData(img);
        } else {
            return img;
        }
    };

    /**
     * get value of an Exif-tag, if it exists.
     * {@see EXIF.showExifTags()} returns the list of valid Exif tags
     *
     * @param img the Image, which is used as argument in {@see EXIF.getData} before.
     * @param tag a valid Exif tag.
     *
     * @return the value of the Exif-tag, or undefined if the tag does not exist.
     * */
    static getTag = (img:ImageData, tag:string): any => {
        if (!imageHasData(img)) return;
        return img?.exifdata?.[tag];
    }

    static getIptcTag =(img:ImageData, tag:string): any => {
        if (!imageHasData(img)) return;
        return img?.iptcdata?.[tag];
    }

    static getAllTags = (img: ImageData):any => {
        if (!imageHasData(img)) return {};
        const data = img.exifdata || {},
            tags:LiteralMap = {};
        for(let [key, value] of Object.entries(data)) {
            tags[key] = value;
        }
        return tags;
    }

    /**
     * prettifies ImageData in human-readable string
     *
     * @param img
     * @return string
    * */
    static pretty = (img:ImageData):string => {
        if (!imageHasData(img)) return "";
        const data = img.exifdata || {};
        let strPretty = "";
        for(const [key, value] of Object.entries(data)) {
            if(typeof value === "object") {
                if (value instanceof Number) {
                    const val = value as Fraction
                    strPretty += `${key} : ${value} [${val.numerator}/${val.denominator}]\r\n`;
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
     * TODO: <s>get document from origin</s> and implement this method.
     * */
    static readFromBinaryFile = (file:Blob|File):any => {
        return undefined;
    }

    static showExifTags = ():any => {
        throw new Error("Not implemented now");
    }
}
