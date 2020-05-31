select * from SurveyMaster order by Id desc;
select * from [Session] order by Id desc;
select * from AnswerGroup order by Id desc;
select * from AnswerOption order by Id desc;
select * from Question order by Id desc;
select * from SurveyQuestion order by Id desc;
select * from SurveyMap order by Id desc;
select * from [Result] order by Id desc;

--update SurveyQuestion set DisplayType = 'Dropdown' where SurveyMasterId = 76
/* delete from SurveyMaster where Id > 64; delete from Session where Id > 1175;
delete from AnswerGroup where Id > 5; delete from AnswerOption where Id > 25; 
delete from Question where Id > 25; delete from SurveyQuestion where Id > 250;
delete from SurveyMap where Id > 0; delete from [Result] where Id > 810; */
--UPDATE SurveyMaster SET Active = 0 WHERE Id = 65
--UPDATE AnswerGroup SET AutoFill = 1 WHERE Id = 104;
--UPDATE SurveyQuestion SET DisplayType = 'Dropdown';
--UPDATE SurveyMap SET DateEntered = CURRENT_DATE WHERE SurveyMasterId = 64;
--INSERT INTO SurveyMap(DateEntered, DataDef, SurveyMasterId)
--VALUES(CURRENT_DATE, '{"name": "Customer Satisfaction Survey","description": "Get feedback directly from the people who matter.","questions": [{"name": "Overall, how satisfied or dissatisfied are you with our company?","type": "Radio","answers": [{ "option": "Very satisfied" },{ "option": "Somewhat satisfied" },{ "option": "Neither satisfied or dissatisfied" },{ "option": "Somewhat dissatisfied" },{ "option": "Very dissatisfied" }]},{"name": "How well do our products meet your needs?","type": "Dropdown","answers": [{ "option": "Extremely well" },{ "option": "Very well" },{ "option": "Somewhat well" },{ "option": "Not so well" },{ "option": "Not at all well" }]},{"name": "How woul you rate the quality of the product?","type": "Dropdown","answers": [{ "option": "Very high quality" },{ "option": "High quality" },{ "option": "Neither high nor low quality" },{ "option": "Low quality" },{ "option": "Very low quality" }]},{"name": "How would you rate the value for money of the product?","type": "Dropdown","answers": [{ "option": "Excellent" },{ "option": "Above average" },{ "option": "Average" },{ "option": "Below average" },{ "option": "Poor" }]},{"name": "How responsive have we been to your questions or concerns about our products?","type": "Dropdown","answers": [{ "option": "Extremely responsive" },{ "option": "Very responsive" },{ "option": "Somewhat responsive" },{ "option": "Not so responsive" },{ "option": "Not at all responsive" },{ "option": "Not applicable" }]},{"name": "How long have you been a customer of our company?","type": "Dropdown","answers": [{ "option": "This is my first purchase" },{ "option": "Less than six months" },{ "option": "Six months to a year" },{ "option": "1 - 2 years" },{ "option": "3 or more years" },{ "option": "I have not made a purchase yet" }]},{"name": "How likely are you to purchase any of our products again?","type": "Dropdown","answers": [{ "option": "Extremely likely" },{ "option": "Very likely" },{ "option": "Somewhat likely" },{ "option": "Not so likely" },{ "option": "Not at all likely" }]}]}', 64)
--DELETE from SurveyMap where SurveyMasterId = 64;