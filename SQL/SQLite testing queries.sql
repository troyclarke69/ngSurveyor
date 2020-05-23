select * from SurveyMaster order by Id desc;
select * from [Session] order by Id desc;
select * from AnswerGroup order by Id desc;
select * from AnswerOption order by Id desc;
select * from Question order by Id desc;
select * from SurveyQuestion order by Id desc;
select * from SurveyMap order by Id desc;
select * from [Result] order by Id desc;

/* delete from SurveyMaster where Id > 64; delete from Session where Id > 1175;
delete from AnswerGroup where Id > 5; delete from AnswerOption where Id > 25; 
delete from Question where Id > 25; delete from SurveyQuestion where Id > 250;
delete from SurveyMap where Id > 0; delete from [Result] where Id > 810; */
--UPDATE SurveyMaster SET Active = 0 WHERE Id = 65
--UPDATE AnswerGroup SET AutoFill = 1 WHERE Id = 104;

