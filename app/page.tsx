export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]"
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-between px-6 py-12 sm:px-10 sm:py-16">
        <header className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium tracking-tight text-zinc-400">
            Omnivate
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-10 py-20">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              In development
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
              ROI Calculator
            </h1>
          </div>

          <p className="max-w-xl text-balance text-lg leading-relaxed text-zinc-400">
            A transparent model of the cold email funnel. Enter your numbers,
            see the projected revenue lift, and understand exactly how each
            stage compounds.
          </p>

          <div className="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-mono text-zinc-600">Phase 2 of 5</span>
            <span className="hidden text-zinc-700 sm:inline">·</span>
            <span>Tooling and infrastructure</span>
          </div>
        </section>

        <footer className="flex flex-col gap-1 text-xs text-zinc-600">
          <p>roi.omnivate.ai</p>
          <p>Built by Omnivate AI</p>
        </footer>
      </main>
    </div>
  );
}
