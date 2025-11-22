/* eslint-disable react/no-unescaped-entities */
"use client";
import { useMemo, useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [excerpt, setExcerpt] = useState<string | null>(null);

  const disabled = useMemo(() => !file || loading, [file, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setBullets(null);
    setExcerpt(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/summarize", { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "?chec du r?sum?");
      }
      const data = (await res.json()) as { bullets: string[]; excerpt: string; stats: { chars: number; sentences: number } };
      setBullets(data.bullets);
      setExcerpt(data.excerpt);
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }
  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }
  function downloadMarkdown() {
    const lines = [
      "# Extrait ? points cl?s",
      "",
      ...(bullets ?? []).map((b) => `- ${b}`),
      "",
      "## Extrait ? ins?rer",
      "",
      excerpt ?? ""
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extrait_chapitre.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <h1 style={{ marginTop: 0, fontSize: 32, lineHeight: 1.2 }}>Extrait de PDF ? pr?t pour un chapitre</h1>
      <p style={{ opacity: 0.85, marginTop: 8 }}>
        T?l?versez un PDF. Obtenez une synth?se en points cl?s et un extrait r?dig?, pr?t ? int?grer dans votre chapitre.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          htmlFor="file"
          style={{
            display: "block",
            padding: "24px 18px",
            border: "2px dashed #2b3456",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            cursor: "pointer"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "#132043",
                display: "grid",
                placeItems: "center",
                fontWeight: 700
              }}
            >
              PDF
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Glissez-d?posez votre PDF ici</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>ou cliquez pour choisir un fichier</div>
            </div>
          </div>
          <input id="file" type="file" accept="application/pdf" onChange={onPickFile} style={{ display: "none" }} />
        </label>
        {file ? (
          <div style={{ marginTop: 10, fontSize: 14, opacity: 0.9 }}>
            Fichier s?lectionn?: <b>{file.name}</b> ({Math.round(file.size / 1024)} ko)
          </div>
        ) : null}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={disabled}
            style={{
              background: disabled ? "#26325a" : "#3a5bff",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Analyse en cours?" : "Extraire l'essentiel"}
          </button>
          {bullets || excerpt ? (
            <>
              <button
                type="button"
                onClick={() => copy((bullets ?? []).map((b) => `- ${b}`).join("\n"))}
                style={{
                  background: "#182349",
                  color: "white",
                  border: "1px solid #2b3c7f",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Copier les points cl?s
              </button>
              <button
                type="button"
                onClick={() => copy(excerpt ?? "")}
                style={{
                  background: "#182349",
                  color: "white",
                  border: "1px solid #2b3c7f",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Copier l'extrait
              </button>
              <button
                type="button"
                onClick={downloadMarkdown}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "1px solid #3a5bff",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                T?l?charger (.md)
              </button>
            </>
          ) : null}
        </div>
      </form>

      {error ? (
        <div style={{ marginTop: 20, color: "#ffb4b4", background: "#3a1212", padding: 12, borderRadius: 10, border: "1px solid #5d1e1e" }}>
          {error}
        </div>
      ) : null}
      {bullets ? (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Points cl?s</h2>
          <ul style={{ lineHeight: 1.5, paddingLeft: 18 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ margin: "6px 0" }}>
                {b}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {excerpt ? (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Extrait r?dig? (ins?rable)</h2>
          <div
            style={{
              background: "#0e1839",
              border: "1px solid #20307a",
              borderRadius: 10,
              padding: 12,
              lineHeight: 1.6
            }}
          >
            {excerpt}
          </div>
        </section>
      ) : null}
    </main>
  );
}

