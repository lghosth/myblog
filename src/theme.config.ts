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

  nav: [
    {
      href: "/",
      text: "首页",
      icon: "i-ri-home-line",
    },
    {
      href: "/about/",
      text: "关于",
      icon: "i-ri-user-3-line",
    },
    {
      href: "/random/",
      text: "文章",
      icon: "i-ri-quill-pen-fill",
      dropbox: {
        enable: true,
        items: [
          {
            href: "/categories/",
            text: "分类",
            icon: "i-ri-book-shelf-fill",
          },
          {
            href: "/tags/",
            text: "标签",
            icon: "i-ri-price-tag-3-fill",
          },
          {
            href: "/archives/",
            text: "归档",
            icon: "i-ri-archive-line",
          },
        ],
      },
    },
    {
      href: "/moments/",
      text: "动态",
      icon: "i-ri-chat-quote-line",
    },
    {
      href: "/statistics/",
      text: "统计",
      icon: "i-ri-bar-chart-box-line",
    },
    {
      href: "/friends/",
      text: "友链",
      icon: "i-ri-link",
    },
  ],

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
      rss: {
        url: "/rss.xml",
        icon: "i-ri-rss-line",
        color: "var(--color-orange)",
      },
    },
  },

  home: {
    selectedCategories: [],
    pageSize: 5,
    title: {
      behavior: "custom",
      customTitle: "Charol的博客",
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
      randomPostsLimit: 3,
      tagCloud: true,
    },
  },

  footer: {
    since: 2026,
    icon: {
      name: "sakura rotate",
      color: "var(--color-pink)",
    },
    count: false,
    powered: true,
    icp: {
      enable: false,
    },
  },

  tagCloud: {
    startColor: "var(--grey-6)",
    endColor: "var(--color-blue)",
  },

  widgets: {
    randomPosts: false,
    recentComments: false,
  },

  comments: {
    enable: false,
  },

  friends: {
    title: "友链",
    description: "这里会放一些常读、常用或互相交换的站点。",
    links: [
      {
        url: "https://blog.rimuru.work/",
        title: "Rimuru's Blog",
        desc: "分享 DevOps、AI 工具、Linux 运维及游戏攻略。",
        author: "Rimuru",
        avatar: "/avatar/friend-avatart-rimuru.png",
      },
    ],
  },

  copyright: {
    license: "CC-BY-NC-SA-4.0",
    show: true,
  },

  postShare: {
    enable: true,
    copyTitle: false,
    qrCode: true,
  },

  visibilityTitle: {
    enable: true,
    leaveTitle: "先去忙吧，我在这里等你。",
    returnTitle: "欢迎回来。",
    restoreDelay: 2500,
  },

  hyc: {
    enable: false,
  },

  nyxPlayer: {
    enable: false,
  },
});
