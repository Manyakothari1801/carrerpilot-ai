import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import type { ResumeDetail, ResumeSummary } from './types'

export const resumeKeys={all:['resumes'] as const,detail:(id:string)=>['resumes',id] as const}
export function useResumes(){return useQuery({queryKey:resumeKeys.all,queryFn:async()=>(await api.get<ResumeSummary[]>('/resumes')).data})}
export function useResume(id?:string){return useQuery({queryKey:resumeKeys.detail(id??''),enabled:Boolean(id),queryFn:async()=>(await api.get<ResumeDetail>(`/resumes/${id}`)).data})}
export function useUploadResume(){const client=useQueryClient();return useMutation({mutationFn:async({file,onProgress}:{file:File;onProgress:(value:number)=>void})=>{const form=new FormData();form.append('file',file);return(await api.post<ResumeDetail>('/resumes',form,{headers:{'Content-Type':'multipart/form-data'},timeout:60_000,onUploadProgress:event=>onProgress(event.total?Math.round(event.loaded*100/event.total):0)})).data},onSuccess:async data=>{client.setQueryData(resumeKeys.detail(data.id),data);await client.invalidateQueries({queryKey:resumeKeys.all})}})}
export function useActivateResume(){const client=useQueryClient();return useMutation({mutationFn:async(id:string)=>(await api.patch<ResumeDetail>(`/resumes/${id}/active`)).data,onSuccess:async()=>{await client.invalidateQueries({queryKey:resumeKeys.all});await client.invalidateQueries({queryKey:['resumes'],exact:false})}})}
export function useDeleteResume(){const client=useQueryClient();return useMutation({mutationFn:async(id:string)=>api.delete(`/resumes/${id}`),onSuccess:async()=>{await client.invalidateQueries({queryKey:resumeKeys.all})}})}
export async function downloadResume(resume:ResumeSummary){const response=await api.get(`/resumes/${resume.id}/download`,{responseType:'blob'});const url=URL.createObjectURL(response.data);const anchor=document.createElement('a');anchor.href=url;anchor.download=resume.originalFilename;anchor.click();URL.revokeObjectURL(url)}
