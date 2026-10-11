package com.careerpilot.modules.assessment.grading;

import com.careerpilot.exception.ApiException;
import com.careerpilot.modules.assessment.dto.AnswerSubmission;
import com.careerpilot.modules.assessment.entity.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import com.careerpilot.modules.assessment.service.AttemptQuestionSet;

@Service
public class AssessmentGradingService {
 private final AttemptQuestionSet questionSet;public AssessmentGradingService(AttemptQuestionSet questionSet){this.questionSet=questionSet;}
 public void grade(AssessmentAttempt attempt,List<AnswerSubmission>submissions,Instant now){
  Map<UUID,AnswerSubmission>provided=new LinkedHashMap<>();for(var answer:submissions)if(provided.putIfAbsent(answer.questionId(),answer)!=null)throw new ApiException(HttpStatus.BAD_REQUEST,"Duplicate answer for question "+answer.questionId());
  Map<UUID,AssessmentQuestion>questions=new LinkedHashMap<>();questionSet.resolve(attempt).forEach(q->questions.put(q.getId(),q));
  if(!questions.keySet().containsAll(provided.keySet()))throw new ApiException(HttpStatus.BAD_REQUEST,"Submission contains a question outside this assessment");
  int correct=0,incorrect=0;
  for(var entry:provided.entrySet()){
   AssessmentQuestion question=questions.get(entry.getKey());AnswerSubmission submitted=entry.getValue();
   if(question.getQuestionType()!=QuestionType.MCQ)throw new ApiException(HttpStatus.BAD_REQUEST,"Unsupported question type");
   String selected=submitted.selectedOptionKey()==null?null:submitted.selectedOptionKey().strip().toUpperCase(Locale.ROOT);
   if(selected==null||selected.isBlank())continue;
   AssessmentOption option=question.getOptions().stream().filter(v->v.getOptionKey().equalsIgnoreCase(selected)).findFirst().orElseThrow(()->new ApiException(HttpStatus.BAD_REQUEST,"Invalid option for question "+question.getId()));
   AssessmentAnswer answer=new AssessmentAnswer();answer.setAttempt(attempt);answer.setQuestion(question);answer.setSelectedOptionKey(option.getOptionKey());answer.setCorrect(option.isCorrect());answer.setAwardedPoints(option.isCorrect()?BigDecimal.ONE:BigDecimal.ZERO);attempt.getAnswers().add(answer);if(option.isCorrect())correct++;else incorrect++;
  }
  int total=questions.size(),unanswered=total-correct-incorrect;attempt.setCorrectAnswers(correct);attempt.setIncorrectAnswers(incorrect);attempt.setUnanswered(unanswered);attempt.setScorePercentage(total==0?0:(int)Math.round(correct*100.0/total));attempt.setSubmittedAt(now);attempt.setDurationSeconds((int)Math.max(0,Duration.between(attempt.getStartedAt(),now).toSeconds()));attempt.setStatus(AttemptStatus.SUBMITTED);
 }
}
