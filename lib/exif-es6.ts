import {findEXIFinJPEG, findIPTCinJPEG, findXMPinJPEG} from "./byte-seeker.js";

interface ImageInfo {
    exifdata:Object,
    iptcdata:Object,
    xmpdata:Object
}

interface ImageEl {
    src:any
}

interface ImageData extends ImageInfo, ImageEl{

}

function imageHasData(img:ImageData):boolean {
    return !!(img.exifdata);
}

function base64ToArrayBuffer(base64:string, contentType:string=undefined):ArrayBuffer {
    contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
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
            return new Promise<ImageInfo>((resolve) => {
                const imageInfo = findInfoFromBinary(arrayBuffer);
                resolve(Object.assign(img, imageInfo));
            });
        } else if (/^blob\:/i.test(img.src)) { // Object URL

            const blob = await fetchURLToBlob(img.src);
            return readBlob(blob);
        } else { // common HTTP(S)
            const response = await fetch(img.src, {
                method: 'GET'
            });
            const blob = await response.blob();
            return readBlob(blob);
        }
    } else if(img instanceof Blob || img instanceof File) {
        return readBlob(img);
    }
    function readBlob(blob:Blob|File) : Promise<ImageInfo> {
        return new Promise<ImageInfo>((resolve) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.addEventListener('load', (event)=> {
                const arrayBuffer = event.target.result as ArrayBuffer;
                const imageInfo = findInfoFromBinary(arrayBuffer);
                resolve(Object.assign(img, imageInfo));
            });
        });
    }
    function findInfoFromBinary(binFile:ArrayBuffer):ImageInfo {
        const result = {
            exifdata: undefined,
            iptcdata: undefined,
            xmpdata: undefined
        };
        const data = findEXIFinJPEG(binFile);
        result['exifdata'] = data || {};
        const iptcdata = findIPTCinJPEG(binFile);
        result['iptcdata'] = iptcdata || {};
        if (EXIF.isXmpEnabled) {
            const xmpdata= findXMPinJPEG(binFile);
            result['xmpdata'] = xmpdata || {};
        }
        return result;
    }
}


export class EXIF {
    static isXmpEnabled = true;

    static getData = async (img: ImageData): Promise<ImageInfo> => {
        if(!imageHasData(img)) {
            return fetchImageData(img);
        } else {
            return img;
        }
    };

    static getTag = (img:ImageData, tag:string): any => {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    static getIptcTag =(img:ImageData, tag:string): any => {
        if (!imageHasData(img)) return;
        return img.iptcdata[tag];
    }

    static getAllTags = (img: ImageData):any => {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    /**
     * prettifies ImageData in string
     * @param img
    * */
    static pretty = (img:ImageData):string => {
        if (!imageHasData(img)) return "";
        const data = img.exifdata;
        let strPretty = "";
        for (let key of Object.keys(data)) {
            if (typeof data[key] == "object") {
                // @ts-nocheck
                if (data[key] instanceof Number) {
                    strPretty += key + " : " + data[key] + " [" + data[key]['numerator'] + "/" + data[key]['denominator'] + "]\r\n";
                } else {
                    strPretty += key + " : [" + data[key].length + " values]\r\n";
                }
            } else {
                strPretty += key + " : " + data[key] + "\r\n";
            }
        }
        return strPretty;
    }

    static readFromBinaryFile = (file:any):any => {
        return undefined;
    }
}
