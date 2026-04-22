// ============================================================
// PrivacyPolicyPage.tsx
// Route: /privacy
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "intro",       title: "1. Introduction" },
  { id: "controller",  title: "2. Data Controller" },
  { id: "collect",     title: "3. Data We Collect" },
  { id: "use",         title: "4. How We Use Your Data" },
  { id: "legal-basis", title: "5. Legal Basis (GDPR)" },
  { id: "retention",   title: "6. Data Retention" },
  { id: "sharing",     title: "7. Sharing Your Data" },
  { id: "rights",      title: "8. Your Rights" },
  { id: "cookies",     title: "9. Cookies & Storage" },
  { id: "security",    title: "10. Security" },
  { id: "children",    title: "11. Children's Privacy" },
  { id: "changes",     title: "12. Changes to Policy" },
  { id: "contact",     title: "13. Contact & DPO" },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("intro");
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  return (
    <div style={s.page}>
      <style>{globalCss}</style>

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <button onClick={() => navigate(-1)} style={s.backBtn} aria-label="Go back">
            <ArrowLeftIcon /> Back
          </button>
          <div style={s.logo}>
            <span style={s.logoIcon}>🎓</span>
            <span style={s.logoText}>FII Smart</span>
          </div>
          <a href="/terms" style={s.headerLink}>Terms of Service →</a>
        </div>
      </header>

      <div style={s.layout}>
        {/* ── Sidebar TOC (desktop) ── */}
        <aside style={s.sidebar}>
          <div style={s.sidebarSticky}>
            <p style={s.tocLabel}>Contents</p>
            <nav aria-label="Table of contents">
              {SECTIONS.map(({ id, title }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    ...s.tocItem,
                    ...(activeId === id ? s.tocItemActive : {}),
                  }}
                >
                  {title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Mobile TOC ── */}
        <div style={s.mobileToc}>
          <button onClick={() => setTocOpen((p) => !p)} style={s.mobileTocBtn}>
            {tocOpen ? "✕ Close" : "☰ Jump to section"}
          </button>
          {tocOpen && (
            <div style={s.mobileTocDropdown}>
              {SECTIONS.map(({ id, title }) => (
                <button key={id} onClick={() => scrollTo(id)} style={s.mobileTocItem}>
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <main style={s.main}>

          <div style={s.docHeader}>
            <div style={s.docBadgeRow}>
              <span style={s.badge}>Legal</span>
              <span style={s.badge}>GDPR Compliant</span>
              <span style={s.badge}>Effective: 1 April 2026</span>
              <span style={s.badge}>Last updated: 20 April 2026</span>
            </div>
            <h1 style={s.docTitle}>Privacy Policy</h1>
            <p style={s.docLead}>
              Your privacy matters to us. This policy explains exactly what personal
              data FIISmart collects, why we collect it, how we use and protect it,
              and what rights you have under the GDPR.
            </p>
            <div style={s.divider} />
          </div>

          {/* ── Section 1 ── */}
          <section id="intro" style={s.section}>
            <h2 style={s.h2}>1. Introduction</h2>
            <p style={s.p}>
              This Privacy Policy applies to the FIISmart e-learning platform
              ("Service") operated by the FIISmart student project team at the
              Faculty of Computer Science (FII), Alexandru Ioan Cuza University,
              Iași, Romania ("we", "us", "our").
            </p>
            <p style={s.p}>
              We are committed to protecting your personal data in accordance with
              Regulation (EU) 2016/679 (the General Data Protection Regulation,
              "GDPR") and Romanian data protection law. Please read this policy
              carefully before using the Service.
            </p>
            <div style={s.callout}>
              <strong>Your data stays in the EU.</strong> All data is stored on
              servers located within the European Union. We do not transfer personal
              data to countries outside the EEA.
            </div>
          </section>

          {/* ── Section 2 ── */}
          <section id="controller" style={s.section}>
            <h2 style={s.h2}>2. Data Controller</h2>
            <p style={s.p}>
              The data controller responsible for your personal data is:
            </p>
            <div style={s.contactBox}>
              <p style={s.contactLine}><strong>FIISmart Project Team</strong></p>
              <p style={s.contactLine}>Faculty of Computer Science (FII)</p>
              <p style={s.contactLine}>Alexandru Ioan Cuza University</p>
              <p style={s.contactLine}>Bd. Carol I nr. 11, Iași 700506, România</p>
              <p style={s.contactLine}>
                Email:{" "}
                <a href="mailto:privacy@fiismart.ro" style={s.link}>
                  privacy@fiismart.ro
                </a>
              </p>
            </div>
          </section>

          {/* ── Section 3 ── */}
          <section id="collect" style={s.section}>
            <h2 style={s.h2}>3. Data We Collect</h2>
            <p style={s.p}>
              We collect the following categories of personal data:
            </p>

            <h3 style={s.h3}>3.1 Account data</h3>
            <p style={s.p}>
              When you register, we collect your first name, last name, email
              address, chosen role (student or teacher), and a hashed version of
              your password. We never store your password in plain text — it is
              immediately hashed using BCrypt before being saved.
            </p>

            <h3 style={s.h3}>3.2 Activity data</h3>
            <p style={s.p}>
              We record information about how you use the Service, including course
              enrolments, lecture progress (seconds watched per lecture), quiz
              attempt scores and timestamps, course reviews you write, and your last
              login timestamp.
            </p>

            <h3 style={s.h3}>3.3 Technical data</h3>
            <p style={s.p}>
              When you use the Service, we may collect your browser type, operating
              system, and IP address in server logs for security and diagnostic
              purposes. Session tokens are stored in your browser's localStorage.
            </p>

            <h3 style={s.h3}>3.4 Data you provide voluntarily</h3>
            <p style={s.p}>
              If you are a teacher, the course content, lecture materials, and quiz
              questions you create and upload are stored on our servers. You are
              responsible for ensuring this content does not include unnecessary
              personal data about third parties.
            </p>
          </section>

          {/* ── Section 4 ── */}
          <section id="use" style={s.section}>
            <h2 style={s.h2}>4. How We Use Your Data</h2>
            <p style={s.p}>We use your personal data for the following purposes:</p>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Purpose</th>
                  <th style={s.th}>Data used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Providing the Service (account management, authentication)", "Name, email, password hash, role, session tokens"],
                  ["Delivering course content to enrolled students", "Enrolment records, lecture progress"],
                  ["Displaying quiz results and progress statistics", "Quiz attempts, scores"],
                  ["Allowing teachers to manage their courses", "Course content, enrolment counts"],
                  ["Sending password reset and email verification emails", "Email address, one-time tokens"],
                  ["Detecting and preventing fraud or abuse", "IP address, login timestamps"],
                  ["Improving the Service", "Aggregated, anonymised usage data"],
                ].map(([purpose, data], i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}>{purpose}</td>
                    <td style={s.td}>{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Section 5 ── */}
          <section id="legal-basis" style={s.section}>
            <h2 style={s.h2}>5. Legal Basis for Processing (GDPR)</h2>
            <p style={s.p}>
              Under the GDPR, we must have a legal basis for each type of processing.
              Our legal bases are:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>
                <strong>Contract (Art. 6(1)(b)).</strong> Processing your account
                data and activity data is necessary to provide the Service you
                signed up for.
              </li>
              <li style={s.li}>
                <strong>Legitimate interests (Art. 6(1)(f)).</strong> We process
                technical data (IP addresses, server logs) to maintain security
                and prevent abuse. This is balanced against your privacy rights.
              </li>
              <li style={s.li}>
                <strong>Consent (Art. 6(1)(a)).</strong> Where we send
                non-essential communications or use optional cookies, we will ask
                for your consent first.
              </li>
              <li style={s.li}>
                <strong>Legal obligation (Art. 6(1)(c)).</strong> We may process
                data where required by Romanian or EU law.
              </li>
            </ul>
          </section>

          {/* ── Section 6 ── */}
          <section id="retention" style={s.section}>
            <h2 style={s.h2}>6. Data Retention</h2>
            <p style={s.p}>
              We retain your personal data only for as long as necessary for the
              purposes described in this policy:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>
                <strong>Account data</strong> — retained for as long as your account
                is active. If you delete your account, we will delete your personal
                data within 30 days, except where retention is required by law.
              </li>
              <li style={s.li}>
                <strong>Activity data</strong> — retained for the duration of your
                account plus 90 days.
              </li>
              <li style={s.li}>
                <strong>Server logs</strong> — retained for a maximum of 90 days
                for security purposes.
              </li>
              <li style={s.li}>
                <strong>Session tokens</strong> — expire automatically or are deleted
                on logout.
              </li>
            </ul>
          </section>

          {/* ── Section 7 ── */}
          <section id="sharing" style={s.section}>
            <h2 style={s.h2}>7. Sharing Your Data</h2>
            <p style={s.p}>
              We do not sell, rent, or trade your personal data to any third party.
              We may share your data in the following limited circumstances:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>
                <strong>Within the platform.</strong> Your display name and reviews
                are visible to other users as part of the Service's normal operation.
                Your email address and password hash are never visible to other users.
              </li>
              <li style={s.li}>
                <strong>Service providers.</strong> We may use third-party hosting
                or infrastructure providers who process data on our behalf under
                data processing agreements. All such providers are EU-based or
                adequately protected under GDPR.
              </li>
              <li style={s.li}>
                <strong>Legal requirements.</strong> We may disclose your data if
                required by law, court order, or governmental authority.
              </li>
              <li style={s.li}>
                <strong>University oversight.</strong> As a student project under
                FII UAIC, we may share anonymised usage statistics with supervising
                faculty for academic evaluation purposes.
              </li>
            </ul>
          </section>

          {/* ── Section 8 ── */}
          <section id="rights" style={s.section}>
            <h2 style={s.h2}>8. Your Rights</h2>
            <p style={s.p}>
              Under the GDPR, you have the following rights regarding your personal data:
            </p>
            <div style={s.rightsGrid}>
              {[
                { icon: "👁️", title: "Right of access", desc: "Request a copy of all personal data we hold about you." },
                { icon: "✏️", title: "Right to rectification", desc: "Ask us to correct inaccurate or incomplete data." },
                { icon: "🗑️", title: "Right to erasure", desc: "Request deletion of your data (\"right to be forgotten\")." },
                { icon: "⏸️", title: "Right to restriction", desc: "Ask us to restrict processing of your data in certain circumstances." },
                { icon: "📦", title: "Right to portability", desc: "Receive your data in a structured, machine-readable format." },
                { icon: "🚫", title: "Right to object", desc: "Object to processing based on legitimate interests." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={s.rightCard}>
                  <span style={s.rightIcon}>{icon}</span>
                  <strong style={s.rightTitle}>{title}</strong>
                  <p style={s.rightDesc}>{desc}</p>
                </div>
              ))}
            </div>
            <p style={s.p}>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@fiismart.ro" style={s.link}>privacy@fiismart.ro</a>.
              We will respond within 30 days. If you are not satisfied with our
              response, you have the right to lodge a complaint with the Romanian
              data protection authority:{" "}
              <a href="https://www.dataprotection.ro" target="_blank"
                rel="noopener noreferrer" style={s.link}>
                Autoritatea Națională de Supraveghere (ANSPDCP)
              </a>.
            </p>
          </section>

          {/* ── Section 9 ── */}
          <section id="cookies" style={s.section}>
            <h2 style={s.h2}>9. Cookies & Local Storage</h2>
            <p style={s.p}>
              FIISmart does not currently use tracking or advertising cookies.
              We use browser <strong>localStorage</strong> to store your session
              tokens (access token and refresh token) so that you remain logged in
              between browser sessions. These are strictly necessary for the
              Service to function and do not require your consent under GDPR.
            </p>
            <p style={s.p}>
              You can clear this data at any time by logging out, which removes
              both tokens, or by clearing your browser's site data for this domain
              in your browser settings.
            </p>
            <div style={s.callout}>
              <strong>No third-party tracking.</strong> We do not embed any
              Google Analytics, Meta Pixel, or other third-party tracking scripts.
            </div>
          </section>

          {/* ── Section 10 ── */}
          <section id="security" style={s.section}>
            <h2 style={s.h2}>10. Security</h2>
            <p style={s.p}>
              We implement appropriate technical and organisational measures to
              protect your personal data against unauthorised access, alteration,
              disclosure, or destruction. These include:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>BCrypt hashing for all stored passwords</li>
              <li style={s.li}>Token-based authentication with short-lived access tokens and refresh token rotation</li>
              <li style={s.li}>HTTPS encryption for all data in transit</li>
              <li style={s.li}>MongoDB connection pools with authenticated access</li>
              <li style={s.li}>Role-based access controls within the platform</li>
            </ul>
            <p style={s.p}>
              However, no method of transmission over the internet or electronic
              storage is 100% secure. If you discover a security vulnerability,
              please disclose it responsibly by emailing{" "}
              <a href="mailto:security@fiismart.ro" style={s.link}>security@fiismart.ro</a>.
            </p>
          </section>

          {/* ── Section 11 ── */}
          <section id="children" style={s.section}>
            <h2 style={s.h2}>11. Children's Privacy</h2>
            <p style={s.p}>
              The Service is intended for users who are at least 16 years of age.
              We do not knowingly collect personal data from children under 16. If
              you believe that a child under 16 has provided us with personal data,
              please contact us immediately and we will take steps to delete it.
            </p>
          </section>

          {/* ── Section 12 ── */}
          <section id="changes" style={s.section}>
            <h2 style={s.h2}>12. Changes to This Policy</h2>
            <p style={s.p}>
              We may update this Privacy Policy from time to time to reflect changes
              in our practices, technology, legal requirements, or other factors.
              When we do, we will update the "Last updated" date at the top of this
              page and, where the changes are material, notify you via an in-app
              notice or email.
            </p>
            <p style={s.p}>
              We encourage you to review this policy periodically. Your continued
              use of the Service after any changes constitutes your acceptance of
              the updated policy.
            </p>
          </section>

          {/* ── Section 13 ── */}
          <section id="contact" style={s.section}>
            <h2 style={s.h2}>13. Contact & Data Protection</h2>
            <p style={s.p}>
              For any questions, requests, or concerns about this Privacy Policy
              or the processing of your personal data, please contact us:
            </p>
            <div style={s.contactBox}>
              <p style={s.contactLine}><strong>FIISmart Privacy Team</strong></p>
              <p style={s.contactLine}>Faculty of Computer Science (FII)</p>
              <p style={s.contactLine}>Alexandru Ioan Cuza University</p>
              <p style={s.contactLine}>Bd. Carol I nr. 11, Iași 700506, România</p>
              <p style={s.contactLine}>
                Privacy email:{" "}
                <a href="mailto:privacy@fiismart.ro" style={s.link}>privacy@fiismart.ro</a>
              </p>
            </div>
            <p style={s.p} style={{ marginTop: "1rem" }}>
              You also have the right to lodge a complaint with the Romanian
              supervisory authority for data protection:
            </p>
            <div style={s.contactBox}>
              <p style={s.contactLine}><strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong></p>
              <p style={s.contactLine}>B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București 010336</p>
              <p style={s.contactLine}>
                Website:{" "}
                <a href="https://www.dataprotection.ro" target="_blank"
                  rel="noopener noreferrer" style={s.link}>
                  www.dataprotection.ro
                </a>
              </p>
            </div>
          </section>

          {/* Footer nav */}
          <div style={s.footerNav}>
            <a href="/terms" style={s.footerLink}>Terms of Service →</a>
            <button onClick={() => navigate(-1)} style={s.footerBack}>
              ← Back
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

const COLOR = {
  bg:           "#f2eae0",
  bgDoc:        "#fdfaf7",
  purple:       "#9b8ec7",
  purpleDark:   "#7a6fb5",
  purpleLight:  "#ece8f7",
  teal:         "#84d3d9",
  lavender:     "#bda6ce",
  text:         "#1e1e2e",
  textMuted:    "#6b7280",
  border:       "#e5ddd4",
  white:        "#ffffff",
  calloutBg:    "#f0edfa",
  calloutBorder:"#c4b8e8",
  tableStripe:  "#f7f4fb",
};

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: COLOR.bg,
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: COLOR.text,
  },
  header: {
    backgroundColor: COLOR.white,
    borderBottom: `1px solid ${COLOR.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
  },
  headerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    background: "none",
    border: "none",
    color: COLOR.textMuted,
    fontSize: "0.875rem",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: "0.35rem 0.6rem",
    borderRadius: "0.4rem",
  },
  logo: { display: "flex", alignItems: "center", gap: "0.4rem" },
  logoIcon: { fontSize: "1.3rem" },
  logoText: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: COLOR.purple,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    letterSpacing: "-0.02em",
  },
  headerLink: {
    fontSize: "0.8rem",
    color: COLOR.purple,
    textDecoration: "none",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  layout: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "3rem",
    alignItems: "start",
  },
  sidebar: { display: "block" },
  sidebarSticky: { position: "sticky", top: "72px" },
  tocLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: COLOR.textMuted,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    margin: "0 0 0.75rem 0.6rem",
  },
  tocItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "0.45rem 0.75rem",
    fontSize: "0.8rem",
    color: COLOR.textMuted,
    cursor: "pointer",
    borderRadius: "0.4rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.4,
    transition: "all 0.15s",
    marginBottom: "0.1rem",
  },
  tocItemActive: {
    color: COLOR.purple,
    backgroundColor: COLOR.purpleLight,
    fontWeight: 600,
  },
  mobileToc: { display: "none", gridColumn: "1 / -1" },
  mobileTocBtn: {
    background: COLOR.white,
    border: `1px solid ${COLOR.border}`,
    borderRadius: "0.5rem",
    padding: "0.6rem 1rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    color: COLOR.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    width: "100%",
    textAlign: "left",
  },
  mobileTocDropdown: {
    background: COLOR.white,
    border: `1px solid ${COLOR.border}`,
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  mobileTocItem: {
    background: "none",
    border: "none",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    color: COLOR.text,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    borderRadius: "0.3rem",
  },
  main: {
    backgroundColor: COLOR.bgDoc,
    borderRadius: "1rem",
    padding: "3rem",
    boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
    border: `1px solid ${COLOR.border}`,
    minWidth: 0,
  },
  docHeader: { marginBottom: "2.5rem" },
  docBadgeRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginBottom: "1.25rem",
  },
  badge: {
    display: "inline-block",
    padding: "0.2rem 0.65rem",
    backgroundColor: COLOR.purpleLight,
    color: COLOR.purpleDark,
    borderRadius: "99px",
    fontSize: "0.72rem",
    fontWeight: 600,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    letterSpacing: "0.02em",
  },
  docTitle: {
    fontSize: "2.25rem",
    fontWeight: 700,
    color: COLOR.text,
    margin: "0 0 1rem",
    lineHeight: 1.2,
  },
  docLead: {
    fontSize: "1.05rem",
    color: COLOR.textMuted,
    lineHeight: 1.7,
    margin: "0 0 1.5rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  divider: {
    height: "2px",
    background: `linear-gradient(to right, ${COLOR.teal}, ${COLOR.purple}, transparent)`,
    borderRadius: "2px",
  },
  section: {
    marginBottom: "2.5rem",
    paddingTop: "0.5rem",
    scrollMarginTop: "72px",
  },
  h2: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: COLOR.purple,
    margin: "0 0 1rem",
    paddingBottom: "0.5rem",
    borderBottom: `1px solid ${COLOR.border}`,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  h3: {
    fontSize: "1rem",
    fontWeight: 600,
    color: COLOR.text,
    margin: "1.25rem 0 0.5rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  p: {
    fontSize: "0.95rem",
    lineHeight: 1.8,
    color: COLOR.text,
    margin: "0 0 0.875rem",
  },
  ul: {
    margin: "0 0 0.875rem",
    paddingLeft: "1.5rem",
  },
  li: {
    fontSize: "0.95rem",
    lineHeight: 1.8,
    color: COLOR.text,
    marginBottom: "0.4rem",
  },
  callout: {
    backgroundColor: COLOR.calloutBg,
    border: `1px solid ${COLOR.calloutBorder}`,
    borderLeft: `3px solid ${COLOR.teal}`,
    borderRadius: "0.5rem",
    padding: "0.875rem 1.125rem",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    color: COLOR.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    margin: "0.875rem 0",
  },
  link: {
    color: COLOR.purple,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  contactBox: {
    backgroundColor: COLOR.white,
    border: `1px solid ${COLOR.border}`,
    borderRadius: "0.75rem",
    padding: "1.25rem 1.5rem",
    marginTop: "0.5rem",
    marginBottom: "0.875rem",
  },
  contactLine: {
    margin: "0 0 0.3rem",
    fontSize: "0.925rem",
    lineHeight: 1.6,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    marginBottom: "0.875rem",
    border: `1px solid ${COLOR.border}`,
    borderRadius: "0.5rem",
    overflow: "hidden",
  },
  th: {
    backgroundColor: COLOR.purpleLight,
    color: COLOR.purpleDark,
    fontWeight: 600,
    padding: "0.65rem 1rem",
    textAlign: "left",
    fontSize: "0.8rem",
    letterSpacing: "0.02em",
    borderBottom: `1px solid ${COLOR.border}`,
  },
  td: {
    padding: "0.65rem 1rem",
    verticalAlign: "top",
    lineHeight: 1.6,
    borderBottom: `1px solid ${COLOR.border}`,
    color: COLOR.text,
  },
  trEven: {
    backgroundColor: COLOR.tableStripe,
  },

  rightsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.875rem",
    margin: "1rem 0",
  },
  rightCard: {
    backgroundColor: COLOR.white,
    border: `1px solid ${COLOR.border}`,
    borderRadius: "0.75rem",
    padding: "1rem 1.125rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  rightIcon: {
    fontSize: "1.4rem",
    lineHeight: 1,
  },
  rightTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: COLOR.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  rightDesc: {
    fontSize: "0.825rem",
    color: COLOR.textMuted,
    lineHeight: 1.5,
    margin: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },

  footerNav: {
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${COLOR.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLink: {
    color: COLOR.purple,
    fontSize: "0.875rem",
    textDecoration: "none",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  footerBack: {
    background: "none",
    border: "none",
    color: COLOR.textMuted,
    fontSize: "0.875rem",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
};

const globalCss = `
  @media (max-width: 768px) {
    aside { display: none !important; }
    .mobile-toc { display: block !important; }
    div[style*="grid-template-columns: 220px"] { grid-template-columns: 1fr !important; }
    main { padding: 1.5rem !important; }
    div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
  a:hover { opacity: 0.8; }
`;
