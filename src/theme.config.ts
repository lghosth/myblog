// cannot use path alias here because unocss can not resolve it
import { defineConfig } from "./toolkit/themeConfig";

export default defineConfig({
  siteName: "Charol's Blog",
  locale: "zh-CN",

  brand: {
    title: "Charol's Blog",
    subtitle: "记录开发、写作与日常思考",
    logo: "✦",
  },

  cover: {
    enable: true,
    preload: true,
    fixedCover: {
      enable: true,
      url: "cover-3",
    },
    nextGradientCover: false,
  },

  sidebar: {
    author: "Charol",
    description: "这里记录AI使用、工作流分享和一些折腾过程。",
    social: {
      email: {
        url: "mailto:charol@example.com",
        icon: "i-ri-mail-line",
        color: "var(--color-red)",
      },
    },
  },

  home: {
    pageSize: 5,
    title: {
      behavior: "default",
      customTitle: "",
    },
  },

  layout: {
    mode: "three-column",
    rightSidebar: {
      announcement: true,
      search: true,
      calendar: true,
      recentMoments: true,
      randomPosts: true,
      tagCloud: true,
    },
  },

  footer: {
    since: 2026,
    icp: {
        enable: false,
    },
  },

  comments: {
    enable: false,
  },
});
