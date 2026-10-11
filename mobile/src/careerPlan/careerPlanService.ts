import{api}from'@/src/api/client';import type{CareerPlan,RoadmapStatus}from'./careerPlanTypes';
export const careerPlanService={current:async()=>{const response=await api.get<CareerPlan>('/career-plans/current',{validateStatus:value=>value===200||value===204});return response.status===204?null:response.data},create:async(recommendationId:string,career:string)=>(await api.post<CareerPlan>('/career-plans',{recommendationId,career})).data,updateStatus:async(itemId:string,status:RoadmapStatus)=>(await api.patch<CareerPlan>(`/career-plans/items/${itemId}`,{status})).data};

