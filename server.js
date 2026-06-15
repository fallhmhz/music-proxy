// 关键词 → 直接出 mp3 流（一跳出流）。给卡片的 <audio> 用。
// GET /play?keyword=歌名 歌手   →   服务端搜 NetEase、取直链、把音频流转发回来
// 用服务端转流(不是 302 跳到 http)，避免 https 卡片里的“混合内容”被拦。
const express = require('express');
const { cloudsearch, song_url_v1 } = require('NeteaseCloudMusicApi');
const { Readable } = require('stream');

const app = express();

app.get('/play', async (req, res) => {
  try {
    const kw = (req.query.keyword || '').trim();
    if (!kw) return res.status(400).send('no keyword');

    // 1) 搜索取第一条
    const s = await cloudsearch({ keywords: kw, limit: 1 });
    const song = s.body && s.body.result && s.body.result.songs && s.body.result.songs[0];
    if (!song) return res.status(404).send('not found');

    // 2) 取播放直链（免费歌可直接拿到；VIP/版权曲需在环境变量放 NetEase cookie，见 README）
    const u = await song_url_v1({ id: song.id, level: 'standard', cookie: process.env.NETEASE_COOKIE || '' });
    const url = u.body && u.body.data && u.body.data[0] && u.body.data[0].url;
    if (!url) return res.status(404).send('no url (可能是 VIP/版权曲)');

    // 3) 服务端拉流并转发（统一走你的 https 域名；inline 在线播放 + 支持拖动进度）
    const range = req.headers.range;
    const upstream = await fetch(url, { headers: range ? { Range: range } : {} });
    if (!upstream.ok || !upstream.body) return res.status(502).send('upstream error');
    res.status(upstream.status === 206 ? 206 : 200);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    res.set('Content-Disposition', 'inline');      // 在线播放，而不是下载
    res.set('Accept-Ranges', 'bytes');             // 允许拖动进度
    const cr = upstream.headers.get('content-range'); if (cr) res.set('Content-Range', cr);
    const cl = upstream.headers.get('content-length'); if (cl) res.set('Content-Length', cl);
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    res.status(500).send('err: ' + (e && e.message));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('music-proxy on :' + PORT));
