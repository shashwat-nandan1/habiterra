import { Link, useRouterState } from "@tanstack/react-router";
import { Sprout, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/today", label: "Today", icon: Sprout },
  { to: "/world", label: "World", icon: Globe },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-3 px-2 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-2xl text-xs font-semibold transition-colors",
                active ? "text-primary bg-primary-soft" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
