export interface FeatureContribution{feature:string;contribution:number}
export interface ExplainedCareer{career:string;confidence:number;supportingSignals:FeatureContribution[];limitingSignals:FeatureContribution[]}
export interface CareerExplanation{modelVersion:string;featureSchemaVersion:string;disclaimer:string;recommendations:ExplainedCareer[]}
export interface CareerIntelligenceOptions{careers:string[];actionableSkills:string[]}
export interface CounterfactualResult{targetCareer:string;found:boolean;currentRank:number;simulatedRank:number|null;currentConfidence:number;simulatedConfidence:number|null;confidenceDelta:number|null;proposedSkills:{name:string;proficiency:string}[];disclaimer:string}
