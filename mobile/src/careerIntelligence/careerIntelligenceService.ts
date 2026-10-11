import{api}from'@/src/api/client';
import type{CareerExplanation,CareerIntelligenceOptions,CounterfactualResult}from'./careerIntelligenceTypes';
export const careerIntelligenceService={explain:async()=>(await api.get<CareerExplanation>('/career-intelligence/explanation',{timeout:20_000})).data,options:async()=>(await api.get<CareerIntelligenceOptions>('/career-intelligence/options')).data,counterfactual:async(targetCareer:string)=>(await api.post<CounterfactualResult>('/career-intelligence/counterfactual',{targetCareer,maxChanges:3},{timeout:30_000})).data};
