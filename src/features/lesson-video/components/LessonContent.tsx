import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveFileUrl } from "@/lib/api";
import type { LectureDetails } from "../types";

type Props = {
  lecture: LectureDetails;
  onMarkComplete: (durationSecs?: number) => Promise<void> | void;
  isSaving?: boolean;
};

const URL_RE = /^(https?:)?\/\//i;

export function inferLessonType(lecture?: Partial<LectureDetails> | null): "video" | "pdf" | "markdown" {
  const explicit = lecture?.type;
  if (explicit === "pdf" || explicit === "markdown" || explicit === "video") return explicit;

  const source = (lecture?.content || lecture?.pdfUrl || lecture?.videoUrl || "").toLowerCase();
  if (source.endsWith(".pdf")) return "pdf";
  if (source.endsWith(".md") || source.endsWith(".markdown") || source.endsWith(".txt")) return "markdown";
  if (source && !URL_RE.test(source) && !source.startsWith("/")) return "markdown";
  return "video";
}

export function estimateReadingDurationSecs(text?: string | null): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(60, Math.ceil(words / 180) * 60);
}

function sourceLooksRemote(source: string): boolean {
  return URL_RE.test(source) || source.startsWith("/");
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MarkdownPreview({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let codeLines: string[] = [];
  let inCode = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push(
          <pre key={`code-${index}`} className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
        codeLines = [];
      }
      inCode = !inCode;
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push(<div key={`space-${index}`} className="h-3" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(<h3 key={index} className="mt-5 text-lg font-semibold">{renderInline(trimmed.slice(4))}</h3>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={index} className="mt-6 text-xl font-bold">{renderInline(trimmed.slice(3))}</h2>);
      return;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(<h1 key={index} className="mt-6 text-2xl font-bold">{renderInline(trimmed.slice(2))}</h1>);
      return;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push(
        <ul key={index} className="ml-6 list-disc text-sm leading-7 text-muted-foreground">
          <li>{renderInline(trimmed.slice(2))}</li>
        </ul>,
      );
      return;
    }

    blocks.push(
      <p key={index} className="text-sm leading-7 text-muted-foreground">
        {renderInline(trimmed)}
      </p>,
    );
  });

  if (inCode && codeLines.length > 0) {
    blocks.push(
      <pre key="code-tail" className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
  }

  return <div className="space-y-1">{blocks}</div>;
}

export default function LessonContent({ lecture, onMarkComplete, isSaving = false }: Props) {
  const type = inferLessonType(lecture);
  const source = lecture.content || lecture.pdfUrl || lecture.videoUrl || "";
  const [remoteMarkdown, setRemoteMarkdown] = useState<string | null>(null);
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);

  useEffect(() => {
    if (type !== "markdown" || !sourceLooksRemote(source)) {
      setRemoteMarkdown(null);
      return;
    }

    const controller = new AbortController();
    setLoadingMarkdown(true);
    fetch(source, { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.statusText))))
      .then(setRemoteMarkdown)
      .catch(() => setRemoteMarkdown(null))
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMarkdown(false);
      });

    return () => controller.abort();
  }, [source, type]);

  const markdownContent = remoteMarkdown ?? source;
  const estimatedDuration = useMemo(
    () => estimateReadingDurationSecs(markdownContent),
    [markdownContent],
  );

  if (type === "pdf") {
    const pdfUrl = lecture.pdfUrl || lecture.content || lecture.videoUrl || "";
    return (
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Document</p>
            <h1 className="truncate text-xl font-bold text-foreground">{lecture.title}</h1>
          </div>
          {pdfUrl && (
            <Button asChild variant="outline" className="gap-2 shrink-0">
              <a href={resolveFileUrl(pdfUrl)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Deschide
              </a>
            </Button>
          )}
        </div>

        {pdfUrl ? (
          <iframe
            title={lecture.title}
            src={resolveFileUrl(pdfUrl)}
            className="h-[70vh] min-h-[520px] w-full bg-muted"
          />
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10" />
            <p>PDF-ul nu este disponibil.</p>
          </div>
        )}

        <div className="border-t border-border p-5">
          <Button onClick={() => onMarkComplete()} disabled={lecture.completed || isSaving} className="gap-2">
            {lecture.completed ? <CheckCircle2 className="h-4 w-4" /> : null}
            {lecture.completed ? "Parcurs" : "Marcheaza ca parcursa"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lectie text</p>
        <h1 className="text-2xl font-bold text-foreground">{lecture.title}</h1>
      </div>

      {loadingMarkdown ? (
        <div className="flex min-h-[220px] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Se incarca textul...
        </div>
      ) : markdownContent.trim() ? (
        <MarkdownPreview content={markdownContent} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Aceasta lectie nu are continut text.
        </p>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <Button
          onClick={() => onMarkComplete(estimatedDuration)}
          disabled={lecture.completed || isSaving}
          className="gap-2"
        >
          {lecture.completed ? <CheckCircle2 className="h-4 w-4" /> : null}
          {lecture.completed ? "Parcurs" : "Marcheaza ca parcursa"}
        </Button>
      </div>
    </section>
  );
}
