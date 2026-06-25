"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Send, Copy, CheckCircle2, ChevronDown, Camera, Upload,
  Loader2, Code2, Zap, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const ENDPOINTS = [
  { label: "POST /v1/enrollment/enroll", value: "enrollment/enroll", method: "POST", multipart: true, fields: ["user_id", "image"] },
  { label: "POST /v1/verification/verify", value: "verification/verify", method: "POST", multipart: true, fields: ["user_id", "image"] },
  { label: "POST /v1/liveness/passive", value: "liveness/passive", method: "POST", multipart: true, fields: ["image"] },
  { label: "GET /v1/users", value: "users/", method: "GET", multipart: false, fields: [] },
  { label: "GET /v1/dashboard/users", value: "dashboard/users", method: "GET", multipart: false, fields: [] },
  { label: "GET /v1/dashboard/verifications", value: "dashboard/verifications", method: "GET", multipart: false, fields: [] },
  { label: "GET /v1/analytics/summary", value: "analytics/summary", method: "GET", multipart: false, fields: [] },
  { label: "POST /v1/webauthn/register/begin", value: "webauthn/register/begin", method: "POST", multipart: false, fields: ["user_id", "username"] },
];

const CODE_TEMPLATES: Record<string, (endpoint: string, fields: string[]) => string> = {
  python: (ep, fields) => `import requests

API_KEY = "sk_live_your_key"
BASE_URL = "https://api.neoface.io/v1"

${fields.includes("image") ? `with open("face.jpg", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/${ep}",
        headers={"x-api-key": API_KEY},
        files={"image": f},
        data={${fields.filter(f => f !== "image").map(f => `"${f}": "your_${f}"`).join(", ")}},
    )` : `response = requests.get(
    f"{BASE_URL}/${ep}",
    headers={"x-api-key": API_KEY},
)`}

print(response.json())`,

  node: (ep, fields) => `const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = 'sk_live_your_key';
const BASE_URL = 'https://api.neoface.io/v1';

${fields.includes("image") ? `const form = new FormData();
form.append('image', fs.createReadStream('face.jpg'));
${fields.filter(f => f !== "image").map(f => `form.append('${f}', 'your_${f}');`).join("\n")}

const response = await fetch(\`\${BASE_URL}/${ep}\`, {
  method: 'POST',
  headers: { 'x-api-key': API_KEY, ...form.getHeaders() },
  body: form,
});` : `const response = await fetch(\`\${BASE_URL}/${ep}\`, {
  headers: { 'x-api-key': API_KEY },
});`}

const data = await response.json();
console.log(data);`,

  react: (ep, fields) => `import { useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_NEOFACE_KEY;
const BASE_URL = 'https://api.neoface.io/v1';

export function NeoFaceExample() {
  const [result, setResult] = useState(null);

  const run = async () => {
    ${fields.includes("image") ? `const form = new FormData();
    form.append('image', imageFile);
    ${fields.filter(f => f !== "image").map(f => `form.append('${f}', '...');`).join("\n    ")}

    const res = await fetch(\`\${BASE_URL}/${ep}\`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: form,
    });` : `const res = await fetch(\`\${BASE_URL}/${ep}\`, {
      headers: { 'x-api-key': API_KEY },
    });`}
    setResult(await res.json());
  };

  return (
    <div>
      <button onClick={run}>Run</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}`,

  flutter: (ep, fields) => `import 'package:http/http.dart' as http;
import 'dart:convert';

const apiKey = 'sk_live_your_key';
const baseUrl = 'https://api.neoface.io/v1';

Future<Map<String, dynamic>> callNeoFace() async {
  ${fields.includes("image") ? `final request = http.MultipartRequest('POST', Uri.parse('\$baseUrl/${ep}'));
  request.headers['x-api-key'] = apiKey;
  request.files.add(await http.MultipartFile.fromPath('image', 'face.jpg'));
  ${fields.filter(f => f !== "image").map(f => `request.fields['${f}'] = 'your_${f}';`).join("\n  ")}

  final response = await request.send();
  final body = await response.stream.bytesToString();
  return jsonDecode(body);` : `final response = await http.get(
    Uri.parse('\$baseUrl/${ep}'),
    headers: {'x-api-key': apiKey},
  );
  return jsonDecode(response.body);`}
}`,
};

export default function SdkPlaygroundPage() {
  const [selectedEp, setSelectedEp] = useState(ENDPOINTS[0]);
  const [epMenuOpen, setEpMenuOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [codeTab, setCodeTab] = useState<"python" | "node" | "react" | "flutter">("python");
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    const t0 = performance.now();
    try {
      let res: any;
      if (selectedEp.multipart) {
        const form = new FormData();
        selectedEp.fields.forEach(f => {
          if (f === "image" && imageFile) form.append("image", imageFile);
          else if (fields[f]) form.append(f, fields[f]);
        });
        res = await apiClient.post(selectedEp.value, form);
      } else {
        res = await apiClient.get(selectedEp.value);
      }
      setLatency(Math.round(performance.now() - t0));
      setResult(res.data);
    } catch (err: any) {
      setLatency(Math.round(performance.now() - t0));
      setResult({ error: true, status: err?.response?.status, detail: err?.response?.data?.detail ?? err.message });
    } finally { setLoading(false); }
  };

  const codeSnippet = CODE_TEMPLATES[codeTab]?.(selectedEp.value, selectedEp.fields) ?? "";

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-semibold text-white tracking-[-0.02em]">SDK Playground</h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
          Test NeoFace APIs interactively, inspect responses, and copy code snippets directly into your app.
        </p>
      </motion.div>

      <div className="grid xl:grid-cols-[380px_1fr] gap-5">
        {/* Left: Request builder */}
        <div className="space-y-4">
          {/* Endpoint selector */}
          <div className="dash-card rounded-2xl p-4">
            <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Endpoint</p>
            <div className="relative">
              <button
                onClick={() => setEpMenuOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-left"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: selectedEp.method === "GET" ? "rgba(0,229,168,0.12)" : "rgba(0,194,255,0.12)", color: selectedEp.method === "GET" ? "#00E5A8" : "#00C2FF" }}>
                    {selectedEp.method}
                  </span>
                  <span className="text-[11.5px] font-mono truncate text-white">{selectedEp.label}</span>
                </div>
                <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.3)", transform: epMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              <AnimatePresence>
                {epMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-10 w-full mt-1.5 rounded-xl overflow-hidden"
                    style={{ background: "rgba(12,12,12,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
                    {ENDPOINTS.map(ep => (
                      <button key={ep.value} onClick={() => { setSelectedEp(ep); setFields({}); setImageFile(null); setResult(null); setEpMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-left hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                        <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: ep.method === "GET" ? "rgba(0,229,168,0.12)" : "rgba(0,194,255,0.12)", color: ep.method === "GET" ? "#00E5A8" : "#00C2FF" }}>
                          {ep.method}
                        </span>
                        <span className="text-[11.5px] font-mono text-[rgba(255,255,255,0.65)]">{ep.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fields */}
          {(selectedEp.fields.length > 0) && (
            <div className="dash-card rounded-2xl p-4">
              <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Request Parameters</p>
              <div className="space-y-3">
                {selectedEp.fields.map(f => (
                  <div key={f}>
                    <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{f}</label>
                    {f === "image" ? (
                      <div>
                        <input type="file" accept="image/*" className="hidden" id="playground-file"
                          onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
                        <label htmlFor="playground-file"
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer text-[12px] transition-colors"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", color: imageFile ? "#00E5A8" : "rgba(255,255,255,0.4)" }}>
                          <Upload size={12} />
                          {imageFile ? imageFile.name : "Select image file"}
                        </label>
                      </div>
                    ) : (
                      <input value={fields[f] ?? ""} onChange={e => setFields(fs => ({ ...fs, [f]: e.target.value }))}
                        placeholder={`Enter ${f}…`}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Headers */}
          <div className="dash-card rounded-2xl p-4">
            <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Headers</p>
            <div className="rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Authorization</p>
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>Bearer ••••••••••••</p>
            </div>
          </div>

          {/* Send button */}
          <button onClick={handleSend} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-opacity"
            style={{ background: "linear-gradient(135deg, #00C2FF, #00E5A8)", color: "#000", opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {loading ? "Sending…" : "Send Request"}
          </button>
        </div>

        {/* Right: Response + Code */}
        <div className="space-y-4">
          {/* Response viewer */}
          <div className="dash-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <p className="text-[13px] font-semibold text-white">Response</p>
                {latency !== null && (
                  <span className="flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,194,255,0.08)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.15)" }}>
                    <Clock size={9} /> {latency}ms
                  </span>
                )}
                {result && !result.error && (
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(0,229,168,0.1)", color: "#00E5A8", border: "1px solid rgba(0,229,168,0.2)" }}>
                    200 OK
                  </span>
                )}
                {result?.error && (
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                    {result.status ?? "Error"}
                  </span>
                )}
              </div>
              {result && (
                <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast.success("Response copied"); }}
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  <Copy size={10} /> Copy
                </button>
              )}
            </div>
            <div className="p-5 min-h-[240px]">
              {result ? (
                <pre className="text-[12px] leading-relaxed overflow-auto max-h-80"
                  style={{ fontFamily: "monospace", color: result.error ? "#f87171" : "#00E5A8" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Terminal size={20} style={{ color: "rgba(255,255,255,0.1)" }} />
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {loading ? "Waiting for response…" : "Send a request to see the response here"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Code snippets */}
          <div className="dash-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[13px] font-semibold text-white">Code Snippet</p>
              <div className="flex items-center gap-1">
                {(["python", "node", "react", "flutter"] as const).map(lang => (
                  <button key={lang} onClick={() => setCodeTab(lang)}
                    className="px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition-all"
                    style={{
                      background: codeTab === lang ? "rgba(255,255,255,0.08)" : "transparent",
                      color: codeTab === lang ? "#fff" : "rgba(255,255,255,0.35)",
                    }}>
                    {lang}
                  </button>
                ))}
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg text-[11px]"
                  style={{ background: "rgba(255,255,255,0.05)", color: copied ? "#00E5A8" : "rgba(255,255,255,0.4)" }}>
                  {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="p-5 overflow-auto max-h-[400px]">
              <pre className="text-[11.5px] leading-relaxed"
                style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.65)" }}>
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
