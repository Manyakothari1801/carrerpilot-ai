import { Link } from 'react-router-dom';
import { EmptyState, SkeletonCards } from '../components/IntelligenceUI';
import { useAssessments, useAttemptHistory } from '../features/assessment/api';
import type { AssessmentSummary } from '../features/assessment/types';

function AssessmentCard({ assessment, featured = false }: { assessment: AssessmentSummary; featured?: boolean }) {
  return (
    <article className={`card ${featured ? 'border-violet-300/40 md:col-span-2 xl:col-span-3' : ''}`}>
      <div className="flex gap-2">
        <span className="pill">{assessment.assessmentType.replaceAll('_', ' ')}</span>
        <span className="pill">{assessment.difficulty}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold">{assessment.title}</h3>
      <p className="mt-2 text-sm text-slate-400">{assessment.description}</p>
      <p className="mt-4 text-xs text-slate-400">
        {assessment.totalQuestions} questions · {assessment.durationMinutes} minutes · Pass {assessment.passingPercentage}%
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="primary-button" to={`/student/assessments/${assessment.id}`}>Start Now</Link>
        <Link className="secondary-button" to={`/student/scheduled-exams?assessment=${assessment.id}`}>Schedule Test</Link>
      </div>
    </article>
  );
}

export function AssessmentsPage() {
  const catalog = useAssessments();
  const history = useAttemptHistory();
  const items = catalog.data ?? [];
  const practice = items.filter((assessment) => assessment.catalogGroup !== 'PLACEMENT_MOCK');
  const mocks = items.filter((assessment) => assessment.catalogGroup === 'PLACEMENT_MOCK');

  return (
    <main className="page">
      <p className="eyebrow">Practice and plan</p>
      <h1 className="page-title">Assessments</h1>
      <p className="page-subtitle">Start immediately or schedule any active assessment for yourself.</p>

      {catalog.isPending ? <div className="mt-8"><SkeletonCards /></div> : catalog.isError ? (
        <div className="mt-8"><EmptyState title="Assessments are unavailable" copy="The assessment catalog could not be loaded. Please try again shortly." /></div>
      ) : items.length === 0 ? (
        <div className="mt-8"><EmptyState title="No assessments available" copy="There are no active assessments in the catalog right now." /></div>
      ) : (
        <>
          <h2 className="mt-8 text-xl font-semibold">Practice assessments</h2>
          {practice.length > 0 ? (
            <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Practice assessments">
              {practice.map((assessment) => <AssessmentCard assessment={assessment} key={assessment.id} />)}
            </section>
          ) : <div className="mt-4"><EmptyState title="No practice assessments" copy="No practice assessments are active right now." /></div>}

          <h2 className="mt-10 text-xl font-semibold">Placement mock tests</h2>
          {mocks.length > 0 ? (
            <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Placement mock tests">
              {mocks.map((assessment) => <AssessmentCard assessment={assessment} featured={assessment.title === 'Full Company Placement Mock Test'} key={assessment.id} />)}
            </section>
          ) : <div className="mt-4"><EmptyState title="No placement mocks" copy="No placement mock tests are active right now." /></div>}
        </>
      )}

      <h2 className="mt-10 text-xl font-semibold">Attempt history</h2>
      <section className="card mt-4" aria-label="Assessment attempt history">
        {history.isPending ? <div className="skeleton h-24" aria-label="Loading attempt history" /> : history.isError ? (
          <EmptyState title="History is unavailable" copy="Your attempt history could not be loaded. Please try again shortly." />
        ) : history.data?.length ? history.data.map((attempt) => (
          <Link className="flex justify-between gap-4 border-b border-white/10 py-3 last:border-0" key={attempt.id} to={attempt.status === 'SUBMITTED' ? `/student/assessment-attempts/${attempt.id}/result` : `/student/assessments/${attempt.assessmentId}`}>
            <span>{attempt.assessmentTitle}</span>
            <span>{attempt.scorePercentage != null ? `${attempt.scorePercentage}%` : attempt.status}</span>
          </Link>
        )) : <EmptyState title="No attempts yet" copy="Completed and active assessment attempts will appear here." />}
      </section>
    </main>
  );
}
