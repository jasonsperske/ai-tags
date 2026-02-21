#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { AITagsRC } from './aitagsrc.mjs';

async function findHtmlFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await findHtmlFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }

    return files;
}

function extractAiTags(htmlContent) {
    const aiTagRegex = /<ai\-([a-zA-Z-]+)([^>]*)>/g;
    const tagData = new Map();
    let match;

    while ((match = aiTagRegex.exec(htmlContent)) !== null) {
        const tagName = match[1];
        const fullTag = match[0];

        if (!tagData.has(tagName)) {
            tagData.set(tagName, {
                attributes: new Set(),
                examples: []
            });
        }

        // Extract attributes from the tag
        const attributeRegex = /(\w+)(?:=["']([^"']*)["'])?/g;
        let attrMatch;
        while ((attrMatch = attributeRegex.exec(match[2])) !== null) {
            tagData.get(tagName).attributes.add(attrMatch[1]);
        }

        // Add the full tag as an example
        tagData.get(tagName).examples.push(fullTag);
    }

    return tagData;
}

async function createComponentFiles(componentsDir, tagName, tagData) {
    const tagDir = path.join(componentsDir, tagName);
    await fs.mkdir(tagDir, { recursive: true });

    // Build attributes section
    const attributesSection = tagData.attributes.size > 0
        ? `\n\n## Attributes\n\n${Array.from(tagData.attributes).map(attr => `- \`${attr}\``).join('\n')}\n`
        : '';

    // Build examples section
    const examplesSection = tagData.examples.length > 0
        ? `\n\n## Examples\n\n${tagData.examples.map(example => `\`\`\`html\n${example}\n\`\`\``).join('\n\n')}\n`
        : '';

    const specContent = `# ${tagName} Component Specification\n\n## Overview\n\nSpecification for the \`ai-${tagName}\` component.${attributesSection}\n## Usage\n\n\`\`\`html\n<ai-${tagName}></ai-${tagName}>\n\`\`\`${examplesSection}`;

    const readmeContent = `# ${tagName} Component\n\n## Description\n\nDocumentation for the \`ai-${tagName}\` component.${attributesSection}${examplesSection}`;

    await fs.writeFile(path.join(tagDir, 'SPEC.md'), specContent);
    await fs.writeFile(path.join(tagDir, 'README.md'), readmeContent);
}

async function main() {
    try {
        const args = process.argv.slice(2);
        let rootDir = process.cwd();

        // Simple argument parsing for --root flag
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
        const rcFile = AITagsRC.fromRCFileContents(await fs.readFile(path.join(sourceDir, '.aitagsrc'), 'utf-8').catch(() => null));
        const htmlFiles = await findHtmlFiles(sourceDir);
        const allTags = /** @type {Map<string, {attributes: Set<string>, examples: string[]}>} */(new Map());

        for (const file of htmlFiles) {
            const content = await fs.readFile(file, 'utf-8');
            const tags = extractAiTags(content);
            for (const [tagName, data] of tags.entries()) {
                if (!allTags.has(tagName)) {
                    allTags.set(tagName, { attributes: new Set(), examples: [] });
                }
                const existingData = allTags.get(tagName);
                data.attributes.forEach(attr => existingData.attributes.add(attr));
                existingData.examples.push(...data.examples);
            }
        }
        console.log(`Found AI tags: ${Array.from(allTags).map(([tagName, tag]) => tagName).join(', ')}`);

        const componentsDir = path.join(sourceDir, rcFile.output_dir_spec);

        await fs.mkdir(componentsDir, { recursive: true });

        for (const [tagName, tagData] of allTags) {
            const tagDir = path.join(componentsDir, tagName);
            const specExists = await fs.access(path.join(tagDir, 'SPEC.md')).then(() => true, () => false);
            const readmeExists = await fs.access(path.join(tagDir, 'README.md')).then(() => true, () => false);
            if (specExists || readmeExists) {
                console.log(`Skipping ${tagName}: ${[specExists && 'SPEC.md', readmeExists && 'README.md'].filter(Boolean).join(' and ')} already exists`);
                continue;
            }
            await createComponentFiles(componentsDir, tagName, tagData);
            console.log(`Created component files for: ${tagName}`);
        }

        console.log('Component generation complete!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();