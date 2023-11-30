import encoder from "plantuml-encoder";
import svgToDataUri from "mini-svg-data-uri";
import { visit } from "unist-util-visit";

async function umlToSvgDataUri(uml) {
    const encoded = encoder.encode(uml);
    const response = await fetch(
        `https://www.plantuml.com/plantuml/svg/${encoded}`
    );
    let svg = await response.text();
    return svgToDataUri(svg);
}

export default () => {
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
