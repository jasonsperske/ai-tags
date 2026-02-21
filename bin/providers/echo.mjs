import { CodeProviderInterface } from "./types.mjs";

export default class EchoProvider extends CodeProviderInterface {
    constructor(rcFile) {
        super(rcFile);
    }

    updateComponentCode(tagName, tagSpec, _outputDir) {
        console.log(`You are a code generator. Generate the code for the ${tagName} component based on the following specification:\n\n${tagSpec}\n\nProvide only the code without any explanations.`);
    }
}