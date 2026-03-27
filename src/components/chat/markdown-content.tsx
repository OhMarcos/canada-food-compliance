"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isSafeUrl } from "@/lib/url";

/**
 * Safe markdown renderer using react-markdown (no dangerouslySetInnerHTML).
 * Strips raw HTML from LLM output by default, preventing XSS.
 * External links open in new tab with security attributes.
 */
export function MarkdownContent({ text }: { readonly text: string }) {
  return (
    <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-li:my-0 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:underline prose-a:underline-offset-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => {
            if (!href || !isSafeUrl(href)) {
              return <span>{children}</span>;
            }
            const isExternal = href.startsWith("http");
            return (
              <a
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
