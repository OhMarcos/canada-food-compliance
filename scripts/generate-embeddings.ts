/**
 * Embedding Generation Script
 *
 * Generates vector embeddings for all regulation sections
 * and stores them in the regulation_chunks table for RAG retrieval.
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 *
 * Prerequisites:
 * - OPENAI_API_KEY in .env.local
 * - Database seeded with regulation sections
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

if (!openaiKey) {
  console.error("Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;
const EMBEDDING_MODEL = "text-embedding-3-small";

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(". ", end);
      if (lastPeriod > start + CHUNK_SIZE * 0.5) {
        end = lastPeriod + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }

  return chunks;
}

async function generateEmbedding(texts: string[]): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      input: texts,
      model: EMBEDDING_MODEL,
      dimensions: 1536,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

async function main() {
  console.log("=== Generating Embeddings for Regulation Chunks ===\n");

  // Get all sections
  const { data: sections, error } = await supabase
    .from("regulation_sections")
    .select("id, section_number, content_en, regulation_id")
    .order("sort_order");

  if (error || !sections) {
    console.error("Failed to fetch sections:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${sections.length} regulation sections\n`);

  // Clear existing chunks
  await supabase.from("regulation_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Cleared existing chunks\n");

  let totalChunks = 0;
  const batchSize = 20;
  const allChunks: { section_id: string; chunk_text: string; chunk_index: number; metadata: Record<string, unknown> }[] = [];

  // Create chunks for all sections
  for (const section of sections) {
    const chunks = chunkText(section.content_en);
    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({
        section_id: section.id,
        chunk_text: chunks[i],
        chunk_index: i,
        metadata: {
          section_number: section.section_number,
          regulation_id: section.regulation_id,
        },
      });
    }
  }

  console.log(`Created ${allChunks.length} text chunks\n`);

  // Generate embeddings in batches
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.chunk_text);

    try {
      const embeddings = await generateEmbedding(texts);

      // Insert chunks with embeddings
      for (let j = 0; j < batch.length; j++) {
        const { error: insertError } = await supabase
          .from("regulation_chunks")
          .insert({
            section_id: batch[j].section_id,
            chunk_text: batch[j].chunk_text,
            chunk_index: batch[j].chunk_index,
            embedding: embeddings[j] as unknown as string,
            metadata: batch[j].metadata,
          });

        if (insertError) {
          console.error(`  ! Failed to insert chunk:`, insertError.message);
        }
      }

      totalChunks += batch.length;
      console.log(`  Processed ${totalChunks}/${allChunks.length} chunks`);

      // Rate limit: small delay between batches
      if (i + batchSize < allChunks.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`  ! Batch embedding failed:`, err);
    }
  }

  console.log(`\n=== Embedding generation complete! ===`);
  console.log(`  Total chunks with embeddings: ${totalChunks}`);
}

main().catch(console.error);
