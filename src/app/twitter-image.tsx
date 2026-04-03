import { renderOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Rabbit Hole — Wander through Wikipedia";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
