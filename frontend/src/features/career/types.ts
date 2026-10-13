export interface CareerReadiness{ready:boolean;missingFields:string[];skillCount:number}
export interface RecommendationItem{rank:number;career:string;confidence:number;profileSignals:string[]}
export interface RecommendationDetail{id:string;modelVersion:string;featureSchemaVersion:string;degree:string|null;experienceLevel:string|null;targetRole:string|null;createdAt:string;recommendations:RecommendationItem[]}
export interface RecommendationSummary{id:string;topCareer:string;topConfidence:number;modelVersion:string;createdAt:string}
export type RoadmapStatus='NOT_STARTED'|'IN_PROGRESS'|'READY'
export interface SkillGapItem{skill:string;category:'CORE'|'SUPPORTING';state:'PRESENT'|'MISSING'|'NEEDS_IMPROVEMENT';proficiency:string|null;nextAction:string}
export interface ReadinessComponent{key:string;label:string;score:number|null;configuredWeight:number;effectiveWeight:number;status:'AVAILABLE'|'UNAVAILABLE';evidence:string}
export interface RoadmapItem{id:string;stageOrder:number;stageName:string;itemOrder:number;topic:string;skillName:string|null;whyItMatters:string;nextAction:string;status:RoadmapStatus;statusSource:string;updatedAt:string}
export interface CareerPlan{id:string;recommendationId:string;selectedCareer:string;taxonomyVersion:string;createdAt:string;updatedAt:string;skillGap:{score:number;present:SkillGapItem[];missingCore:SkillGapItem[];missingSupporting:SkillGapItem[];needsImprovement:SkillGapItem[]};placementReadiness:{score:number;version:string;components:ReadinessComponent[];howToImprove:string[];disclaimer:string};roadmap:RoadmapItem[];nextActions:string[];progressPercentage:number}
export interface FeatureContribution{feature:string;contribution:number}
export interface ExplainedRecommendation extends RecommendationItem{supportingSignals:FeatureContribution[];limitingSignals:FeatureContribution[]}
export interface CareerExplanation{modelVersion:string|null;featureSchemaVersion:string|null;disclaimer:string;recommendations:ExplainedRecommendation[];available:boolean;availabilityMessage:string|null}
export interface CareerIntelligenceOptions{careers:string[];actionableSkills:string[]}
export interface HypotheticalSkill{name:string;proficiency:string}
export interface SimulationResult{modelVersion:string;featureSchemaVersion:string;before:RecommendationItem[];simulated:RecommendationItem[];appliedSkills:HypotheticalSkill[];disclaimer:string}
export interface CounterfactualResult{modelVersion:string;featureSchemaVersion:string;targetCareer:string;found:boolean;currentRank:number;simulatedRank:number|null;currentConfidence:number;simulatedConfidence:number|null;confidenceDelta:number|null;rankDelta:number|null;proposedSkills:HypotheticalSkill[];disclaimer:string}
