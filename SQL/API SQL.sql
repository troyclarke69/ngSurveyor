USE [Surveyor]

/*  .../pySurveyor/Summary  */
SELECT Id, [Name], Purpose, DateOpen, DateClose, Active FROM [dbo].[SurveyMaster]

/*  .../pySurveyor/Survey?survey=1  */
SELECt r.SurveyMasterId, QuestionId, q.QuestionText,
	AnswerOptionId, ao.AnswerText,
	count(*) [Count], (cast(count(*) as money) / 100) * 100 [Perc]
FROM Result r inner join Question q on r.QuestionId = q.Id inner join AnswerOption ao on r.AnswerOptionId = ao.Id
--where r.SurveyMasterId = 1
GROUP BY r.SurveyMasterId, QuestionId, q.QuestionText, AnswerOptionId, ao.AnswerText
ORDER BY r.SurveyMasterId, QuestionId, q.QuestionText, AnswerOptionId, ao.AnswerText

/*  .../pySurveyor/survey/entry?session=1&qgroup=1
	*** Return all questions with associated answer options for the user SESSION and SURVEY entered	
*/
SELECT s.Id SessionId, sm.Id SurveyId, sm.Name, q.Id QuestionId, q.QuestionText, ao.AnswerVal, ao.AnswerText
FROM Session s inner join SurveyMaster sm on s.SurveyMasterId = sm.Id
inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
inner join Question q on q.Id = sq.QuestionId
inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId
WHERE s.Id = 1 AND q.QGroup = 1
ORDER BY q.[Order]

/*  .../pySurveyor/survey/entry?session=1&qgroup=1
	*** Return all questions for the user SESSION and SURVEY entered	
*/
SELECT s.Id SessionId, sm.Id SurveyId, sm.Name, q.Id QuestionId, q.QuestionText, q.[Order], q.AnswerGroupId	
--, ao.AnswerVal, ao.AnswerText
FROM Session s inner join SurveyMaster sm on s.SurveyMasterId = sm.Id
inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
inner join Question q on q.Id = sq.QuestionId
--inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId
WHERE s.Id = 1 AND q.QGroup = 1
ORDER BY q.[Id]

/*  *** Now, return answer options for above questions */
SELECT q.Id QuestionId, q.QuestionText, ao.AnswerVal, ao.AnswerText
FROM Question q inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId
WHERE q.Id = 22







