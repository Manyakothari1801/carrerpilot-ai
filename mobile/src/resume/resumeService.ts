import type{DocumentPickerAsset}from'expo-document-picker';
import{api}from'@/src/api/client';
import{File,Paths}from'expo-file-system';
import*as Sharing from'expo-sharing';
import type{AnalysisDetail,AnalysisSummary,ResumeDetail,ResumeSummary}from'./resumeTypes';

export const resumeService={
 list:async()=>(await api.get<ResumeSummary[]>('/resumes')).data,
 upload:async(asset:DocumentPickerAsset,onProgress:(value:number)=>void)=>{const form=new FormData();if(asset.file)form.append('file',asset.file,asset.name);else form.append('file',{uri:asset.uri,name:asset.name,type:asset.mimeType}as unknown as Blob);return(await api.post<ResumeDetail>('/resumes',form,{headers:{'Content-Type':'multipart/form-data'},timeout:120_000,onUploadProgress:event=>onProgress(event.total?Math.round(event.loaded*100/event.total):0)})).data},
 activate:async(id:string)=>(await api.patch<ResumeDetail>(`/resumes/${id}/active`)).data,
 remove:async(id:string)=>{await api.delete(`/resumes/${id}`)},
 history:async(resumeId:string)=>(await api.get<AnalysisSummary[]>(`/resumes/${resumeId}/analyses`)).data,
 analysis:async(resumeId:string,analysisId:string)=>(await api.get<AnalysisDetail>(`/resumes/${resumeId}/analyses/${analysisId}`)).data,
 analyze:async(resumeId:string)=>(await api.post<AnalysisDetail>(`/resumes/${resumeId}/analyses`,undefined,{timeout:120_000})).data,
 downloadReport:async(resumeId:string,analysisId:string)=>{const response=await api.get<ArrayBuffer>(`/resumes/${resumeId}/analyses/${analysisId}/report.pdf`,{responseType:'arraybuffer',timeout:60_000});const file=new File(Paths.cache,`career-guidance-ai-${analysisId}.pdf`);file.create({overwrite:true});file.write(new Uint8Array(response.data));if(await Sharing.isAvailableAsync())await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',dialogTitle:'Resume Intelligence Report',UTI:'com.adobe.pdf'});return file.uri},
};
