export interface CareerRecommendationReadiness{ready:boolean;missingFields:string[];skillCount:number}
export interface CareerRecommendationItem{rank:number;career:string;confidence:number;profileSignals:string[]}
export interface CareerRecommendationDetail{id:string;modelVersion:string;featureSchemaVersion:string;degree:string|null;experienceLevel:string|null;targetRole:string|null;createdAt:string;recommendations:CareerRecommendationItem[]}
export interface CareerRecommendationSummary{id:string;topCareer:string;topConfidence:number;modelVersion:string;createdAt:string}

