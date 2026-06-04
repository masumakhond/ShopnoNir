import { ReactNode } from "react";

export function ResponsiveTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`scrollbar-thin -mx-1 overflow-x-auto px-1 text-zinc-100 ${className}`}>
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function MobileCardList({ children }: { children: ReactNode }) {
  return <div className="space-y-3 md:hidden">{children}</div>;
}

export function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function DesktopTable({ children }: { children: ReactNode }) {
  return <div className="hidden md:block">{children}</div>;
}
