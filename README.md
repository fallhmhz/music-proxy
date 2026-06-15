# music-proxy —— 把"搜歌→出流"包成一个网址

这就是"包成 HTTP 端点"的意思：一个**一直在线的小服务**，别人访问
`https://你的域名/play?keyword=歌名 歌手` 时，它在**服务器后台**搜歌、取直链、把音频流转发回来。
卡片的 `<audio>` 访问这个网址就等于在放歌。AI 只要给"歌名+歌手"即可，谁用你的卡都不用填东西。

## 它是什么 / 为什么这样
- `server.js` 是一个 Node 服务。后台用 `NeteaseCloudMusicApi` 搜歌取直链（这一步在服务器跑、可以解析 JSON，
  跟"卡片里不能跑脚本"无关）。然后**服务端转流**回卡片——所以卡片只发一个 GET、一步拿到音频(满足"一跳出流")。
- 用转流而不是 302 跳转，是为了让音频走**你自己的 https 域名**，避免 https 页面里加载 http 直链被浏览器当
  "混合内容"拦掉。

## 本地先跑通
1. 装 Node 18+。
2. 在本文件夹里：
   ```
   npm install
   npm start
   ```
3. 浏览器开 `http://localhost:3000/play?keyword=陈绮贞 旅行的意义` —— 能直接播/下到 mp3 就成功。

## 部署上线（任选其一，要 HTTPS）
- **Railway / Render / Fly.io / Zeabur**：新建 Node 服务，连这个仓库，启动命令 `npm start`，会给你一个
  `https://xxx.up.railway.app` 之类的域名。
- **自己的 VPS**：`npm i && npm start`，前面套 Nginx + 证书(https)。
- 上线后你的端点就是 `https://你的域名/play?keyword=...`。

## 接到卡片（只改一处）
打开 `bar_card_TEMPLATE.html`，找到顶部这一行：
```
<span id="musicapi" data-tpl="" ...></span>
```
把 `data-tpl` 填成你的端点模板（`{q}` 是占位符，别动）：
```
<span id="musicapi" data-tpl="https://你的域名/play?keyword={q}" ...></span>
```
完成。卡里按播放时会用「歌名 歌手」替换 `{q}` 来放歌。

## 重要提醒
- **VIP/版权曲取不到直链**：不登录时只有免费歌能出 url。要放更多歌，去拿一个网易云账号的 cookie（`MUSIC_U=...`），
  作为环境变量 `NETEASE_COOKIE` 配上(部署平台的 Environment Variables 里加)。这属于灰色地带，自负其责。
- **前端 CSP**：你那个聊天前端的 `media-src` 必须放行你的域名，声音才出得来。这条在前端，不在本服务；
  若被拦，要在前端那边放行(或换个放行外链的前端)。
- 公共第三方接口(Meting 之类)也能用，但会限速/失效；**自部署最稳、最适合"分享给别人直接用"**。
- 想换音源(QQ/酷狗等)：把 `server.js` 里的搜/取链换成对应库即可，端点形状不变(`/play?keyword={q}`)。
