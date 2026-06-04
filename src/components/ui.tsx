import Link from "next/link";
import { ReactNode } from "react";

/** Dark card — white body text by default */
const cardBase =
  "rounded-2xl border border-zinc-700/80 bg-zinc-900 p-4 text-zinc-100 shadow-lg shadow-black/50 sm:p-5";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${cardBase} ${className}`}>{children}</div>;
}

/** Mini stat box inside cards */
export function StatBox({
  label,
  value,
  variant = "default",
  className = "",
}: {
  label: string;
  value: ReactNode;
  variant?: "default" | "profit" | "info";
  className?: string;
}) {
  const valueColor =
    variant === "profit"
      ? "text-amber-400"
      : variant === "info"
        ? "text-sky-400"
        : "text-white";
  return (
    <div
      className={`rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2 ${className}`}
    >
      <span className="block text-xs text-zinc-400">{label}</span>
      <span className={`mt-0.5 block font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}

const statVariants = {
  dark: {
    gradient: "from-zinc-800 via-zinc-900 to-black",
    label: "text-zinc-400",
    value: "text-white",
    hint: "text-zinc-500",
    ring: "ring-zinc-700",
  },
  gold: {
    gradient: "from-amber-500 via-yellow-500 to-amber-600",
    label: "text-amber-950/70",
    value: "text-amber-950",
    hint: "text-amber-950/60",
    ring: "ring-amber-400/50",
  },
  slate: {
    gradient: "from-zinc-700 via-zinc-800 to-zinc-900",
    label: "text-zinc-300",
    value: "text-white",
    hint: "text-zinc-400",
    ring: "ring-zinc-600",
  },
  accent: {
    gradient: "from-zinc-900 via-zinc-950 to-black",
    label: "text-sky-400/90",
    value: "text-amber-400",
    hint: "text-zinc-500",
    ring: "ring-amber-500/25",
  },
  members: {
    gradient: "from-sky-800/90 via-zinc-900 to-zinc-950",
    label: "text-sky-200/80",
    value: "text-white",
    hint: "text-sky-200/50",
    ring: "ring-sky-500/35",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  variant = "dark",
  highlight = false,
}: {
  label: string;
  value: string;
  hint?: string;
  variant?: keyof typeof statVariants;
  highlight?: boolean;
}) {
  const v = statVariants[variant];
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${v.gradient} p-4 shadow-xl sm:p-5 ${
        highlight ? `ring-2 ${v.ring} shadow-2xl` : `ring-1 ${v.ring}`
      }`}
    >
      <p className={`text-sm font-semibold ${v.label}`}>{label}</p>
      <p
        className={`mt-1 font-bold tracking-tight ${v.value} ${
          highlight ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
      {hint ? <p className={`mt-1.5 text-xs ${v.hint}`}>{hint}</p> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {title ? <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2> : null}
        {subtitle ? <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "muted" | "info";
}) {
  const tones = {
    default: "bg-zinc-800 text-zinc-200 ring-zinc-600",
    success: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    warning: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
    muted: "bg-zinc-800/80 text-zinc-500 ring-zinc-700",
    info: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary:
      "bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-300",
    secondary:
      "border border-zinc-600 bg-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300",
    danger: "bg-red-600 text-white shadow-md hover:bg-red-500",
  };
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:text-sm";

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-400">{label}</span>
      <input {...props} className={`${inputClass} ${props.className ?? ""}`} />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-400">{label}</span>
      <select {...props} className={`${inputClass} ${props.className ?? ""}`}>
        {children}
      </select>
    </label>
  );
}

export const formErrorClass = "text-sm text-red-400";
export const cardTitleClass = "text-lg font-bold text-white";
export const cardHeadingClass = "font-bold text-white";
export const linkClass = "text-amber-400 hover:text-amber-300 hover:underline";
export const mutedTextClass = "text-sm text-zinc-400";
export const profitTextClass = "font-semibold text-amber-400";
