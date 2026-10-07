import React, { useMemo, useState } from "react";
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaHeadset, FaClock, FaPen, FaCheck,
} from "react-icons/fa";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import { useAuthStore } from "../../../store/authStore";

const C = { primary: "#6b3e2b", accent: "#b95a52", muted: "#8b7b74", whatsapp: "#25D366" };

const teamMembers = [
  { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
  { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
  { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
  { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
  { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
  { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" },
];

// What the client is reaching out about — drives the topic line of the message
const TOPICS = [
  { id: "general", label: "General query", line: "a general query" },
  { id: "bill", label: "Bill / Invoice", line: "my bill / invoice" },
  { id: "payment", label: "Payment request", line: "a payment request" },
  { id: "agreement", label: "Agreement", line: "an agreement" },
  { id: "document", label: "Documents", line: "my documents" },
  { id: "salary", label: "Salary", line: "salary details" },
  { id: "technical", label: "Portal issue", line: "an issue on the portal" },
];

const MAX_NOTE = 400;

const initials = (name) => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const toTitle = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const firstName = (name) => toTitle(name.trim().split(/\s+/)[0] || "");

// Builds the WhatsApp message addressed to one team member, signed by the logged-in client
const buildMessage = ({ recipientName, user, topic, note }) => {
  const lines = [];
  lines.push(`Hello ${recipientName},`);
  lines.push("");

  const who = [`I am *${user?.name || "a client"}*`];
  if (user?.firmName) who.push(`from *${user.firmName}*`);
  lines.push(`${who.join(" ")}, a client on the Rane Infra portal.`);
  if (user?.cid && user.cid !== "N/A") lines.push(`Client ID: ${user.cid}`);

  lines.push("");
  lines.push(`I would like to get in touch regarding ${topic.line}.`);
  if (note.trim()) {
    lines.push("");
    lines.push(note.trim());
  }
  lines.push("");
  lines.push("Please get back to me at your earliest convenience.");
  lines.push("");
  lines.push("Thank you,");
  lines.push(user?.name || "");
  return lines.join("\n");
};

export default function SupportPage() {
  const user = useAuthStore((state) => state.user);
  const [topicId, setTopicId] = useState("general");
  const [note, setNote] = useState("");

  const topic = TOPICS.find(t => t.id === topicId) || TOPICS[0];

  const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)" };
  const sectionLabel = { fontSize: 13, fontWeight: 700, color: "var(--text-strong)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 };

  const contactInfo = [
    { icon: <FaMapMarkerAlt size={15} color={C.accent} />, label: "Address", value: "101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India" },
    { icon: <FaPhoneAlt size={14} color={C.accent} />, label: "Phone", value: "+91 94250 29680", href: "tel:+919425029680" },
    { icon: <FaEnvelope size={14} color={C.accent} />, label: "Email", value: "sales@ranendranesons.site", href: "mailto:sales@ranendranesons.site" },
  ];

  // Preview uses a placeholder greeting — every card personalises it with that member's name
  const previewMessage = useMemo(
    () => buildMessage({ recipientName: "[Team member]", user, topic, note }),
    [user, topic, note]
  );

  const whatsappLink = (member) => {
    const message = buildMessage({ recipientName: firstName(member.name), user, topic, note });
    return `https://wa.me/${member.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  };

  // Render *bold* segments of the WhatsApp message like WhatsApp does
  const renderBold = (text) =>
    text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*") && part.length > 2
        ? <strong key={i}>{part.slice(1, -1)}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );

  return (
    <>
      <ClientHeader />

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaHeadset size={16} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Support</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Reach our team directly on WhatsApp, call or email</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {/* ── WhatsApp message composer ── */}
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: "#e7f8ee", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <FaWhatsapp size={16} color={C.whatsapp} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)", lineHeight: 1.2 }}>Message our team on WhatsApp</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    Pick a topic and add a note — we prepare the message with your details and the team member&apos;s name.
                  </div>
                </div>
              </div>

              <div className="sp-composer">
                {/* Left: inputs */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    What is this about?
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {TOPICS.map((t) => {
                      const active = t.id === topicId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTopicId(t.id)}
                          className="sp-chip"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "6px 13px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                            border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                            background: active ? "var(--primary)" : "var(--secondary)",
                            color: active ? "var(--primary-foreground, #fff)" : "var(--secondary-foreground)",
                          }}
                        >
                          {active && <FaCheck size={10} color="#fff" />} {t.label}
                        </button>
                      );
                    })}
                  </div>

                  <label htmlFor="sp-note" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <FaPen size={10} color={C.muted} /> Add details <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span>
                  </label>
                  <textarea
                    id="sp-note"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
                    placeholder="e.g. Invoice INV-204 shows unpaid but payment was made on 12 Oct…"
                    style={{
                      width: "100%", boxSizing: "border-box", resize: "vertical",
                      background: "var(--input)", color: "var(--foreground)",
                      border: "1px solid var(--border)", borderRadius: 10,
                      padding: "10px 12px", fontSize: 13.5, outline: "none", minHeight: 96,
                    }}
                  />
                  <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{note.length}/{MAX_NOTE}</div>
                </div>

                {/* Right: WhatsApp-style preview */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    Message preview
                  </div>
                  <div style={{ background: "#efeae2", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
                    <div style={{
                      background: "#d9fdd3", color: "#111b21", borderRadius: "10px 10px 2px 10px",
                      padding: "9px 12px", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
                      wordBreak: "break-word", boxShadow: "0 1px 1px rgba(0,0,0,0.12)", marginLeft: "auto", maxWidth: "100%",
                    }}>
                      {renderBold(previewMessage)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                    The greeting is replaced with the team member&apos;s name when you tap their WhatsApp button below.
                  </div>
                </div>
              </div>
            </div>

            {/* Company contact */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 18 }}>
              {contactInfo.map((c) => (
                <div key={c.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-strong)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</span>
                  </div>
                  {c.href ? (
                    <a href={c.href} style={{ fontSize: 13, color: "var(--link)", textDecoration: "none", lineHeight: 1.5, wordBreak: "break-word" }}>{c.value}</a>
                  ) : (
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{c.value}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Team members */}
            <div style={sectionLabel}>Team members</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 18 }}>
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", boxShadow: "0 2px 8px var(--shadow-color)", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 24px var(--shadow-color)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {/* Header: avatar + name + role */}
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                    <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--secondary)", color: C.primary, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0, border: "1px solid var(--border)" }}>
                      {initials(member.name)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)", textTransform: "uppercase", lineHeight: 1.25 }}>{member.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>{member.position}</div>
                    </div>
                  </div>

                  {/* Contact lines */}
                  <a href={`tel:${member.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none", marginBottom: 7 }}>
                    <FaPhoneAlt size={12} color={C.accent} /> {member.phone}
                  </a>
                  <a href={`mailto:${member.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)", textDecoration: "none", marginBottom: 14, wordBreak: "break-all" }}>
                    <FaEnvelope size={12} color={C.accent} /> {member.email}
                  </a>

                  {/* WhatsApp — opens with the prepared, personalised message */}
                  <a
                    href={whatsappLink(member)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "9px", borderRadius: 8, background: C.whatsapp, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "filter .2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    <FaWhatsapp size={16} color="#ffffff" /> Message {firstName(member.name)}
                  </a>
                </div>
              ))}
            </div>

            {/* Business hours */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <FaClock size={13} color={C.accent} />
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }}>Business hours</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Weekdays</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Monday – Friday: 9:00 AM – 6:00 PM</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Weekends</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>Saturday: 10:00 AM – 4:00 PM<br />Sunday: Closed</div>
                </div>
              </div>

              <div style={{ background: "var(--warning)", borderLeft: "4px solid var(--accent)", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
                <span style={{ fontSize: 12.5, color: "var(--warning-foreground)", fontWeight: 600 }}>
                  Note: For urgent matters outside business hours, please contact +91 94250 29680.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .sp-composer { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 20px; padding: 16px 18px; }
        .sp-chip { transition: background .15s, border-color .15s; }
        .sp-chip:hover { border-color: var(--primary) !important; }
        @media (max-width: 860px) { .sp-composer { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </>
  );
}
