/*!
 * @name 🎉 XiaoqiangClub 音源
 * @description 自建聚合音源 · 高音质优先 · 多后端自动回退
 * @version 1.1.0
 * @author XiaoqiangClub
 * @homepage https://xiaoqiangclub.github.io/lxmusic/
 */

/**
 * XiaoqiangClub LX Music 自定义音源
 * ---------------------------------------------------------------
 * 设计要点（与 TVBox 自建源同构）：
 *  1. 每个平台配置「多后端 fallback 链」，逐个尝试直到拿到可播直链；
 *  2. 音质阶梯：请求 flac → 失败降 320k → 再降 128k（高音质优先，失败不静默）；
 *  3. 结果缓存（TTL 6h），同曲同质不重复解析；
 *  4. 纯 JS 实现，仅依赖 globalThis.lx（桌面版 / 移动版通用）；
 *  5. 所有后端均为公开解析接口，脚本不含任何私有密钥逻辑之外的硬编码。
 *
 * 维护：每周由 projects/lxmusic/scripts 健康检测流水线择优更新本文件。
 *
 * v1.1.0 (2026-10-13) —— 基于 TrongChen/raw-hub 候选源沙箱实测的修复：
 *  1. [严重] tx/aacab 改为关键词模式：传 songmid 会返回无关歌曲（放错歌）；
 *  2. kg 新增 nianxin(kg.php) 后端并置顶：lossless 返回真 FLAC（cenguigui 实为 MP3 静默降级）；
 *  3. kw 新增 nianxin 后端：实测对酷我 rid 同样出真 FLAC，作为 cenguigui 故障时的备胎；
 *  4. wy 维持探测链：本轮实测 K×H/星海/残像/迟言等外部 wy 后端均不可用（token 失效/403）。
 */

const { EVENT_NAMES, request, on, send } = globalThis.lx;

// ============================ 配置区 ============================
// 说明：quality 为 LX 请求音质 -> 后端参数 的映射；缺省表示后端不支持该音质。
// extract: 从后端响应对象中取直链；缺失时用默认深度查找。

const KEY_CARD = '6C1F-53W0-GRKI-EVFG';

const CONFIG = {
  // ---------------- 网易云音乐 ----------------
  // 实测（2026-10-12）：全网免费后端对本环境 IP 均不可用（outer/url 仅回 HTML；
  // c.wwwweb/zddyr/103.79 全失败；mcp 返回空 url）。保留链 + 周更持续探测，
  // 一旦有后端复活即刻纳入。
  wy: {
    name: '网易云音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['songmid', 'id', 'musicId', 'hash'],
    backends: [
      {
        name: 'mcp-nianxin',
        timeout: 8000,
        url: (id, q) => 'https://mcp.nianxinxz.com/share/ceshi/wy.php?id=' + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && d.code === 200 && d.url ? d.url : null,
      },
      {
        name: 'bugpk',
        timeout: 8000,
        url: (id, q) => 'https://api.bugpk.com/api/163_music?type=json&ids=' + id,
        extract: (d) => d && d.url ? d.url : null,
      },
    ],
  },

  // ---------------- 酷我音乐 ----------------
  kw: {
    name: '酷我音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['rid', 'songmid', 'id', 'musicId', 'DC_TARGETID'],
    backends: [
      {
        name: 'cenguigui',
        timeout: 8000,
        url: (id, q) => 'http://103.79.184.97/api/music/url?source=kw&songId=' + id +
          '&quality=' + q + '&key=' + KEY_CARD,
        headers: { 'X-Card-Key': KEY_CARD },
        qmap: { '128k': '128k', '320k': '320k', flac: 'flac' },
        extract: (d) => d && (d.url || (d.data && d.data.url)),
      },
      {
        name: 'nianxin',
        // 2026-10-13 实测：kg.php 对酷我 rid 同样有效，flac 档返回真 FLAC（fLaC 魔数）
        timeout: 9000,
        url: (id, q) => 'https://mcp.nianxinxz.com/share/ceshi/kg.php?hash=' + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && d.code === 200 && d.url ? d.url : null,
      },
      {
        name: 'haitangw',
        timeout: 9000,
        url: (id, q) => 'https://musicapi.haitangw.net/music/kw.php?type=mp3&id=' + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        followRedirect: false,
      },
      {
        name: 'nianxin',
        timeout: 9000,
        url: (id, q) => 'https://music.nxinxz.com/kw.php?id=' + id + '&level=' + q + '&type=mp3',
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        followRedirect: false,
      },
      {
        name: 'nmobi',
        timeout: 9000,
        url: (id, q) => 'https://nmobi.kuwo.cn/mobi.s?f=web&user=0' +
          '&source=kwplayerhd_ar_4.3.0.8_tianbao_T1A_qirui.apk' +
          '&type=convert_url_with_sign&rid=' + id + '&br=' + q,
        qmap: { '128k': '128kmp3', '320k': '320kmp3', flac: '2000kflac' },
        extract: (d) => d && d.data && d.data.url,
      },
    ],
  },

  // ---------------- 酷狗音乐 ----------------
  kg: {
    name: '酷狗音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['hash', 'songmid', 'id', 'FileHash', 'HQFileHash'],
    backends: [
      {
        name: 'nianxin',
        // 2026-10-13 实测：lossless/hires 档返回真 FLAC；cenguigui 的 lossless 实为 MP3 静默降级
        timeout: 9000,
        url: (id, q) => 'https://mcp.nianxinxz.com/share/ceshi/kg.php?hash=' + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && d.code === 200 && d.url ? d.url : null,
      },
      {
        name: 'cenguigui',
        timeout: 8000,
        url: (id, q) => 'http://103.79.184.97/api/music/url?source=kg&songId=' + id +
          '&quality=' + q + '&key=' + KEY_CARD,
        headers: { 'X-Card-Key': KEY_CARD },
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && (d.url || (d.data && d.data.url)),
      },
    ],
  },

  // ---------------- QQ音乐 ----------------
  tx: {
    name: 'QQ音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['songmid', 'id', 'mid', 'hash'],
    backends: [
      {
        name: 'aacab',
        // ⚠️ 2026-10-13 严重 bug 修复：a.aa.cab 的 msg 传 songmid 会返回完全无关的歌曲
        // （实测传《晴天》mid 返回了无关外文歌）。它是关键词搜索接口，必须用 歌名+歌手。
        keywordMode: true,
        timeout: 9000,
        url: (kw, q) => 'https://a.aa.cab/qq.music?msg=' + encodeURIComponent(kw) +
          '&n=1&type=' + q,
        qmap: { '128k': '0', '320k': '1', flac: '4' },
        extract: (d) => d && d.data && (d.data.music || d.data.url),
      },
      {
        name: 'vkeys',
        timeout: 9000,
        url: (id, q) => 'https://api.vkeys.cn/v2/music/tencent/geturl?mid=' + id +
          '&quality=' + q,
        qmap: { '128k': '7', '320k': '5', flac: '4' },
        extract: (d) => d && d.data && (d.data.url || d.data.music),
      },
      {
        name: 'liuyunidc',
        timeout: 9000,
        url: (id, q) => 'https://api.liuyunidc.cn/baimusic/musicurl.php?source=tx&musicId=' + id +
          '&quality=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
      },
    ],
  },

  // ---------------- 咪咕音乐 ----------------
  // 注意：oiapi MiGu_Music 为关键词解析接口（msg=歌名+歌手），必须由调用方拼 keyword
  mg: {
    name: '咪咕音乐',
    qualitys: ['128k', '320k', 'flac'],
    keywordMode: true, // idField 不可用时改用 keyword
    idField: ['id', 'songmid', 'copyrightId', 'contentId'],
    backends: [
      {
        name: 'oiapi',
        timeout: 15000,
        url: (kw, q) => 'https://oiapi.net/api/MiGu_Music?msg=' + encodeURIComponent(kw) +
          '&br=' + q + '&n=1',
        qmap: { '128k': 'PQ', '320k': 'HQ', flac: 'SQ' },
        extract: (d) => d && d.data && d.data.url,
      },
    ],
  },
};

// ============================ 工具函数 ============================

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时
const cache = Object.create(null);

const cacheGet = (k) => {
  const e = cache[k];
  if (e && e.expire > Date.now()) return e.url;
  if (e) delete cache[k];
  return null;
};
const cacheSet = (k, url) => { cache[k] = { url: url, expire: Date.now() + CACHE_TTL }; };

// 深度查找响应中的直链字段
const URL_FIELDS = ['url', 'music', 'play_url', 'playUrl', 'songurl', 'link',
  'song_play_url_sq', 'song_play_url_hq', 'song_play_url_standard',
  'song_play_url_pq', 'song_play_url'];
const findUrl = (data) => {
  if (data == null) return null;
  if (typeof data === 'string') return /^https?:\/\//i.test(data.trim()) ? data.trim() : null;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const r = findUrl(data[i]);
      if (r) return r;
    }
    return null;
  }
  if (typeof data === 'object') {
    for (let i = 0; i < URL_FIELDS.length; i++) {
      const f = URL_FIELDS[i];
      if (data[f] !== undefined) {
        const r = findUrl(data[f]);
        if (r) return r;
      }
    }
    for (const k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        const r = findUrl(data[k]);
        if (r) return r;
      }
    }
  }
  return null;
};

const getField = (obj, path) => {
  if (!obj) return undefined;
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
};

const pickId = (info, fields) => {
  for (let i = 0; i < fields.length; i++) {
    const v = getField(info, fields[i]);
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '';
};

// 清理直链：去掉控制字符；对含非 ASCII 的路径做安全编码（咪咕 CDN 常见）
const sanitize = (url) => {
  if (!url) return '';
  let u = String(url).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  u = u.replace(/\\u0026/gi, '&').replace(/&amp;/g, '&');
  return u;
};
const quotePath = (url) => {
  const i = url.indexOf('://');
  if (i < 0) return url;
  const j = url.indexOf('/', i + 3);
  if (j < 0) return url;
  const k = url.indexOf('?', j);
  const pathEnd = k < 0 ? url.length : k;
  const path = url.slice(j, pathEnd);
  const hasNonAscii = /[^\x00-\x7f]/.test(path);
  if (!hasNonAscii) return url;
  const encoded = path.split('/').map((seg) =>
    /[^\x00-\x7f]/.test(seg) ? encodeURIComponent(seg) : seg).join('/');
  return url.slice(0, j) + encoded + url.slice(pathEnd);
};

const httpGet = (url, headers, timeout, followRedirect) =>
  new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; reject(new Error('timeout')); }
    }, timeout || 8000);
    const opts = { method: 'GET', headers: headers || {}, timeout: timeout || 8000 };
    if (followRedirect === false) opts.followRedirect = false;
    try {
      request(url, opts, (err, resp) => {
        if (done) return;
        done = true; clearTimeout(timer);
        if (err) return reject(err);
        let body = resp && resp.body;
        if (typeof body === 'string') {
          const t = body.trim();
          if (t.charAt(0) === '{' || t.charAt(0) === '[' || t.charAt(0) === '"') {
            try { body = JSON.parse(t); } catch (e) { /* keep string */ }
          }
        }
        // 某些后端用重定向直接给音频地址（followRedirect:false 时取 location）
        if (followRedirect === false && body && typeof body === 'object') {
          const loc = resp.headers && (resp.headers.location || resp.headers.Location);
          if (loc) return resolve({ direct: sanitize(loc) });
        }
        resolve({ body: body, resp: resp });
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); reject(e); }
    }
  });

// 探测直链是否真的是音频（拒绝 HTML 错误页、空响应、提示音等）
// 只读前几十字节，成本极低。
const looksLikeAudio = (url) =>
  new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; resolve(false); }
    }, 6000);
    try {
      request(url, { method: 'GET', headers: { Range: 'bytes=0-63' }, timeout: 6000 }, (err, resp) => {
        if (done) return;
        done = true; clearTimeout(timer);
        if (err || !resp) return resolve(false);
        let body = resp.body;
        // resp.body 可能是 ArrayBuffer / string
        let hex = '';
        if (typeof body === 'string') {
          hex = body.split('').slice(0, 4).map((c) =>
            ('0' + c.charCodeAt(0).toString(16)).slice(-2)).join('');
        } else if (body && body.length) {
          const u8 = new Uint8Array(body);
          hex = Array.from(u8.subarray(0, 4)).map((b) =>
            ('0' + b.toString(16)).slice(-2)).join('');
        }
        // ID3 / mp3 sync / FLAC / OGG / M4A(ftyp) / WMA
        resolve(/^(494433|fffb|fff3|fff2|664c6143|4f676753|.*66747970)/.test(hex));
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); resolve(false); }
    }
  });

// 单后端解析
const resolveViaBackend = async (cfg, backend, id, quality) => {
  const mapped = backend.qmap ? backend.qmap[quality] : quality;
  if (mapped === undefined) throw new Error('unsupported quality');
  const url = backend.url(id, mapped);
  const res = await httpGet(url, backend.headers, backend.timeout, backend.followRedirect);
  if (res.direct) return res.direct;
  let out = null;
  if (typeof backend.extract === 'function') {
    try { out = backend.extract(res.body); } catch (e) { out = null; }
  }
  if (!out) out = findUrl(res.body);
  if (!out) throw new Error('no url in response');
  return sanitize(out);
};

// 平台解析：音质阶梯 + 后端 fallback
const resolveSource = async (srcKey, info, requestedQuality) => {
  const cfg = CONFIG[srcKey];
  if (!cfg) throw new Error('unsupported source: ' + srcKey);

  const id = pickId(info, cfg.idField);
  const keyword = [info && info.name, info && (info.singer || info.artist)].filter(Boolean).join(' ');
  if (!id && !keyword) throw new Error('missing song id/keyword for ' + srcKey);

  // 音质阶梯：从请求音质向下
  const order = ['flac', '320k', '128k'];
  let start = order.indexOf(requestedQuality);
  if (start < 0) start = 0;
  const ladder = [];
  for (let i = start; i < order.length; i++) {
    if (cfg.qualitys.indexOf(order[i]) >= 0) ladder.push(order[i]);
  }
  if (!ladder.length) ladder.push(cfg.qualitys[cfg.qualitys.length - 1]);

  let lastErr = null;
  for (let li = 0; li < ladder.length; li++) {
    const q = ladder[li];
    const ck = srcKey + '|' + (id || keyword) + '|' + q;
    const cached = cacheGet(ck);
    if (cached) return cached;

    for (let bi = 0; bi < cfg.backends.length; bi++) {
      const b = cfg.backends[bi];
      // 后端级 keywordMode（如 tx 的 aacab、mg 的 oiapi）：用 歌名+歌手 而非 id
      const useKeyword = (b.keywordMode || cfg.keywordMode) && keyword;
      if ((b.keywordMode || cfg.keywordMode) && !keyword) continue;
      try {
        // keywordMode 后端用 keyword 作第一参，否则用 id
        let u = await resolveViaBackend(cfg, b, useKeyword ? keyword : id, q);
        u = quotePath(u);
        if (!/^https?:\/\//i.test(u)) throw new Error('bad url');
        // 音频头校验：拒绝 HTML 错误页 / 空文件
        const ok = await looksLikeAudio(u);
        if (!ok) throw new Error('not audio');
        cacheSet(ck, u);
        return u;
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw new Error('all backends failed: ' + (lastErr ? lastErr.message : 'unknown'));
};

// ============================ 事件注册 ============================

const sources = {};
const keys = Object.keys(CONFIG);
for (let i = 0; i < keys.length; i++) {
  const k = keys[i];
  sources[k] = {
    name: CONFIG[k].name,
    type: 'music',
    actions: ['musicUrl'],
    qualitys: CONFIG[k].qualitys,
  };
}

on(EVENT_NAMES.request, (payload) => {
  const action = payload.action;
  const source = payload.source;
  const info = payload.info || {};
  if (action !== 'musicUrl') {
    return Promise.reject(new Error('action not supported: ' + action));
  }
  return resolveSource(source, info.musicInfo || {}, info.type)
    .then((url) => Promise.resolve(url))
    .catch((err) => Promise.reject(err));
});

send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: false,
  sources: sources,
});
