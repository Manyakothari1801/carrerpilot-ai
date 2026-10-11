export type MatchStatus='MATCHED'|'PARTIAL'|'MISSING';
export type SkillImportance='REQUIRED'|'PREFERRED'|'OPTIONAL';
export type SkillPriority='HIGH'|'MEDIUM'|'LOW';
export type SemanticStatus='AVAILABLE'|'UNAVAILABLE';
export type AlignmentStatus='MATCHED'|'PARTIAL'|'NOT_MATCHED'|'UNKNOWN'|'NOT_REQUIRED';
export interface JobMatchSkill{skill:string;normalizedSkill:string;status:MatchStatus;importance:SkillImportance;priority:SkillPriority;source:string;evidence:string;recommendation:string}
export interface JobMatchSummary{id:string;resumeId:string;jobTitle:string;companyName?:string;overallMatchScore:number;createdAt:string}
export interface JobMatchDetail extends JobMatchSummary{keywordMatchScore:number;skillMatchScore:number;semanticMatchScore:number|null;experienceMatchScore:number|null;educationMatchScore:number|null;semanticStatus:SemanticStatus;experienceStatus:AlignmentStatus;educationStatus:AlignmentStatus;scoringVersion:string;matchedSkills:JobMatchSkill[];partialMatches:JobMatchSkill[];missingSkills:JobMatchSkill[];extraResumeSkills:JobMatchSkill[];disclaimer:string}
export interface CreateJobMatch{resumeId:string;jobTitle:string;companyName?:string;jobDescription:string}
