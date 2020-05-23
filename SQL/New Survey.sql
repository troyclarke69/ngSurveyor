INSERT INTO SurveyMaster (Name, Purpose, DateOpen, Active)
VALUES('News Media Survey', '', '05/12/2020', 1)
-- return SurveyMasterId

INSERT INTO Session (Guid, DateEntered, Origin, SurveyMasterId)
VALUES(?,?,?,?)

INSERT INTO AnswerGroup (Name)
VALUES('Not much ... A lot')
-- return AnswerGroupId

INSERT INTO AnswerOption (AnswerVal, AnswerText, AnswerGroupId)
VALUES(1, 'Not much at all', 6),
(2, 'A little bit', 6),
(3, 'An average amount', 6),
(4, 'Quite a bit', 6),
(5, 'A lot', 6)

INSERT INTO Question (QGroup, [Order], QuestionText, AnswerGroupId)
VALUES(1, 1, 'How much news do you follow?", 6),
(1, 2, 'How much news do you believe is truthful?", 6),
(1, 3, 'How much news do you believe is positive?", 6),
(1, 4, 'How important is the source of news to you?", 6),
(1, 5, 'How much does repeated exposure affect how much you trust a news story?", 6),
(1, 6, 'How much news do you get from the internet?", 6)
-- return QuestionId

INSERT INTO SurveyQuestion (SurveyMasterId, QuestionId)
VALUES(?,?)