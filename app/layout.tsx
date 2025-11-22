export const metadata = {
  title: "Extracteur PDF ? Extrait de chapitre",
  description: "T?l?versez un PDF et obtenez l'essentiel, pr?t ? ins?rer."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji",
          backgroundColor: "#0b1020",
          color: "#e7eaf3",
          margin: 0
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 20px" }}>{children}</div>
      </body>
    </html>
  );
}

