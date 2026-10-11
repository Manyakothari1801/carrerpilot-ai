import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, ProgressRing } from '../components/IntelligenceUI';
import { useCareerPlan, useUpdateRoadmap } from '../features/career/api';
import { careerLabel as label } from '../features/career/format';
import type { RoadmapStatus, SkillGapItem } from '../features/career/types';

const statuses: RoadmapStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'READY'];

export function CareerPlanPage() {
  const plan = useCareerPlan();
  const update = useUpdateRoadmap();
  if (plan.isLoading) return <main className="page"><div className="skeleton h-64" /></main>;
  if (plan.isError) return <main className="page"><p className="error-message">Career plan could not be loaded.</p></main>;
  const data = plan.data;
  if (!data) return <main className="page"><EmptyState title="No career plan selected" copy="Discover careers and choose Build Career Plan." action={<Link to="/student/careers" className="primary-button inline-flex">Discover Careers</Link>} /></main>;

  const stages = new Map<number, typeof data.roadmap>();
  data.roadmap.forEach((item) => stages.set(item.stageOrder, [...(stages.get(item.stageOrder) ?? []), item]));

  return <main className="page">
    <p className="eyebrow">Persisted development plan</p>
    <h1 className="page-title">{data.selectedCareer}</h1>
    <p className="page-subtitle">{data.taxonomyVersion} · Roadmap task statuses are marked by you, not automatic proof of skill mastery.</p>

    <section className="mt-6 grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
      <article className="card flex flex-col items-center justify-center">
        <ProgressRing value={data.placementReadiness.score} label="Placement Readiness" />
        <h2 className="mt-3 font-semibold">Placement Readiness</h2>
        <p className="mt-2 text-center text-xs leading-5 text-slate-400">Placement Readiness is a deterministic preparation indicator. It is not a prediction of hiring or placement probability.</p>
      </article>
      <article className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">Readiness breakdown</h2>
          <div className="text-right">
            <strong>{data.progressPercentage}% roadmap tasks marked Ready</strong>
            <p className="mt-1 text-xs text-slate-500">Based on roadmap statuses you marked.</p>
          </div>
        </div>
        <div className="mt-3 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.placementReadiness.components.filter((component) => component.score != null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{data.placementReadiness.components.map((component) => <div className="rounded-xl border border-white/10 p-3" key={component.key}>
          <div className="flex justify-between gap-3"><strong className="text-sm">{component.label}</strong><span>{component.score == null ? 'Unavailable' : `${component.score}%`}</span></div>
          <p className="mt-1 text-xs text-slate-500">{component.evidence}</p>
          <p className="mt-1 text-[11px] text-slate-600">{component.score == null ? `${component.configuredWeight}% configured weight excluded` : `${component.effectiveWeight}% effective weight`}</p>
        </div>)}</div>
      </article>
    </section>

    <section className="card mt-5">
      <div className="flex justify-between gap-3"><h2 className="text-lg font-semibold">Career skill coverage</h2><strong className="text-2xl text-violet-300">{data.skillGap.score}%</strong></div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SkillGroup title="Needs improvement" values={data.skillGap.needsImprovement} />
        <SkillGroup title="Missing core" values={data.skillGap.missingCore} />
        <SkillGroup title="Missing supporting" values={data.skillGap.missingSupporting} />
      </div>
    </section>

    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-xl font-semibold">Roadmap</h2><p className="mt-1 text-xs text-slate-500">Statuses are self-tracked and do not verify skill mastery or placement readiness.</p></div>
        <span className="pill">{data.progressPercentage}% roadmap tasks marked Ready</span>
      </div>
      <div className="mt-4 space-y-5">{[...stages.entries()].map(([number, items]) => <div key={number}>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-300">{number}. {items[0].stageName}</h3>
        <div className="grid gap-3 xl:grid-cols-2">{items.map((item) => <article className="card" key={item.id}>
          <div className="flex gap-3"><h4 className="flex-1 font-semibold">{item.topic}</h4><span className="pill">{label(item.status)}</span></div>
          <p className="mt-2 text-sm text-slate-400">{item.whyItMatters}</p>
          <p className="mt-2 text-sm text-violet-200">{item.nextAction}</p>
          <p className="mt-2 text-[11px] text-slate-600">Source: {label(item.statusSource)}</p>
          <div className="mt-3 flex flex-wrap gap-2">{statuses.map((status) => <button className={`secondary-button ${item.status === status ? 'border-violet-400 text-violet-200' : ''}`} disabled={update.isPending} key={status} onClick={() => update.mutate({ id: item.id, status })}>{label(status)}</button>)}</div>
        </article>)}</div>
      </div>)}</div>
    </section>

    <section className="card mt-6">
      <h2 className="text-lg font-semibold">Next Actions</h2>
      {data.nextActions.length ? <ul className="mt-3 grid gap-3 md:grid-cols-2">{data.nextActions.map((action) => <li className="rounded-xl bg-white/5 p-3 text-sm text-slate-300" key={action}>→ {action}</li>)}</ul> : <p className="mt-3 text-slate-400">All current roadmap tasks are marked Ready.</p>}
    </section>
  </main>;
}

function SkillGroup({ title, values }: { title: string; values: SkillGapItem[] }) {
  return <div><h3 className="text-sm font-semibold">{title} <span className="text-slate-500">({values.length})</span></h3><div className="mt-3 flex flex-wrap gap-2">{values.length ? values.map((item) => <span className="skill-chip" key={item.skill}>{item.skill}{item.proficiency ? ` · ${label(item.proficiency)}` : ''}</span>) : <span className="text-sm text-slate-500">None</span>}</div></div>;
}
