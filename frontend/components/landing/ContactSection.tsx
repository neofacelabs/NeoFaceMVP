"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", type: "sales" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submit
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-32 px-6 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(#00C2FF, transparent 70%)", filter: "blur(80px)", transform: "translate(-50%,-50%)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-6"
            style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.15)", color: "#00E5A8" }}>
            Contact
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Get in touch
          </h2>
          <p className="text-[rgba(255,255,255,0.45)] text-lg max-w-md mx-auto">
            Talk to our team about your identity infrastructure needs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Sales", value: "sales@neoface.io", desc: "Enterprise plans & custom pricing", color: "#00C2FF" },
              { icon: MessageSquare, label: "Support", value: "support@neoface.io", desc: "Technical help & integration guidance", color: "#00E5A8" },
              { icon: MapPin, label: "Engineering", value: "engineering@neoface.io", desc: "Bug reports & API questions", color: "#818cf8" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase mb-0.5" style={{ color: item.color }}>
                    {item.label}
                  </p>
                  <p className="text-[14px] font-medium text-white mb-0.5">{item.value}</p>
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* SLA badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl"
              style={{ background: "rgba(0,229,168,0.04)", border: "1px solid rgba(0,229,168,0.12)" }}
            >
              <p className="text-[13px] font-medium text-white mb-1">⚡ Enterprise response SLA</p>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                Enterprise customers receive a response within 4 business hours. Standard support is within 1 business day.
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,229,168,0.1)", border: "1px solid rgba(0,229,168,0.2)" }}>
                  <CheckCircle2 size={24} style={{ color: "#00E5A8" }} />
                </div>
                <h3 className="text-[16px] font-semibold text-white">Message sent</h3>
                <p className="text-[13px] text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                  We'll get back to you within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Full name
                    </label>
                    <input
                      type="text" required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      placeholder="Alex Johnson"
                      onFocus={e => (e.target.style.borderColor = "rgba(0,194,255,0.4)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      placeholder="Acme Corp"
                      onFocus={e => (e.target.style.borderColor = "rgba(0,194,255,0.4)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Work email
                  </label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="alex@company.com"
                    onFocus={e => (e.target.style.borderColor = "rgba(0,194,255,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    What can we help with?
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <option value="sales">Enterprise pricing / sales</option>
                    <option value="technical">Technical integration help</option>
                    <option value="demo">Product demo request</option>
                    <option value="security">Security / compliance questions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Message
                  </label>
                  <textarea
                    required rows={4}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none transition-all resize-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="Tell us about your use case and scale..."
                    onFocus={e => (e.target.style.borderColor = "rgba(0,194,255,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all"
                  style={{ background: "#00C2FF", color: "#000" }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <><Send size={14} /> Send message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
