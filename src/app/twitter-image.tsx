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
          padding: "80px 100px",
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
            gap: "0px",
          }}
        >
          <div
            style={{
              fontSize: "110px",
              fontWeight: 800,
              color: "#EF3922",
              lineHeight: 0.95,
              letterSpacing: "-3px",
            }}
          >
            rabbit
          </div>
          <div
            style={{
              fontSize: "110px",
              fontWeight: 800,
              color: "#EF3922",
              lineHeight: 0.95,
              letterSpacing: "-3px",
            }}
          >
            hole.
          </div>
        </div>

        <div
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "rgba(26, 21, 32, 0.55)",
            marginTop: "28px",
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
