import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/world")({
  component: World,
});

function World() {
  return (
    <div className="min-h-dvh max-w-md mx-auto px-5 pt-10 pb-28 text-center">
      <h1 className="text-4xl font-black text-primary">World</h1>
      <div className="mt-10 text-7xl">🌍</div>
      <p className="mt-6 font-bold text-lg">Coming soon</p>
      <p className="mt-1 text-muted-foreground">Soon you'll be able to visit your friends' gardens here.</p>
      <BottomNav />
    </div>
  );
}
