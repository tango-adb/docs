// Adopted from https://github.com/sapphiredev/documentation-plugins/tree/main/packages/ts2esm2cjs

import { format } from "prettier";
import { transpileModule, NewLineKind, ModuleKind, ModuleResolutionKind, ScriptTarget, JsxEmit } from "typescript";
import { visit } from "unist-util-visit";

async function tsToJs(code) {
    const escaped = code.replace(/\n\n/g, "\n/* :newline: */");
    const { outputText, diagnostics } = transpileModule(escaped, {
        reportDiagnostics: true,
        compilerOptions: {
            newLine: NewLineKind.LineFeed,
            removeComments: false,
            jsx: JsxEmit.Preserve,
            pretty: true,
            module: ModuleKind.ESNext,
            moduleResolution: ModuleResolutionKind.Bundler,
            target: ScriptTarget.ESNext,
        },
    });

    if (diagnostics.length) {
        for (const diagnostic of diagnostics) {
            console.warn(diagnostic.messageText)
        }
    }

    return await format(outputText.replace(/\/\* :newline: \*\//g, "\n"), {
        parser: "typescript",
        printWidth: 100,
    })
        .then((code) => {
            code = code.trim();
            if (code.endsWith("export {};")) {
                code = code.slice(0, -11);
            }
            return code;
        });
}

function createTabs(children) {
    return /** @type {import("mdast").RootContent} */({
        type: "mdxJsxFlowElement",
        name: "Tabs",
        attributes: [
            {
                type: "mdxJsxAttribute",
                name: "className",
                value: "language-tabs"
            },
            {
                type: "mdxJsxAttribute",
                name: "groupId",
                value: "lang"
            },
            {
                type: "mdxJsxAttribute",
                name: "defaultValue",
                value: "typescript"
            },
        ],
        children
    });
}

function createTab(value, label, children) {
    return /** @type {import("mdast").RootContent} */({
        type: "mdxJsxFlowElement",
        name: "TabItem",
        attributes: [
            {
                type: "mdxJsxAttribute",
                name: "label",
                value: label
            },
            {
                type: "mdxJsxAttribute",
                name: "value",
                value
            },
        ],
        children,
    });
}

/**
 * Transforms a Docusaurus node from TypeScript to JavaScript
 * @param {import("mdast").Code} node The Docusaurus node to transform
 * @returns {Promise<import("mdast").RootContent>} The transformed node in the form of Tabs.
 */
async function transformNode(node) {
    const tsCode = await format(node.value, {
        parser: "typescript",
        printWidth: 100,
    })
        .then((code) => code.trim());
    const jsCode = await tsToJs(tsCode);

    if (tsCode === jsCode) {
        node.meta = 'showLineNumbers'
        return node;
    }

    let [, jsHighlight, tsHighlight] = (node.meta ?? "").split(" ");

    if (!tsHighlight && jsHighlight) {
        tsHighlight = jsHighlight;
    }

    return createTabs([
        createTab("javascript", "JavaScript", [{
            type: node.type,
            lang: node.lang,
            meta: `${jsHighlight} showLineNumbers`,
            value: jsCode,
        }]),
        createTab("typescript", "TypeScript", [{
            type: node.type,
            lang: node.lang,
            meta: `${tsHighlight} showLineNumbers`,
            value: tsCode,
        }]),
    ]);
}

export default function ts2js() {
    return /** @param {import("mdast").Root} root */ async (root) => {
        let hasImport = false;
        const matches = [];

        visit(root, (node, index, parent) => {
            if (node.type === "mdxjsEsm" && node.value.includes("@theme/Tabs")) {
                hasImport = true;
            }

            if (node.type === "code" && node.lang === "ts" && node.meta?.match(/^transpile\|?/)) {
                matches.push([node, parent.children]);
            }
        });

        if (matches.length && !hasImport) {
            root.children.unshift({
                type: "mdxjsEsm",
                value: "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
                data: {
                    estree: {
                        type: 'Program',
                        body: [
                            {
                                type: 'ImportDeclaration',
                                specifiers: [
                                    {
                                        type: 'ImportDefaultSpecifier',
                                        local: { type: 'Identifier', name: 'Tabs' },
                                    },
                                ],
                                source: {
                                    type: 'Literal',
                                    value: '@theme/Tabs',
                                    raw: "'@theme/Tabs'",
                                },
                            },
                            {
                                type: 'ImportDeclaration',
                                specifiers: [
                                    {
                                        type: 'ImportDefaultSpecifier',
                                        local: { type: 'Identifier', name: 'TabItem' },
                                    },
                                ],
                                source: {
                                    type: 'Literal',
                                    value: '@theme/TabItem',
                                    raw: "'@theme/TabItem'",
                                },
                            },
                        ],
                        sourceType: 'module',
                    },
                },
            });
        }

        for (const [node, siblings] of matches) {
            const result = await transformNode(node);
            const index = siblings.indexOf(node);
            siblings.splice(index, 1, result);
        }
    };
};
