import EchoProvider from './providers/echo.mjs';
import ClaudeProvider from './providers/claude.mjs';

const REQUIRED_OPTIONS = ['code_tool', 'output_format', 'output_dir_code', 'output_dir_spec'];

export class AITagsRC {
    #code_tool;
    #output_format;
    #output_dir_code;
    #output_dir_spec;
    #extended_options;

    constructor(options = {}) {
        this.#code_tool = options.code_tool || 'claude';
        this.#output_format = options.output_format || 'javascript WebComponent';
        this.#output_dir_code = options.output_dir_code || 'dist';
        this.#output_dir_spec = options.output_dir_spec || 'components';
        this.#extended_options = {};

        for (const [key, value] of Object.entries(options)) {
            if (!REQUIRED_OPTIONS.includes(key)) {
                this.#extended_options[key] = value;
            }
        }

        switch (this.#code_tool) {
            case 'echo':
                this.#code_tool = new EchoProvider(this);
                break;
            case 'claude':
                this.#code_tool = new ClaudeProvider(this);
                break;
            default:
                throw new Error(`Unsupported code_tool: ${this.#code_tool}`);
        }   
    }

    /**
     * Parses .aitagsrc file contents and returns an AITagsRC instance
     * @param {string} contents 
     * @return {AITagsRC | null}
     */
    static fromRCFileContents(contents) {
        if (!contents) {
            return null;
        }

        const options = {};
        for (const line of contents.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'))) {
            const [key, value] = line.split('=', 2).map(part => part.trim());
            options[key] = value;
        }

        return new AITagsRC(options);
    }

    get code_tool() {
        return this.#code_tool;
    }

    get output_format() {
        return this.#output_format;
    }

    get output_dir_code() {
        return this.#output_dir_code;
    }

    get extended_options() {
        return this.#extended_options;
    }

    get output_dir_spec() {
        return this.#output_dir_spec;
    }
}