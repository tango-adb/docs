import remarkPluginNpm2yarn from "@docusaurus/remark-plugin-npm2yarn";
import { themes } from "prism-react-renderer";
import { fileURLToPath } from "url";
import ts2js from "./scripts/ts2js.js";

function resolve(path) {
  return fileURLToPath(new URL(path, import.meta.url));
}

const lightTheme = {
  ...themes.github,
  styles: [
    ...themes.github.styles,
    {
      types: ["title"],
      style: {
        color: "#0550AE",
        fontWeight: "bold",
      },
    },
    {
      types: ["parameter"],
      style: {
        color: "#953800",
      },
    },
    {
      types: ["boolean", "rule", "color", "number", "constant", "property"],
      style: {
        color: "#005CC5",
      },
    },
    {
      types: ["atrule", "tag"],
      style: {
        color: "#22863A",
      },
    },
    {
      types: ["script"],
      style: {
        color: "#24292E",
      },
    },
    {
      types: ["operator", "unit", "rule"],
      style: {
        color: "#D73A49",
      },
    },
    {
      types: ["font-matter", "string", "attr-value"],
      style: {
        color: "#C6105F",
      },
    },
    {
      types: ["class-name"],
      style: {
        color: "#116329",
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: "#0550AE",
      },
    },
    {
      types: ["keyword"],
      style: {
        color: "#CF222E",
      },
    },
    {
      types: ["function"],
      style: {
        color: "#8250DF",
      },
    },
    {
      types: ["selector"],
      style: {
        color: "#6F42C1",
      },
    },
    {
      types: ["variable"],
      style: {
        color: "#E36209",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "#6B6B6B",
      },
    },
  ],
};

const darkTheme = {
  plain: {
    color: "#D4D4D4",
    backgroundColor: "#212121",
  },
  styles: [
    ...themes.vsDark.styles,
    {
      types: ["title"],
      style: {
        color: "#569CD6",
        fontWeight: "bold",
      },
    },
    {
      types: ["property", "parameter"],
      style: {
        color: "#9CDCFE",
      },
    },
    {
      types: ["script"],
      style: {
        color: "#D4D4D4",
      },
    },
    {
      types: ["boolean", "arrow", "atrule", "tag"],
      style: {
        color: "#569CD6",
      },
    },
    {
      types: ["number", "color", "unit"],
      style: {
        color: "#B5CEA8",
      },
    },
    {
      types: ["font-matter"],
      style: {
        color: "#CE9178",
      },
    },
    {
      types: ["keyword", "rule"],
      style: {
        color: "#C586C0",
      },
    },
    {
      types: ["regex"],
      style: {
        color: "#D16969",
      },
    },
    {
      types: ["maybe-class-name"],
      style: {
        color: "#4EC9B0",
      },
    },
    {
      types: ["constant"],
      style: {
        color: "#4FC1FF",
      },
    },
  ],
};

/** @type {import('@docusaurus/types').Config} */
export default {
  markdown: {
    mdx1Compat: {
      admonitions: false,
      comments: false,
      headingIds: false,
    },
    mermaid: true,
  },

  title: "Tango ADB Development Guide",
  tagline: "Documentation for Tango ADB library",
  url: "https://docs.tangoapp.dev",
  baseUrl: "/",
  trailingSlash: true,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo.svg",
  organizationName: "tango-adb",
  projectName: "docs",
  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {Record<string, unknown>} */ (
        /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */ ({
          docsRouteBasePath: "/",
          highlightSearchTermsOnTargetPage: true,
        })
      ),
    ],
  ],
  themeConfig: {
    navbar: {
      title: "Tango ADB",
      logo: {
        alt: "Tango Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "doc",
          docId: "tango/index",
          position: "left",
          label: "Guide",
        },
        {
          type: "doc",
          docId: "api/index",
          position: "left",
          label: "API",
        },
        {
          type: "doc",
          docId: "scrcpy/index",
          position: "left",
          label: "Scrcpy",
        },
        {
          type: "doc",
          docId: "internal/index",
          position: "left",
          label: "Internal",
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownItemsAfter: [],
          dropdownActiveClassDisabled: true,
        },
        {
          href: "https://github.com/yume-chan/ya-webadb",
          label: 'Source code',
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Links",
          items: [
            {
              label: "Tango Web App",
              href: "https://app.tangoapp.dev",
            },
            {
              label: "OpenCollective",
              href: "https://opencollective.com/ya-webadb",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/yume-chan/ya-webadb",
            },
            {
              label: "Reddit",
              href: "https://www.reddit.com/r/tango_adb",
            },
            {
              label: "Discord",
              href: "https://discord.gg/26k3ttC2PN",
            },
          ],
        },
      ],
      copyright: `Copyright © 2021-${new Date().getFullYear()} Tango ADB. Built with Docusaurus.`,
    },
    prism: {
      theme: lightTheme,
      darkTheme: darkTheme,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: resolve("./sidebars.js"),
          routeBasePath: "/",
          // Please change this to your repo.
          editUrl: "https://github.com/tango-adb/docs/edit/main/",
          remarkPlugins: [ts2js, [remarkPluginNpm2yarn, { sync: true }]],
          showLastUpdateTime: true,
        },
        theme: {
          customCss: resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "GTM-WLPBQBK4",
        },
        sitemap: {
          lastmod: 'datetime',
          changefreq: 'daily'
        }
      },
    ],
  ],
};
