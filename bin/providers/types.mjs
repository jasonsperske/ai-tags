export class CodeProviderInterface {
    #rcFile;
    constructor(rcFile) {
        this.#rcFile = rcFile;
    }

    get rcFile() {
        return this.#rcFile;
    }

    /**
     * @param {string} tagName - Component tag name
     * @param {string} tagSpec - Component specification content
     * @param {string} [outputDir] - Component directory path for writing output (e.g. tag.mjs)
     * @returns {string|Promise<string|void>} - Generated code string, or void if provider writes directly
     */
    updateComponentCode(tagName, tagSpec, outputDir) {
        throw new Error('Not implemented');
    }
}