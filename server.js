const { createServer } = require("node:http");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const { z } = require("zod");

const schema = z.object({ question: z.string().trim().min(2).max(1000) });
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "").split(",").map((v) => v.trim()).filter(Boolean);
const json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};
function cors(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return true;
  }
  return !origin;
}
async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 32_000) throw new Error("Request body too large");
  }
  return JSON.parse(raw || "{}");
}
const server = createServer(async (req, res) => {
  if (!cors(req, res)) return json(res, 403, { error: "Origin not allowed." });
  if (req.method === "OPTIONS" && req.url === "/api/assistant") {
    res.writeHead(204); return res.end();
  }
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { status: "ok", service: "payday-peace-api" });
  }
  if (req.method !== "POST" || req.url !== "/api/assistant") {
    return json(res, 404, { error: "Not found." });
  }
  try {
    const parsed = schema.safeParse(await readBody(req));
    if (!parsed.success) return json(res, 400, { error: "Enter a question between 2 and 1,000 characters." });
    const token = req.headers.authorization?.replace(/^Bearer\\s+/i, "");
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !key) return json(res, 401, { error: "Sign in is required." });
    if (!process.env.OPENAI_API_KEY) return json(res, 503, { error: "AI is not configured yet." });
    const db = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return json(res, 401, { error: "Your session is invalid." });
    const [{ data: profile }, { data: bills }, { data: expenses }] = await Promise.all([
      db.from("profiles").select("take_home_income,next_payday,pay_frequency").eq("id", user.id).maybeSingle(),
      db.from("bills").select("name,amount,due_date,is_paid").eq("user_id", user.id).order("due_date").limit(100),
      db.from("expenses").select("description,amount,spent_on").eq("user_id", user.id).order("spent_on", { ascending: false }).limit(200)
    ]);
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.2, max_tokens: 350,
      messages: [
        { role: "system", content: "You are Payday Peace, a cautious cash-flow planning assistant. Use only the user's entered records. Distinguish plans from confirmed payments. Do not claim bank access, guarantee results, or give investment, tax, legal or credit-repair advice. Be concise and non-judgmental." },
        { role: "user", content: JSON.stringify({ question: parsed.data.question, profile, bills, expenses }) }
      ]
    });
    return json(res, 200, { answer: response.choices[0]?.message?.content || "I could not prepare an answer." });
  } catch {
    return json(res, 500, { error: "The assistant could not process this request." });
  }
});
const port = Number(process.env.PORT || 10000);
server.listen(port, "0.0.0.0", () => console.log(`Payday Peace API listening on ${port}`));
