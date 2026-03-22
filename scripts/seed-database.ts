/**
 * Database Seeding Script
 *
 * Seeds the Supabase database with:
 * 1. Regulatory agencies (CFIA, Health Canada, CBSA, etc.)
 * 2. Regulations (SFCA, SFCR, FDA, FDR, CPLA, etc.)
 * 3. Regulation sections (actual law content)
 *
 * Usage: npx tsx scripts/seed-database.ts
 *
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - Database migrations already applied
 */

import { createClient } from "@supabase/supabase-js";
import { AGENCIES } from "../supabase/seed/agencies";
import { REGULATIONS } from "../supabase/seed/regulations";
import { REGULATION_SECTIONS } from "../supabase/seed/sections";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAgencies() {
  console.log("Seeding agencies...");

  for (const agency of AGENCIES) {
    const { error } = await supabase
      .from("agencies")
      .upsert(
        {
          name_en: agency.name_en,
          name_ko: agency.name_ko,
          acronym: agency.acronym,
          website_url: agency.website_url,
          jurisdiction: agency.jurisdiction,
          description_en: agency.description_en,
          description_ko: agency.description_ko,
        },
        { onConflict: "acronym" },
      );

    if (error) {
      console.error(`Failed to seed agency ${agency.acronym}:`, error.message);
    } else {
      console.log(`  + ${agency.acronym} - ${agency.name_en}`);
    }
  }
}

async function seedRegulations() {
  console.log("\nSeeding regulations...");

  // Get agency ID map
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, acronym");

  const agencyMap = new Map(
    (agencies ?? []).map((a: { id: string; acronym: string }) => [a.acronym, a.id]),
  );

  for (const reg of REGULATIONS) {
    const agencyId = agencyMap.get(reg.agency_acronym);
    if (!agencyId) {
      console.error(`  ! Agency not found: ${reg.agency_acronym}`);
      continue;
    }

    const { error } = await supabase
      .from("regulations")
      .upsert(
        {
          agency_id: agencyId,
          title_en: reg.title_en,
          title_ko: reg.title_ko,
          short_name: reg.short_name,
          statute_type: reg.statute_type,
          official_url: reg.official_url,
          gazette_citation: reg.gazette_citation,
          effective_date: reg.effective_date,
          last_amended: reg.last_amended,
          applies_to: [...reg.applies_to],
          is_active: true,
        },
        { onConflict: "short_name" },
      );

    if (error) {
      console.error(`  ! Failed to seed ${reg.short_name}:`, error.message);
    } else {
      console.log(`  + ${reg.short_name} - ${reg.title_en}`);
    }
  }
}

async function seedSections() {
  console.log("\nSeeding regulation sections...");

  // Get regulation ID map
  const { data: regulations } = await supabase
    .from("regulations")
    .select("id, short_name");

  const regMap = new Map(
    (regulations ?? []).map((r: { id: string; short_name: string }) => [r.short_name, r.id]),
  );

  for (const section of REGULATION_SECTIONS) {
    const regulationId = regMap.get(section.regulation_short_name);
    if (!regulationId) {
      console.error(`  ! Regulation not found: ${section.regulation_short_name}`);
      continue;
    }

    const { error } = await supabase
      .from("regulation_sections")
      .upsert(
        {
          regulation_id: regulationId,
          section_number: section.section_number,
          title_en: section.title_en,
          title_ko: section.title_ko,
          content_en: section.content_en,
          content_ko: section.content_ko,
          section_url: section.section_url,
          topics: [...section.topics],
          applies_to: [...section.applies_to],
          depth_level: section.depth_level,
          sort_order: section.sort_order,
        },
        { onConflict: "regulation_id,section_number" },
      );

    if (error) {
      console.error(
        `  ! Failed to seed ${section.regulation_short_name} ${section.section_number}:`,
        error.message,
      );
    } else {
      console.log(
        `  + ${section.regulation_short_name} ${section.section_number} - ${section.title_en}`,
      );
    }
  }
}

async function main() {
  console.log("=== Canada Food Compliance - Database Seeding ===\n");

  await seedAgencies();
  await seedRegulations();
  await seedSections();

  console.log("\n=== Seeding complete! ===");
  console.log(`  Agencies: ${AGENCIES.length}`);
  console.log(`  Regulations: ${REGULATIONS.length}`);
  console.log(`  Sections: ${REGULATION_SECTIONS.length}`);
  console.log("\nNext steps:");
  console.log("  1. Run 'npx tsx scripts/generate-embeddings.ts' to create vector embeddings");
  console.log("  2. Run 'npm run dev' to start the application");
}

main().catch(console.error);
