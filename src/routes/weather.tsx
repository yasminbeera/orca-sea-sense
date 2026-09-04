import { createFileRoute } from "@tanstack/react-router";
import { WeatherPage } from "@/components/orca/WeatherPage";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Marine Weather — ORCA" },
      {
        name: "description",
        content:
          "Current marine weather, temperature, rainfall and wind charts for the Bay of Bengal and Andhra Pradesh coast.",
      },
      { property: "og:title", content: "Marine Weather — ORCA" },
      {
        property: "og:description",
        content: "Current conditions plus past, today and forecast marine weather charts.",
      },
    ],
  }),
  component: () => <WeatherPage title="Weather" />,
});
