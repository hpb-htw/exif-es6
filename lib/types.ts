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
 * For Example
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
 * generic type to represent a JavaScript literal object,
 * which maps a number (= property) to a string (=value).
 * For example:
 *
 * ```
 * const sharpness:NumericMap = {
 *     0 : "Normal",
 *     1 : "Soft",
 *     2 : "Hard"
 * }
 * function codeToText(strings:NumericMap) {
 *      const idx = 0; // or whatever you calculate
 *      return strings[idx];
 * }
 * const text = codeToText(sharpness);
 * ```
 *
 * */
export interface NumericMap<T = string> {
    [key: number]: T;
}


/**
 * cast Number with numerator and denominator to Fraction.
 * This interface will be removed in next version (for internal use only).
 * 
 * @see
 * */
export interface Fraction extends Number{
    numerator:Number,
    denominator:Number
}


