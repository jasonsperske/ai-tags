#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { AITagsRC } from './aitagsrc.mjs';

async function findComponentDirs(componentsDir) {
    const entries = await fs.readdir(componentsDir, { withFileTypes: true });
    const dirs = [];
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const specPath = path.join(componentsDir, entry.name, 'SPEC.md');
            try {
                await fs.access(specPath);
                dirs.push(entry.name);
            } catch {
                // Skip dirs without SPEC.md
            }
        }
    }
    return dirs;
}

async function main() {
    try {
        const args = process.argv.slice(2);
        let rootDir = process.cwd();

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--root' && i + 1 < args.length) {
                rootDir = args[i + 1];
                break;
            } else if (args[i].startsWith('--root=')) {
                rootDir = args[i].split('=')[1];
                break;
            }
        }

        const sourceDir = path.join(process.cwd(), rootDir);
        const rcFile = AITagsRC.fromRCFileContents(
            await fs.readFile(path.join(sourceDir, '.aitagsrc'), 'utf-8').catch(() => null)
        );

        if (!rcFile) {
            console.error('Error: No .aitagsrc found. Run from a project with .aitagsrc or use --root.');
            process.exit(1);
        }

        const componentsDir = path.join(sourceDir, rcFile.output_dir_spec);
        const outputDirBase = path.join(sourceDir, rcFile.output_dir_code);

        try {
            await fs.access(componentsDir);
        } catch {
            console.error(`Error: Components directory not found: ${componentsDir}`);
            console.error('Run example:generate:spec first to create component specs.');
            process.exit(1);
        }

        const componentNames = await findComponentDirs(componentsDir);
        if (componentNames.length === 0) {
            console.log('No components with SPEC.md found.');
            return;
        }

        console.log(`Generating code for: ${componentNames.join(', ')}`);

        const codeTool = rcFile.code_tool;

        for (const tagName of componentNames) {
            const componentDir = path.join(componentsDir, tagName);
            const outputDir = path.join(outputDirBase, tagName);
            const existingTagPath = path.join(componentDir, 'tag.mjs');
            const outputTagPath = path.join(outputDir, 'tag.mjs');

            try {
                await fs.access(existingTagPath);
                await fs.mkdir(outputDir, { recursive: true });
                await fs.copyFile(existingTagPath, outputTagPath);
                console.log(`Copied ${tagName}/tag.mjs (existing)`);
                continue;
            } catch {
                /* tag.mjs does not exist in component dir, proceed with generation */
            }

            const specPath = path.join(componentDir, 'SPEC.md');
            const tagSpec = await fs.readFile(specPath, 'utf-8');
            await fs.mkdir(outputDir, { recursive: true });
            let result = codeTool.updateComponentCode(tagName, tagSpec, outputDir);
            result = await Promise.resolve(result);
            if (result && typeof result === 'string') {
                await fs.writeFile(outputTagPath, result, 'utf-8');
                console.log(`Wrote ${tagName}/tag.mjs`);
            }
        }

        console.log('Code generation complete!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
