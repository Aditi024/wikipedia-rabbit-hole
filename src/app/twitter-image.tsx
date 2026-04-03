import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rabbit Hole — Wander through Wikipedia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const syneBold = await fetch(
    "https://fonts.gstatic.com/s/syne/v24/8vIS7w4qzmVxsWxjBZRjr0FKM_24vj6k.ttf"
  ).then((res) => res.arrayBuffer());

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
          fontFamily: "Syne",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(241,132,235,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(241,132,235,0.25) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "140px",
              fontWeight: 800,
              color: "#EF3922",
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            rabbit hole.
          </div>
        </div>

        <div
          style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "rgba(26, 21, 32, 0.6)",
            marginTop: "24px",
            letterSpacing: "-0.5px",
          }}
        >
          Wander through Wikipedia.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Syne",
          data: syneBold,
          style: "normal",
          weight: 800,
        },
      ],
    }
  );
}
