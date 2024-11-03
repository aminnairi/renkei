import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  lang: "en-US",
  title: "Renkei",
  description: "Documentation for Renkei: Effortless type-safe communication between client and server",
  base: "/renkei/",
  cleanUrls: 'with-subfolders',
  outDir: "../../../docs",
  lastUpdated: true,
  themeConfig: {
    nav: [
      {
        text: "GitHub",
        link: "https://github.com/aminnairi/renkei"
      }
    ],
    sidebar: [
      {
        text: "Reference",
        items: [
          {
            text: "Getting started",
            link: "/getting-started"
          }
        ]
      },
      {
        text: "Going Further",
        items: [
          {
            text: "Prior Art",
            link: "/prior-art"
          }
        ]
      }
    ]
  }
});