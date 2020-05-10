import flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import sqlite3
import requests
import json
# for MSSQL/PYODBC >
import pyodbc
import collections
import datetime

app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)


# ex. http://127.0.0.1:5000/pysurveyor/result/post?result={ "1": "5", "2": "2", "3": "3", "4": "4", "5": "5", "6": "1", "7": "2", "8": "3", "9": "4", "10": "5", "11": "1", "12": "2", "13": "3", "14": "4", "15": "5", "16": "1", "17": "2", "18": "3", "19": "4", "20": "5", "21": "1", "22": "2", "23": "3", "24": "2", "25": "1" }&session=1
@app.route("/pysurveyor/result/post", methods=["GET", "POST"])
# @app.route("/test", methods=["GET", "POST"])
def result_post():

    query_parameters = request.args
    result = query_parameters.get('result')
    session = query_parameters.get('session')
    # survey = query_parameters.get('survey')

    # TO DO: Get surveyId from sessionId passed in...
    # perhaps we do not need the surveyId here at all (delete column from RESULT table)? 
    survey = 1

    # result = '{ "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "1", "7": "2", "8": "3", "9": "4", "10": "5", "11": "1", "12": "2", "13": "3", "14": "4", "15": "5", "16": "1", "17": "2", "18": "3", "19": "4", "20": "5", "21": "1", "22": "2", "23": "3", "24": "4", "25": "5" }'

    # parse param for easier processing
    row = result.replace('"', '')
    row = row.replace(' ', '')
    row = row.replace('{', '')
    row = row.replace('}', '')
    row = row.split(',')

    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')

    query = '''INSERT INTO [dbo].[Result]([SessionId],[SurveyMasterId],[QuestionId],[AnswerOptionId]) VALUES(?,?,?,?)'''
    cursor = conn.cursor()
    
    records=0
    for x in row:
        # print('**************')
        # print('>>    row: ', x)
        pos = x.find(":")
        # print('>>pos: ', pos)
        # print('>>len: ', len(x))
        question = x[0:pos]
        answer = x[pos+1:len(x)]
        # print('>> >> QuestionId ', question)
        # print('>> >> AnswerId ', answer)
        # print('>> >> session: ', session)
        # print('>> >> survey: ', survey)

        cursor.execute(query, session, survey, question, answer)
        records = records + 1
        # cursor.commit()

    # bulk insert
    cursor.commit()
    cursor.close()
    # return 'success: ' + 'Inserted ' + str(records) + ' records'
    return str(records)


# ex. http://127.0.0.1:5000//pysurveyor/survey/entry?session=1&qgroup=1
@app.route("/pysurveyor/survey/entry", methods=["GET"])
def survey_entry():
# params: sessionId, qgroup

    query_parameters = request.args
    session = query_parameters.get('session')
    qgroup = query_parameters.get('qgroup')

    # prereq: TO/DO - must insert row in SESSION table for session/survey
    query = "SELECT s.Id SessionId, sm.Id SurveyId, sm.Name, q.Id QuestionId, q.QuestionText, q.[Order] FROM Session s inner join SurveyMaster sm on s.SurveyMasterId = sm.Id inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId inner join Question q on q.Id = sq.QuestionId WHERE"   
    # s.Id = 1 AND q.QGroup = 1 ORDER BY q.[Id]"
    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')

    to_filter = []
    if session:
        query += ' s.Id=? AND'
        to_filter.append(session)
    if qgroup:
        query += ' q.QGroup=? AND'
        to_filter.append(qgroup)

    if not (session or qgroup):
        return page_not_found(404)

    query = query[:-4]
    query += " ORDER BY q.[Order];"

    cursor = conn.cursor()
    cursor.execute(query, to_filter)
    rows = cursor.fetchall()

    jsondata = {}
    # set these 2 with params passed in
    jsondata['sessionid'] = session
    # these 2 are needed here (?)
    jsondata['surveyid'] = '1'
    jsondata['name'] = 'survey 1'

    # FOR all questions for the survey ...
    questions=[] 
    for row in rows:
        question={}      
        question['id'] = row.QuestionId
        question['text'] = row.QuestionText
        questions.append(question)

        # get all answer options per each questionId (above) - based on the Question.AnswerGroupId
        query2 = "SELECT q.Id QuestionId, q.QuestionText, ao.Id AnswerOptionId, ao.AnswerText FROM Question q inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId WHERE q.Id = " + str(row.QuestionId)

        conn2 = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                            'Server=DESKTOP-GQKKU00;'
                            'Database=Surveyor;'
                            'Trusted_Connection=yes;')
        cursor2 = conn2.cursor()
        cursor2.execute(query2)
        rows2 = cursor2.fetchall()

        option=[]
        for row2 in rows2:
            opt={}           
            opt['id'] = row2.AnswerOptionId
            opt['text'] = row2.AnswerText
            option.append(opt)

        options={}
        options['option'] = option
        question['options'] = options

    jsondata['data'] = questions  
  
    conn.close()
    conn2.close()

    return jsonify(jsondata)


@app.route("/pysurveyor/summary", methods=["GET"])
def summary_header():
    
    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')
    cursor = conn.cursor()
    cursor.execute('SELECT Id, [Name], Purpose, DateOpen, DateClose, Active FROM [dbo].[SurveyMaster]')
    rows = cursor.fetchall()

    objects_list = []
    for row in rows:
        d = collections.OrderedDict()
        d['Id'] = row.Id
        d['Name'] = row.Name
        d['Purpose'] = row.Purpose
        d['DateOpen'] = str(row.DateOpen)
        d['DateClose'] = str(row.DateClose)
        if row.Active == 1:
            d['Active'] = "Open"
        else:
            "Closed"
       
        objects_list.append(d)

    response = json.dumps(objects_list)

    conn.close()
    return response

# http://127.0.0.1:5000/pysurveyor/survey?survey=1
@app.route("/pysurveyor/survey", methods=["GET"])
def survey_detail():
# params: sessionId, qgroup

    query_parameters = request.args
    survey = query_parameters.get('survey')
    # qgroup = query_parameters.get('qgroup')

    # prereq: TO/DO - must insert row in SESSION table for session/survey
    query = '''SELECT sm.Id SurveyMasterId, q.Id QuestionId, q.QuestionText, ag.Id AnswerGroupId 
                FROM SurveyMaster sm
                inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
                inner join Question q on q.Id = sq.QuestionId 
                inner join AnswerGroup ag on q.AnswerGroupId = ag.Id
                WHERE ''' 

    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')

    to_filter = []
    if survey:
        query += ' sm.Id=? AND'
        to_filter.append(survey)
    if not (survey):
        return page_not_found(404)

    query = query[:-4]
    query += " ORDER BY q.[Order];"

    cursor = conn.cursor()
    cursor.execute(query, to_filter)
    rows = cursor.fetchall()

    jsondata = {}
    # set these 2 with params passed in
    # jsondata['sessionid'] = session
    # these 2 are needed here (?)
    jsondata['surveyid'] = survey
    # jsondata['name'] = 'survey 1'

    # FOR all questions for the survey ...
    questions=[] 
    for row in rows:
        question={}      
        question['id'] = row.QuestionId
        question['text'] = row.QuestionText
        questions.append(question)


        # get answer options for each q
        query2 = '''SELECT sm.Id SurveyMasterId, q.Id QuestionId, q.QuestionText, ag.Id AnswerGroupId, 
                ao.Id AnswerOptionId, ao.AnswerText 
                FROM SurveyMaster sm
                inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
                inner join Question q on q.Id = sq.QuestionId 
                inner join AnswerGroup ag on q.AnswerGroupId = ag.Id
                inner join AnswerOption ao on ag.Id = ao.AnswerGroupId WHERE q.Id = ''' + str(row.QuestionId)
        query2 += ''' AND sm.Id = ''' + str(survey)

        conn2 = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                            'Server=DESKTOP-GQKKU00;'
                            'Database=Surveyor;'
                            'Trusted_Connection=yes;')
        cursor2 = conn2.cursor()
        cursor2.execute(query2)
        rows2 = cursor2.fetchall()

        print(rows2)

        option=[]
        for row2 in rows2:
            opt={}           
            opt['id'] = row2.AnswerOptionId
            opt['text'] = row2.AnswerText

            # get counts
            query3 = 'SELECT COUNT(*) Tally FROM Result WHERE SurveyMasterId = ' + str(survey)
            query3 += ' AND QuestionId = ' + str(row.QuestionId) 
            query3 += ' AND AnswerOptionId = ' + str(row2.AnswerOptionId)

            conn3 = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                                'Server=DESKTOP-GQKKU00;'
                                'Database=Surveyor;'
                                'Trusted_Connection=yes;')
            cursor3 = conn3.cursor()
            cursor3.execute(query3)
            rows3 = cursor3.fetchall()

            # option=[]
            for row3 in rows3:          
                opt['tally'] = row3.Tally
                option.append(opt)

            options={}
            options['option'] = option
            question['options'] = options

    jsondata['data'] = questions  
  
    conn.close()
    conn2.close()

    # print(jsonify(jsondata))
    return jsonify(jsondata)

# http://127.0.0.1:5000/pysurveyor/survey?survey=1
@app.route("/pysurveyor/survey/old", methods=["GET"])
def summary_detail():

    query_parameters = request.args
    survey = query_parameters.get('survey')
    # placeholders...
    param2 = query_parameters.get('param2')
    param3 = query_parameters.get('param3')

    # print('Params: ', survey)

    query = "select r.SurveyMasterId, sm.Name, QuestionId, q.QuestionText, AnswerOptionId, ao.AnswerText, count(*) [Votes],	(cast(count(*) as money) / 100) * 100 [Perc] from Result r inner join Question q on r.QuestionId = q.Id inner join AnswerOption ao on r.AnswerOptionId = ao.Id inner join SurveyMaster sm on r.SurveyMasterId = sm.Id where"
    
    # QuestionId in (1,2) and"   
    to_filter = []

    if survey:
        query += ' r.SurveyMasterId=? AND'
        to_filter.append(survey)
    if param2:
        query += ' param2=? AND'
        to_filter.append(param2)
    if param3:
        query += ' param3=? AND'
        to_filter.append(param3)
    if not (survey or param2 or param3):
        return page_not_found(404)

    query = query[:-4]
    query += " group by r.SurveyMasterId, sm.Name, QuestionId, q.QuestionText, AnswerOptionId, ao.AnswerText order by r.SurveyMasterId, sm.Name, QuestionId, q.QuestionText, AnswerOptionId;"
    # print(query)   
    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')
    cursor = conn.cursor()
    cursor.execute(query, to_filter)
    rows = cursor.fetchall()

    # output contains no keys
    # rowarray_list = []
    # for row in rows:
    #     t = (row.SurveyMasterId, row.QuestionId, row.QuestionText, row.AnswerOptionId, 
    #         row.AnswerText, row.Votes, str(row.Perc))
    #     rowarray_list.append(t)
    # response = json.dumps(rowarray_list)
    print(query)

    objects_list = []
    outer_list = []
    inner_list = []

    for row in rows:
        d = collections.OrderedDict()
        
        #top object
        d['SurveyMasterId'] = row.SurveyMasterId
        d['Name'] = row.Name

        #outer array
        d['QuestionId'] = row.QuestionId
        d['QuestionText'] = row.QuestionText

        #inner array
        d['AnswerOptionId'] = row.AnswerOptionId
        d['AnswerText'] = row.AnswerText
        d['Votes'] = row.Votes
        d['Perc'] = str(row.Perc)

        objects_list.append(d)

    response = json.dumps(objects_list, indent=2)
    
    conn.close()
    return response

@app.route("/pysurveyor/survey/entry/old", methods=["GET"])
def survey_entry_old():

    query_parameters = request.args
    session = query_parameters.get('session')
    qgroup = query_parameters.get('qgroup')
        # placeholder...
    param3 = query_parameters.get('param3')

    query = "SELECT s.Id SessionId, sm.Id SurveyId, sm.Name, q.Id QuestionId, q.QuestionText, ao.AnswerVal, ao.AnswerText FROM Session s inner  join SurveyMaster sm on s.SurveyMasterId = sm.Id inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId inner join Question q on q.Id = sq.QuestionId inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId WHERE"
    
    #  s.Id = 1 AND q.QGroup = 1
    #     ORDER BY q.[Order]"
    
    to_filter = []
    if session:
        query += ' s.Id=? AND'
        to_filter.append(session)
    if qgroup:
        query += ' qgroup=? AND'
        to_filter.append(qgroup)
    if param3:
        query += ' param3=? AND'
        to_filter.append(param3)
    if not (session or qgroup or param3):
        return page_not_found(404)

    query = query[:-4]
    query += " ORDER BY q.[Order];"

    # print(query)
    
    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                        'Server=DESKTOP-GQKKU00;'
                        'Database=Surveyor;'
                        'Trusted_Connection=yes;')
    cursor = conn.cursor()
    cursor.execute(query, to_filter)

    rows = cursor.fetchall()

    # output contains no keys
    # rowarray_list = []
    # for row in rows:
    #     t = (row.SurveyMasterId, row.QuestionId, row.QuestionText, row.AnswerOptionId, 
    #         row.AnswerText, row.Votes, str(row.Perc))
    #     rowarray_list.append(t)
    # response = json.dumps(rowarray_list)
    print(query)
    objects_list = []
    outer_list = []
    inner_list = []

    for row in rows:
        d = collections.OrderedDict()      
        #outer object
        d['SessionId'] = row.SessionId
        d['SurveyId'] = row.SurveyId
        d['Name'] = row.Name
        d['QuestionId'] = row.QuestionId
        d['QuestionText'] = row.QuestionText
        #inner array
        # options 
        d['AnswerVal'] = row.AnswerVal
        d['AnswerText'] = row.AnswerText

        objects_list.append(d)

    response = jsonify(objects_list)
    
    conn.close()
    return response

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

@app.route('/', methods=['GET'])
def home():
    return '''
        <span><h1>pysurveyor-api</h1></span>     
        '''

app.run()