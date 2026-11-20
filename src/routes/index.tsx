import { createFileRoute } from "@tanstack/react-router";
import { FreesideApp } from "@/components/freeside-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <FreesideApp />;
}
