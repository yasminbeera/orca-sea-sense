import { createFileRoute } from "@tanstack/react-router";
import { WeatherPage } from "@/components/orca/WeatherPage";

export const Route = createFileRoute("/weather-status")({
  head: () => ({
    meta: [
      { title: "Weather Status — ORCA Marine Intelligence" },
      {
        name: "description",
        content:
          "Regional marine weather status with observation map, temperature, rainfall and wind analytics.",
      },
      { property: "og:title", content: "Weather Status — ORCA Marine Intelligence" },
      {
        property: "og:description",
        content: "Regional marine weather status and observation map.",
      },
    ],
  }),
  component: () => <WeatherPage title="Weather Status" />,
});
