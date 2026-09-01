const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'miami_portal_data';

// 初回アクセス時にUpstashへ書き込む初期データ
const DEFAULT_DATA = {
  miami: {
    name: "MIAMIホールディングス株式会社",
    password: "miami0383",
    systems: [
      { name: "入金管理システム", url: "https://mr-debt-collection.vercel.app", id: "a", pw: "a" },
      { name: "RECS注文フォーム(新規発注)", url: "https://recs-order-form.vercel.app", id: "", pw: "" },
      { name: "カーズリペア保証管理システム", url: "https://guarantor-main.vercel.app/login", id: "b", pw: "b" },
      { name: "RECS GPSシステム", url: "https://recs-gps.com/#/admin/login", id: "super.admin@maiami-prod.local", pw: "SuperAdmin#Prod-MghEKqxnJxrfzBet" }
    ]
  },
  engine: {
    name: "株式会社エンジン",
    password: "miami0383",
    systems: [
      { name: "カーセラマネジメントシステム", url: "https://engine-payment.vercel.app", id: "", pw: "" },
      { name: "カーズリペア保証管理システム", url: "https://guarantor-main.vercel.app/login", id: "a", pw: "a" },
      { name: "RECS GPSシステム", url: "https://recs-gps.com/#/login", id: "info@enjin-motors.com", pw: "Miami@03830383" },
      { name: "レインフォース", url: "https://www.reinforce.style/login", id: "", pw: "" },
      { name: "GMS GPS", url: "https://ops.cloud-gms.com/", id: "", pw: "" },
      { name: "シンフォニー", url: "https://kurumaerabi.com/symphony/?SymphonyLogin", id: "", pw: "" }
    ]
  },
  threeeight: {
    name: "株式会社スリーエイト",
    password: "kcar3333",
    systems: [
      { name: "カーセラマネジメントシステム", url: "https://engine-payment.vercel.app", id: "", pw: "" },
      { name: "カーズリペア保証管理システム", url: "https://guarantor-main.vercel.app/login", id: "kcar", pw: "3333" },
      { name: "RECS GPSシステム", url: "https://recs-gps.com/#/login", id: "threeeight333@gmail.com", pw: "Threeeight@333" }
    ]
  }
};

async function upstashCommand(cmd) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cmd)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash error (${res.status}): ${text}`);
  }
  return res.json();
}

async function getData() {
  const { result } = await upstashCommand(['GET', KEY]);
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

async function setData(data) {
  await upstashCommand(['SET', KEY, JSON.stringify(data)]);
}

module.exports = async (req, res) => {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    res.status(500).json({
      error: 'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN がVercelの環境変数に設定されていません。'
    });
    return;
  }

  try {
    if (req.method === 'GET') {
      let data = await getData();
      if (!data) {
        data = DEFAULT_DATA;
        await setData(data);
      }
      res.status(200).json(data);
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: '不正なデータ形式です。' });
        return;
      }
      await setData(body);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
