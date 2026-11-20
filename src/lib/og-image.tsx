import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function buildOgImage(title: string, description: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#031A30",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#19B8C2",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              background: "#19B8C2",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#031A30",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: -1,
            }}
          >
            iz
          </div>
          <span
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            Inzerv
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 920,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 26,
            marginTop: 24,
            maxWidth: 820,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            color: "rgba(255,255,255,0.35)",
            fontSize: 20,
            letterSpacing: 0.5,
          }}
        >
          inzerv.com
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#19B8C2",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
