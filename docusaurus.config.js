/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'Unofficial ADB Book',
    tagline: 'Deep-dive into ADB',
    url: 'https://tango-adb.github.io',
    baseUrl: '/docs/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'tango-adb',
    projectName: 'docs', // Usually your repo name.
    themeConfig: {
        navbar: {
            title: 'Unofficial ADB Book',
            logo: {
                alt: 'Site Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'doc',
                    docId: 'basics/intro',
                    position: 'left',
                    label: 'ADB',
                },
                {
                    type: 'doc',
                    docId: 'adb/installation',
                    position: 'left',
                    label: 'Tango',
                },
                {
                    href: 'https://github.com/tango-adb/docs',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [],
            copyright: `Copyright © ${new Date().getFullYear()} Simon Chan. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    routeBasePath: '/',
                    // Please change this to your repo.
                    editUrl:
                        'https://github.com/tango-adb/docs/edit/main/',
                    remarkPlugins: [require('./scripts/plantuml')],
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
