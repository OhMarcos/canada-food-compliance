/**
 * Text chunker for regulation content.
 * Splits regulation text into overlapping chunks suitable for embedding.
 */

export interface TextChunk {
  readonly text: string;
  readonly index: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 100;

export function chunkText(
  text: string,
  options: {
    readonly chunkSize?: number;
    readonly overlap?: number;
    readonly metadata?: Readonly<Record<string, unknown>>;
  } = {},
): readonly TextChunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const metadata = options.metadata ?? {};

  if (text.length <= chunkSize) {
    return [{ text, index: 0, metadata }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(". ", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + chunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }

    chunks.push({
      text: text.slice(start, end).trim(),
      index,
      metadata,
    });

    start = end - overlap;
    if (start >= text.length) break;
    index++;
  }

  return chunks;
}
