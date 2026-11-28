import { ImageResponse } from "next/og";

// Home-screen icon built from the current "ICH" badge. Replace with the new logo when the client sends it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#24160f" }}>
        <div style={{ width: 138, height: 138, borderRadius: 999, border: "5px solid #c9a24b", display: "flex", alignItems: "center", justifyContent: "center", color: "#e6c987", fontSize: 50, fontWeight: 700, letterSpacing: 2, fontFamily: "serif" }}>
          ICH
        </div>
      </div>
    ),
    size,
  );
}
