import { createFileRoute } from "@tanstack/react-router";
import { HuespedView } from "@/components/HuespedView";

export const Route = createFileRoute("/huesped")({
  component: HuespedPage,
});

function HuespedPage() {
  return <HuespedView />;
}
