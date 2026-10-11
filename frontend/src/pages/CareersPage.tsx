import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, SkeletonCards } from '../components/IntelligenceUI';
import { useCareerExplanation, useCareerHistory, useCareerReadiness, useCareerRecommendation, useCreateCareerPlan, useDiscoverCareers } from '../features/career/api';
import { formatPercentFraction, recommendationAxisMaximum } from '../features/career/chart';

export function CareersPage() {
  const readiness = useCareerReadiness();
  const history = useCareerHistory();
  const discover = useDiscoverCareers();
  const createPlan = useCreateCareerPlan();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const id = selected || discover.data?.id || history.data?.[0]?.id;
  const detail = useCareerRecommendation(id);
  const data = detail.data;
  const explanation = useCareerExplanation();
  const confidenceMax = recommendationAxisMaximum(data?.recommendations.map((item) => item.confidence) ?? []);

  if (readiness.isLoading) return <main className="page"><SkeletonCards /></main>;

  return <main className="page">
    <p className="eyebrow">Profile-based trained ML</p>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title">Career discovery</h1>
        <p className="page-subtitle">Explore ranked career directions from your saved profile. Model confidence is not hiring or career-success probability.</p>
      </div>
      <button className="primary-button" disabled={!readiness.data?.ready || discover.isPending} onClick={() => discover.mutate()}>
        {discover.isPending ? 'Discovering…' : 'Discover Careers'}
      </button>
    </div>

    {readiness.isError && <p className="error-message mt-6">Career readiness could not be loaded.</p>}
    {readiness.data && !readiness.data.ready && <EmptyState title="Complete your profile first" copy={`Missing: ${readiness.data.missingFields.join(', ')}`} action={<Link className="primary-button inline-flex" to="/student/profile">Open Profile</Link>} />}
    {discover.isError && <p className="error-message mt-6">The ML service is unavailable or the recommendation could not be created. Existing history remains available.</p>}

    {data && <>
      <section className="card mt-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Recommendation confidence</h2>
            <p className="mt-1 text-xs text-slate-500">{data.modelVersion} · {data.featureSchemaVersion}</p>
          </div>
          <span className="pill">Model confidence</span>
        </div>
        <div className="mt-4 h-60" role="img" aria-label="Career recommendation confidence chart with a dynamically labelled percentage axis">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.recommendations} margin={{ left: 20, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, confidenceMax]} tickFormatter={(value) => formatPercentFraction(Number(value))} stroke="#94a3b8" />
              <YAxis type="category" dataKey="career" width={150} stroke="#cbd5e1" />
              <Tooltip formatter={(value) => [formatPercentFraction(Number(value)), 'Model confidence']} />
              <Bar dataKey="confidence" fill="#c084fc" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">{data.recommendations.map((item) => <p key={item.career}>{item.career}: {formatPercentFraction(item.confidence)} model confidence</p>)}</div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        {data.recommendations.map((item) => <article className="card" key={item.rank}>
          <div className="flex justify-between gap-3">
            <span className="pill">Rank {item.rank}</span>
            <strong className="text-violet-300">{formatPercentFraction(item.confidence)}</strong>
          </div>
          <h2 className="mt-3 text-lg font-semibold">{item.career}</h2>
          <p className="mt-1 text-xs text-slate-500">Actual model confidence</p>
          <h3 className="mt-3 text-sm font-semibold text-violet-200">Why this career?</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">{(explanation.data?.recommendations.find((value) => value.career === item.career)?.supportingSignals ?? []).slice(0,3).map((signal) => <li key={signal.feature}>• {signal.feature}</li>)}</ul>
          {!explanation.isLoading && !explanation.data && <p className="mt-2 text-sm text-slate-500">Model explanation unavailable.</p>}
          <div className="mt-4 flex flex-wrap gap-2"><button className="secondary-button" disabled={createPlan.isPending} onClick={() => createPlan.mutate({ recommendationId: data.id, career: item.career }, { onSuccess: () => navigate('/student/career-plan') })}>Build Career Plan</button><Link className="secondary-button" to="/student/career-twin">Explain / Simulate</Link></div>
        </article>)}
      </section>
    </>}

    {history.data?.length ? <section className="card mt-6">
      <h2 className="text-lg font-semibold">Recommendation history</h2>
      <div className="mt-3 divide-y divide-white/10">{history.data.map((item) => <button className="flex w-full items-center justify-between gap-3 py-3 text-left hover:text-violet-200" key={item.id} onClick={() => setSelected(item.id)}>
        <span>{item.topCareer}<small className="block text-slate-500">{new Date(item.createdAt).toLocaleString()}</small></span>
        <strong>{formatPercentFraction(item.topConfidence)}</strong>
      </button>)}</div>
    </section> : !data && readiness.data?.ready ? <EmptyState title="No recommendations yet" copy="Discover careers to create a real, persisted recommendation." /> : null}
  </main>;
}
