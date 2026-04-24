export const ROUTES = {
  home: "/",
  page2: "/page/2/",
  page3: "/page/3/",
  moments: "/moments/",
  tags: "/tags/",
  categories: "/categories/",
  rss: "/rss.xml",
  atom: "/atom.xml",
} as const;

export const POSTS = {
  aiWorkflow: "/posts/ai-coding-workflow-terminal-tmux/",
  helloWorld: "/posts/hello-world/",
  gettingStarted: "/posts/getting-started/",
  encryptedTest: "/posts/encrypted-test/",
  imageZoomTest: "/posts/image-zoom-test/",
  noteMdxDemo: "/posts/note-mdx-demo/",
  postMigrationTest: "/posts/post-migration-test/",
  spoilerMdxTest: "/posts/spoiler-mdx-test/",
} as const;

export const SEARCH_TERMS = {
  publicPostTitle: "Hello World!",
  encryptedPostTitle: "加密文章测试",
  encryptedOnlyText: "AES-GCM",
} as const;
