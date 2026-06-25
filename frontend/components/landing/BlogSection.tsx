"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const POSTS = [
  {
    tag: "Engineering",
    tagColor: "#00C2FF",
    title: "How NeoFace's Liveness Pipeline Defeats Modern Deepfake Attacks",
    excerpt:
      "A deep dive into our multi-signal passive liveness system: depth estimation, texture analysis, and neural spoof detection working in concert.",
    author: "NeoFace Engineering",
    readTime: "8 min read",
    date: "Jun 2026",
    href: "#",
  },
  {
    tag: "Product",
    tagColor: "#00E5A8",
    title: "WebAuthn in Production: Lessons from 1 Million Passkey Authentications",
    excerpt:
      "What we learned deploying FIDO2 at scale — device compatibility, fallback strategies, and the UX patterns that drive adoption.",
    author: "NeoFace Product",
    readTime: "6 min read",
    date: "May 2026",
    href: "#",
  },
  {
    tag: "Security",
    tagColor: "#818cf8",
    title: "Zero-Trust Identity: Why Static Passwords Are a Liability in 2026",
    excerpt:
      "Exploring the shift from credential-based to biometric-first authentication and what it means for your security posture.",
    author: "NeoFace Security",
    readTime: "5 min read",
    date: "Apr 2026",
    href: "#",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="relative py-32 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-14 gap-6 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-4"
              style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)", color: "#818cf8" }}>
              Engineering Blog
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              From the NeoFace team
            </h2>
          </div>
          <Link href="#"
            className="flex items-center gap-2 text-[13px] font-medium text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
            All posts <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {POSTS.map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col rounded-2xl p-6 cursor-pointer transition-all"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                  style={{ background: `${post.tagColor}10`, color: post.tagColor, border: `1px solid ${post.tagColor}20` }}>
                  {post.tag}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold text-white mb-3 leading-snug group-hover:text-[rgba(255,255,255,0.9)] transition-colors">
                {post.title}
              </h3>
              <p className="text-[12.5px] leading-relaxed mb-6 flex-1" style={{ color: "rgba(255,255,255,0.38)" }}>
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: `${post.tagColor}15`, color: post.tagColor }}>
                    N
                  </div>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{post.author}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Clock size={10} />
                  {post.readTime}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4 text-[11.5px] font-medium transition-all"
                style={{ color: post.tagColor, opacity: 0.6 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
              >
                Read article <ArrowRight size={11} className="inline ml-0.5" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
