package com.careerpilot.modules.resume.exception;
import com.careerpilot.exception.ApiException;
import org.springframework.http.HttpStatus;
public class ResumeException extends ApiException { public ResumeException(HttpStatus status,String message){super(status,message);} }
