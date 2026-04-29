'use client';

import Link from "next/link";
import { useState } from "react";

import type { ContentStatus, VisualCheckStatus } from "@/lib/types";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/85">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  className,
  ...props
}: Readonly<
  {
    children: React.ReactNode;
    href?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    className?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" &&
      "bg-cyan-300 text-slate-950 shadow-[0_14px_30px_rgba(103,232,249,0.28)]",
    variant === "secondary" && "bg-white/10 text-white ring-1 ring-white/12",
    variant === "ghost" && "bg-transparent text-slate-200 ring-1 ring-white/10",
    variant === "danger" && "bg-rose-400/90 text-slate-950",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  help,
}: Readonly<{
  label: string;
  value: string | number;
  help: string;
}>) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="text-sm text-slate-300">{help}</p>
    </Card>
  );
}

export function Field({
  label,
  hint,
  children,
}: Readonly<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}>) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      <span className="font-medium text-white">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-6 text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function textInputClassName() {
  return "min-h-11 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20";
}

export function statusClassName(status: ContentStatus | VisualCheckStatus) {
  if (status === "approved" || status === "pass") {
    return "bg-emerald-400/16 text-emerald-200 ring-1 ring-emerald-300/20";
  }

  if (status === "exported") {
    return "bg-cyan-400/16 text-cyan-200 ring-1 ring-cyan-300/20";
  }

  if (status === "posted") {
    return "bg-violet-400/16 text-violet-200 ring-1 ring-violet-300/20";
  }

  if (status === "warning") {
    return "bg-amber-400/16 text-amber-100 ring-1 ring-amber-300/20";
  }

  if (status === "fail") {
    return "bg-rose-400/16 text-rose-100 ring-1 ring-rose-300/20";
  }

  return "bg-white/8 text-slate-200 ring-1 ring-white/10";
}

export function Badge({
  children,
  tone = "default",
}: Readonly<{
  children: React.ReactNode;
  tone?: "default" | "accent";
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "accent"
          ? "bg-cyan-300/14 text-cyan-200 ring-1 ring-cyan-300/20"
          : "bg-white/8 text-slate-200 ring-1 ring-white/10",
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
}: Readonly<{
  status: ContentStatus | VisualCheckStatus;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
        statusClassName(status),
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function CopyButton({
  value,
  label = "Copy",
}: Readonly<{
  value: string;
  label?: string;
}>) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? "Copied" : label}
    </Button>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description: string;
  action?: React.ReactNode;
}>) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {action}
    </Card>
  );
}
