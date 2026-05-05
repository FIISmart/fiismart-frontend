import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Terms of Service. Long-form copy ported verbatim from
 * `origin/login-signin-front:src/auth/components/TermsOfService.tsx` —
 * only the presentation layer was rewritten in Tailwind. No inline styles.
 */
export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-edu-bg text-edu-foreground">
      {/* Header */}
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
          <Link to="/privacy" className="text-sm text-edu-purple hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>Legal</Badge>
          <Badge>Effective: 1 April 2026</Badge>
          <Badge>Last updated: 20 April 2026</Badge>
        </div>

        <h1 className="mt-6 text-4xl sm:text-5xl font-serif font-semibold leading-tight">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Please read these terms carefully before using FIISmart. By creating an
          account or accessing the platform, you agree to be bound by these terms.
        </p>
        <hr className="mt-8 border-border/60" />

        <Section id="acceptance" title="1. Acceptance of Terms">
          <p>
            These Terms of Service ("Terms") govern your access to and use of the
            FIISmart platform ("Service"), operated by the FIISmart student project
            team at the Faculty of Computer Science (FII), Alexandru Ioan Cuza
            University, Iași, Romania ("we", "us", or "our").
          </p>
          <p>
            By registering an account, logging in, or otherwise accessing or using
            the Service, you confirm that you are at least 16 years old, that you
            have read and understood these Terms, and that you agree to be bound by
            them. If you do not agree, you must not use the Service.
          </p>
          <p>
            If you are accessing the Service on behalf of an institution or
            organisation, you represent that you have the authority to bind that
            entity to these Terms.
          </p>
        </Section>

        <Section id="service" title="2. Description of Service">
          <p>
            FIISmart is an educational e-learning platform designed for the students
            and teachers of FII UAIC. The Service allows teachers to create and
            publish courses with lectures and quizzes, and allows students to enrol
            in those courses, track their progress, take quizzes, and leave reviews.
          </p>
          <p>
            The Service is provided for educational and academic purposes. It is
            currently in active development and is offered on an "as is" basis.
            Features, availability, and functionality may change at any time.
          </p>
          <Callout>
            <strong>Note:</strong> FIISmart is a student-developed project and is
            not an official service of Alexandru Ioan Cuza University. It does not
            replace or substitute any official university system.
          </Callout>
        </Section>

        <Section id="accounts" title="3. User Accounts">
          <p>
            To access most features of the Service, you must register for an account.
            When registering, you agree to provide accurate, complete, and current
            information. You are responsible for maintaining the confidentiality of
            your login credentials and for all activity that occurs under your account.
          </p>
          <p>
            You must notify us immediately at the contact address below if you
            suspect any unauthorised use of your account. We will not be liable for
            any loss or damage arising from your failure to protect your credentials.
          </p>
          <p>
            You may not create more than one account per person, share your account
            with others, or transfer your account to another person.
          </p>
        </Section>

        <Section id="roles" title="4. User Roles">
          <p>The Service operates two primary user roles:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Students</strong> may browse the course catalogue, enrol in
              published courses, access lecture content, submit quiz attempts, and
              leave reviews for courses they are enrolled in.
            </li>
            <li>
              <strong>Teachers</strong> may create and manage courses, publish
              lectures and quizzes, and view enrolment statistics for their own
              courses. Teachers are responsible for ensuring that any content they
              upload complies with these Terms and applicable law.
            </li>
          </ul>
          <p>
            Administrative accounts are reserved for platform maintainers and are
            not available for general registration.
          </p>
        </Section>

        <Section id="conduct" title="5. Acceptable Use">
          <p>
            You agree to use the Service only for lawful purposes and in a manner
            that does not infringe the rights of others or restrict their use of
            the Service. You must not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upload, post, or transmit any content that is unlawful, harmful, defamatory, obscene, or otherwise objectionable.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
            <li>Attempt to gain unauthorised access to any part of the Service, its servers, or any connected systems.</li>
            <li>Use automated tools, bots, scrapers, or crawlers to access or collect data from the Service without our prior written consent.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Use the Service to distribute spam, malware, or any unsolicited commercial communication.</li>
            <li>Circumvent or attempt to circumvent any technological protection measures on the Service.</li>
          </ul>
          <p>
            We reserve the right to investigate and take appropriate action —
            including suspension or termination of accounts — against anyone who,
            in our sole discretion, violates this section.
          </p>
        </Section>

        <Section id="ip" title="6. Intellectual Property">
          <p>
            <strong>Platform content.</strong> The FIISmart name, logo, interface
            design, and all software code are owned by the FIISmart project team.
            You may not copy, reproduce, distribute, or create derivative works from
            any part of the platform without our prior written consent.
          </p>
          <p>
            <strong>User-generated content.</strong> Teachers retain ownership of
            the course content they create and upload. By publishing content on
            FIISmart, you grant us a non-exclusive, royalty-free, worldwide licence
            to host, display, and deliver that content to enrolled students as part
            of the Service.
          </p>
          <p>
            <strong>Academic integrity.</strong> All content shared on the platform
            must comply with the academic integrity policies of Alexandru Ioan Cuza
            University. Uploading copyrighted third-party material without
            authorisation is strictly prohibited.
          </p>
        </Section>

        <Section id="privacy" title="7. Privacy & Data Protection">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link to="/privacy" className="text-edu-purple underline">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference. The Privacy
            Policy explains what personal data we collect, how we use it, and your
            rights under the General Data Protection Regulation (GDPR) and Romanian
            data protection law.
          </p>
          <p>
            By using the Service, you consent to the processing of your personal
            data as described in the Privacy Policy.
          </p>
        </Section>

        <Section id="disclaimers" title="8. Disclaimers">
          <p>
            The Service is provided "as is" and "as available" without warranties
            of any kind, either express or implied, including but not limited to
            implied warranties of merchantability, fitness for a particular purpose,
            or non-infringement.
          </p>
          <p>
            We do not warrant that the Service will be uninterrupted, error-free,
            or free of viruses or other harmful components. We do not guarantee
            the accuracy, completeness, or usefulness of any content available
            through the Service.
          </p>
          <p>
            Course content is created by teachers and we do not review, verify,
            or endorse it. You access all content at your own risk.
          </p>
        </Section>

        <Section id="liability" title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, we shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages — including loss of data, loss of profits, or
            interruption of service — arising out of or in connection with your
            use of the Service, even if we have been advised of the possibility
            of such damages.
          </p>
          <p>
            Our total liability to you for any claim arising out of these Terms
            shall not exceed the greater of (a) the amount you paid us in the
            twelve months preceding the claim, or (b) €50.
          </p>
        </Section>

        <Section id="termination" title="10. Termination">
          <p>
            You may stop using the Service and delete your account at any time
            by contacting us at the address below. Upon deletion, your personal
            data will be handled in accordance with our Privacy Policy.
          </p>
          <p>
            We may suspend or terminate your access to the Service at any time,
            with or without notice, if we believe you have violated these Terms
            or for any other reason at our discretion. Termination does not limit
            any other rights or remedies we may have.
          </p>
        </Section>

        <Section id="changes" title="11. Changes to Terms">
          <p>
            We may update these Terms from time to time. When we do, we will
            revise the "Last updated" date at the top of this page. If the
            changes are material, we will make reasonable efforts to notify you —
            for example, via an in-app notice or email.
          </p>
          <p>
            Your continued use of the Service after changes take effect
            constitutes your acceptance of the updated Terms. If you do not
            agree with the revised Terms, you should stop using the Service.
          </p>
        </Section>

        <Section id="governing" title="12. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the
            laws of Romania, without regard to its conflict of law provisions.
            Any disputes arising under these Terms shall be subject to the
            exclusive jurisdiction of the courts of Iași, Romania.
          </p>
          <p>
            If you are a consumer resident in the European Union, you also
            benefit from any mandatory protective provisions of the law of the
            country in which you reside.
          </p>
        </Section>

        <Section id="contact" title="13. Contact">
          <p>
            If you have questions about these Terms, please contact the FIISmart
            team at:
          </p>
          <ContactBox>
            <p><strong>FIISmart Project Team</strong></p>
            <p>Faculty of Computer Science (FII)</p>
            <p>Alexandru Ioan Cuza University</p>
            <p>Bd. Carol I nr. 11, Iași 700506, România</p>
            <p>
              Email:{" "}
              <a
                href="mailto:contact@fiismart.ro"
                className="text-edu-purple underline"
              >
                contact@fiismart.ro
              </a>
            </p>
          </ContactBox>
        </Section>

        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Înapoi
          </Button>
          <Link to="/privacy" className="text-sm text-edu-purple hover:underline">
            Privacy Policy →
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
