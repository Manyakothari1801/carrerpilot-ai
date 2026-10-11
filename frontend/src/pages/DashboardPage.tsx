import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MetricCard, ProgressRing, SkeletonCards } from '../components/IntelligenceUI';
import { useAttemptHistory } from '../features/assessment/api';
import { useCareerExplanation, useCareerHistory, useCareerPlan, useCareerRecommendation } from '../features/career/api';
import { formatChartTimestamp, formatPercentFraction, formatTooltipTimestamp, recommendationAxisMaximum } from '../features/career/chart';
import type { Profile, UserSkill } from '../features/profile/types';
import { useAnalysisHistory, useResumes } from '../features/resume/api';
import { api } from '../services/api';

export function DashboardPage() {
  const profile = useQuery({ queryKey: ['profile'], queryFn: async () => (await api.get<Profile>('/profile')).data });
  const skills = useQuery({ queryKey: ['skills'], queryFn: async () => (await api.get<UserSkill[]>('/profile/skills')).data });
  const resumes = useResumes();
  const active = resumes.data?.find((resume) => resume.active);
  const analyses = useAnalysisHistory(active?.id);
  const attempts = useAttemptHistory();
  const plan = useCareerPlan();
  const careerHistory = useCareerHistory();
  const recommendation = useCareerRecommendation(careerHistory.data?.[0]?.id);
  const explanation = useCareerExplanation();
  const loading = [profile, skills, resumes, attempts, plan, careerHistory].some((query) => query.isLoading);

  if (loading) return <main className="page"><SkeletonCards /></main>;

  const currentPlan = plan.data;
  const submitted = (attempts.data ?? []).filter((attempt) => attempt.status === 'SUBMITTED' && attempt.scorePercentage != null);
  const ats = analyses.data ?? [];
  const cta = !active ? ['Upload resume', '/student/resumes'] : !careerHistory.data?.length ? ['Discover careers', '/student/careers'] : !currentPlan ? ['Build career plan', '/student/careers'] : ['Continue roadmap', '/student/career-plan'];
  const confidenceMax = recommendationAxisMaximum(recommendation.data?.recommendations.map((item) => item.confidence) ?? []);
  const firstTimeSteps = [
    { label: 'Complete your profile', done: Boolean(profile.data && profile.data.profileCompletionPercentage === 100), to: '/student/profile' },
    { label: 'Add career skills', done: Boolean(skills.data?.length), to: '/student/profile' },
    { label: 'Upload a resume', done: Boolean(active), to: '/student/resumes' },
    { label: 'Discover careers', done: Boolean(careerHistory.data?.length), to: '/student/careers' },
    { label: 'Build a career plan', done: Boolean(currentPlan), to: '/student/career-plan' },
    { label: 'Take an assessment', done: Boolean(submitted.length), to: '/student/assessments' },
  ];
  const showGettingStarted = firstTimeSteps.some((step) => !step.done);
  const nextAction = !active ? { title: 'Upload your first resume', detail: 'Begin explainable ATS analysis and unlock resume evidence.', to: '/student/resumes' } : !careerHistory.data?.length ? { title: 'Discover your career directions', detail: 'Generate a profile-based recommendation using your current evidence.', to: '/student/careers' } : !currentPlan ? { title: 'Turn your direction into a plan', detail: 'Choose a recommended career and build a deterministic skill roadmap.', to: '/student/careers' } : { title: `Improve ${currentPlan.selectedCareer} skill coverage`, detail: `Current coverage: ${currentPlan.skillGap.score}%. Continue the next incomplete roadmap task.`, to: '/student/career-plan' };

  return <main className="page">
    <p className="eyebrow">Career intelligence overview</p>
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="page-title">Good to see you, {profile.data?.fullName?.split(' ')[0] ?? 'Student'}.</h1>
        <p className="page-subtitle">Your real preparation evidence, plans, and latest outcomes in one place.</p>
      </div>
      <Link className="primary-button" to={cta[1]}>{cta[0]} →</Link>
    </div>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Profile completion" value={profile.data ? `${profile.data.profileCompletionPercentage}%` : 'Not available'} detail={profile.data?.missingFields.length ? `${profile.data.missingFields.length} items remaining` : 'Core profile complete'} />
      <MetricCard label="Latest Resume ATS" value={ats[0] ? `${ats[0].atsScore}%` : 'Not available'} detail={active?.originalFilename} />
      <MetricCard label="Placement Readiness" value={currentPlan ? `${currentPlan.placementReadiness.score}/100` : 'Not available'} detail="Deterministic preparation indicator" />
      <MetricCard label="Career skill coverage" value={currentPlan ? `${currentPlan.skillGap.score}%` : 'Not available'} detail={currentPlan?.selectedCareer} />
      <MetricCard label="Roadmap task progress" value={currentPlan ? `${currentPlan.progressPercentage}%` : 'Not available'} detail={currentPlan ? 'Based on roadmap statuses you marked.' : 'Select a career plan'} />
    </section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
      <article className="next-action-card"><div><p className="eyebrow">Next best action</p><h2>{nextAction.title}</h2><p>{nextAction.detail}</p></div><Link className="primary-button" to={nextAction.to}>Continue →</Link></article>
      {showGettingStarted ? <article className="card"><div className="flex items-center justify-between"><h2 className="font-semibold">Getting started</h2><span className="pill">{firstTimeSteps.filter((step) => step.done).length}/{firstTimeSteps.length}</span></div><div className="mt-4 grid gap-2">{firstTimeSteps.filter((step) => !step.done).slice(0, 3).map((step) => <Link className="checklist-item" to={step.to} key={step.label}><span>○</span>{step.label}<span className="ml-auto">→</span></Link>)}</div></article> : <article className="card"><p className="eyebrow">Foundation complete</p><h2 className="mt-2 font-semibold">Your workspace is set up</h2><p className="mt-2 text-sm text-slate-400">Keep your evidence current as your skills and goals change.</p></article>}
    </section>

    {currentPlan && <section className="mt-5 grid gap-4 lg:grid-cols-[.55fr_1.45fr]">
      <article className="card flex flex-col items-center justify-center">
        <ProgressRing value={currentPlan.placementReadiness.score} label="Placement Readiness" />
        <Link className="mt-3 text-sm font-semibold text-violet-300" to="/student/career-plan">Open Career Plan →</Link>
      </article>
      <Chart title="Readiness breakdown">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentPlan.placementReadiness.components.filter((component) => component.score != null)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis domain={[0, 100]} stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
    </section>}

    <section className="mt-5 grid gap-4 xl:grid-cols-2">
      {recommendation.data ? <Chart title="Career recommendation confidence">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={recommendation.data.recommendations} margin={{ left: 20, right: 16 }}>
            <XAxis type="number" domain={[0, confidenceMax]} tickFormatter={(value) => formatPercentFraction(Number(value))} stroke="#94a3b8" />
            <YAxis type="category" dataKey="career" width={140} stroke="#cbd5e1" />
            <Tooltip formatter={(value) => [formatPercentFraction(Number(value)), 'Model confidence']} />
            <Bar dataKey="confidence" fill="#c084fc" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Chart> : <Empty title="Career recommendations" copy="No persisted recommendation yet." link="/student/careers" />}

      {ats.length > 1 ? <HistoryChart title="Resume ATS history" color="#6366f1" data={[...ats].reverse().map((analysis) => ({ timestamp: new Date(analysis.createdAt).getTime(), score: analysis.atsScore }))} /> : <Empty title="Resume ATS history" copy={ats[0] ? `Latest real ATS score: ${ats[0].atsScore}%` : 'No resume analyses yet.'} link="/student/resumes" />}
      {submitted.length > 1 ? <HistoryChart title="Assessment performance" color="#34d399" data={[...submitted].reverse().map((attempt) => ({ timestamp: new Date(attempt.submittedAt!).getTime(), score: attempt.scorePercentage! }))} /> : <Empty title="Assessment performance" copy={submitted[0] ? `Latest submitted score: ${submitted[0].scorePercentage}%` : 'No submitted assessments yet.'} link="/student/assessments" />}

      <article className="card">
        <h2 className="text-lg font-semibold">Preparation summary</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <Row label="Active resume" value={active?.originalFilename ?? 'Not available'} />
          <Row label="Selected career" value={currentPlan?.selectedCareer ?? 'Not available'} />
          <Row label="Latest assessment" value={submitted[0]?.assessmentTitle ?? 'Not available'} />
        </div>
      </article>
    </section>
    <section className="research-card mt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="eyebrow text-violet-300">AI career intelligence</p><h2 className="mt-2 text-xl font-semibold">Explain, simulate, and intervene</h2></div>
        <Link className="primary-button bg-violet-500 text-white hover:bg-violet-400" to="/student/career-twin">Open CareerTwin AI →</Link>
      </div>
      {explanation.isLoading ? <div className="skeleton mt-4 h-20" /> : explanation.data?.recommendations[0] ? <div className="mt-4 grid gap-4 md:grid-cols-[.45fr_1fr]">
        <div><p className="text-xs text-slate-500">Current top ML career</p><strong className="mt-1 block text-xl">{explanation.data.recommendations[0].career}</strong><p className="mt-1 text-violet-300">{formatPercentFraction(explanation.data.recommendations[0].confidence)} model confidence</p></div>
        <div><p className="text-xs text-slate-500">Top contributing model signals</p><div className="mt-2 flex flex-wrap gap-2">{explanation.data.recommendations[0].supportingSignals.slice(0,3).map((signal) => <span className="pill" key={signal.feature}>{signal.feature}</span>)}</div></div>
      </div> : <p className="mt-4 text-sm text-slate-400">Career intelligence is unavailable until the profile is ready and the ML service can evaluate it.</p>}
    </section>
    <section className="mt-5"><div className="mb-3 flex items-end justify-between"><div><p className="eyebrow">AI tools</p><h2 className="mt-1 text-xl font-semibold">Practice and explore</h2></div></div><div className="grid gap-3 md:grid-cols-3"><ToolLink title="CareerTwin AI" copy="Explain and simulate career recommendations." to="/student/career-twin"/><ToolLink title="AI Interview" copy="Practice adaptive interview questions." to="/student/ai-interview"/><ToolLink title="Career Copilot" copy="Ask grounded questions about your evidence." to="/student/career-copilot"/></div></section>
    <p className="mt-7 text-xs text-slate-500">Charts use persisted backend data only. Placement Readiness is not hiring or placement probability.</p>
  </main>;
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="chart-card"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-3 h-56">{children}</div></article>;
}

function HistoryChart({ title, color, data }: { title: string; color: string; data: { timestamp: number; score: number }[] }) {
  return <Chart title={title}><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ right: 12 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(value) => formatChartTimestamp(Number(value))} minTickGap={64} stroke="#94a3b8" />
      <YAxis domain={[0, 100]} stroke="#94a3b8" />
      <Tooltip labelFormatter={(value) => formatTooltipTimestamp(Number(value))} formatter={(value) => [`${Number(value)}%`, 'Score']} />
      <Line dataKey="score" stroke={color} strokeWidth={3} dot={{ r: 3 }} />
    </LineChart>
  </ResponsiveContainer></Chart>;
}

function Empty({ title, copy, link }: { title: string; copy: string; link: string }) {
  return <article className="chart-card flex flex-col justify-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-3 text-sm text-slate-400">{copy}</p><Link className="mt-4 text-sm font-semibold text-violet-300" to={link}>Open →</Link></article>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-slate-500">{label}</span><strong className="text-right">{value}</strong></div>;
}

function ToolLink({ title, copy, to }: { title: string; copy: string; to: string }) { return <Link className="tool-link-card" to={to}><span className="tool-link-mark">✦</span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-400">{copy}</p></div><span className="ml-auto">→</span></Link>; }
