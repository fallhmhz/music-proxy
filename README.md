# music-proxy-vercel —— 部署到 Vercel（302 跳转版）

无服务器版：函数搜歌 → 拿直链 → 302 跳到 mp3（强制 https）。适合 Vercel，**免费、不休眠**。
端点：`https://你的项目.vercel.app/api/play?keyword=歌名 歌手`

## 文件结构（很重要）
```
music-proxy-vercel/
├── api/
│   └── play.js        ← Vercel 会把 api/ 下的文件当成接口，路径就是 /api/play
└── package.json
```
传到 GitHub 时**保持这个结构**：`play.js` 一定要在 `api/` 文件夹里。

## 部署
1. 把这个文件夹推到一个 GitHub 仓库（保持上面的 api/ 结构）。
2. 打开 vercel.com → Add New → Project → 选这个仓库 → **Deploy**。
   - 框架预设选 **Other**，其它默认即可（不用填 build/start，Vercel 自动识别 api/）。
3. 部署完拿到域名，如 `https://xxx.vercel.app`。
4. 测试：浏览器开 `https://xxx.vercel.app/api/play?keyword=陈绮贞 旅行的意义`，会跳转并播放/下载 mp3。

## 接进卡片（改一处）
`bar_card_TEMPLATE.html` 顶部：
```
<span id="musicapi" data-tpl="https://xxx.vercel.app/api/play?keyword={q}" style="display:none"></span>
```
注意 Vercel 的路径是 **`/api/play`**（不是 `/play`）。

## 可选：放更多歌
Vercel 项目 → Settings → Environment Variables 加 `NETEASE_COOKIE`，值是网易云账号的 `MUSIC_U=...`。灰色地带，自负其责。

## 取舍（和 Render 版的区别）
- ✅ 免费、不休眠、你熟。
- ⚠ 用的是 302 跳转，不是转流。个别歌的 CDN 不支持 https 时，那首会放不出（其它正常，歌词照滚）。
  若遇到较多放不出，改用 `music-proxy/`（Render 转流版，兼容性更好但免费档会休眠）。
