// Vercel serverless 版：关键词 → 搜歌 → 302 跳到 mp3 直链（强制 https，避免混合内容）
// 端点：https://你的项目.vercel.app/api/play?keyword=歌名 歌手
// 注意：Vercel 函数不适合长时间转流，所以这里用“跳转”而不是“转流”。
const { cloudsearch, song_url_v1 } = require('NeteaseCloudMusicApi');

module.exports = async (req, res) => {
  try {
    const kw = ((req.query && req.query.keyword) || '').trim();
    if (!kw) return res.status(400).send('no keyword');

    const s = await cloudsearch({ keywords: kw, limit: 1 });
    const song = s.body && s.body.result && s.body.result.songs && s.body.result.songs[0];
    if (!song) return res.status(404).send('not found');

    const u = await song_url_v1({ id: song.id, level: 'standard', cookie: process.env.NETEASE_COOKIE || '' });
    let url = u.body && u.body.data && u.body.data[0] && u.body.data[0].url;
    if (!url) return res.status(404).send('no url (可能 VIP/版权曲)');

    url = url.replace(/^http:\/\//, 'https://'); // 强制 https，避免 https 卡片的混合内容拦截

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    res.writeHead(302, { Location: url });
    res.end();
  } catch (e) {
    res.status(500).send('err: ' + (e && e.message));
  }
};
