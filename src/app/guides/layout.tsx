import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Business Guides — OHMAZE",
  description:
    "Practical guides for starting and scaling a food business in Canada. Regulations, pricing, retail landscape, and import requirements — based on real data.",
  openGraph: {
    title: "Food Business Guides — OHMAZE",
    description:
      "Practical guides for starting and scaling a food business in Canada.",
    type: "website",
  },
};

export default function GuidesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
