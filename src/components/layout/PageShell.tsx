import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#f1c7a6]/60 blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[#b9d7d3]/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f8e6cc]/80 blur-3xl" />
      </div>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-14">
        {children}
      </main>
    </div>
  );
}
