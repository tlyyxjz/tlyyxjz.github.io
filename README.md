# tlyyxjz.github.io

徐浚钊的个人主页 —— **https://tlyyxjz.github.io/**

技术栈：React 19 · Vite 8 · Tailwind CSS 4 · Framer Motion · React Three Fiber

## 本地运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物输出到 dist/
```

## 部署

GitHub Pages 从 `gh-pages` 分支的根目录提供服务，`master` 是源码分支。

```bash
npm run build
cd dist
git init -b gh-pages
git remote add origin https://github.com/tlyyxjz/tlyyxjz.github.io.git
git add -A && git commit -m "deploy"
git push -f origin gh-pages
```

> 注意：源码在 `master`，部署产物在 `gh-pages`。改内容请改 `src/App.jsx` 后重新构建推送，**不要直接编辑 `gh-pages` 分支**。

## 页面内容都在哪

| 想改什么 | 改哪里 |
|---|---|
| 项目清单（BidAgent / DeepProbe / HiveSwarm / 开源贡献 / Casbin Doctor） | `src/App.jsx` 顶部的 `PROJECTS` 数组 |
| 书单 / 国风音乐 | 同文件的 `BOOKS` 数组 |
| 桌面助手「三玖」的问答内容 | `src/App.jsx` 里 `reply()` 的 `map` 对象 |
| 技能条 | 搜 `SkillBar`，等级传 `主力` / `在用` / `入门` / `正在学` |
| 页面标题与 SEO 描述 | `index.html` |

## 相关仓库

- [BidAgent](https://github.com/tlyyxjz/BidAgent) — 620 篇金标实测字段准确率 97.60%，每条结论可回溯原文第几个字符
- [Casbin Config Doctor](https://github.com/tlyyxjz/casbin-config-doctor) — [在线 demo](https://tlyyxjz.github.io/casbin-doctor-demo/)
- [oceanbase/powercontext #1483](https://github.com/oceanbase/powercontext/pull/1483) — 已合并的授权方向 PR

## License

个人作品，代码可参考，内容请勿直接转载。
