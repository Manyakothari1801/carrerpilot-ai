import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { downloadAnalysisReport, useAnalysis } from '../features/resume/api'
import type { AnalysisFinding, FindingSeverity } from '../features/resume/types'
import { useFeedback } from '../components/FeedbackProvider'

const severityOrder:Record<FindingSeverity,number>={HIGH:4,MEDIUM:3,LOW:2,INFO:1}

export function ResumeAnalysisPage(){
 const {notify}=useFeedback();const[downloading,setDownloading]=useState(false)
 const{resumeId,analysisId}=useParams();const{data,isLoading,isError}=useAnalysis(resumeId,analysisId)
 if(isLoading)return <main className="page">Loading analysis…</main>
 if(isError||!data)return <main className="page"><p className="error-message">Analysis could not be loaded.</p></main>
 const ruleFindings=data.findings.filter(f=>!f.aiGenerated)
 const aiFindings=data.findings.filter(f=>f.aiGenerated)
 const aiStrengths=aiFindings.filter(f=>f.category==='AI_STRENGTH')
 const aiImprovements=aiFindings.filter(f=>f.category==='AI_WEAKNESS')
 const writing=aiFindings.filter(f=>f.category==='AI_WRITING')
 const rewrites=aiFindings.filter(f=>f.category==='AI_REWRITE')
 const summaries=aiFindings.filter(f=>f.category==='AI_SUMMARY')
 const download=async()=>{setDownloading(true);try{await downloadAnalysisReport(data.resumeId,data.id);notify('Resume report downloaded.','success')}catch{notify('Unable to download the resume report. Please try again.','error')}finally{setDownloading(false)}}
 return <main className="page">
  <Link className="text-sm text-violet-300" to={`/student/resumes/${resumeId}`}>← Resume details</Link>
  <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Resume intelligence</p><h1 className="page-title">Analysis report</h1><p className="page-subtitle">Generated {new Date(data.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><button className="primary-button" disabled={downloading} onClick={()=>void download()}>{downloading?'Preparing report…':'Download PDF Report'}</button><span className={`pill ${data.status==='PARTIAL'?'text-amber-200':''}`}>{data.status}</span></div></div>
  <section className="mt-8 grid gap-4 md:grid-cols-2"><ScoreCard title="Overall resume score" value={data.overallScore}/><ScoreCard title="ATS heuristic" value={data.atsScore}/></section>
  <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[['Sections',data.sectionScore],['Keywords',data.keywordScore],['Action verbs',data.actionVerbScore],['Quantification',data.quantificationScore],['Readability',data.readabilityScore]].map(([label,value])=><ScoreCard compact title={String(label)} value={Number(value)} key={label}/>)}</section>
  <div className="mt-6 rounded-2xl border border-violet-300/15 bg-violet-300/5 p-5 text-sm text-slate-300"><p>{data.scoreDisclaimer}</p><p className="mt-2"><strong>AI status:</strong> {data.aiMessage}</p>{data.modelName&&<p className="mt-1 text-xs text-slate-500">Provider: {data.modelProvider} · Model: {data.modelName} · Prompt: {data.promptVersion}</p>}{data.inputTruncated&&<p className="mt-2 text-amber-200">AI input was safely truncated; deterministic scoring used the complete parsed resume.</p>}</div>
  <section className="mt-10"><p className="eyebrow">Rule-based analysis</p><h2 className="mt-1 text-2xl font-semibold">Explainable local checks</h2><FindingGrid findings={ruleFindings}/></section>
  <section className="mt-12 border-t border-white/10 pt-10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">AI suggestions</p><h2 className="mt-1 text-2xl font-semibold">Gemini writing feedback</h2></div><span className="pill">Suggestions, not guaranteed facts</span></div>
   {aiFindings.length===0?<div className="card mt-5 text-sm text-slate-400"><strong className="block text-slate-200">AI writing feedback was not generated for this analysis.</strong><span className="mt-1 block">Your deterministic ATS analysis remains available.</span></div>:<>
    <FindingSection title="AI strengths" findings={aiStrengths}/><FindingSection title="AI improvement suggestions" findings={aiImprovements}/><FindingSection title="Summary recommendations" findings={summaries}/><RewriteSection title="Writing feedback" findings={writing}/><RewriteSection title="Bullet rewrites" findings={rewrites}/>
   </>}
  </section>
 </main>
}

function ScoreCard({title,value,compact=false}:{title:string;value:number;compact?:boolean}){return <article className="card"><p className="text-sm text-slate-400">{title}</p><p className={`${compact?'text-3xl':'text-5xl'} mt-2 font-semibold text-violet-200`}>{value}</p><div className="mt-4 h-2 overflow-hidden rounded bg-slate-800"><div className="h-full rounded bg-gradient-to-r from-violet-400 to-indigo-400" style={{width:`${value}%`}}/></div></article>}
function FindingGrid({findings}:{findings:AnalysisFinding[]}){const sorted=[...findings].sort((a,b)=>severityOrder[b.severity]-severityOrder[a.severity]);if(!sorted.length)return <p className="mt-4 text-sm text-slate-400">No rule-based findings were recorded.</p>;return <div className="mt-5 grid gap-4 lg:grid-cols-2">{sorted.map(f=><FindingCard key={f.id} finding={f}/>)}</div>}
function FindingSection({title,findings}:{title:string;findings:AnalysisFinding[]}){if(!findings.length)return null;return <section className="mt-8"><h3 className="text-xl font-semibold">{title}</h3><div className="mt-4 grid gap-4 lg:grid-cols-2">{[...findings].sort((a,b)=>severityOrder[b.severity]-severityOrder[a.severity]).map(f=><FindingCard key={f.id} finding={f}/>)}</div></section>}
function FindingCard({finding}:{finding:AnalysisFinding}){return <details className="card"><summary className="cursor-pointer list-none"><div className="flex items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wider text-slate-500">{finding.severity}</span><h3 className="mt-1 font-semibold">{finding.title}</h3></div><SourceBadge finding={finding}/></div></summary><p className="mt-4 text-sm leading-6 text-slate-300">{finding.description}</p></details>}
function RewriteSection({title,findings}:{title:string;findings:AnalysisFinding[]}){if(!findings.length)return null;return <section className="mt-8"><h3 className="text-xl font-semibold">{title}</h3><div className="mt-4 space-y-4">{findings.map(f=><article className="card" key={f.id}><div className="flex justify-between gap-3"><h4 className="font-semibold">{f.title}</h4><SourceBadge finding={f}/></div><p className="mt-2 text-sm text-slate-400">{f.description}</p><div className="mt-5 space-y-3"><TextBox label="Original" text={f.originalText}/><div className="text-center text-violet-300" aria-hidden="true">↓</div><TextBox label="Suggested" text={f.suggestedText}/></div></article>)}</div></section>}
function SourceBadge({finding}:{finding:AnalysisFinding}){return <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{finding.aiGenerated?'AI-generated suggestion':'Rule-based analysis'}</span>}
function TextBox({label,text}:{label:string;text?:string}){return <div className="rounded-xl bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{text}</p></div>}
