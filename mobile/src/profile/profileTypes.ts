export type ExperienceLevel='STUDENT'|'ENTRY_LEVEL'|'JUNIOR'|'MID_LEVEL'|'SENIOR';
export type ProficiencyLevel='BEGINNER'|'INTERMEDIATE'|'ADVANCED'|'EXPERT';
export interface Profile{id:string;fullName:string;email:string;phone:string|null;college:string|null;degree:string|null;graduationYear:number|null;targetRole:string|null;experienceLevel:ExperienceLevel|null;githubUrl:string|null;linkedinUrl:string|null;bio:string|null;profileCompletionPercentage:number;missingFields:string[]}
export interface UserSkill{id:string;skillId:string;displayName:string;proficiencyLevel:ProficiencyLevel;source:string;confidence:number}
export interface ProfileUpdate{fullName:string;phone:string;college:string;degree:string;graduationYear:number|null;targetRole:string;experienceLevel:ExperienceLevel|null;githubUrl:string;linkedinUrl:string;bio:string}
export interface SkillInput{displayName:string;proficiencyLevel:ProficiencyLevel}
