create index idx_result_fkeys 
ON 'Result'(SessionId, SurveyMasterId, QuestionId, AnswerOptionId)

create index idx_answeroption_fkeys 
ON AnswerOption(AnswerGroupId)

create index idx_question_fkeys 
ON Question(AnswerGroupId)

create index idx_session_fkeys 
ON Session(SurveyMasterId)

create index idx_surveyquestion_fkeys 
ON SurveyQuestion(SurveyMasterId, QuestionId)

create index idx_surveymap_fkeys 
ON SurveyMap(SurveyMasterId)

