package com.careerpilot.modules.resume.analysis.ai;
public record AiFeedbackResult(Status status,AiFeedback feedback,String provider,String model,String message,String primaryModelAttempted,String fallbackModelUsed,String requestOutcome) {
 public enum Status { SUCCESS, DISABLED, FAILED }
 public static AiFeedbackResult disabled(){return new AiFeedbackResult(Status.DISABLED,null,"DISABLED",null,"AI feedback is disabled; deterministic analysis completed locally.",null,null,"DISABLED");}
 public static AiFeedbackResult failed(String model,String message){return failed(model,null,message);}
 public static AiFeedbackResult failed(String primary,String fallback,String message){return new AiFeedbackResult(Status.FAILED,null,"GEMINI",fallback==null?primary:fallback,message,primary,fallback,"FAILED");}
 public static AiFeedbackResult success(AiFeedback feedback,String model){return success(feedback,model,null);}
 public static AiFeedbackResult success(AiFeedback feedback,String primary,String fallback){return new AiFeedbackResult(Status.SUCCESS,feedback,"GEMINI",fallback==null?primary:fallback,"Gemini feedback generated successfully.",primary,fallback,fallback==null?"PRIMARY_SUCCESS":"FALLBACK_SUCCESS");}
}
