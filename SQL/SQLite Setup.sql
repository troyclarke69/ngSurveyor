CREATE TABLE Result_temp
(Id integer primary key autoincrement, 
SessionId integer, 
SurveyMasterId integer, 
QuestionId integer, 
AnswerOptionId integer)

INSERT INTO 'Result_temp'
(SessionId, SurveyMasterId, QuestionId, AnswerOptionId)
SELECT SessionId, SurveyMasterId, QuestionId, AnswerOptionId
FROM 'dbo.Result';

SELECT * FROM 'Result_temp'

DROP TABLE 'dbo.Result';
ALTER TABLE Result_temp RENAME TO Result;

-------------
CREATE TABLE Session_temp
(Id integer primary key autoincrement, 
Guid text, 
DateEntered datetime, 
Origin text, 
SurveyMasterId integer)

INSERT INTO 'Session_temp'
(Guid, DateEntered, Origin, SurveyMasterId)
SELECT Guid, DateEntered, Origin, SurveyMasterId
FROM 'dbo.Session';

SELECT * FROM 'Session_temp'

DROP TABLE 'dbo.Session';
ALTER TABLE Session_temp RENAME TO Session;

---------------
--ALTER TABLE 'dbo.AnswerGroup' RENAME TO AnswerGroup;
--ALTER TABLE 'dbo.AnswerOption' RENAME TO AnswerOption;
--ALTER TABLE 'dbo.Question' RENAME TO Question;
--ALTER TABLE 'dbo.SurveyMaster' RENAME TO SurveyMaster;
--ALTER TABLE 'dbo.SurveyQuestion' RENAME TO SurveyQuestion;

-------------
CREATE TABLE AnswerGroup_temp
(Id integer primary key autoincrement, 
Name text)

INSERT INTO AnswerGroup_temp
(Name)
SELECT Name
FROM 'AnswerGroup';

SELECT * FROM AnswerGroup_temp

DROP TABLE AnswerGroup;
ALTER TABLE AnswerGroup_temp RENAME TO AnswerGroup;

-------------
CREATE TABLE AnswerOption_temp
(Id integer primary key autoincrement, 
AnswerVal integer, AnswerText text, AnswerGroupId integer)

INSERT INTO AnswerOption_temp
(AnswerVal, AnswerText, AnswerGroupId)
SELECT AnswerVal, AnswerText, AnswerGroupId
FROM AnswerOption;

SELECT * FROM AnswerOption_temp

DROP TABLE AnswerOption;
ALTER TABLE AnswerOption_temp RENAME TO AnswerOption;

-------------
CREATE TABLE Question_temp
(Id integer primary key autoincrement, 
QGroup integer, [Order] integer, QuestionText text, AnswerGroupId integer)

INSERT INTO Question_temp
(QGroup, [Order], QuestionText, AnswerGroupId)
SELECT QGroup, [Order], QuestionText, AnswerGroupId
FROM Question;

SELECT * FROM Question_temp

DROP TABLE Question;
ALTER TABLE Question_temp RENAME TO Question;

-------------
CREATE TABLE SurveyMaster_temp
(Id integer primary key autoincrement, 
Name text, Purpose text, DateOpen datetime, DateClose datetime, Active integer)

INSERT INTO SurveyMaster_temp
(Name, Purpose, DateOpen, DateClose, Active)
SELECT Name, Purpose, DateOpen, DateClose, Active
FROM SurveyMaster;

SELECT * FROM SurveyMaster_temp

DROP TABLE SurveyMaster;
ALTER TABLE SurveyMaster_temp RENAME TO SurveyMaster;

-------------
CREATE TABLE SurveyQuestion_temp
(Id integer primary key autoincrement, 
SurveyMasterId integer, QuestionId integer)

INSERT INTO SurveyQuestion_temp
(SurveyMasterId, QuestionId)
SELECT SurveyMasterId, QuestionId
FROM SurveyQuestion;

SELECT * FROM SurveyQuestion_temp

DROP TABLE SurveyQuestion;
ALTER TABLE SurveyQuestion_temp RENAME TO SurveyQuestion;