import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
export type DsaStatus='NOT_STARTED'|'ATTEMPTED'|'SOLVED'|'REVISE';
export interface DsaTopic{topicId:string;topicName:string;status:DsaStatus;attemptCount:number;selfConfidence?:number;lastPracticedAt?:string;solvedAt?:string;readinessScore:number|null;readinessLabel:string;enoughEvidence:boolean}
export interface DsaDashboard{summary:{overallProgress:number;solved:number;attempted:number;revisionDue:number;tracked:number;recommendedTopicId?:string;recommendedTopicName?:string;formulaVersion:string};topics:DsaTopic[];disclaimer:string;externalResourceUrl:string;externalResourceNotice:string}
export function useDsaDashboard(){return useQuery({queryKey:['dsa-practice'],queryFn:async()=>(await api.get<DsaDashboard>('/dsa-practice')).data})}
export function useUpdateDsaProgress(){const client=useQueryClient();return useMutation({mutationFn:async({topicId,status,selfConfidence}:{topicId:string;status:DsaStatus;selfConfidence?:number})=>(await api.put<DsaDashboard>(`/dsa-practice/topics/${topicId}`,{status,selfConfidence})).data,onSuccess:data=>client.setQueryData(['dsa-practice'],data)})}
