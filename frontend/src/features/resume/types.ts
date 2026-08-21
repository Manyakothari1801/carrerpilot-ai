export type ParseStatus='UPLOADED'|'PARSING'|'PARSED'|'FAILED'
export type SectionType='SUMMARY'|'EDUCATION'|'SKILLS'|'EXPERIENCE'|'PROJECTS'|'CERTIFICATIONS'|'ACHIEVEMENTS'|'CONTACT'|'OTHER'
export interface ResumeSummary {id:string;originalFilename:string;mimeType:string;fileSize:number;active:boolean;parseStatus:ParseStatus;uploadedAt:string}
export interface ResumeContact {email?:string;phone?:string;linkedin?:string;github?:string}
export interface ResumeSection {type:SectionType;text:string;sequenceOrder:number}
export interface ResumeDetail extends ResumeSummary {checksum:string;contact:ResumeContact;sections:ResumeSection[]}
