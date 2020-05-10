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

@app.route("/test", methods=["GET"])
def test():

    jsondata = {}
    # set these 2 with params passed in
    jsondata['sessionid'] = '1'
    jsondata['surveyid'] = '1'

    jsondata['name'] = 'survey 1'

    # get all questions for the survey
    questions=[] 
    for x in range(1, 6):
        question={}
        
        question['id'] = x
        question['text'] = 'What is the question ' + str(x) + ' ?'
        # question['options'] = ''
        questions.append(question)

        # get all answer options per questionId (above) - based on the Question.AnswerGroupId
        option=[]
        for y in range(1, 6):
            opt={}
            
            opt['id'] = y
            opt['text'] = "Pick your choice - " + str(y)
            option.append(opt)

    # question['option'] = option
        options={}
        options['option'] = option

        question['options'] = options

    # jsondata['options'] = options
    jsondata['data'] = questions  
    print(json.dumps(jsondata))
    # return json.dumps(jsondata)
    return jsonify(jsondata)

@app.route("/pySurveyor/survey/entry", methods=["GET"])
def survey_entry():

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
        options 
        d['AnswerVal'] = row.AnswerVal
        d['AnswerText'] = row.AnswerText

        objects_list.append(d)

    #essentially, the same thing... nice thing about jsonify is that response is formatted in browswer...
    # response = json.dumps(objects_list, indent=2)
    response = jsonify(objects_list)
    
    conn.close()
    return response

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

@app.route('/', methods=['GET'])
def home():
    return '''
        <span><h1>SURVEYOR-API</h1></span>     
        '''

app.run()