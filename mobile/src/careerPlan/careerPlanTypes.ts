export type RoadmapStatus='NOT_STARTED'|'IN_PROGRESS'|'READY';export type RoadmapStatusSource='PROFILE_EVIDENCE'|'SYSTEM_EVIDENCE'|'USER_REPORTED'|'PLANNED';
export interface SkillGapItem{skill:string;category:'CORE'|'SUPPORTING';state:'PRESENT'|'MISSING'|'NEEDS_IMPROVEMENT';proficiency:string|null;nextAction:string}
export interface SkillGap{score:number;present:SkillGapItem[];missingCore:SkillGapItem[];missingSupporting:SkillGapItem[];needsImprovement:SkillGapItem[]}
export interface ReadinessComponent{key:string;label:string;score:number|null;configuredWeight:number;effectiveWeight:number;status:'AVAILABLE'|'UNAVAILABLE';evidence:string}
export interface PlacementReadiness{score:number;version:string;components:ReadinessComponent[];howToImprove:string[];disclaimer:string}
export interface RoadmapItem{id:string;stageOrder:number;stageName:string;itemOrder:number;topic:string;skillName:string|null;whyItMatters:string;nextAction:string;status:RoadmapStatus;statusSource:RoadmapStatusSource;updatedAt:string}
export interface CareerPlan{id:string;recommendationId:string;selectedCareer:string;taxonomyVersion:string;createdAt:string;updatedAt:string;skillGap:SkillGap;placementReadiness:PlacementReadiness;roadmap:RoadmapItem[];nextActions:string[];progressPercentage:number}

