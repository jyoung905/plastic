'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui";
import { selectCurrentCharacter } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/project/new", label: "Project" },
  { href: "/character/setup", label: "Character" },
  { href: "/calendar", label: "Calendar" },
  { href: "/checker", label: "Checker" },
  { href: "/export", label: "Export" },
  { href: "/settings", label: "Settings" },
];

export function AppFrame({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { state } = usePersistentAppState();
  const activeCharacter = selectCurrentCharacter(state);
  const approved = state.contentItems.filter((item) => item.status === "approved").length;
  const exported = state.contentItems.filter((item) => item.status === "exported").length;
  const posted = state.contentItems.filter((item) => item.status === "posted").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#17476a_0%,#07111f_40%,#020617_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.16),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.12),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 rounded-[28px] border border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Link href="/" className="inline-flex items-center gap-3 text-white">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-base font-bold text-slate-950">
                    CC
                  </span>
                  <span>
                    <span className="block text-base font-semibold tracking-tight">
                      Consistent Creator
                    </span>
                    <span className="block text-xs uppercase tracking-[0.24em] text-slate-400">
                      Local-first TikTok engine
                    </span>
                  </span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{state.settings.lastGenerator ?? "mock-ready"}</Badge>
                <Badge>{state.project?.accountName || "no project yet"}</Badge>
                <Badge>{activeCharacter?.name || "no character yet"}</Badge>
              </div>
            </div>
            <nav className="flex snap-x gap-2 overflow-x-auto pb-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`snap-start rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-cyan-300 text-slate-950"
                        : "bg-white/6 text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
                {state.contentItems.length} total items
              </div>
              <div className="rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
                {approved} approved
              </div>
              <div className="rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
                {exported} exported
              </div>
              <div className="rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/8">
                {posted} posted
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 py-6">{children}</main>
      </div>
    </div>
  );
}
