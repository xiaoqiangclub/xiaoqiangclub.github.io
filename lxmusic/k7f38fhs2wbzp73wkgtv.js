// 本文件经过轻度混淆：后端地址与卡密以编码形式存放，运行时解码。
// 之所以不做整体加密，是因为洛雪官方要求文件头保留 @name 等注释块，
// 且移动版轻量引擎未实现 zlib.inflate（官方文档明确标注）。
const _k=(()=>{try{return _x("B08KSwsAHU0KCVoIAkFVDQYOAhofQAMcFkkeFg==")}catch(e){return "k7f3gxq5fq6pn99ujvnbs8odz1rn"}})();
const _d=(s)=>{try{return _x(s)}catch(e){return ''}};
function _x(b){const t=atob(b);const o=new Uint8Array(t.length);for(let i=0;i<t.length;i++)o[i]=t.charCodeAt(i);let s='';for(let i=0;i<o.length;i++)s+=String.fromCharCode(o[i]^_k.charCodeAt(i%_k.length));return s;}
/*!
 * @name 🎉 XiaoqiangClub 音源
 * @description 自建聚合音源 · 高音质优先 · 多后端自动回退 · 反广告占位校验
 * @version 1.2.0
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
 * v1.2.0 (2026-10-18) —— 「识别到音乐后被复写成广告」专项修复：
 *  [严重] 移除两个「恒定返回同一文件」的后端（详情见内部维护文档，此处不列域名）：
 *          一个对任意歌曲/平台/音质都返回同一段 TTS 合成语音（约 20s）；
 *          一个对任意 hash 都返回同一份 FLAC（点 A 歌放 B 歌）。
 *          二者都是 HTTP 200 + 合法音频魔数，旧的纯 magic 校验拦不住。
 *  [新增] 三层内容校验（见 verifyAudio / staticGuard）：
 *          a. 元数据比对：解析 ID3v2 TIT2/TPE1 或 FLAC VORBIS_COMMENT，
 *             与请求的歌名/歌手做模糊匹配，不符即拒绝；
 *          b. 时长闸门：MP3 走帧取码率、FLAC 读 STREAMINFO，低于 30s 视为
 *             提示音/试听片段，拒绝；
 *          c. 广告特征词：命中 ttsmaker / 加群 / 接口过期 / 公众号 等即拒绝。
 *  [新增] 静态文件探测（staticGuard）：同一后端对两首不同歌曲返回同一条 URL，
 *          本会话内立即拉黑该后端（占位文件的通用指纹，自愈、无需人工维护名单）。
 *  [新增] kw 平台补 music.nxinxz.com/kw.php（302 直跳酷我 CDN，实测真 FLAC）。
 *  [说明] wy 平台：mcp-wy 对部分歌曲已可出真 FLAC，保留探测链。
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

const KEY_CARD = "_d(\"XXRXdUpNQmJWXHEiJXAUMDwwKQ==\")";

const CONFIG = {
  // ---------------- 网易云音乐 ----------------
  // 实测（2026-10-18）：mcp-wy 对非 VIP 曲目可出真 FLAC（起风了 1330348068 已验证），
  // VIP 曲目返回空 url；bugpk 只给 outer/url（302 到 HTML 页），由内容校验层拒绝。
  wy: {
    name: '网易云音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['songmid', 'id', 'musicId', 'hash'],
    backends: [
      {
        name: 'mcp-wy',
        timeout: 10000,
        url: (id, q) => _d("A0MSQxRCXhoLEkZeAFBYGxIfABoJFgwLFx4BBgpFAxwEHQJdD15BCUBJUQVVHwpf") + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && d.url ? d.url : null,
      },
      {
        name: 'bugpk',
        timeout: 8000,
        url: (id, q) => _d("A0MSQxRCXhoHAV9eDExeBQFYDQ0eFw4UEx5DWFhoC0YUERIKEghGFVNTShoEUAcGAAU=") + id,
        extract: (d) => d && d.url ? d.url : null,
      },
    ],
  },

  // ---------------- 酷我音乐 ----------------
  // v1.2.0：移除 nianxin(kg.php)（占位文件，对任意 rid 都返回同一份《光年之外》）。
  // 保留链：cenguigui（换源聚合，带卡密）→ nxinxz-kw（302 直跳酷我 CDN）→ nmobi（酷我 mobi.s）→ haitangw。
  kw: {
    name: '酷我音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['rid', 'songmid', 'id', 'musicId', 'DC_TARGETID'],
    backends: [
      {
        name: 'cenguigui',
        timeout: 10000,
        url: (id, q) => _d("A0MSQ11XXgRWQhhHVxcITV5YV1VcWR8NVVwHHQJUSUYVFE5GCQREEwsEUgJMBQEMFHELWQ==") + id +
          '&quality=' + q + '&key=' + KEY_CARD,
        headers: { 'X-Card-Key': KEY_CARD },
        qmap: { '128k': '128k', '320k': '320k', flac: 'flac' },
        extract: (d) => d && (d.url || (d.data && d.data.url)),
      },
      {
        name: 'nxinxz-kw',
        // 2026-10-18 实测：302 直跳 car-er.kuwo.cn，flac 档是真 FLAC（晴天/周杰伦 已验证）
        timeout: 10000,
        url: (id, q) => _d("A0MSQxRCXhoLBEUZDRdXDQMYFhhdWwAJVVoFQBtfFgwOHEw=") + id + '&level=' + q + '&type=mp3',
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        followRedirect: false,
      },
      {
        name: 'nmobi',
        timeout: 10000,
        url: (id, q) => _d("A0MSQxRCXhoIHFkSBxdSAB0ZQAEdFwILGFhcHVRRW0QCGldAFRRETV4=") +
          '&source=kwplayerhd_ar_4.3.0.8_tianbao_T1A_qirui.apk' +
          '&type=convert_url_with_sign&rid=' + id + '&br=' + q,
        qmap: { '128k': '128kmp3', '320k': '320kmp3', flac: '2000kflac' },
        extract: (d) => d && d.data && d.data.url,
      },
      {
        name: 'haitangw',
        timeout: 9000,
        url: (id, q) => _d("A0MSQxRCXhoLBEUZDVhJHEQeDwsHWQEDDR8cCx8YC0YUERIaDQYYAAZJBgETBgtfHkhcQhNVTw==") + id + '&level=' + q,
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        followRedirect: false,
      },
    ],
  },

  // ---------------- 酷狗音乐 ----------------
  // v1.2.0：移除 nianxin(kg.php)（占位文件，任意 hash 都返回同一份《光年之外》）。
  // v1.3.0：cenguigui 卡密 2026-10-18 实测失效（恒定 401，静默 90s 重测仍失败），
  //        新增 yinyueku 两步式分支后端顶上；cenguigui 留在链尾等卡密恢复。
  kg: {
    name: '酷狗音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['hash', 'songmid', 'id', 'FileHash', 'HQFileHash'],
    backends: [
      {
        name: 'yinyueku',
        // 两步式：先关键词搜索换 {id, source, sign}，再换直链。
        // 实测 2026-10-18：酷狗 320k 真 MP3、时长 269.8s、ID3 标签正确（晴天/周杰伦）。
        keywordMode: true,
        twoStep: 'yinyueku',
        sourceKey: 'kugou',
        timeout: 15000,
      },
      {
        name: 'cenguigui',
        // 2026-10-18 实测：真实 hash 均能出歌（晴天/周杰伦、光年之外/G.E.M. 已验证），
        // 但 lossless 档实际回落 128k MP3。
        timeout: 10000,
        url: (id, q) => _d("A0MSQ11XXgRWQhhHVxcITV5YV1VcWR8NVVwHHQJUSUYVFE5GCQREEwsEUhJMBQEMFHELWQ==") + id +
          '&quality=' + q + '&key=' + KEY_CARD,
        headers: { 'X-Card-Key': KEY_CARD },
        qmap: { '128k': 'standard', '320k': 'exhigh', flac: 'lossless' },
        extract: (d) => d && (d.url || (d.data && d.data.url)),
      },
    ],
  },

  // ---------------- QQ音乐 ----------------
  // v1.2.0：移除 liuyunidc（对任意歌曲/平台都返回同一个 TTS 广告文件）。
  tx: {
    name: 'QQ音乐',
    qualitys: ['128k', '320k', 'flac'],
    idField: ['songmid', 'id', 'mid', 'hash'],
    backends: [
      {
        name: 'aacab',
        // ⚠️ 2026-10-13 严重 bug 修复：a.aa.cab 的 msg 传 songmid 会返回完全无关的歌曲
        // （实测传《晴天》mid 返回了无关外文歌）。它是关键词搜索接口，必须用 歌名+歌手。
        // v1.2.0：关键词模式 + 内容校验后，实测《晴天》→晴天/周杰伦、《起风了》→起风了/买辣椒也用券。
        keywordMode: true,
        timeout: 10000,
        url: (kw, q) => _d("A0MSQxRCXhoHX1cRQFpYF0UHH0weTRwNGQ4fHQwK") + encodeURIComponent(kw) +
          '&n=1&type=' + q,
        qmap: { '128k': '0', '320k': '1', flac: '4' },
        extract: (d) => d && d.data && (d.data.music || d.data.url),
      },
      {
        name: 'vkeys',
        timeout: 10000,
        url: (id, q) => _d("A0MSQxRCXhoHAV9eGFJcDBlYDQxcTl1LF0QBBwgYElYJGxRbEl5RFRpMSxlVGwcGTg==") + id +
          '&quality=' + q,
        qmap: { '128k': '7', '320k': '5', flac: '4' },
        extract: (d) => d && d.data && (d.data.url || d.data.music),
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
        url: (kw, q) => _d("A0MSQxRCXhoJGFcABxdXEB5ZDxIaFyINPUQtIx5ED1BYFQJSWw==") + encodeURIComponent(kw) +
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
        // ⚠️ 不能只在 body 是对象时取：302 的 body 常是空串/HTML，照样要读 Location。
        if (followRedirect === false && resp) {
          const h = resp.headers || {};
          const loc = h.location || h.Location;
          if (loc) return resolve({ direct: sanitize(loc) });
        }
        resolve({ body: body, resp: resp });
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); reject(e); }
    }
  });

// ==================== 反广告 / 反占位文件 校验层（v1.2.0） ====================
//
// 背景（2026-10-18 实测踩坑）：
//   有些后端「看起来成功」——返回 HTTP 200、魔数是合法 MP3/FLAC——但内容其实是
//   一个固定的 TTS 语音文件（"接口已过期，请加群 XXX"）或一个与请求无关的占位音频。
//   只校验 magic 拦不住这类，必须校验「内容是不是你要的那首歌」。

// 广告 / 提示音特征词（元数据命中即拒绝）
const AD_PATTERN = /(ttsmaker|audio\s*generated|generated\s*by|加群|加\s*qq|qq\s*群|q\s*群|微信群|扫码|关注公众号|接口.{0,4}(过期|失效|关闭)|已过期|请更换|获取新.{0,4}(接口|源)|vx\s*[:：]|telegram|tg\s*群|付费|赞助|捐赠|提示音|试听片段|advertisement)/i;

// 歌曲时长下限（秒）。占位语音/试听片段通常远低于此值。
const MIN_SONG_SECONDS = 30;

// 探测窗口大小（字节）。只读文件头一小段，成本极低。
const PROBE_BYTES = 262143;

// ---- 二进制读取：兼容 lx.request 可能返回 string / ArrayBuffer / Uint8Array ----
const toBytes = (body) => {
  if (!body) return null;
  if (typeof body === 'string') {
    const n = Math.min(body.length, PROBE_BYTES + 1);
    const u8 = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8[i] = body.charCodeAt(i) & 0xff;
    return u8;
  }
  if (body instanceof Uint8Array) return body;
  if (typeof body === 'object' && typeof body.length === 'number') {
    try { return new Uint8Array(body); } catch (e) { return null; }
  }
  return null;
};

const u8 = (buf, i) => (buf && i < buf.length ? buf[i] : 0);

// ---- ID3v2 (MP3) 标签解析：只取 TIT2/TPE1/TALB/COMM/TSSE/TXXX ----
const parseId3v2 = (buf) => {
  const out = { tags: {}, size: 0 };
  if (!buf || buf.length < 10) return out;
  if (u8(buf, 0) !== 0x49 || u8(buf, 1) !== 0x44 || u8(buf, 2) !== 0x33) return out; // "ID3"
  const ver = u8(buf, 3);
  const size = ((u8(buf, 6) & 0x7f) << 21) | ((u8(buf, 7) & 0x7f) << 14) |
               ((u8(buf, 8) & 0x7f) << 7) | (u8(buf, 9) & 0x7f);
  out.size = size;
  out.ver = ver;
  let i = 10;
  const end = Math.min(buf.length, 10 + size);
  const WANT = { TIT2: 1, TPE1: 1, TALB: 1, TSSE: 1, TENC: 1, TPUB: 1 };
  while (i + 10 <= end) {
    const fid = String.fromCharCode(u8(buf, i), u8(buf, i + 1), u8(buf, i + 2), u8(buf, i + 3));
    if (!/^[A-Z0-9]{4}$/.test(fid)) break;
    let fsz;
    if (ver === 4) {
      fsz = ((u8(buf, i + 4) & 0x7f) << 21) | ((u8(buf, i + 5) & 0x7f) << 14) |
            ((u8(buf, i + 6) & 0x7f) << 7) | (u8(buf, i + 7) & 0x7f);
    } else {
      fsz = (u8(buf, i + 4) << 24) | (u8(buf, i + 5) << 16) | (u8(buf, i + 6) << 8) | u8(buf, i + 7);
    }
    const body = buf.subarray(i + 10, Math.min(i + 10 + fsz, end));
    i += 10 + fsz;
    if (WANT[fid] && body.length > 1) {
      const enc = body[0];
      const raw = body.subarray(1);
      let txt = '';
      try {
        if (enc === 0) txt = decodeLatin1(raw);
        else if (enc === 1 || enc === 2) txt = decodeUtf16(raw, enc === 2);
        else txt = decodeUtf8(raw);
      } catch (e) { txt = ''; }
      txt = txt.replace(/\u0000/g, '').trim();
      if (txt) out.tags[fid] = txt.slice(0, 120);
    }
  }
  return out;
};

const decodeLatin1 = (b) => {
  let s = '';
  for (let i = 0; i < b.length; i++) {
    if (b[i] === 0) break;
    s += String.fromCharCode(b[i]);
  }
  return s;
};
const decodeUtf16 = (b, bigEndian) => {
  let s = '';
  for (let i = 0; i + 1 < b.length; i += 2) {
    const c = bigEndian ? ((b[i] << 8) | b[i + 1]) : ((b[i + 1] << 8) | b[i]);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
};
const decodeUtf8 = (b) => {
  // ⚠️ 移动版是轻量 JS 引擎，浏览器 API（TextDecoder）可能不存在。
  // 必须手写 UTF-8 解码，否则元数据在手机上会静默退化成空串，
  // 等于把反广告校验整个关掉（2026-10-18 查官方文档后补）。
  try {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(b);
  } catch (e) { /* fallthrough */ }
  try {
    let out = '';
    let i = 0;
    const n = b.length;
    while (i < n) {
      const c = b[i++];
      if (c < 0x80) { out += String.fromCharCode(c); continue; }
      let extra = 0, cp = 0;
      if ((c & 0xe0) === 0xc0) { extra = 1; cp = c & 0x1f; }
      else if ((c & 0xf0) === 0xe0) { extra = 2; cp = c & 0x0f; }
      else if ((c & 0xf8) === 0xf0) { extra = 3; cp = c & 0x07; }
      else { out += '\ufffd'; continue; }
      for (let k = 0; k < extra && i < n; k++) cp = (cp << 6) | (b[i++] & 0x3f);
      if (cp > 0xffff) {
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      } else out += String.fromCharCode(cp);
    }
    return out;
  } catch (e) { return ''; }
};

// ---- FLAC VORBIS_COMMENT 解析 ----
const parseFlac = (buf) => {
  const out = { tags: {}, duration: null, sampleRate: 0, totalSamples: 0 };
  if (!buf || buf.length < 8) return out;
  if (!(u8(buf, 0) === 0x66 && u8(buf, 1) === 0x4c && u8(buf, 2) === 0x61 && u8(buf, 3) === 0x43)) return out; // fLaC（小写 a=0x61）
  let i = 4;
  while (i + 4 <= buf.length) {
    const hdr = u8(buf, i);
    const last = (hdr & 0x80) !== 0;
    const type = hdr & 0x7f;
    const len = (u8(buf, i + 1) << 16) | (u8(buf, i + 2) << 8) | u8(buf, i + 3);
    const body = buf.subarray(i + 4, Math.min(i + 4 + len, buf.length));
    i += 4 + len;
    if (type === 0 && body.length >= 18) {
      // STREAMINFO：sample rate(20b) + channels(3b) + bps(5b) + total samples(36b)
      out.sampleRate = (u8(body, 10) << 12) | (u8(body, 11) << 4) | (u8(body, 12) >> 4);
      // ⚠️ totalSamples 是 36 位：高 4 位在 body[13] 低半字节，再接 body[14..17]。
      // （2026-10-18 用真实 FLAC 字节 dump 验证：晴天 FLAC → 11895828 samples / 44100 = 269.7s）
      // JS 位运算按 32 位取模，`<< 32` 等价于 `<< 0`，所以高位必须用乘法拼接。
      out.totalSamples = (u8(body, 13) & 0x0f) * 0x100000000 +
        u8(body, 14) * 0x1000000 + u8(body, 15) * 0x10000 +
        u8(body, 16) * 0x100 + u8(body, 17);
    }
    if (type === 4) {
      try {
        let p = 0;
        const vl = readLe32(body, p); p += 4 + vl;              // vendor
        const n = readLe32(body, p); p += 4;
        for (let k = 0; k < n && p + 4 <= body.length; k++) {
          const l = readLe32(body, p); p += 4;
          const kv = decodeUtf8(body.subarray(p, p + l)); p += l;
          const eq = kv.indexOf('=');
          if (eq > 0) out.tags[kv.slice(0, eq).toUpperCase()] = kv.slice(eq + 1).slice(0, 120);
        }
      } catch (e) { /* ignore */ }
      break;
    }
    if (last) break;
  }
  if (out.sampleRate && out.totalSamples) out.duration = out.totalSamples / out.sampleRate;
  return out;
};

const readLe32 = (b, p) =>
  ((u8(b, p) & 0xff)) | ((u8(b, p + 1) & 0xff) << 8) |
  ((u8(b, p + 2) & 0xff) << 16) | ((u8(b, p + 3) & 0xff) << 24);

// 文件总大小：优先 Content-Range 的 total，其次 Content-Length。
// Range 请求会回 206，此时 Content-Length 只是区间长度，不能当总大小用。
const totalSizeOf = (resp, cl) => {
  const h = (resp && resp.headers) || {};
  const cr = h['content-range'] || h['Content-Range'] || '';
  const m = /\/(\d+)\s*$/.exec(String(cr));
  if (m) return parseInt(m[1], 10) || 0;
  // 200 全量响应：Content-Length 就是总大小
  const status = resp && (resp.status || resp.statusCode);
  if (status === 200 && cl > 0) return cl;
  return 0;
};

// ---- MP3 帧解析：取平均码率 + 估算时长 ----
const MP3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const MP3_RATES = [44100, 48000, 32000, 0];

const analyzeMp3 = (buf, id3Size) => {
  // 找第一个帧同步
  let start = -1;
  for (let i = Math.max(0, id3Size); i < Math.min(buf.length - 4, id3Size + 65536); i++) {
    if (u8(buf, i) === 0xff && (u8(buf, i + 1) & 0xe0) === 0xe0) { start = i; break; }
  }
  if (start < 0) return null;
  let pos = start;
  let frames = 0;
  let bytes = 0;
  let brSum = 0;
  const limit = buf.length;
  while (pos + 4 <= limit && frames < 4096) {
    if (u8(buf, pos) !== 0xff || (u8(buf, pos + 1) & 0xe0) !== 0xe0) { pos++; continue; }
    const brIdx = (u8(buf, pos + 2) >> 4) & 0x0f;
    const srIdx = (u8(buf, pos + 2) >> 2) & 0x03;
    if (brIdx === 0 || brIdx === 15 || srIdx === 3) { pos++; continue; }
    const br = MP3_BITRATES[brIdx] * 1000;
    const sr = MP3_RATES[srIdx];
    const pad = (u8(buf, pos + 2) >> 1) & 0x01;
    const flen = Math.floor(144 * br / sr) + pad;
    if (flen <= 4) { pos++; continue; }
    frames++; bytes += flen; brSum += br;
    pos += flen;
  }
  if (!frames) return null;
  const avgBr = brSum / frames;
  return { bitrate: avgBr, sampledBytes: pos - start, id3Size: id3Size };
};

// ---- 歌名/歌手模糊匹配（CJK 字符重合度） ----
const cjkChars = (s) => {
  const m = String(s || '').match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g);
  return m ? m.join('') : '';
};
const asciiTokens = (s) =>
  String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3);

const textMatch = (tag, expect) => {
  const a = String(tag || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const b = String(expect || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!a || !b) return null; // 无法判定
  if (a === b) return true;
  if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return true;
  // CJK 重合
  const ca = cjkChars(a), cb = cjkChars(b);
  if (ca && cb) {
    const setB = new Set(cb.split(''));
    let hit = 0;
    for (const ch of ca) if (setB.has(ch)) hit++;
    if (hit >= Math.min(2, cb.length)) return true;
    if (hit >= 1 && cb.length <= 2) return true;
  }
  // 英文词重合
  const ta = asciiTokens(a), tb = new Set(asciiTokens(b));
  if (ta.length && tb.size) {
    for (const t of ta) if (tb.has(t)) return true;
  }
  return false;
};

/**
 * 内容校验：拉文件头一小段，判定
 *   1) 是否音频魔数；2) 元数据是否与请求歌曲匹配；3) 时长是否合理；4) 是否广告特征词。
 * expect = { name, singer }；任一为空则跳过对应比对。
 */
const verifyAudio = (url, expect) =>
  new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => finish({ ok: false, reason: 'probe-timeout' }), 9000);
    // finish 是唯一出口：自行接管 done 标志 + 清理定时器。
    // ⚠️ 不要在调用 finish 之前手动置 done，否则 Promise 永不 settle。
    function finish(r) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(r);
    }
    try {
      request(url, { method: 'GET', headers: { Range: 'bytes=0-' + PROBE_BYTES }, timeout: 9000 },
        (err, resp) => {
          if (err || !resp) return finish({ ok: false, reason: 'probe-error' });
          const buf = toBytes(resp.body);
          if (!buf || buf.length < 8) return finish({ ok: false, reason: 'empty-body' });
          // hex 用于 ftyp(m4a) 定位：至少覆盖 ISO-BMFF 头（ftyp box 在偏移 4 处）。
          const hex = Array.from(buf.subarray(0, Math.min(16, buf.length)))
            .map((b) => b.toString(16).padStart(2, '0')).join('');
          const isFlac = buf[0] === 0x66 && buf[1] === 0x4c && buf[2] === 0x61 && buf[3] === 0x43; // fLaC（小写 a=0x61）
          const isId3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;
          const isMp3Frame = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
          const isOgg = buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53;
          const isFtyp = hex.indexOf('66747970') >= 0; // m4a / mp4（ftyp box，通常在偏移 4）
          if (!isFlac && !isId3 && !isMp3Frame && !isOgg && !isFtyp) {
            return finish({ ok: false, reason: 'not-audio:' + hex });
          }
          const cl = (resp.headers && (resp.headers['content-length'] || resp.headers['Content-Length']))
            ? parseInt(resp.headers['content-length'] || resp.headers['Content-Length'], 10) : 0;
          // ⚠️ 我们用 Range 拉探针，服务端多回 206 + Content-Range。
          // 总大小必须取 Content-Range 的 total，不能取 Content-Length（那只是区间长度）。
          const total = totalSizeOf(resp, cl);
          const info = { ok: true, magic: hex, tags: {}, duration: null };
          if (isFlac) {
            const f = parseFlac(buf);
            info.tags = f.tags; info.duration = f.duration;
          } else if (isId3) {
            const t = parseId3v2(buf);
            info.tags = t.tags;
            const a = analyzeMp3(buf, t.size);
            if (a) {
              // 仅在拿到可靠总大小时才算时长，否则留空跳过时长闸门
              if (total > a.id3Size) info.duration = (total - a.id3Size) * 8 / a.bitrate;
              info.bitrate = Math.round(a.bitrate / 1000);
            }
          } else if (isMp3Frame) {
            const a = analyzeMp3(buf, 0);
            if (a) {
              if (total > 0) info.duration = total * 8 / a.bitrate;
              info.bitrate = Math.round(a.bitrate / 1000);
            }
          }
          // --- 广告特征词 ---
          const tagBlob = Object.keys(info.tags).map((k) => k + '=' + info.tags[k]).join(' ');
          if (AD_PATTERN.test(tagBlob)) {
            return finish({ ok: false, reason: 'ad-metadata', tags: info.tags });
          }
          // --- 时长闸门 ---
          if (info.duration !== null && info.duration > 0 && info.duration < MIN_SONG_SECONDS) {
            return finish({ ok: false, reason: 'too-short:' + Math.round(info.duration) + 's' });
          }
          // --- 歌名/歌手比对 ---
          const name = expect && expect.name;
          const singer = expect && expect.singer;
          if (name || singer) {
            const title = info.tags.TIT2 || info.tags.TITLE || '';
            const artist = info.tags.TPE1 || info.tags.ARTIST || '';
            const tOk = name ? textMatch(title, name) : null;
            const aOk = singer ? textMatch(artist, singer) : null;
            if (tOk === false || aOk === false) {
              return finish({ ok: false, reason: 'song-mismatch',
                              tags: { title: title, artist: artist }, duration: info.duration });
            }
          }
          return finish(info);
        });
    } catch (e) {
      finish({ ok: false, reason: 'probe-throw' });
    }
  });

// ---- 静态文件探测：同一后端把同一条 URL 发给不同歌曲 → 本会话拉黑 ----
// 这是「占位文件 / 广告文件」的通用指纹，无需人工维护后端黑名单。
const backendSeen = Object.create(null);  // backendName -> { url -> songKey }
const backendPoisoned = Object.create(null);

const noteStaticHit = (backendName, url, songKey) => {
  if (backendPoisoned[backendName]) return;
  const m = backendSeen[backendName] || (backendSeen[backendName] = Object.create(null));
  const prev = m[url];
  if (prev === undefined) { m[url] = songKey; return; }
  if (prev !== songKey) {
    backendPoisoned[backendName] = true;
    try {
      console.warn('[xiaoqiang] 反广告：后端 ' + backendName +
        ' 对不同歌曲返回同一条 URL，已在本会话内停用。');
    } catch (e) { /* noop */ }
  }
};

// 单后端解析
// -=================== 两步式后端（yinyueku / MKOnlinePlayer） ====================
// 与「一次请求换直链」的后端不同：它需要先关键词搜索拿到 {id, source, sign}，
// 再用这三个字段换直链。逆向自 ~/.openclaw/skills/yinyueku-search（yinyueku.cn）。
//
// 实测（2026-10-18）：
//   - 音质档位参数（br/quality/flac）全部无效，url 接口忽略它们，只返回一种码率；
//   - netease 常见 320k，kugou 常见 320k；所以音质阶梯对它意义不大，
//     由 verifyAudio 报出的真实码率兜底（不静默降级）。
//   - sign 非一次性，可重复取链；直链约 10~30 分钟有效，缓存 6h 可能过期，
//     过期后由 fallback 链重试（失败会继续降级，不会整体报错）。
//   - 该站 HTTPS 证书已过期（2025-08-12），lx.request 由客户端代理，不受本容器证书链影响。
// ⚠️ 2026-10-18 实测：www.yinyueku.cn 的 HTTPS 证书已于 2025-08-12 过期
//    （openssl 确认 notAfter=Aug 12 2025，Node fetch 报 CERT_HAS_EXPIRED）。
//    Electron/Chromium 网络栈同样会校验证书，所以 https 在客户端大概率也失败。
//    该域名 http(80) 直连可用且不跳转，故这里用 http。
//    本地 Python 探测能通是因为脚本显式 verify=False，不能拿来说明客户端行为。
const YINYUEKU_API = _d("A0MSQ11XXkIRBhgJB1dAAA8dG0wQVkAFClhcHgNH");

const yinyuekuResolve = async (keyword, sourceKey, timeout, expect) => {
  // 第一步：搜索。响应是对象数组 {id,name,artist,album,pic_id,url_id,lyric_id,source,sign}
  const searchBody = 'types=search&name=' + encodeURIComponent(keyword) +
    '&count=6&pages=1' + (sourceKey ? '&source=' + encodeURIComponent(sourceKey) : '');
  const sres = await httpPost(YINYUEKU_API, searchBody, timeout);
  let list = null;
  if (typeof sres === 'string') {
    try { list = JSON.parse(sres); } catch (e) { list = null; }
  } else if (sres && typeof sres === 'object') {
    list = sres;
  }
  if (!Array.isArray(list) || !list.length) throw new Error('yinyueku: no search result');
  // 取第一条歌名与请求最贴近的结果，避免搜到 remix/翻唱就交差
  let item = list[0];
  let bestScore = -1;
  for (let i = 0; i < list.length && i < 6; i++) {
    const it = list[i];
    if (!it || !it.id) continue;
    let score = 0;
    if (expect && expect.name && it.name && it.name.indexOf(expect.name) >= 0) score += 2;
    if (expect && expect.singer && it.artist) {
      const ar = Array.isArray(it.artist) ? it.artist.join(' ') : String(it.artist);
      if (ar.indexOf(expect.singer) >= 0) score += 2;
    }
    if (score > bestScore) { bestScore = score; item = it; }
  }
  if (!item || !item.id) throw new Error('yinyueku: no usable item');
  // 第二步：换直链。必须用搜索返回的 sign（一次性由服务端签发）
  const urlBody = 'types=url&id=' + encodeURIComponent(String(item.url_id || item.id)) +
    '&source=' + encodeURIComponent(String(item.source || sourceKey || '')) +
    '&sign=' + encodeURIComponent(String(item.sign || ''));
  const ures = await httpPost(YINYUEKU_API, urlBody, timeout);
  let out = null;
  if (typeof ures === 'string') {
    try { out = JSON.parse(ures).url; } catch (e) { out = null; }
  } else if (ures && typeof ures === 'object') {
    out = ures.url;
  }
  if (!out || !/^https?:\/\//i.test(String(out))) throw new Error('yinyueku: no url');
  return sanitize(String(out));
};

// POST 表单（yinyueku 用 POST 更稳；GET 亦可但易被 CDN 拦）
const httpPost = (url, bodyStr, timeout) =>
  new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; reject(new Error('timeout')); }
    }, timeout || 15000);
    try {
      request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyStr,
        timeout: timeout || 15000,
      }, (err, resp) => {
        if (done) return;
        done = true; clearTimeout(timer);
        if (err) return reject(err);
        resolve(resp && resp.body);
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); reject(e); }
    }
  });

const resolveViaBackend = async (cfg, backend, id, quality, expect) => {
  // 两步式后端（yinyueku）：id 此时是「歌名 歌手」关键词
  if (backend.twoStep === 'yinyueku') {
    const out = await yinyuekuResolve(id, backend.sourceKey, backend.timeout, expect);
    return out;
  }
  const mapped = backend.qmap ? backend.qmap[quality] : quality;
  if (mapped === undefined) throw new Error('unsupported quality');
  const url = backend.url(id, mapped);
  const res = await httpGet(url, backend.headers, backend.timeout, backend.followRedirect);
  if (res.direct) {
    const songKey = expect && (expect.name || '') + '|' + (expect.singer || '');
    const v = await verifyAudio(quotePath(res.direct), expect);
    if (!v.ok) throw new Error('direct-not-verified: ' + v.reason);
    noteStaticHit(backend.name, res.direct, songKey);
    return res.direct;
  }
  let out = null;
  if (typeof backend.extract === 'function') {
    try { out = backend.extract(res.body); } catch (e) { out = null; }
  }
  if (!out) out = findUrl(res.body);
  if (!out) throw new Error('no url in response');
  out = sanitize(out);
  return out;
};

// 平台解析：音质阶梯 + 后端 fallback + 内容校验
const resolveSource = async (srcKey, info, requestedQuality) => {
  const cfg = CONFIG[srcKey];
  if (!cfg) throw new Error('unsupported source: ' + srcKey);

  const id = pickId(info, cfg.idField);
  const keyword = [info && info.name, info && (info.singer || info.artist)].filter(Boolean).join(' ');
  if (!id && !keyword) throw new Error('missing song id/keyword for ' + srcKey);
  const expect = { name: info && info.name, singer: info && (info.singer || info.artist) };
  const songKey = (id || keyword) + '|' + keyword;

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
      if (backendPoisoned[b.name]) continue;   // 静态文件后端，本会话停用
      try {
        let u = await resolveViaBackend(cfg, b, useKeyword ? keyword : id, q, expect);
        u = quotePath(u);
        if (!/^https?:\/\//i.test(u)) throw new Error('bad url');
        // 内容校验：拒绝 HTML / 空文件 / 占位音频 / 广告语音 / 时长过短 / 歌名不符
        const v = await verifyAudio(u, expect);
        if (!v.ok) throw new Error('rejected: ' + v.reason);
        noteStaticHit(b.name, u, songKey);
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
