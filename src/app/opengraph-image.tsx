import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} · ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "radial-gradient(circle at 85% 0%, #3b2a6b 0%, #121118 55%)",
          color: "#f5f4fa",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#8e8aa3" }}>
          ~/<span style={{ color: "#f5f4fa" }}>kaneko</span>
          <span style={{ color: "#a78bfa" }}>_</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ marginTop: 24, fontSize: 30, color: "#c4b5fd" }}>{site.role}</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#aba8bc" }}>{site.tagline}</div>
        </div>
        <div
          style={{
            display: "flex",
            height: 4,
            width: "100%",
            background: "linear-gradient(90deg, #c4b5fd, #8b5cf6, #a78bfa)",
            borderRadius: 4,
          }}
        />
      </div>
    ),
    size,
  );
}
