// ============================================================
// TermsOfServicePage.tsx
// Full Terms of Service page for FIISmart.
// Route: /terms
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "acceptance",    title: "1. Acceptance of Terms" },
  { id: "service",       title: "2. Description of Service" },
  { id: "accounts",      title: "3. User Accounts" },
  { id: "roles",         title: "4. User Roles" },
  { id: "conduct",       title: "5. Acceptable Use" },
  { id: "ip",            title: "6. Intellectual Property" },
  { id: "privacy",       title: "7. Privacy & Data" },
  { id: "disclaimers",   title: "8. Disclaimers" },
  { id: "liability",     title: "9. Limitation of Liability" },
  { id: "termination",   title: "10. Termination" },
  { id: "changes",       title: "11. Changes to Terms" },
  { id: "governing",     title: "12. Governing Law" },
  { id: "contact",       title: "13. Contact" },
];

export function TermsOfServicePage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("acceptance");
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
          <a href="/privacy" style={s.headerLink}>Privacy Policy →</a>
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

        {/* ── Mobile TOC toggle ── */}
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
          {/* Hero */}
          <div style={s.docHeader}>
            <div style={s.docBadgeRow}>
              <span style={s.badge}>Legal</span>
              <span style={s.badge}>Effective: 1 April 2026</span>
              <span style={s.badge}>Last updated: 20 April 2026</span>
            </div>
            <h1 style={s.docTitle}>Terms of Service</h1>
            <p style={s.docLead}>
              Please read these terms carefully before using FIISmart. By creating
              an account or accessing the platform, you agree to be bound by these terms.
            </p>
            <div style={s.divider} />
          </div>

          {/* ── Section 1 ── */}
          <section id="acceptance" style={s.section}>
            <h2 style={s.h2}>1. Acceptance of Terms</h2>
            <p style={s.p}>
              These Terms of Service ("Terms") govern your access to and use of
              the FIISmart platform ("Service"), operated by the FIISmart student
              project team at the Faculty of Computer Science (FII), Alexandru Ioan
              Cuza University, Iași, Romania ("we", "us", or "our").
            </p>
            <p style={s.p}>
              By registering an account, logging in, or otherwise accessing or using
              the Service, you confirm that you are at least 16 years old, that you
              have read and understood these Terms, and that you agree to be bound
              by them. If you do not agree, you must not use the Service.
            </p>
            <p style={s.p}>
              If you are accessing the Service on behalf of an institution or
              organisation, you represent that you have the authority to bind that
              entity to these Terms.
            </p>
          </section>

          {/* ── Section 2 ── */}
          <section id="service" style={s.section}>
            <h2 style={s.h2}>2. Description of Service</h2>
            <p style={s.p}>
              FIISmart is an educational e-learning platform designed for the
              students and teachers of FII UAIC. The Service allows teachers to
              create and publish courses with lectures and quizzes, and allows
              students to enrol in those courses, track their progress, take quizzes,
              and leave reviews.
            </p>
            <p style={s.p}>
              The Service is provided for educational and academic purposes. It is
              currently in active development and is offered on an "as is" basis.
              Features, availability, and functionality may change at any time.
            </p>
            <div style={s.callout}>
              <strong>Note:</strong> FIISmart is a student-developed project and is
              not an official service of Alexandru Ioan Cuza University. It does not
              replace or substitute any official university system.
            </div>
          </section>

          {/* ── Section 3 ── */}
          <section id="accounts" style={s.section}>
            <h2 style={s.h2}>3. User Accounts</h2>
            <p style={s.p}>
              To access most features of the Service, you must register for an account.
              When registering, you agree to provide accurate, complete, and current
              information. You are responsible for maintaining the confidentiality of
              your login credentials and for all activity that occurs under your account.
            </p>
            <p style={s.p}>
              You must notify us immediately at the contact address below if you suspect
              any unauthorised use of your account. We will not be liable for any loss
              or damage arising from your failure to protect your credentials.
            </p>
            <p style={s.p}>
              You may not create more than one account per person, share your account
              with others, or transfer your account to another person.
            </p>
          </section>

          {/* ── Section 4 ── */}
          <section id="roles" style={s.section}>
            <h2 style={s.h2}>4. User Roles</h2>
            <p style={s.p}>
              The Service operates two primary user roles:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>
                <strong>Students</strong> may browse the course catalogue, enrol in
                published courses, access lecture content, submit quiz attempts, and
                leave reviews for courses they are enrolled in.
              </li>
              <li style={s.li}>
                <strong>Teachers</strong> may create and manage courses, publish
                lectures and quizzes, and view enrolment statistics for their own
                courses. Teachers are responsible for ensuring that any content they
                upload complies with these Terms and applicable law.
              </li>
            </ul>
            <p style={s.p}>
              Administrative accounts are reserved for platform maintainers and are
              not available for general registration.
            </p>
          </section>

          {/* ── Section 5 ── */}
          <section id="conduct" style={s.section}>
            <h2 style={s.h2}>5. Acceptable Use</h2>
            <p style={s.p}>
              You agree to use the Service only for lawful purposes and in a manner
              that does not infringe the rights of others or restrict their use of
              the Service. You must not:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>Upload, post, or transmit any content that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.</li>
              <li style={s.li}>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li style={s.li}>Attempt to gain unauthorised access to any part of the Service, its servers, or any connected systems.</li>
              <li style={s.li}>Use automated tools, bots, scrapers, or crawlers to access or collect data from the Service without our prior written consent.</li>
              <li style={s.li}>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li style={s.li}>Use the Service to distribute spam, malware, or any unsolicited commercial communication.</li>
              <li style={s.li}>Circumvent or attempt to circumvent any technological protection measures on the Service.</li>
            </ul>
            <p style={s.p}>
              We reserve the right to investigate and take appropriate action — including
              suspension or termination of accounts — against anyone who, in our sole
              discretion, violates this section.
            </p>
          </section>

          {/* ── Section 6 ── */}
          <section id="ip" style={s.section}>
            <h2 style={s.h2}>6. Intellectual Property</h2>
            <p style={s.p}>
              <strong>Platform content.</strong> The FIISmart name, logo, interface
              design, and all software code are owned by the FIISmart project team.
              You may not copy, reproduce, distribute, or create derivative works
              from any part of the platform without our prior written consent.
            </p>
            <p style={s.p}>
              <strong>User-generated content.</strong> Teachers retain ownership of
              the course content they create and upload. By publishing content on
              FIISmart, you grant us a non-exclusive, royalty-free, worldwide licence
              to host, display, and deliver that content to enrolled students as part
              of the Service.
            </p>
            <p style={s.p}>
              <strong>Academic integrity.</strong> All content shared on the platform
              must comply with the academic integrity policies of Alexandru Ioan Cuza
              University. Uploading copyrighted third-party material without
              authorisation is strictly prohibited.
            </p>
          </section>

          {/* ── Section 7 ── */}
          <section id="privacy" style={s.section}>
            <h2 style={s.h2}>7. Privacy & Data Protection</h2>
            <p style={s.p}>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy" style={s.link}>Privacy Policy</a>, which is
              incorporated into these Terms by reference. The Privacy Policy explains
              what personal data we collect, how we use it, and your rights under
              the General Data Protection Regulation (GDPR) and Romanian data
              protection law.
            </p>
            <p style={s.p}>
              By using the Service, you consent to the processing of your personal
              data as described in the Privacy Policy.
            </p>
          </section>

          {/* ── Section 8 ── */}
          <section id="disclaimers" style={s.section}>
            <h2 style={s.h2}>8. Disclaimers</h2>
            <p style={s.p}>
              The Service is provided "as is" and "as available" without warranties
              of any kind, either express or implied, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose,
              or non-infringement.
            </p>
            <p style={s.p}>
              We do not warrant that the Service will be uninterrupted, error-free,
              or free of viruses or other harmful components. We do not guarantee
              the accuracy, completeness, or usefulness of any content available
              through the Service.
            </p>
            <p style={s.p}>
              Course content is created by teachers and we do not review, verify,
              or endorse it. You access all content at your own risk.
            </p>
          </section>

          {/* ── Section 9 ── */}
          <section id="liability" style={s.section}>
            <h2 style={s.h2}>9. Limitation of Liability</h2>
            <p style={s.p}>
              To the fullest extent permitted by applicable law, we shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages — including loss of data, loss of profits, or
              interruption of service — arising out of or in connection with your
              use of the Service, even if we have been advised of the possibility
              of such damages.
            </p>
            <p style={s.p}>
              Our total liability to you for any claim arising out of these Terms
              shall not exceed the greater of (a) the amount you paid us in the
              twelve months preceding the claim, or (b) €50.
            </p>
          </section>

          {/* ── Section 10 ── */}
          <section id="termination" style={s.section}>
            <h2 style={s.h2}>10. Termination</h2>
            <p style={s.p}>
              You may stop using the Service and delete your account at any time
              by contacting us at the address below. Upon deletion, your personal
              data will be handled in accordance with our Privacy Policy.
            </p>
            <p style={s.p}>
              We may suspend or terminate your access to the Service at any time,
              with or without notice, if we believe you have violated these Terms
              or for any other reason at our discretion. Termination does not limit
              any other rights or remedies we may have.
            </p>
          </section>

          {/* ── Section 11 ── */}
          <section id="changes" style={s.section}>
            <h2 style={s.h2}>11. Changes to Terms</h2>
            <p style={s.p}>
              We may update these Terms from time to time. When we do, we will
              revise the "Last updated" date at the top of this page. If the changes
              are material, we will make reasonable efforts to notify you — for
              example, via an in-app notice or email.
            </p>
            <p style={s.p}>
              Your continued use of the Service after changes take effect constitutes
              your acceptance of the updated Terms. If you do not agree with the
              revised Terms, you should stop using the Service.
            </p>
          </section>

          {/* ── Section 12 ── */}
          <section id="governing" style={s.section}>
            <h2 style={s.h2}>12. Governing Law</h2>
            <p style={s.p}>
              These Terms are governed by and construed in accordance with the laws
              of Romania, without regard to its conflict of law provisions. Any
              disputes arising under these Terms shall be subject to the exclusive
              jurisdiction of the courts of Iași, Romania.
            </p>
            <p style={s.p}>
              If you are a consumer resident in the European Union, you also benefit
              from any mandatory protective provisions of the law of the country in
              which you reside.
            </p>
          </section>

          {/* ── Section 13 ── */}
          <section id="contact" style={s.section}>
            <h2 style={s.h2}>13. Contact</h2>
            <p style={s.p}>
              If you have questions about these Terms, please contact the FIISmart
              team at:
            </p>
            <div style={s.contactBox}>
              <p style={s.contactLine}><strong>FIISmart Project Team</strong></p>
              <p style={s.contactLine}>Faculty of Computer Science (FII)</p>
              <p style={s.contactLine}>Alexandru Ioan Cuza University</p>
              <p style={s.contactLine}>Bd. Carol I nr. 11, Iași 700506, România</p>
              <p style={s.contactLine}>
                Email:{" "}
                <a href="mailto:contact@fiismart.ro" style={s.link}>
                  contact@fiismart.ro
                </a>
              </p>
            </div>
          </section>

          {/* Footer nav */}
          <div style={s.footerNav}>
            <a href="/privacy" style={s.footerLink}>Privacy Policy →</a>
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
  bg:         "#f2eae0",
  bgDoc:      "#fdfaf7",
  purple:     "#9b8ec7",
  purpleDark: "#7a6fb5",
  purpleLight:"#ece8f7",
  teal:       "#84d3d9",
  lavender:   "#bda6ce",
  text:       "#1e1e2e",
  textMuted:  "#6b7280",
  border:     "#e5ddd4",
  white:      "#ffffff",
  calloutBg:  "#f0edfa",
  calloutBorder: "#c4b8e8",
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
    transition: "background 0.15s",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
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

  sidebar: {
    display: "block",
  },
  sidebarSticky: {
    position: "sticky",
    top: "72px",
  },
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

  mobileToc: {
    display: "none",
    gridColumn: "1 / -1",
  },
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

  docHeader: {
    marginBottom: "2.5rem",
  },
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
    background: `linear-gradient(to right, ${COLOR.purple}, ${COLOR.teal}, transparent)`,
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
    borderLeft: `3px solid ${COLOR.purple}`,
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
  },
  contactLine: {
    margin: "0 0 0.3rem",
    fontSize: "0.925rem",
    lineHeight: 1.6,
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
    .tos-layout { grid-template-columns: 1fr !important; }
    aside { display: none !important; }
    .mobile-toc { display: block !important; }
    main { padding: 1.5rem !important; }
  }
  a:hover { opacity: 0.8; }
  button:hover { opacity: 0.85; }
`;
