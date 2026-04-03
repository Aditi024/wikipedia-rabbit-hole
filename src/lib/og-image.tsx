import { ImageResponse } from "next/og";
import { COLORS } from "./config";

const SYNE_FONT_URL =
  "https://fonts.gstatic.com/s/syne/v24/8vIS7w4qzmVxsWxjBZRjr0FKM_24vj6k.ttf";

export const ogSize = { width: 1200, height: 630 };

export async function renderOgImage() {
  const syneBold = await fetch(SYNE_FONT_URL).then((res) => res.arrayBuffer());

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
          background: COLORS.background,
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
              color: COLORS.brand,
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
              color: COLORS.brand,
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
      ...ogSize,
      fonts: [
        {
          name: "Syne",
          data: syneBold,
          style: "normal" as const,
          weight: 800 as const,
        },
      ],
    }
  );
}
