结论概览
必修
侧边栏 Tab 组件的 ARIA 结构不合法
role="tablist" 的子元素结构不符合规范
role="tab" 没有处在 Lighthouse 认可的 tablist 关系里
当前 ul > li > button[role=tab] 这套写法触发了多条错误
次修
相同/近似文本链接可能表达了不同目的
页面里多个 “ShokaX / shokaX” 链接分别指向首页、标签页、GitHub 项目
这是 minor / informative，不影响主流程，但建议统一文案策略
1）高优先级：侧边栏 Tab 组件语义错误

Lighthouse 报了 3 条相关问题，实际上是同一个组件设计问题导致的连锁报错。

受影响节点
astro-island > aside#sidebar > div.inner > ul.tab
aside#sidebar > div.inner > ul.tab > li.svelte-1wfzvb7
div.inner > ul.tab > li.svelte-1wfzvb7 > button.item
当前结构

大致是这样：

<ul class="tab" aria-label="侧边栏标签页" role="tablist">
  <li>
    <button role="tab" aria-label="相关" aria-selected="false" type="button">...</button>
  </li>
  <li>
    <button role="tab" aria-label="站点" aria-selected="true" type="button">...</button>
  </li>
</ul>
为什么会报错
A. aria-required-children

role="tablist" 期望它的后代关系满足 tab 组件规范。报告明确指出：

ul[role="tablist"] 的子节点里出现了不被允许的 li

也就是：这个 tablist 下不该插入纯列表语义的中间层 li，至少 Lighthouse/axe 在当前结构下不认这套关系。

B. aria-required-parent

两个 button[role="tab"] 都报了：

Required ARIA parent role not present: tablist

虽然视觉上它们在 ul[role=tablist] 里面，但因为中间夹了 li，审计工具没有把它识别为合法的 tab 父子关系。

C. listitem

两个 <li> 还报了：

List item parent element has a role that is not role="list"

原因是：<ul> 本来是列表容器，但你给它改成了 role="tablist"，这样它不再被视为列表；于是里面的 <li> 也就失去了合法的列表父元素。

2）Tab 组件还应该顺手补齐的行为

虽然这份报告主要报的是结构问题，但你既然已经在做 tab，建议一次补完整。

必补属性

每个 role="tab"：

aria-selected="true|false"
aria-controls="tabpanel-id"
只有当前激活项 tabindex="0"，其他为 tabindex="-1"

每个 role="tabpanel"：

aria-labelledby="tab-id"
必补交互

键盘上至少支持：

Tab 进入当前选中的 tab
左右方向键切换 tab
切换时同步：
aria-selected
tabindex
panel 的 hidden / 展示状态
一个简化判断标准

如果你做了 role="tab"，那就要尽量满足标准 tabs 交互模型。
如果做不到，宁可退回普通 button，不要挂半套 ARIA。

3）低优先级：重复链接文案用途不一致

报告里有一个 identical-links-same-purpose 提示，影响较小。它指出页面中多个 “ShokaX / shokaX” 链接对应不同目标：

首页链接：href="/"，文案 ShokaX
标签链接：href="/tags/shokax/"，文案 shokaX
页脚外链：GitHub 项目，文案 ShokaX
风险

对屏幕阅读器用户来说，重复或近似重复的链接文本，若目标不同，会增加理解成本。

建议改法

把链接文案写得更具体：

首页：ShokaX 首页
标签页：shokaX 标签
GitHub：ShokaX GitHub 项目

如果视觉上不想改文案，可以：

保持可见文本不变
用 aria-label 增强区分

例如：

<a href="/" aria-label="ShokaX 首页">ShokaX</a>
<a href="/tags/shokax/" aria-label="shokaX 标签">shokaX</a>
<a href="https://github.com/..." aria-label="ShokaX GitHub 项目">ShokaX</a>
