import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

function ErrorPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="text-7xl">🔒</div>
        <h1 className="text-2xl font-black">Oops, this garden is locked</h1>
        <p className="text-muted-foreground">You need to be signed in to view this page.</p>
        <Link
          to="/"
          className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold soft-shadow"
        >
          Go to welcome page
        </Link>
      </div>
    </div>
  );
}
