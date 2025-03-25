/* script to build TypeScript Code to ES6 Code */

import * as esbuild from 'esbuild'

const result = await esbuild.context({
    entryPoints: ['./lib/exif-es6.ts'],
    outdir: './dist',
    allowOverwrite: true,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    platform: 'neutral',
    logLevel: "verbose"
});
await result.watch();
console.log('watching...')




