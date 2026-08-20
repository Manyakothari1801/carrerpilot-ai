export type ExperienceLevel = 'STUDENT'|'ENTRY_LEVEL'|'JUNIOR'|'MID_LEVEL'|'SENIOR'
export type ProficiencyLevel = 'BEGINNER'|'INTERMEDIATE'|'ADVANCED'|'EXPERT'
export interface Profile { id:string;fullName:string;email:string;phone?:string;college?:string;degree?:string;graduationYear?:number;targetRole?:string;experienceLevel?:ExperienceLevel;githubUrl?:string;linkedinUrl?:string;bio?:string;profileCompletionPercentage:number;missingFields:string[] }
export interface UserSkill { id:string;skillId:string;displayName:string;proficiencyLevel:ProficiencyLevel;source:string;confidence:number }
