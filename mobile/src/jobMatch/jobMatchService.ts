import{api}from'@/src/api/client';
import type{CreateJobMatch,JobMatchDetail,JobMatchSummary}from'./jobMatchTypes';
export const jobMatchService={history:async()=>(await api.get<JobMatchSummary[]>('/job-matches')).data,get:async(id:string)=>(await api.get<JobMatchDetail>(`/job-matches/${id}`)).data,create:async(value:CreateJobMatch)=>(await api.post<JobMatchDetail>('/job-matches',value,{timeout:60_000})).data};
