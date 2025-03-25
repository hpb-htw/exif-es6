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
