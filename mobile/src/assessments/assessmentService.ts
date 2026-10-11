import{api}from'@/src/api/client';import type{AssessmentSummary,AttemptSummary,ScheduledExam}from'./assessmentTypes';
export const assessmentService={
 catalog:async()=>(await api.get<AssessmentSummary[]>('/assessments')).data,
 schedules:async()=>(await api.get<ScheduledExam[]>('/student/scheduled-exams')).data,
 history:async()=>(await api.get<AttemptSummary[]>('/assessment-attempts')).data,
 schedule:async(assessmentId:string,scheduledStart:string)=>(await api.post<ScheduledExam>('/student/scheduled-exams',{assessmentId,scheduledStart})).data,
 reschedule:async(id:string,scheduledStart:string)=>(await api.patch<ScheduledExam>(`/student/scheduled-exams/${id}/reschedule`,{scheduledStart})).data,
 cancel:async(id:string)=>(await api.post<ScheduledExam>(`/student/scheduled-exams/${id}/cancel`)).data,
};
