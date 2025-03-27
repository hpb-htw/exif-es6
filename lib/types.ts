/**
 * define oblivious types and common habits in JavaScript
 * */

/** represents a literal object with three given properties */
export interface ImageInfo {
    exifdata?: LiteralMap,
    iptcdata?: LiteralMap,
    xmpdata?: LiteralMap|string
}

/** A generic type to represent JavaScript literal objects as Map.
 * Example
 * ```
 * const result:LiteralMap = {};
 * result['x'] = "XXX";
 * result.y = "YYY";
 * ```
 * */
export interface LiteralMap<T = any> {
    [key: string]: T;
}

/**
 * generic type to represent a JavaScript literal object, which maps a number to a string.
 * */
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


