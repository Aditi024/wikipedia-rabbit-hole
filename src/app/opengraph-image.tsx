import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rabbit Hole - Wikipedia Adventures";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFAAFA",
          position: "relative",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(241,132,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(241,132,235,0.3) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              fontWeight: 800,
              color: "#EF3922",
              lineHeight: 0.9,
              letterSpacing: "-3px",
            }}
          >
            rabbit
          </div>
          <div
            style={{
              fontSize: "120px",
              fontWeight: 800,
              color: "#EF3922",
              lineHeight: 0.9,
              letterSpacing: "-3px",
            }}
          >
            hole.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: "rgba(26, 21, 32, 0.7)",
            marginTop: "32px",
            textAlign: "center",
          }}
        >
          Wander through Wikipedia. Find what you never knew you were looking
          for.
        </div>

        {/* Decorative dots */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {[
            "#6B7280",
            "#059669",
            "#2563EB",
            "#7C3AED",
            "#B45309",
          ].map((color) => (
            <div
              key={color}
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: color,
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
