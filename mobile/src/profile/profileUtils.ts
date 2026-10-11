import type{Profile,UserSkill}from'./profileTypes';
export const completionFields=['fullName','phone','college','degree','graduationYear','targetRole','experienceLevel','githubUrl','linkedinUrl','skills']as const;
export function profileCompletion(profile:Profile,skills:UserSkill[]){const complete=[present(profile.fullName),present(profile.phone),present(profile.college),present(profile.degree),profile.graduationYear!=null,present(profile.targetRole),profile.experienceLevel!=null,present(profile.githubUrl),present(profile.linkedinUrl),skills.length>0].filter(Boolean).length;return complete*10}
export function initials(name:string){const parts=name.trim().split(/\s+/).filter(Boolean);return parts.slice(0,2).map(v=>v[0]?.toUpperCase()).join('')||'S'}
export function label(value:string){return value.toLowerCase().replaceAll('_',' ').replace(/(^|\s)\S/g,v=>v.toUpperCase())}
function present(value:string|null|undefined){return Boolean(value?.trim())}
