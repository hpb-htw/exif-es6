/*
 * define obliviously types and common habits in JavaScript
 * */


/** generic type to represent literal objects as Map */
export interface LiteralMap<T = any> {
    [key: string]: T;
}

export interface NumericMap<T = string> {
    [key: number]: T;
}

/**
 * cast Number with numerator and denominator to Fraction
 * @see
 * */
export interface Fraction extends Number{
    numerator:Number,
    denominator:Number
}

export interface ImageInfo {
    exifdata?:LiteralMap,
    iptcdata?:LiteralMap,
    xmpdata?:LiteralMap|string
}

export interface ImageEl {
    src:any
}

/**
 * merge Image and ImageInfo.
 * */
export interface ImageData extends ImageInfo, ImageEl{

}