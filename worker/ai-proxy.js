/**
 * 漫威模拟器 · AI 代理 Worker (Cloudflare Workers)
 * 部署后把 ai.js 里的 CX_BASE 改成你的 Worker 地址，前端就不再暴露 API Key。
 *
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. 粘贴本文件全部内容
 * 3. 变量 → 添加环境变量 ZHIPU_KEY = 你的智谱 API Key（加密存储）
 * 4. 保存部署，拿到 https://xxx.worker.dev 地址
 * 5. 在游戏「⚙ 引擎」里把 API 地址改成你的 Worker 地址
 */

const ALLOWED_ORIGINS = [
  'https://mvsimbycx-3mdv2jb.maozi.io',
  'https://congxihang21-ctrl.github.io'
];

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request.headers.get('Origin'))
      });
    }

    // 只允许 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({error: 'Method not allowed'}), {
        status: 405,
        headers: {'Content-Type': 'application/json'}
      });
    }

    // 来源校验（防盗用）
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
    if (!allowed && origin) {
      return new Response(JSON.stringify({error: 'Origin not allowed'}), {
        status: 403,
        headers: {'Content-Type': 'application/json'}
      });
    }

    try {
      const body = await request.text();
      const upstream = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + env.ZHIPU_KEY
        },
        body
      });

      const respHeaders = new Headers();
      respHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
      const cors = corsHeaders(origin);
      for (const [k, v] of cors) respHeaders.set(k, v);

      return new Response(upstream.body, {
        status: upstream.status,
        headers: respHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({error: 'Proxy error: ' + e.message}), {
        status: 502,
        headers: {'Content-Type': 'application/json'}
      });
    }
  }
};

function corsHeaders(origin) {
  const h = new Headers();
  h.set('Access-Control-Allow-Origin', origin || '*');
  h.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  h.set('Access-Control-Max-Age', '86400');
  return h;
}
