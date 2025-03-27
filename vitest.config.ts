/// <reference types="vitest/config" />

import {defineConfig} from "vitest/config";

export default defineConfig({
    test:{
        include: ['tests/**.ts'],
        includeSource: ['lib/**'],
        coverage: {
            enabled: true,
            include: ['lib/**']
        }
    },
});