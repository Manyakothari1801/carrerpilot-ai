import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { useCareerIntelligenceOptions } from "../features/career/api";
import {
  type InterviewAnswer,
  type InterviewHistory,
  type InterviewMode,
  type InterviewSession,
  type InterviewType,
  useInterviewHistory,
  useStartInterview,
  useSubmitInterviewAnswer,
} from "../features/career/ai";
import { useFeedback } from "../components/FeedbackProvider";
type DeviceState = "idle" | "checking" | "ready" | "denied" | "unavailable";

function stopMedia(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function attachAndPlayVideo(
  element: HTMLVideoElement,
  media: MediaStream,
) {
  element.srcObject = media;
  if (element.readyState < HTMLMediaElement.HAVE_METADATA) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error("Camera preview timed out")),
        5000,
      );
      element.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      element.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Camera preview could not load"));
      };
    });
  }
  await element.play();
}

export function CareerInterviewPage() {
  const options = useCareerIntelligenceOptions(),
    history = useInterviewHistory(),
    start = useStartInterview(),
    submit = useSubmitInterviewAnswer(),
    { notify } = useFeedback();
  const [tab, setTab] = useState<InterviewMode>("TEXT"),
    [career, setCareer] = useState(""),
    [type, setType] = useState<InterviewType>("TECHNICAL"),
    [focus, setFocus] = useState(""),
    [count, setCount] = useState(5),
    [session, setSession] = useState<InterviewSession | null>(null),
    [transcript, setTranscript] = useState(""),
    [device, setDevice] = useState<DeviceState>("idle"),
    [recording, setRecording] = useState(false),
    [seconds, setSeconds] = useState(0);
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    recorder = useRef<MediaRecorder | null>(null),
    startedAt = useRef(0),
    target = career || options.data?.careers[0] || "";
  useEffect(() => () => stopMedia(stream.current), []);
  useEffect(() => {
    if (tab !== "TEXT") return;
    if (recorder.current?.state === "recording") recorder.current.stop();
    stopMedia(stream.current);
    stream.current = null;
    setRecording(false);
    setDevice("idle");
  }, [tab]);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [recording]);
  useEffect(() => {
    if (!session || !video.current || !stream.current) return;
    void attachAndPlayVideo(video.current, stream.current).catch(() =>
      setDevice("unavailable"),
    );
  }, [session]);
  const checkDevices = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setDevice("unavailable");
      return;
    }
    setDevice("checking");
    stopMedia(stream.current);
    stream.current = null;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const hasLiveVideo = media
        .getVideoTracks()
        .some((track) => track.readyState === "live");
      const hasLiveAudio = media
        .getAudioTracks()
        .some((track) => track.readyState === "live");
      if (!hasLiveVideo || !hasLiveAudio) {
        stopMedia(media);
        throw new Error("Required camera or microphone track is unavailable");
      }
      stream.current = media;
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );
      if (!video.current) throw new Error("Camera preview is not mounted");
      await attachAndPlayVideo(video.current, media);
      setDevice("ready");
    } catch (error) {
      stopMedia(stream.current);
      stream.current = null;
      setDevice(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "unavailable",
      );
    }
  };
  const begin = () =>
    start.mutate(
      {
        targetCareer: target,
        interviewType: type,
        mode: tab,
        focusArea: focus || undefined,
        questionCount: count,
      },
      {
        onSuccess: (value) => {
          setSession(value);
          setTranscript("");
          notify("AI interview started.", "success");
        },
        onError: () =>
          notify(
            "AI interview coaching is temporarily unavailable. Please try again.",
            "error",
          ),
      },
    );
  const toggleRecording = () => {
    if (!stream.current) return;
    if (!recording) {
      const chunks: Blob[] = [];
      const value = new MediaRecorder(stream.current);
      value.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      value.onstop = () => {
        chunks.length = 0;
      };
      recorder.current = value;
      value.start();
      startedAt.current = Date.now();
      setSeconds(0);
      setRecording(true);
    } else {
      recorder.current?.stop();
      setRecording(false);
    }
  };
  const answer = () =>
    session &&
    submit.mutate(
      {
        id: session.id,
        transcript: transcript.trim(),
        answerDurationSeconds: tab === "VIDEO" ? seconds : undefined,
      },
      {
        onSuccess: (value) => {
          setSession(value);
          setTranscript("");
          notify(
            value.status === "COMPLETED"
              ? "Interview complete."
              : "Coaching generated.",
            "success",
          );
        },
        onError: () =>
          notify(
            "AI coaching is temporarily unavailable. Your answer was not saved.",
            "error",
          ),
      },
    );
  if (session)
    return (
      <Workspace
        session={session}
        transcript={transcript}
        setTranscript={setTranscript}
        submit={answer}
        busy={submit.isPending}
        mode={tab}
        device={device}
        video={video}
        recording={recording}
        seconds={seconds}
        toggleRecording={toggleRecording}
        restart={() => {
          setSession(null);
          setTranscript("");
        }}
      />
    );
  return (
    <main className="page">
      <p className="eyebrow">Adaptive AI coaching</p>
      <h1 className="page-title">AI Mock Interview</h1>
      <p className="page-subtitle">
        Practice role-specific interviews with adaptive AI coaching.
      </p>
      <div className="mt-6 flex gap-2" role="tablist">
        <Tab active={tab === "TEXT"} onClick={() => setTab("TEXT")}>
          Text Interview
        </Tab>
        <Tab active={tab === "VIDEO"} onClick={() => setTab("VIDEO")}>
          Video Interview
        </Tab>
      </div>
      <section className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <article className="research-card">
          <h2 className="text-lg font-semibold">Interview setup</h2>
          <label className="field-label mt-4">
            Target career
            <select
              className="input"
              value={target}
              onChange={(event) => setCareer(event.target.value)}
            >
              {options.data?.careers.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field-label mt-4">
            Interview type
            <select
              className="input"
              value={type}
              onChange={(event) => setType(event.target.value as InterviewType)}
            >
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">HR / Behavioral</option>
              <option value="MIXED">Mixed</option>
            </select>
          </label>
          <label className="field-label mt-4">
            Focus area (optional)
            <input
              className="input"
              maxLength={120}
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
            />
          </label>
          <label className="field-label mt-4">
            Number of questions
            <select
              className="input"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
          {tab === "VIDEO" && (
            <DeviceCheck state={device} check={checkDevices} video={video} />
          )}
          <button
            className="primary-button mt-5"
            disabled={
              !target ||
              start.isPending ||
              (tab === "VIDEO" && device !== "ready")
            }
            onClick={begin}
          >
            {start.isPending ? "Generating first question…" : "Start Interview"}
          </button>
          <p className="mt-4 text-xs text-slate-500">
            Video creates realistic practice conditions only. Raw media stays in
            this browser and is discarded; it is never scored, uploaded, or
            persisted.
          </p>
        </article>
        <History items={history.data ?? []} />
      </section>
    </main>
  );
}
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`secondary-button ${active ? "border-violet-400 text-violet-300" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function DeviceCheck({
  state,
  check,
  video,
}: {
  state: DeviceState;
  check(): void;
  video: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div className="mt-5 rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Camera & microphone</h3>
        <span className="pill">{state}</span>
      </div>
      {(state === "checking" || state === "ready") && (
        <video
          ref={video}
          autoPlay
          muted
          playsInline
          className="mt-3 aspect-video w-full rounded-xl bg-black object-cover"
        />
      )}
      {state === "checking" && (
        <p className="mt-2 text-sm text-slate-400">
          Verifying camera preview and microphone…
        </p>
      )}
      {state === "denied" && (
        <p className="error-message mt-3">
          Camera or microphone permission was denied. Update browser
          permissions, then retry.
        </p>
      )}
      {state === "unavailable" && (
        <p className="error-message mt-3">
          Camera, microphone, or recording is unavailable in this browser.
        </p>
      )}
      <button className="secondary-button mt-3" onClick={() => void check()}>
        {state === "ready" ? "Check again" : "Preview Camera"}
      </button>
    </div>
  );
}
function Workspace({
  session,
  transcript,
  setTranscript,
  submit,
  busy,
  mode,
  device,
  video,
  recording,
  seconds,
  toggleRecording,
  restart,
}: {
  session: InterviewSession;
  transcript: string;
  setTranscript(v: string): void;
  submit(): void;
  busy: boolean;
  mode: InterviewMode;
  device: DeviceState;
  video: RefObject<HTMLVideoElement | null>;
  recording: boolean;
  seconds: number;
  toggleRecording(): void;
  restart(): void;
}) {
  if (session.status === "COMPLETED")
    return <FinalReport session={session} restart={restart} />;
  const latest = session.answers.at(-1);
  return (
    <main className="page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">AI Mock Interview</p>
          <h1 className="page-title">
            Question {session.completedAnswers + 1} / {session.questionCount}
          </h1>
          <p className="page-subtitle">
            {session.targetCareer} · {session.interviewType} · {mode}
          </p>
        </div>
        <span className="pill">
          {session.completedAnswers}/{session.questionCount} complete
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-violet-400"
          style={{
            width: `${(session.completedAnswers / session.questionCount) * 100}%`,
          }}
        />
      </div>
      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        {mode === "VIDEO" && (
          <article className="research-card">
            <video
              ref={video}
              autoPlay
              muted
              playsInline
              className="aspect-video w-full rounded-xl bg-black object-cover"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className={recording ? "text-rose-300" : "text-slate-400"}>
                {recording ? "● Recording" : "Ready"} · {clock(seconds)}
              </span>
              <button
                className={
                  recording
                    ? "secondary-button text-rose-300"
                    : "primary-button"
                }
                disabled={device !== "ready"}
                onClick={toggleRecording}
              >
                {recording ? "Stop Answer" : "Start Answer"}
              </button>
            </div>
          </article>
        )}
        <article className="research-card">
          <p className="eyebrow">Interview question</p>
          <h2 className="mt-4 text-xl leading-8">{session.currentQuestion}</h2>
          <label className="field-label mt-6">
            Your transcript
            <textarea
              className="input min-h-44"
              maxLength={12000}
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder={
                mode === "VIDEO"
                  ? "Automatic transcription is not configured. Review and enter the answer transcript here."
                  : "Type your answer…"
              }
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Evaluation uses only the transcript you submit.
          </p>
          <button
            className="primary-button mt-4"
            disabled={!transcript.trim() || busy || recording}
            onClick={submit}
          >
            {busy ? "Generating coaching…" : "Submit Answer"}
          </button>
        </article>
      </section>
      {latest && <Coaching answer={latest} />}
      <p className="mt-6 text-xs text-slate-500">{session.disclaimer}</p>
    </main>
  );
}
function Coaching({ answer }: { answer: InterviewAnswer }) {
  return (
    <section className="research-card mt-5">
      <p className="eyebrow">AI coaching</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(answer.scores).map(([key, value]) => (
          <div className="rounded-xl border border-white/10 p-3" key={key}>
            <p className="text-xs text-slate-500">{label(key)}</p>
            <strong className="mt-1 block text-xl">{value}/100</strong>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <List
          title="Strengths"
          tone="text-emerald-300"
          items={answer.strengths}
        />
        <List
          title="Improve"
          tone="text-amber-300"
          items={answer.needsImprovement}
        />
      </div>
      {answer.suggestedAnswer && (
        <details className="mt-5">
          <summary className="cursor-pointer font-semibold">
            Suggested stronger answer
          </summary>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {answer.suggestedAnswer}
          </p>
        </details>
      )}
    </section>
  );
}
function List({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className={`font-semibold ${tone}`}>{title}</h3>
      {items.length ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {items.map((v) => (
            <li key={v}>• {v}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No items returned.</p>
      )}
    </div>
  );
}
function FinalReport({
  session,
  restart,
}: {
  session: InterviewSession;
  restart(): void;
}) {
  const sums = session.answers.reduce(
    (a, v) => {
      for (const key of Object.keys(a) as (keyof typeof a)[])
        a[key] += v.scores[key];
      return a;
    },
    {
      technicalCorrectness: 0,
      relevance: 0,
      answerStructure: 0,
      completeness: 0,
      communicationClarity: 0,
    },
  );
  return (
    <main className="page">
      <p className="eyebrow">Interview complete</p>
      <h1 className="page-title">Practice report</h1>
      <p className="page-subtitle">
        {session.targetCareer} · {session.interviewType} · {session.mode} ·{" "}
        {session.questionCount} questions
      </p>
      <section className="mt-7 grid gap-4 lg:grid-cols-[.5fr_1.5fr]">
        <article className="research-card text-center">
          <p className="text-sm text-slate-400">Overall coaching score</p>
          <strong className="mt-3 block text-6xl text-violet-300">
            {session.overallCoachingScore}
          </strong>
          <span className="text-sm text-slate-500">/100</span>
        </article>
        <article className="research-card grid gap-3 sm:grid-cols-2">
          {Object.entries(sums).map(([key, value]) => (
            <div
              className="flex justify-between border-b border-white/10 pb-2"
              key={key}
            >
              <span className="text-sm text-slate-400">{label(key)}</span>
              <strong>{Math.round(value / session.answers.length)}/100</strong>
            </div>
          ))}
        </article>
      </section>
      <section className="mt-6 space-y-3">
        {session.answers.map((answer) => (
          <details className="card" key={answer.id}>
            <summary className="cursor-pointer font-semibold">
              Question {answer.sequenceNumber}: {answer.question}
            </summary>
            <p className="mt-4 text-xs uppercase text-slate-500">
              Submitted transcript
            </p>
            <p className="mt-2 text-sm text-slate-300">{answer.transcript}</p>
            <Coaching answer={answer} />
          </details>
        ))}
      </section>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className="primary-button" onClick={restart}>
          Start Another Interview
        </button>
        <Link className="secondary-button" to="/student/career-plan">
          Open Career Plan
        </Link>
        <Link className="secondary-button" to="/student/dsa-practice">
          Practice DSA
        </Link>
        <Link className="secondary-button" to="/student/assessments">
          Take Assessment
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-500">{session.disclaimer}</p>
    </main>
  );
}
function History({ items }: { items: InterviewHistory[] }) {
  return (
    <article className="research-card">
      <h2 className="text-lg font-semibold">Interview history</h2>
      {items.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Career</th>
                <th>Mode</th>
                <th>Questions</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.startedAt).toLocaleDateString()}</td>
                  <td>{item.targetCareer}</td>
                  <td>{item.mode}</td>
                  <td>
                    {item.completedAnswers}/{item.questionCount}
                  </td>
                  <td>
                    {item.overallCoachingScore == null
                      ? "—"
                      : `${item.overallCoachingScore}/100`}
                  </td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Completed and active practice sessions will appear here.
        </p>
      )}
    </article>
  );
}
function label(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (v) => v.toUpperCase());
}
function clock(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
