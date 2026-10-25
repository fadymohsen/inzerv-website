import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inzerv",
    short_name: "Inzerv",
    description:
      "Order Egyptian government documents online. Inzerv's team in Egypt handles the paperwork and delivers it to you.",
    start_url: "/en",
    display: "standalone",
    background_color: "#062544",
    theme_color: "#062544",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
