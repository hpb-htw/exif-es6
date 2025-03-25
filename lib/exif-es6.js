import {findEXIFinJPEG, findIPTCinJPEG, findXMPinJPEG} from "./byte-seeker.js";

/**
 * @param {ImageData} img
 * @return boolean
 * */
function imageHasData(img) {
    return !!(img.exifdata);
}

/**
 * @param {string} base64
 * @param {string} contentType
 *
 * @return ArrayBuffer
 * */
function base64ToArrayBuffer(base64, contentType = undefined) {
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
 * @param {string} url
 * @return {Promise<Blob>}
 * */
export async function fetchURLToBlob(url) {
    const response = await fetch(url, {
        method: "GET",
    });
    return await response.blob();
}

/**
 * export for testing only
 * */
export async function fetchImageData(img) {
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
    /**
     * @param {Blob|File} blob
     * @return {Promise<ImageInfo>}
     * */
    function readBlob(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.addEventListener('load', (event)=> {
                const arrayBuffer = event.target.result;
                const imageInfo = findInfoFromBinary(arrayBuffer);
                resolve(Object.assign(img, imageInfo));
            });
        });
    }
    /**
     * @param {ArrayBuffer} binFile
     * @return ImageInfo
     * */
    function findInfoFromBinary(binFile) {
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

    /**
     * @param {ImageData} img
     * @return Promise<ImageInfo>
     * */
    static getData = async (img) => {
        if(!imageHasData(img)) {
            return fetchImageData(img);
        } else {
            return img;
        }
    };

    /**
     * @param {ImageData} img
     * @param {string} tag
     * @return any
     * */
    static getTag = (img, tag) => {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    /**
     * @param {ImageData} img
     * @param {string} tag
     * @return any
     * */
    static getIptcTag =(img, tag) => {
        if (!imageHasData(img)) return;
        return img.iptcdata[tag];
    }

    /**
     * @param {ImageData} img
     */
     static getAllTags = (img) => {
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
     * @param {ImageData} img
     * @return string
    * */
    static pretty = (img) => {
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

    /**
     * @param {any} file
     * @return any
     */
    static readFromBinaryFile = (file) => {
        return undefined;
    }
}
