import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Privacy Policy. Long-form copy ported verbatim from
 * `origin/login-signin-front:src/auth/components/PrivacyPolicy.tsx` —
 * only the presentation layer was rewritten in Tailwind. No inline styles.
 */
export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-edu-bg text-edu-foreground">
      <header className="sticky top-0 z-30 bg-card border-b border-border/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Înapoi
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="size-5 text-edu-purple" aria-hidden="true" />
            <span className="font-semibold tracking-tight">FIISmart</span>
          </Link>
          <Link to="/terms" className="text-sm text-edu-purple hover:underline">
            Terms of Service →
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>Legal</Badge>
          <Badge>GDPR Compliant</Badge>
          <Badge>Effective: 1 April 2026</Badge>
          <Badge>Last updated: 20 April 2026</Badge>
        </div>

        <h1 className="mt-6 text-4xl sm:text-5xl font-serif font-semibold leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your privacy matters to us. This policy explains exactly what personal
          data FIISmart collects, why we collect it, how we use and protect it,
          and what rights you have under the GDPR.
        </p>
        <hr className="mt-8 border-border/60" />

        <Section id="intro" title="1. Introduction">
          <p>
            This Privacy Policy applies to the FIISmart e-learning platform
            ("Service") operated by the FIISmart student project team at the
            Faculty of Computer Science (FII), Alexandru Ioan Cuza University,
            Iași, Romania ("we", "us", "our").
          </p>
          <p>
            We are committed to protecting your personal data in accordance with
            Regulation (EU) 2016/679 (the General Data Protection Regulation,
            "GDPR") and Romanian data protection law. Please read this policy
            carefully before using the Service.
          </p>
          <Callout>
            <strong>Your data stays in the EU.</strong> All data is stored on
            servers located within the European Union. We do not transfer
            personal data to countries outside the EEA.
          </Callout>
        </Section>

        <Section id="controller" title="2. Data Controller">
          <p>The data controller responsible for your personal data is:</p>
          <ContactBox>
            <p><strong>FIISmart Project Team</strong></p>
            <p>Faculty of Computer Science (FII)</p>
            <p>Alexandru Ioan Cuza University</p>
            <p>Bd. Carol I nr. 11, Iași 700506, România</p>
            <p>
              Email:{" "}
              <a
                href="mailto:privacy@fiismart.ro"
                className="text-edu-purple underline"
              >
                privacy@fiismart.ro
              </a>
            </p>
          </ContactBox>
        </Section>

        <Section id="collect" title="3. Data We Collect">
          <p>We collect the following categories of personal data:</p>

          <h3 className="text-lg font-semibold mt-4">3.1 Account data</h3>
          <p>
            When you register, we collect your first name, last name, email
            address, chosen role (student or teacher), and a hashed version of
            your password. We never store your password in plain text — it is
            immediately hashed using BCrypt before being saved.
          </p>

          <h3 className="text-lg font-semibold mt-4">3.2 Activity data</h3>
          <p>
            We record information about how you use the Service, including
            course enrolments, lecture progress (seconds watched per lecture),
            quiz attempt scores and timestamps, course reviews you write, and
            your last login timestamp.
          </p>

          <h3 className="text-lg font-semibold mt-4">3.3 Technical data</h3>
          <p>
            When you use the Service, we may collect your browser type,
            operating system, and IP address in server logs for security and
            diagnostic purposes. Session tokens are stored in your browser's
            localStorage.
          </p>

          <h3 className="text-lg font-semibold mt-4">3.4 Data you provide voluntarily</h3>
          <p>
            If you are a teacher, the course content, lecture materials, and
            quiz questions you create and upload are stored on our servers. You
            are responsible for ensuring this content does not include
            unnecessary personal data about third parties.
          </p>
        </Section>

        <Section id="use" title="4. How We Use Your Data">
          <p>We use your personal data for the following purposes:</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Purpose</th>
                  <th className="text-left px-4 py-2 font-semibold">Data used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Providing the Service (account management, authentication)", "Name, email, password hash, role, session tokens"],
                  ["Delivering course content to enrolled students", "Enrolment records, lecture progress"],
                  ["Displaying quiz results and progress statistics", "Quiz attempts, scores"],
                  ["Allowing teachers to manage their courses", "Course content, enrolment counts"],
                  ["Sending password reset and email verification emails", "Email address, one-time tokens"],
                  ["Detecting and preventing fraud or abuse", "IP address, login timestamps"],
                  ["Improving the Service", "Aggregated, anonymised usage data"],
                ].map(([purpose, data]) => (
                  <tr key={purpose} className="even:bg-muted/20">
                    <td className="px-4 py-2 align-top">{purpose}</td>
                    <td className="px-4 py-2 align-top">{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="legal-basis" title="5. Legal Basis for Processing (GDPR)">
          <p>
            Under the GDPR, we must have a legal basis for each type of
            processing. Our legal bases are:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Contract (Art. 6(1)(b)).</strong> Processing your account
              data and activity data is necessary to provide the Service you
              signed up for.
            </li>
            <li>
              <strong>Legitimate interests (Art. 6(1)(f)).</strong> We process
              technical data (IP addresses, server logs) to maintain security
              and prevent abuse. This is balanced against your privacy rights.
            </li>
            <li>
              <strong>Consent (Art. 6(1)(a)).</strong> Where we send
              non-essential communications or use optional cookies, we will
              ask for your consent first.
            </li>
            <li>
              <strong>Legal obligation (Art. 6(1)(c)).</strong> We may process
              data where required by Romanian or EU law.
            </li>
          </ul>
        </Section>

        <Section id="retention" title="6. Data Retention">
          <p>
            We retain your personal data only for as long as necessary for the
            purposes described in this policy:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account data</strong> — retained for as long as your
              account is active. If you delete your account, we will delete
              your personal data within 30 days, except where retention is
              required by law.
            </li>
            <li>
              <strong>Activity data</strong> — retained for the duration of
              your account plus 90 days.
            </li>
            <li>
              <strong>Server logs</strong> — retained for a maximum of 90 days
              for security purposes.
            </li>
            <li>
              <strong>Session tokens</strong> — expire automatically or are
              deleted on logout.
            </li>
          </ul>
        </Section>

        <Section id="sharing" title="7. Sharing Your Data">
          <p>
            We do not sell, rent, or trade your personal data to any third
            party. We may share your data in the following limited circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Within the platform.</strong> Your display name and
              reviews are visible to other users as part of the Service's
              normal operation. Your email address and password hash are never
              visible to other users.
            </li>
            <li>
              <strong>Service providers.</strong> We may use third-party
              hosting or infrastructure providers who process data on our
              behalf under data processing agreements. All such providers are
              EU-based or adequately protected under GDPR.
            </li>
            <li>
              <strong>Legal requirements.</strong> We may disclose your data
              if required by law, court order, or governmental authority.
            </li>
            <li>
              <strong>University oversight.</strong> As a student project
              under FII UAIC, we may share anonymised usage statistics with
              supervising faculty for academic evaluation purposes.
            </li>
          </ul>
        </Section>

        <Section id="rights" title="8. Your Rights">
          <p>
            Under the GDPR, you have the following rights regarding your
            personal data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Right of access", desc: "Request a copy of all personal data we hold about you." },
              { title: "Right to rectification", desc: "Ask us to correct inaccurate or incomplete data." },
              { title: "Right to erasure", desc: 'Request deletion of your data ("right to be forgotten").' },
              { title: "Right to restriction", desc: "Ask us to restrict processing of your data in certain circumstances." },
              { title: "Right to portability", desc: "Receive your data in a structured, machine-readable format." },
              { title: "Right to object", desc: "Object to processing based on legitimate interests." },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@fiismart.ro"
              className="text-edu-purple underline"
            >
              privacy@fiismart.ro
            </a>
            . We will respond within 30 days. If you are not satisfied with our
            response, you have the right to lodge a complaint with the Romanian
            data protection authority:{" "}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-edu-purple underline"
            >
              Autoritatea Națională de Supraveghere (ANSPDCP)
            </a>
            .
          </p>
        </Section>

        <Section id="cookies" title="9. Cookies & Local Storage">
          <p>
            FIISmart does not currently use tracking or advertising cookies.
            We use browser <strong>localStorage</strong> to store your session
            tokens (access token and refresh token) so that you remain logged
            in between browser sessions. These are strictly necessary for the
            Service to function and do not require your consent under GDPR.
          </p>
          <p>
            You can clear this data at any time by logging out, which removes
            both tokens, or by clearing your browser's site data for this
            domain in your browser settings.
          </p>
          <Callout>
            <strong>No third-party tracking.</strong> We do not embed any
            Google Analytics, Meta Pixel, or other third-party tracking scripts.
          </Callout>
        </Section>

        <Section id="security" title="10. Security">
          <p>
            We implement appropriate technical and organisational measures to
            protect your personal data against unauthorised access, alteration,
            disclosure, or destruction. These include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>BCrypt hashing for all stored passwords</li>
            <li>Token-based authentication with short-lived access tokens and refresh token rotation</li>
            <li>HTTPS encryption for all data in transit</li>
            <li>MongoDB connection pools with authenticated access</li>
            <li>Role-based access controls within the platform</li>
          </ul>
          <p>
            However, no method of transmission over the internet or electronic
            storage is 100% secure. If you discover a security vulnerability,
            please disclose it responsibly by emailing{" "}
            <a
              href="mailto:security@fiismart.ro"
              className="text-edu-purple underline"
            >
              security@fiismart.ro
            </a>
            .
          </p>
        </Section>

        <Section id="children" title="11. Children's Privacy">
          <p>
            The Service is intended for users who are at least 16 years of age.
            We do not knowingly collect personal data from children under 16.
            If you believe that a child under 16 has provided us with personal
            data, please contact us immediately and we will take steps to
            delete it.
          </p>
        </Section>

        <Section id="changes" title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, technology, legal requirements, or other
            factors. When we do, we will update the "Last updated" date at the
            top of this page and, where the changes are material, notify you
            via an in-app notice or email.
          </p>
          <p>
            We encourage you to review this policy periodically. Your continued
            use of the Service after any changes constitutes your acceptance of
            the updated policy.
          </p>
        </Section>

        <Section id="contact" title="13. Contact & Data Protection">
          <p>
            For any questions, requests, or concerns about this Privacy Policy
            or the processing of your personal data, please contact us:
          </p>
          <ContactBox>
            <p><strong>FIISmart Privacy Team</strong></p>
            <p>Faculty of Computer Science (FII)</p>
            <p>Alexandru Ioan Cuza University</p>
            <p>Bd. Carol I nr. 11, Iași 700506, România</p>
            <p>
              Privacy email:{" "}
              <a
                href="mailto:privacy@fiismart.ro"
                className="text-edu-purple underline"
              >
                privacy@fiismart.ro
              </a>
            </p>
          </ContactBox>
          <p>
            You also have the right to lodge a complaint with the Romanian
            supervisory authority for data protection:
          </p>
          <ContactBox>
            <p>
              <strong>
                Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
                Caracter Personal (ANSPDCP)
              </strong>
            </p>
            <p>
              B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București 010336
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.dataprotection.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-edu-purple underline"
              >
                www.dataprotection.ro
              </a>
            </p>
          </ContactBox>
        </Section>

        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Înapoi
          </Button>
          <Link to="/terms" className="text-sm text-edu-purple hover:underline">
            Terms of Service →
          </Link>
        </div>
      </article>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-24 space-y-4 leading-relaxed">
      <h2 className="text-2xl font-serif font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-md bg-edu-purple/10 text-edu-purple ring-1 ring-edu-purple/20 font-medium">
      {children}
    </span>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-edu-purple bg-edu-purple/5 p-4 text-sm">
      {children}
    </div>
  );
}

function ContactBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1 text-sm">
      {children}
    </div>
  );
}
