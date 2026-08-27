export type ParseStatus='UPLOADED'|'PARSING'|'PARSED'|'FAILED'
export type SectionType='SUMMARY'|'EDUCATION'|'SKILLS'|'EXPERIENCE'|'PROJECTS'|'CERTIFICATIONS'|'ACHIEVEMENTS'|'CONTACT'|'OTHER'
export interface ResumeSummary {id:string;originalFilename:string;mimeType:string;fileSize:number;active:boolean;parseStatus:ParseStatus;uploadedAt:string}
export interface ResumeContact {email?:string;phone?:string;linkedin?:string;github?:string}
export interface ResumeSection {type:SectionType;text:string;sequenceOrder:number}
export interface ResumeDetail extends ResumeSummary {checksum:string;contact:ResumeContact;sections:ResumeSection[]}
export type AnalysisStatus='PENDING'|'PROCESSING'|'COMPLETED'|'PARTIAL'|'FAILED'
export type FindingType='STRENGTH'|'WEAKNESS'|'MISSING_SECTION'|'KEYWORD'|'ACTION_VERB'|'QUANTIFICATION'|'READABILITY'|'FORMATTING'|'GRAMMAR'|'REWRITE'
export type FindingSeverity='INFO'|'LOW'|'MEDIUM'|'HIGH'
export interface AnalysisSummary {id:string;resumeId:string;status:AnalysisStatus;overallScore:number;atsScore:number;modelProvider:string;createdAt:string}
export interface AnalysisFinding {id:string;type:FindingType;category:string;severity:FindingSeverity;title:string;description:string;originalText?:string;suggestedText?:string;sequenceOrder:number;aiGenerated:boolean}
export interface AnalysisDetail extends AnalysisSummary {sectionScore:number;keywordScore:number;actionVerbScore:number;quantificationScore:number;readabilityScore:number;modelName?:string;primaryModelAttempted?:string;fallbackModelUsed?:string;aiRequestOutcome?:string;promptVersion:string;scoringVersion:string;aiMessage:string;inputTruncated:boolean;findings:AnalysisFinding[];scoreDisclaimer:string}
