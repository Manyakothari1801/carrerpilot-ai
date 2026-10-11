import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, SkeletonCards } from '../components/IntelligenceUI';
import { useCareerCounterfactual, useCareerExplanation, useCareerIntelligenceOptions, useCareerSimulation } from '../features/career/api';
import { formatPercentFraction } from '../features/career/chart';

type Tab = 'explain' | 'simulate' | 'counterfactual';

export function CareerTwinPage() {
  const [tab, setTab] = useState<Tab>('explain');
  const [skills, setSkills] = useState<string[]>([]);
  const [targetCareer, setTargetCareer] = useState('');
  const explanation = useCareerExplanation();
  const options = useCareerIntelligenceOptions();
  const simulation = useCareerSimulation();
  const counterfactual = useCareerCounterfactual();
  const selectedTarget = targetCareer || options.data?.careers[0] || '';
  const comparison = useMemo(() => {
    const before = simulation.data?.before ?? [];
    return before.map((item) => ({ career: item.career, before: item.confidence, simulated: simulation.data?.simulated.find((value) => value.career === item.career)?.confidence ?? null }));
  }, [simulation.data]);

  const toggle = (skill: string) => setSkills((current) => current.includes(skill) ? current.filter((value) => value !== skill) : [...current, skill]);

  return <main className="page">
    <p className="eyebrow text-violet-300">CareerTwin AI · Research prototype</p>
    <h1 className="page-title">Career Simulation Lab</h1>
    <p className="page-subtitle">Explore how hypothetical skill changes affect your trained career-recommendation model.</p>

    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="CareerTwin tools">
      <TabButton active={tab === 'explain'} onClick={() => setTab('explain')}>Explain</TabButton>
      <TabButton active={tab === 'simulate'} onClick={() => setTab('simulate')}>What-if Simulation</TabButton>
      <TabButton active={tab === 'counterfactual'} onClick={() => setTab('counterfactual')}>Counterfactual Path</TabButton>
    </div>

    <aside className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/5 p-3 text-sm text-slate-300">
      Simulation only · No saved profile changes · Model confidence is not an employment or career-success probability.
    </aside>
    <div className="mt-4 flex flex-wrap gap-2"><Link className="secondary-button" to="/student/ai-interview">Open AI Mock Interview</Link><Link className="secondary-button" to="/student/career-copilot">Open Career Copilot</Link></div>

    {tab === 'explain' && <section className="mt-5">
      {explanation.isLoading ? <SkeletonCards /> : explanation.isError ? <EmptyState title="Career intelligence is unavailable" copy="The model explanation service is temporarily unavailable. No fallback explanation was generated." /> : explanation.data ? <>
        <div className="grid gap-4 lg:grid-cols-3">{explanation.data.recommendations.map((item, index) => <article className="research-card" key={item.career}>
          <div className="flex items-center justify-between gap-3"><span className="pill">Rank {index + 1}</span><strong className="text-violet-300">{formatPercentFraction(item.confidence)}</strong></div>
          <h2 className="mt-3 text-lg font-semibold">{item.career}</h2>
          <p className="mt-1 text-xs text-slate-500">Actual model confidence</p>
          <h3 className="mt-4 text-sm font-semibold text-emerald-300">Supporting model signals</h3>
          {item.supportingSignals.length ? <ul className="mt-2 space-y-2 text-sm text-slate-300">{item.supportingSignals.map((signal) => <li key={signal.feature}>+ {signal.feature} <span className="text-slate-500">({signal.contribution.toFixed(4)})</span></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No positive active feature contribution was available.</p>}
          {item.limitingSignals.length > 0 && <><h3 className="mt-4 text-sm font-semibold text-rose-300">Limiting active signals</h3><ul className="mt-2 space-y-2 text-sm text-slate-400">{item.limitingSignals.map((signal) => <li key={signal.feature}>− {signal.feature} <span className="text-slate-500">({signal.contribution.toFixed(4)})</span></li>)}</ul></>}
        </article>)}</div>
        <p className="mt-4 text-xs text-slate-500">{explanation.data.disclaimer} · {explanation.data.modelVersion} · {explanation.data.featureSchemaVersion}</p>
      </> : null}
    </section>}

    {tab === 'simulate' && <section className="mt-5 grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
      <article className="research-card">
        <h2 className="text-lg font-semibold">Hypothetical skills</h2>
        <p className="mt-2 text-sm text-slate-400">Select taxonomy skills to add to a temporary in-memory copy of your profile.</p>
        {options.isLoading ? <div className="skeleton mt-4 h-32" /> : options.isError ? <p className="error-message mt-4">Career intelligence options could not be loaded.</p> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{options.data?.actionableSkills.map((skill) => <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm" key={skill}><input type="checkbox" checked={skills.includes(skill)} onChange={() => toggle(skill)} /><span>{skill}</span></label>)}</div>}
        <button className="primary-button mt-4 bg-violet-500 text-white hover:bg-violet-400" disabled={!skills.length || simulation.isPending} onClick={() => simulation.mutate(skills.map((name) => ({ name, proficiency: 'INTERMEDIATE' })))}>{simulation.isPending ? 'Running simulation…' : 'Run Simulation'}</button>
        <button className="secondary-button ml-2 mt-4" onClick={() => { setSkills([]); simulation.reset(); }}>Reset</button>
        {simulation.isError && <p className="error-message mt-4">Career intelligence service is temporarily unavailable.</p>}
      </article>
      <article className="research-card min-w-0">
        <h2 className="text-lg font-semibold">Before vs simulated model output</h2>
        {simulation.data ? <><div className="mt-4 h-72" role="img" aria-label="Before and simulated career model confidence comparison"><ResponsiveContainer width="100%" height="100%"><BarChart data={comparison} layout="vertical" margin={{ left: 24, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#272b3a"/><XAxis type="number" domain={[0,1]} tickFormatter={(value) => formatPercentFraction(Number(value))}/><YAxis type="category" dataKey="career" width={145}/><Tooltip formatter={(value) => [formatPercentFraction(Number(value)), 'Model confidence']}/><Legend/><Bar dataKey="before" fill="#6366f1" name="Before"/><Bar dataKey="simulated" fill="#8b5cf6" name="Simulated"/></BarChart></ResponsiveContainer></div><ComparisonText rows={comparison}/><p className="mt-3 text-xs text-slate-500">{simulation.data.disclaimer} · {simulation.data.modelVersion}</p></> : <EmptyState title="No simulation yet" copy="Select at least one hypothetical skill and run the trained model." />}
      </article>
    </section>}

    {tab === 'counterfactual' && <section className="mt-5 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <article className="research-card">
        <label className="field-label">Target career<select className="input" value={selectedTarget} onChange={(event) => setTargetCareer(event.target.value)}>{options.data?.careers.map((career) => <option value={career} key={career}>{career}</option>)}</select></label>
        <p className="mt-3 text-sm text-slate-400">Searches deterministic combinations of up to three missing taxonomy skills and prefers the sparsest improving intervention.</p>
        <button className="primary-button mt-4 bg-violet-500 text-white hover:bg-violet-400" disabled={!selectedTarget || counterfactual.isPending} onClick={() => counterfactual.mutate({ targetCareer: selectedTarget, maxChanges: 3 })}>{counterfactual.isPending ? 'Searching…' : 'Find Actionable Path'}</button>
        {counterfactual.isError && <p className="error-message mt-4">Career intelligence service is temporarily unavailable.</p>}
      </article>
      <article className="research-card">
        <h2 className="text-lg font-semibold">Personalized intervention</h2>
        {!counterfactual.data ? <EmptyState title="No path calculated" copy="Choose a target career and run the constrained model search." /> : !counterfactual.data.found ? <EmptyState title="No meaningful path found" copy={counterfactual.data.disclaimer} /> : <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><Evidence label="Current confidence" value={formatPercentFraction(counterfactual.data.currentConfidence)}/><Evidence label="Simulated confidence" value={formatPercentFraction(counterfactual.data.simulatedConfidence!)}/><Evidence label="Confidence change" value={`+${formatPercentFraction(counterfactual.data.confidenceDelta!)}`}/></div>
          <p className="mt-4 text-sm text-slate-300">Rank {counterfactual.data.currentRank} → {counterfactual.data.simulatedRank}. Proposed changes: {counterfactual.data.proposedSkills.length}.</p>
          <div className="mt-4 flex flex-wrap gap-2">{counterfactual.data.proposedSkills.map((skill) => <span className="skill-chip border-violet-400/30 bg-violet-400/10 text-violet-100" key={skill.name}>{skill.name} · {skill.proficiency}</span>)}</div>
          <div className="mt-5 flex flex-wrap gap-2"><Link className="secondary-button" to="/student/career-plan">Review roadmap</Link><Link className="secondary-button" to="/student/assessments">Browse assessments</Link></div>
          <p className="mt-4 text-xs text-slate-500">Recommendations only; no proficiency, roadmap status, readiness, or assessment score was changed. {counterfactual.data.disclaimer}</p>
        </>}
      </article>
    </section>}
  </main>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick(): void; children: React.ReactNode }) { return <button role="tab" aria-selected={active} className={`secondary-button ${active ? 'border-violet-400 bg-violet-400/10 text-violet-200' : ''}`} onClick={onClick}>{children}</button>; }
function Evidence({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-slate-500">{label}</p><strong className="mt-1 block text-xl text-violet-200">{value}</strong></div>; }
function ComparisonText({ rows }: { rows: { career: string; before: number; simulated: number | null }[] }) { return <div className="sr-only">{rows.map((row) => <p key={row.career}>{row.career}: before {formatPercentFraction(row.before)}, simulated {row.simulated == null ? 'unavailable' : formatPercentFraction(row.simulated)}</p>)}</div>; }
