AI Tags
=======

A WebComponent generator that works by just declaring tags as you need them. HTML structure will give them context, and as tags are discovered they are added to your project with documentation. Once a tag is generated it becomes part of your project where you can steer its implementation either by directing its README or by modifying its usage. Tags can also be styled, controlled by JS or combined with HTML standard elements as well as other WebComponents. You can use as much or as little as you like.

Adding AI Tags to your project
------------------------------

1. Install aitags as a dev dependency:

   ```bash
   npm install --save-dev aitags
   ```

2. Create a `.aitagsrc` file in your project root (see [How to configure a project](#how-to-configure-a-project) below).

3. Add these npm scripts to your `package.json`:

   ```json
   {
     "scripts": {
       "generate:spec": "node node_modules/aitags/bin/generateSpec.mjs",
       "generate:code": "node node_modules/aitags/bin/generateCode.mjs"
     }
   }
   ```

   If your project lives in a subdirectory, pass `--root`:

   ```json
   "generate:spec": "node node_modules/aitags/bin/generateSpec.mjs --root ./my-app",
   "generate:code": "node node_modules/aitags/bin/generateCode.mjs --root ./my-app"
   ```

How to configure a project
--------------------------

The generate commands read a local configuration file to determine how to generate output. This file is called `.aitagsrc` and the example in this repo contains the default values for each available option. You can also place any extra configuration values into this file and your LLM coding agent will consider these when it generates your code. These files can also be placed directly into subdirectories and they will override or extend values defined at lower levels. This is helpful if you are building for multiple environments or if specific components require some default set of values.

How to define a tag
-------------------

1. In any HTML file, add a tag with the following namespace `<ai-[TagName]>` and any parameters that this tag will need. For example:

   ```html
   <ai-ColumnLayout>
     <ai-ColumnLayoutItem role="navigation" width="200px"></ai-ColumnLayoutItem>
     <ai-ColumnLayoutItem role="main-content" width="auto">
       <h1>Content</h1>
     </ai-ColumnLayoutItem>
   </ai-ColumnLayout>
   ```

2. Run `npm run generate:spec` to scan your HTML files and create component specs. This creates a `SPEC.md` and `README.md` for each discovered tag in your `output_dir_spec` (default: `components`).

3. Run `npm run generate:code` to generate the component code. This writes `tag.mjs` for each component to your `output_dir_code` (default: `dist`). If a component already has a `tag.mjs` in its spec folder, that file is copied to the output directory and generation is skipped for that component.

4. Inside each component's folder you can edit `SPEC.md` to add any information that an LLM needs to implement the component. Re-run `generate:code` to regenerate with your updates.

5. Import the generated components in your HTML:

   ```html
   <script src="dist/Chart/tag.mjs" defer type="module"></script>
   <script src="dist/CodeSample/tag.mjs" defer type="module"></script>
   <script src="dist/Menu/tag.mjs" defer type="module"></script>
   <script src="dist/MenuItem/tag.mjs" defer type="module"></script>
   <script src="dist/RowLayout/tag.mjs" defer type="module"></script>
   <script src="dist/RowLayoutItem/tag.mjs" defer type="module"></script>
   ```

Examples
--------

In the `example` directory you can find examples of pages that define a mixture of tags. Run `npm run example:generate:spec` to generate specs for each tag found in the HTML files, then run `npm run example:generate:code` to see how your LLM coding agent processes these tags. WebComponents are imported in HTML as JavaScript modules, but they can also be packaged as React Components or any other runtime that your LLM can generate code for. To see the examples running, open `example/index.html` in a web browser. This is not how these components would typically run in a production environment.

<img width="815" height="611" alt="Screenshot of Example Page" src="https://github.com/user-attachments/assets/b2354f18-da4f-4173-9705-0e25ae48900b" />
