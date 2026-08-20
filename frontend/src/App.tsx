import { motion } from 'framer-motion'

const foundations = ['Secure API foundation', 'PostgreSQL + Flyway', 'Modular architecture']

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="text-lg font-semibold tracking-tight">CareerPilot <span className="text-cyan-400">AI</span></div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Foundation ready</span>
        </header>
        <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">Career intelligence for students</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">Build the skills that move your career forward.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">CareerPilot AI will bring resume insight, job matching, learning plans, and fair assessments into one focused platform.</p>
          </motion.div>
          <aside className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <p className="text-sm font-medium text-slate-300">Phase 1</p>
            <h2 className="mt-2 text-2xl font-semibold">A production-minded foundation</h2>
            <ul className="mt-6 space-y-4">
              {foundations.map((item) => <li className="flex items-center gap-3 text-slate-200" key={item}><span className="h-2 w-2 rounded-full bg-cyan-400" />{item}</li>)}
            </ul>
          </aside>
        </section>
        <footer className="border-t border-white/10 pt-6 text-sm text-slate-500">CareerPilot AI · Phase 1 application shell</footer>
      </div>
    </main>
  )
}
