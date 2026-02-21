import { CodeProviderInterface } from "./types.mjs";
import { spawn } from "child_process";

export default class CodeProvider extends CodeProviderInterface {
    #systemPrompt;

    constructor(rcFile) {
        super(rcFile);
        const opts = rcFile.extended_options || {};
        this.#systemPrompt = opts.claude_system_prompt;
    }

    async updateComponentCode(tagName, tagSpec, outputDir) {
        const prompt = `Generate the code for the ${tagName} component based on the following specification:

${tagSpec}

Write the output to tag.mjs in this directory. Provide only the code without any explanations.`;

        const args = [
            "-p",
            "--no-session-persistence",
            "--tools", "Read,Edit",
            "--allowedTools", "Read(./*),Edit(./*)",
        ];
        if (this.#systemPrompt) {
            args.push("--append-system-prompt", this.#systemPrompt);
        }
        args.push(prompt);

        return new Promise((resolve, reject) => {
            const proc = spawn("claude", args, {
                cwd: outputDir,
                stdio: "inherit",
            });

            proc.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`claude exited with code ${code}`));
                }
            });

            proc.on("error", (err) => {
                reject(new Error(`Failed to run claude: ${err.message}`));
            });
        });
    }
}
