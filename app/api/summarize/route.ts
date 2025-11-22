import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// pdf-parse has no perfect types; import as any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { buildSummary } from "@/lib/summarize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Dynamic import to avoid build-time side effects
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { default: pdfParse } = await import("pdf-parse");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new NextResponse("Aucun fichier fourni (cl? 'file').", { status: 400 });
    }
    if (!file.type.includes("pdf")) {
      return new NextResponse("Le fichier doit ?tre un PDF.", { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const text: string = parsed.text ?? "";
    if (!text.trim()) {
      return new NextResponse("Impossible d'extraire du texte de ce PDF.", { status: 422 });
    }
    const { bullets, excerpt, stats } = buildSummary(text);
    return NextResponse.json({ bullets, excerpt, stats });
  } catch (err: any) {
    console.error("Summarize error:", err);
    return new NextResponse(`Erreur: ${err?.message ?? "inconnue"}`, { status: 500 });
  }
}

