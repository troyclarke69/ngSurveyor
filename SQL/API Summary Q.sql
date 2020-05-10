DROP TABLE IF EXISTS #TEMP;
CREATE TABLE #TEMP (
    Id int IDENTITY(1,1) PRIMARY KEY,
	SurveyId int not null,
	QuestionId int not null,
	QuestionText varchar(max),
	AnswerGroupId int not null,
	AnswerOptionId int not null,
	AnswerText varchar(max),
	Tally int
);

--fill temp table with data to process
INSERT INTO #TEMP(SurveyId,QuestionId, QuestionText, AnswerGroupId, AnswerOptionId, AnswerText)
	(select sm.Id, q.Id, q.QuestionText, ag.Id, ao.Id, ao.AnswerText
		from Session s
			inner join SurveyMaster sm on s.SurveyMasterId = sm.Id
			inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
			inner join Question q on q.Id = sq.QuestionId
			inner join AnswerGroup ag on q.AnswerGroupId = ag.Id
			inner join AnswerOption ao on ag.Id = ao.AnswerGroupId				
			--left join Result r on s.Id = r.SessionId and sm.Id = r.SurveyMasterId and q.Id = r.QuestionId and ao.Id = r.AnswerOptionId
			where s.Id = 1)

--now loop to obtain counts
DECLARE @TABLE_COUNT int = (SELECT COUNT(*) FROM #TEMP);
DECLARE @COUNTER int = 1;
DECLARE @SurveyId int = 0;
DECLARE @QuestionId int = 0;
DECLARE @AnswerOptionId int = 0;
DECLARE @TALLY int = 0;

WHILE @COUNTER <= @TABLE_COUNT
BEGIN
	SELECT @SurveyId = SurveyId, @QuestionId = QuestionId, @AnswerOptionId = AnswerOptionId
	FROM #TEMP WHERE Id = @COUNTER;

	BEGIN TRY
		SELECT @TALLY = COUNT(*) FROM Result
		WHERE SurveyMasterId = @SurveyId and QuestionId = @QuestionId and AnswerOptionId = @AnswerOptionId;

		UPDATE #TEMP
		SET Tally = @TALLY WHERE Id = @COUNTER;

		SET @COUNTER = @COUNTER + 1;
	
	END TRY  
	BEGIN CATCH
		SELECT   
			ERROR_NUMBER() AS ErrorNumber  
		   ,ERROR_MESSAGE() AS ErrorMessage;  
	END CATCH  
END

--return the results
SELECT * FROM #TEMP;