import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { CareerExplanation, CareerIntelligenceOptions, CareerPlan, CareerReadiness, CounterfactualResult, HypotheticalSkill, RecommendationDetail, RecommendationSummary, RoadmapStatus, SimulationResult } from './types';

export const careerKeys = {
  readiness: ['career-readiness'] as const,
  history: ['career-recommendations'] as const,
  detail: (id: string) => ['career-recommendation', id] as const,
  plan: ['career-plan'] as const,
};

export const useCareerReadiness = () => useQuery({ queryKey: careerKeys.readiness, queryFn: async () => (await api.get<CareerReadiness>('/career-recommendations/readiness')).data });
export const useCareerHistory = () => useQuery({ queryKey: careerKeys.history, queryFn: async () => (await api.get<RecommendationSummary[]>('/career-recommendations')).data });
export const useCareerRecommendation = (id?: string) => useQuery({ queryKey: careerKeys.detail(id ?? ''), enabled: Boolean(id), queryFn: async () => (await api.get<RecommendationDetail>(`/career-recommendations/${id}`)).data });
export function useDiscoverCareers() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async () => (await api.post<RecommendationDetail>('/career-recommendations', undefined, { timeout: 20_000 })).data, onSuccess: async (value) => { client.setQueryData(careerKeys.detail(value.id), value); await client.invalidateQueries({ queryKey: careerKeys.history }); } });
}
export const useCareerPlan = () => useQuery({ queryKey: careerKeys.plan, queryFn: async () => { const response = await api.get<CareerPlan | ''>('/career-plans/current'); return response.data || null; } });
export function useCreateCareerPlan() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (value: { recommendationId: string; career: string }) => (await api.post<CareerPlan>('/career-plans', value)).data, onSuccess: (value) => client.setQueryData(careerKeys.plan, value) });
}
export function useUpdateRoadmap() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async (value: { id: string; status: RoadmapStatus }) => (await api.patch<CareerPlan>(`/career-plans/items/${value.id}`, { status: value.status })).data, onSuccess: (value) => client.setQueryData(careerKeys.plan, value) });
}

export const useCareerIntelligenceOptions = () => useQuery({ queryKey: ['career-intelligence-options'], queryFn: async () => (await api.get<CareerIntelligenceOptions>('/career-intelligence/options')).data });
export const useCareerExplanation = () => useQuery({ queryKey: ['career-intelligence-explanation'], queryFn: async () => (await api.get<CareerExplanation>('/career-intelligence/explanation', { timeout: 20_000 })).data, retry: false });
export function useCareerSimulation() {
  return useMutation({ mutationFn: async (hypotheticalSkills: HypotheticalSkill[]) => (await api.post<SimulationResult>('/career-intelligence/simulate', { hypotheticalSkills }, { timeout: 20_000 })).data });
}
export function useCareerCounterfactual() {
  return useMutation({ mutationFn: async (value: { targetCareer: string; maxChanges: number }) => (await api.post<CounterfactualResult>('/career-intelligence/counterfactual', value, { timeout: 30_000 })).data });
}
