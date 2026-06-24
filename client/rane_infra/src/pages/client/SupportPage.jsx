import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaHeadset, FaClock } from "react-icons/fa";
import ClientHeader from "../../component/header/ClientHeader";

const C = { primary: "#6b3e2b", accent: "#b95a52", muted: "#8b7b74" };

const teamMembers = [
  { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
  { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
  { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
  { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
  { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
  { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" },
];

const initials = (name) => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function SupportPage() {
  const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)" };

  const contactInfo = [
    { icon: <FaMapMarkerAlt size={15} color={C.accent} />, label: "Address", value: "101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India" },
    { icon: <FaPhoneAlt size={14} color={C.accent} />, label: "Phone", value: "+91 94250 29680", href: "tel:+919425029680" },
    { icon: <FaEnvelope size={14} color={C.accent} />, label: "Email", value: "sales@ranendranesons.site", href: "mailto:sales@ranendranesons.site" },
  ];

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
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Contact our team for assistance or inquiries</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

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
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Team members</div>

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

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${member.whatsapp.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "9px", borderRadius: 8, background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "filter .2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    <FaWhatsapp size={15} color="#ffffff" /> Chat on WhatsApp
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
    </>
  );
}