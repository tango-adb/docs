const encoder = require("plantuml-encoder");
const svgToDataUri = require("mini-svg-data-uri");
const visit = require("unist-util-visit");

/**
 * @template T
 */
class Lazy {
    /**
     * @type {T | undefined}
     */
    value;

    /**
     *
     * @param {() => T} initializer
     */
    constructor(initializer) {
        this.initializer = initializer;
    }

    get() {
        if (!this.value) {
            this.value = this.initializer();
        }
        return this.value;
    }
}

const importFetch = new Lazy(() => import("node-fetch").then(module => module.default));

async function umlToSvgDataUri(uml) {
    const fetch = await importFetch.get();
    const encoded = encoder.encode(uml);
    const response = await fetch(
        `https://www.plantuml.com/plantuml/svg/${encoded}`
    );
    let svg = await response.text();
    return svgToDataUri(svg);
}

module.exports = () => {
    return async (syntaxTree) => {
        const matches = [];
        visit(syntaxTree, "code", (node) => {
            if (node.lang === "uml" && !!node.value) {
                matches.push(node);
            }
        });
        if (!matches.length) {
            return;
        }

        const id = Math.random().toString().substring(2);
        syntaxTree.children.unshift({
            type: "import",
            value: `import ThemedImage${id} from '@theme/ThemedImage'`,
        });

        await Promise.all(
            matches.map(async (node) => {
                const lightSvg = await umlToSvgDataUri(
                    node.value.replace(
                        "@startuml",
                        "@startuml\n!theme bluegray"
                    )
                );
                // Workaround https://github.com/bschwarz/puml-themes/issues/15
                const darkSvg = await umlToSvgDataUri(
                    node.value.replace(
                        "@startuml",
                        "@startuml\n!theme cyborg\nskinparam SequenceDelayFontColor $FGCOLOR"
                    )
                );
                node.type = "jsx";
                node.value = `<ThemedImage${id} sources={{ light: "${lightSvg}", dark: "${darkSvg}" }} />`;
            })
        );
    };
};
