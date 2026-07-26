// Proxies the lead form to the CRM's public intake endpoint. Runs server-side on
// Cloudflare Pages so the shared secret (INTAKE_TOKEN_FORM, a Pages secret) never
// reaches the browser. Bots that fill the hidden honeypot field get a fake success
// and are dropped.
const CRM_INTAKE = "https://sales.kaymacktechnologies.com/api/intake";

export async function onRequestPost({ request, env }) {
    let b;
    try { b = await request.json(); } catch { b = {}; }
    if (b.website) return json({ ok: true }); // honeypot

    const name = clip(b.name, 200);
    const business = clip(b.business, 200);
    const email = clip(b.email, 200);
    const phone = clip(b.phone, 50);
    const message = clip(b.message, 2000);
    if (!name && !email) return json({ error: "name_or_email_required" }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "invalid_email" }, 400);

    const r = await fetch(CRM_INTAKE, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "X-Intake-Token": env.INTAKE_TOKEN_FORM,
        },
        body: JSON.stringify({
            company: business || name || email,
            contact: name || null,
            email: email || null,
            phone: phone || null,
            source: "Web form",
            notes: message || null,
        }),
    });
    if (!r.ok) return json({ error: "upstream" }, 502);
    return json({ ok: true });
}

const clip = (v, n) => String(v || "").trim().slice(0, n);
const json = (d, status = 200) =>
    new Response(JSON.stringify(d), { status, headers: { "content-type": "application/json" } });
