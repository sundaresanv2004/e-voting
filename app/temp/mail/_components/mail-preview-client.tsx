"use client"

import React, { useState, useRef } from "react"

interface Template {
  id: string
  name: string
  description: string
  tag: string
  tagColor: string
  html: string
}

interface MailPreviewClientProps {
  templates: Template[]
}

export function MailPreviewClient({ templates }: MailPreviewClientProps) {
  const [activeId, setActiveId] = useState(templates[0].id)
  const [viewMode, setViewMode] = useState<"preview" | "html">("preview")
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const active = templates.find((t) => t.id === activeId)!

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#0f0f14",
        color: "#f8f8fc",
        overflow: "hidden",
      }}
    >
      {/* ══ Left Sidebar ══ */}
      <aside
        style={{
          width: "276px",
          flexShrink: 0,
          backgroundColor: "#13131a",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "20px 18px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #4338ca 0%, #818cf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              ✉
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "-0.3px", lineHeight: "1.2" }}>
                Mail Preview
              </div>
              <div style={{ fontSize: "10px", color: "#52525b", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                e-voting · dev tool
              </div>
            </div>
          </div>
        </div>

        {/* Template count badge */}
        <div style={{ padding: "10px 18px 6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "600",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            {templates.length} Templates
          </span>
        </div>

        {/* Template List */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "3px",
                backgroundColor: activeId === t.id ? "rgba(99,102,241,0.1)" : "transparent",
                borderLeft: `2px solid ${activeId === t.id ? "#6366f1" : "transparent"}`,
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => {
                if (activeId !== t.id) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.04)"
                }
              }}
              onMouseLeave={(e) => {
                if (activeId !== t.id) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "#fff",
                    backgroundColor: t.tagColor,
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  {t.tag}
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: activeId === t.id ? "#a5b4fc" : "#c4c4d4",
                  marginBottom: "2px",
                  lineHeight: "1.3",
                }}
              >
                {t.name}
              </div>
              <div style={{ fontSize: "11px", color: "#52525b", lineHeight: "1.4" }}>
                {t.description}
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: "10px",
            color: "#3f3f5a",
            lineHeight: "1.5",
          }}
        >
          ⚠ Dev-only · Not accessible in production
        </div>
      </aside>

      {/* ══ Main Panel ══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <header
          style={{
            height: "54px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            backgroundColor: "#13131a",
            flexShrink: 0,
            gap: "12px",
          }}
        >
          {/* Template info */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <span
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: "#fff",
                backgroundColor: active.tagColor,
                padding: "2px 8px",
                borderRadius: "9999px",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {active.tag}
            </span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#d4d4e8", whiteSpace: "nowrap" }}>
              {active.name}
            </span>
            <span style={{ fontSize: "11px", color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              · {active.description}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* View mode toggle */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "9999px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {(["preview", "html"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: viewMode === mode ? "#4338ca" : "transparent",
                    color: viewMode === mode ? "#eef2ff" : "#71717a",
                    fontSize: "11px",
                    fontWeight: "600",
                    transition: "all 0.12s",
                    letterSpacing: "0.1px",
                  }}
                >
                  {mode === "preview" ? "Preview" : "HTML"}
                </button>
              ))}
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              style={{
                padding: "5px 14px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: copied ? "rgba(5,150,105,0.15)" : "rgba(255,255,255,0.04)",
                color: copied ? "#34d399" : "#a1a1aa",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.12s",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "✓ Copied!" : "Copy HTML"}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", backgroundColor: "#0f0f14" }}>
          {viewMode === "preview" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 24px 40px",
                minHeight: "100%",
              }}
            >
              {/* Device size indicator */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "16px",
                  alignSelf: "flex-end",
                  maxWidth: "680px",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "10px", color: "#3f3f5a" }}>600px max-width · gmail-safe rendering</span>
              </div>

              {/* Email client chrome mock */}
              <div style={{ width: "100%", maxWidth: "680px" }}>
                <div
                  style={{
                    backgroundColor: "#1a1a24",
                    borderRadius: "14px 14px 0 0",
                    padding: "12px 16px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderBottom: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {/* Traffic lights */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                      <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: c }} />
                    ))}
                  </div>
                  {/* Address bar mock */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: "6px",
                      padding: "4px 12px",
                      fontSize: "11px",
                      color: "#52525b",
                    }}
                  >
                    📧 {active.name} · support@evoting.sundaresan.dev → sundar@example.com
                  </div>
                </div>
                <iframe
                  ref={iframeRef}
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f8f8fc;}</style></head><body>${active.html}</body></html>`}
                  style={{
                    width: "100%",
                    minHeight: "600px",
                    height: "auto",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "0 0 14px 14px",
                    display: "block",
                  }}
                  title={`Preview: ${active.name}`}
                  onLoad={(e) => {
                    // Auto-resize iframe to content height
                    const iframe = e.currentTarget
                    try {
                      const doc = iframe.contentDocument || iframe.contentWindow?.document
                      if (doc) {
                        iframe.style.height = doc.documentElement.scrollHeight + "px"
                      }
                    } catch {}
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: "24px", maxWidth: "900px" }}>
              <div
                style={{
                  backgroundColor: "#13131a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#52525b", fontWeight: "500" }}>
                    HTML Output · {active.html.length.toLocaleString()} chars
                  </span>
                </div>
                <pre
                  style={{
                    color: "#a5f3fc",
                    fontSize: "11.5px",
                    lineHeight: "1.65",
                    padding: "20px",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {active.html}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
