"use client";

import { useLanguage } from "@/hooks/use-language";

interface TocItem {
  readonly id: string;
  readonly label_en: string;
  readonly label_ko: string;
}

interface TableOfContentsProps {
  readonly items: readonly TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const { t } = useLanguage();

  return (
    <nav className="rounded-xl border bg-muted/30 p-5 space-y-2" aria-label="Table of contents">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {t("In This Guide", "목차")}
      </p>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
            >
              <span className="text-primary font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{t(item.label_en, item.label_ko)}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
