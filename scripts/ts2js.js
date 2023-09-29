// Adopted from https://github.com/sapphiredev/documentation-plugins/tree/main/packages/ts2esm2cjs

const prettier = require("prettier");
const ts = require("typescript");
const visit = require("unist-util-visit");

async function tsToJs(code) {
    const escaped = code.replace(/\n\n/g, "\n/* :newline: */");
    const { outputText } = ts.transpileModule(escaped, {
        reportDiagnostics: true,
        compilerOptions: {
            newLine: ts.NewLineKind.LineFeed,
            removeComments: false,
            pretty: true,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            target: ts.ScriptTarget.ESNext,
        },
    });

    return await prettier
        .format(outputText.replace(/\/\* :newline: \*\//g, "\n"), {
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

/**
 * Transforms a Docusaurus node from TypeScript to JavaScript
 * @param {import("mdast").Code} node The Docusaurus node to transform
 * @returns {Promise<import("mdast").RootContent[]>} The transformed node in the form of Tabs.
 */
async function transformNode(node) {
    const tsCode = await prettier
        .format(node.value, {
            parser: "typescript",
            printWidth: 100,
        })
        .then((code) => code.trim());
    const jsCode = await tsToJs(tsCode);

    if (tsCode === jsCode) {
        return [node];
    }

    let [, jsHighlight, tsHighlight] = (node.meta ?? "").split("|");

    if (!tsHighlight && jsHighlight) {
        tsHighlight = jsHighlight;
    }

    const nodes = [
        {
            type: "jsx",
            value: `<Tabs className="language-tabs" groupId="lang"
						defaultValue="typescript"
						values={[
							{ label: "JavaScript", value: "javascript" },
							{ label: "TypeScript", value: "typescript" },
						]}
			>\n<TabItem value="javascript">`,
        },
        {
            type: node.type,
            lang: node.lang,
            meta: `${jsHighlight} showLineNumbers`,
            value: jsCode,
        },
        {
            type: "jsx",
            value: '</TabItem>\n<TabItem value="typescript">',
        },
        {
            type: node.type,
            lang: node.lang,
            meta: `${tsHighlight} showLineNumbers`,
            value: tsCode,
        },
        {
            type: "jsx",
            value: "</TabItem>\n</Tabs>",
        },
    ];

    return nodes;
}

module.exports = () => {
    return /** @param {import("mdast").Root} root */ async (root) => {
        let hasImport = false;
        const matches = [];

        visit(root, (node, index, parent) => {
            if (node.type === "import" && node.value.includes("@theme/Tabs")) {
                hasImport = true;
            }

            if (node.type === "code" && node.lang === "ts" && node.meta?.match(/^transpile\|?/)) {
                matches.push([node, parent.children]);
            }
        });

        if (matches.length && !hasImport) {
            root.children.unshift({
                type: "import",
                value:
                    "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
            });
        }

        for (const [node, siblings] of matches) {
            const result = await transformNode(node);
            const index = siblings.indexOf(node);
            siblings.splice(index, 1, ...result);
        }
    };
};
