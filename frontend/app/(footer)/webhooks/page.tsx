"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#3b82f6",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => (
  <div className="rounded-2xl border p-6" style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}>
    <h2 className="text-[13px] font-bold mb-4 pb-3 border-b" style={{ color: accent, borderColor: "#ffffff08" }}>
      {title}
    </h2>
    {children}
  </div>
);

export default function Page() {
  return (
    <SubpageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <div className="mb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-4 border"
            style={{ borderColor: "#3b82f620", backgroundColor: "#3b82f605", color: "#3b82f6" }}
          >
            Integrations
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Real-Time{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #00C2FF)" }}>
              Webhooks
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Receive instant HTTP POST callbacks for every identity lifecycle event. Webhooks enable your
            backend to react synchronously to enrollments, verifications, failures, and security alerts
            without polling the API.
          </p>
        </div>

        {/* Event Catalog */}
        <SectionCard title="Supported Event Types" accent="#3b82f6">
          <div className="space-y-2.5">
            {[
              { event: "identity.enrolled", trigger: "A new biometric template has been successfully stored in the enclave.", color: "#10b981" },
              { event: "identity.verified", trigger: "A live biometric sample was matched successfully. Includes trust_score and session_id.", color: "#10b981" },
              { event: "identity.verification_failed", trigger: "Biometric match fell below the configured threshold. Includes failure_reason code.", color: "#f43f5e" },
              { event: "identity.deleted", trigger: "A biometric identity record was permanently purged from the enclave.", color: "#f59e0b" },
              { event: "session.liveness_failed", trigger: "Liveness analysis detected a presentation attack (mask, screen, or injection).", color: "#f43f5e" },
              { event: "session.expired", trigger: "A verification session token exceeded the configured TTL without completion.", color: "#6b7280" },
              { event: "webhook.test", trigger: "Sent when you manually trigger a test ping from the dashboard.", color: "#a78bfa" },
            ].map((ev) => (
              <div key={ev.event} className="p-3.5 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ev.color }} />
                  <code className="font-mono text-[11.5px] text-white/85">{ev.event}</code>
                </div>
                <p className="text-[11px] text-white/40 pl-3.5">{ev.trigger}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Payload */}
        <SectionCard title="Example Webhook Payload" accent="#00E5A8">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Every webhook delivers a signed JSON payload over HTTPS. The <code className="font-mono text-[11px] text-emerald-400">X-NeoFace-Signature</code> header
            contains an HMAC-SHA256 signature of the raw request body using your webhook secret.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`POST https://your-app.com/webhooks/neoface
Content-Type: application/json
X-NeoFace-Signature: sha256=9f86d08...
X-NeoFace-Event: identity.verified

{
  "id": "evt_01JYNXKGM4ZQC",
  "type": "identity.verified",
  "created": 1751298478,
  "data": {
    "identity_id": "id_01JYNXKGM3",
    "user_ref": "usr_12345",
    "session_id": "sess_0xA1F2C3",
    "trust_score": 0.974,
    "verified": true,
    "modalities": ["face", "liveness"],
    "region": "us-east-1"
  }
}`}
          </pre>
        </SectionCard>

        {/* Signature Verification */}
        <SectionCard title="Verifying Webhook Signatures" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Always verify the signature before processing a webhook. This prevents replay attacks and ensures 
            the payload originated from NeoFace servers. Use the raw request body — not a parsed version.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`import crypto from 'crypto';

function verifyWebhook(rawBody: Buffer, signature: string, secret: string) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

// In your Express handler:
app.post('/webhooks/neoface', express.raw({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-neoface-signature'] as string;
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }
  // Process event...
  res.status(200).send('OK');
});`}
          </pre>
        </SectionCard>

        {/* Retry Policy */}
        <SectionCard title="Retry & Delivery Policy" accent="#f59e0b">
          <div className="grid sm:grid-cols-2 gap-4 text-[12px]">
            <div>
              <h3 className="text-[11.5px] font-semibold text-white mb-2">Retry Schedule</h3>
              <div className="space-y-1.5 text-white/45">
                {[
                  ["Attempt 1", "Immediate"],
                  ["Attempt 2", "+30 seconds"],
                  ["Attempt 3", "+5 minutes"],
                  ["Attempt 4", "+30 minutes"],
                  ["Attempt 5", "+2 hours"],
                ].map(([a, t]) => (
                  <div key={a} className="flex justify-between">
                    <span>{a}</span>
                    <span className="font-mono text-white/60">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[11.5px] font-semibold text-white mb-2">Delivery Rules</h3>
              <ul className="space-y-1.5 text-[11.5px] text-white/45">
                <li>• Your endpoint must respond with HTTP 2xx within 10 seconds</li>
                <li>• After 5 failed attempts, the webhook is marked as failed</li>
                <li>• Failed events are visible in the dashboard for 30 days</li>
                <li>• You can manually replay any event from the dashboard</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Setup */}
        <SectionCard title="Registering a Webhook Endpoint" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Register endpoints via the dashboard (<strong className="text-white">Settings → Webhooks → Add Endpoint</strong>) or via the API.
            You can register multiple endpoints per event type for fan-out delivery.
          </p>
          <pre className="p-3.5 rounded-xl text-[11px] font-mono text-white/65 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`await nfl.webhooks.register({
  url: 'https://your-app.com/webhooks/neoface',
  events: ['identity.verified', 'session.liveness_failed'],
  secret: process.env.WEBHOOK_SECRET
});`}
          </pre>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
