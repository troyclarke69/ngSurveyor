import flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import sqlite3
import requests
import json
# for MSSQL/PYODBC >
import pyodbc
#import collections
import datetime

app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

dbName = 'data.sqlite'

# GETS survey list for cards (incl. # of respondents)
@app.route("/pysurveyor/survey/list", methods=["GET"])
def survey_list():
    
    query = ''' SELECT Id, [Name], Purpose, DateOpen, DateClose, [Count] 
                FROM SurveyMaster a LEFT JOIN
                    (SELECT SurveyMasterId, count(*) [Count] 
                        FROM [Session]
                        group by SurveyMasterId) as c on c.SurveyMasterId = a.Id
                WHERE Active = 1 ORDER BY [Count] desc'''

    to_filter = []
    rows = get_data_sl(query, to_filter)

    objects_list = []
    
    for row in rows:
        d = {}
        d['Id'] = row['Id']
        d['Name'] = row['Name']
        d['Purpose'] = row['Purpose']
        d['DateOpen'] = str(row['DateOpen'])
        d['DateClose'] = str(row['DateClose'])
        d['Count'] = str(row['Count'])
       
        objects_list.append(d)

    response = json.dumps(objects_list)
    return response

# GETS json schema  ...
# http://127.0.0.1:5000/pysurveyor/survey/schema?survey=60
@app.route("/pysurveyor/survey/schema", methods=["GET"])
def survey_schema():

    query_parameters = request.args
    _survey = query_parameters.get('survey')
    
    # for now - storing each creation/revision BUT only returning top 1 (latest) schema ...
    # future use - use as change/revision-tracker, templating, gen. troubleshooting...
    query = ''' SELECT DataDef FROM SurveyMap WHERE SurveyMasterId = ''' + str(_survey)
    query += ''' ORDER BY DateEntered desc 
                LIMIT 1;  '''

    to_filter = []
    rows = get_data_sl(query, to_filter)
    result = ''
    for row in rows:
        result = row[0]

    return str(result)

# http://127.0.0.1:5000/pysurveyor/survey/options?group=85
@app.route("/pysurveyor/survey/options", methods=["GET"])
def survey_options():

    query_parameters = request.args
    _group = query_parameters.get('group')
    
    query = ''' SELECT Id, AnswerVal, AnswerText FROM AnswerOption
                WHERE AnswerGroupId = ''' + str(_group)

    to_filter = []
    rows = get_data_sl(query, to_filter)

    result = []
    for row in rows:
        option={}      
        option['id'] = row['Id']
        option['answerval'] = row['AnswerVal']
        option['answertext'] = row['AnswerText']
        result.append(option)

    return jsonify(result)

# http://127.0.0.1:5000/pysurveyor/survey/groups
@app.route("/pysurveyor/survey/groups", methods=["GET"])
def survey_groups():

    # query_parameters = request.args
    # _group = query_parameters.get('group')
    
    query = ''' SELECT Id, Name FROM AnswerGroup WHERE AutoFill = 1 ORDER BY Name; '''
    to_filter = []
    rows = get_data_sl(query, to_filter)

    result = []
    option={}
    option['id'] = 0
    option['name'] = '~~ Auto-fill answer options ~~'
    result.append(option)

    for row in rows:
        option={}      
        option['id'] = row['Id']
        option['name'] = row['Name']
        result.append(option)

    return jsonify(result)


# ex. http://127.0.0.1:5000/pysurveyor/survey/create?new={"name":"The Awesome Survey","description":"This is the description of the new Survey","questions": [{"name":"Where is now?","answers": [{"option":"It's here"},{"option":"It's there"},{"option":"It's nowhere"},{"option":"It's everywhere"}]},{"name":"Who is what?","answers": [{"option":"It's her"},{"option":"It's him"},{"option":"It's no one"},{"option": "It's everyone"}]}]}&guid=n0e0w0s1u2r3v4e5y6
@app.route("/pysurveyor/survey/create", methods=["GET", "POST"])
def survey_create():
    # discovered in testing: query_parameters.get() cannot handle '#' ... and likely other special chars
    # not sure how to handle? have to eliminate chars before api call?

    query_parameters = request.args
    _result = query_parameters.get('new')
    _guid = query_parameters.get('guid')
    # load json str into js object
    data = json.loads(_result)

    # Insert into SurveyMaster, return SurveyMasterId ****************************
    _name = data['name']
    _purpose = data['description']
    _today = datetime.datetime.now().date()
    _origin = '' # future use
    _active = 1

    query = ''' INSERT INTO SurveyMaster (Name, Purpose, DateOpen, Active)
                VALUES(?, ?, ?, ?)'''
    _params = []
    _params.append(_name)
    _params.append(_purpose)
    _params.append(_today)
    _params.append(_active)
    _surveyMasterId = post_data_sl(query, _params)

    # Insert the session
    query = '''INSERT INTO Session(Guid,DateEntered,Origin,SurveyMasterId) VALUES(?,?,?,?)'''
    _params = []
    _params.append(_guid)
    _params.append(_today)
    _params.append(_origin)
    _params.append(_surveyMasterId)
    _sessionId = post_data_sl(query, _params)

    # Insert the 'map' record
    query = ''' INSERT INTO SurveyMap (DateEntered, DataDef, SurveyMasterId)
                VALUES(?, ?, ?)'''
    _params = []
    _params.append(_today)
    _params.append(_result)
    _params.append(_surveyMasterId)
    _surveyMapId = post_data_sl(query, _params)

    # load up arrays - easier to process going forward...
    questions = []
    answers = []
    for row in data['questions']:
        q = []
        q.append(row['name'])
        a = []
        for r in row['answers']:         
            a.append(r['option'])
        answers.append(a)
        questions.append(q)   

    count = 0
    for answer in answers:
        loop_count = 1
        loop_end = len(answer)
        # concat string on 1st and last entry to obtain AnswerGroup.name
        answerGroupName = ''
        for a in answer:
            if loop_count == 1:
                answerGroupName = answerGroupName + a
            if loop_count == loop_end:
                answerGroupName = answerGroupName + ' - ' + a          
            loop_count = loop_count + 1

        # in this loop -- insert AnswerGroup, return answerGroupId
        # print('insert AnswerGroup >> ', answerGroupName)
        query = '''INSERT INTO AnswerGroup(Name) VALUES(?)'''
        _params.clear()
        _params.append(answerGroupName)
        _answerGroupId = post_data_sl(query, _params)
        # print('answerGroupId ', _answerGroupId)

        # in this loop -- insert AnswerOption *answerGroupId
        # print('insert AnswerOptions >>')
        answerVal = 1
        for text in answer:
            # print('option ', text)
            query = ''' INSERT INTO AnswerOption(AnswerVal, AnswerText, AnswerGroupId)
                        VALUES(?,?,?) '''
            _params.clear()
            _params.append(answerVal)
            _params.append(text)
            _params.append(_answerGroupId)
            _answerOptionId = post_data_sl(query, _params)
            # print('answerOptionId ', _answerOptionId)
            answerVal = answerVal + 1

        # in this loop -- insert Question, return questionId *answerGroupId
        # print('insert Question >> ', questions[count][0])

        qOrder = count + 1
        query = ''' INSERT INTO Question(QGroup, [Order], QuestionText, AnswerGroupId)
                    VALUES(?,?,?,?) '''
        _params.clear()
        _params.append(1)   # QGroup default: 1 * future use
        _params.append(qOrder)
        _params.append(questions[count][0])
        _params.append(_answerGroupId)
        _questionId = post_data_sl(query, _params)
        # print('questionId ', _questionId)

        # in this loop -- insert SurveyQuestion *questionId
        # print('insert SurveyQuestion >> ', questions[count][0], _surveyMasterId)
        query = ''' INSERT INTO SurveyQuestion(SurveyMasterId, QuestionId)
                    VALUES(?,?) '''
        _params.clear()
        _params.append(_surveyMasterId)
        _params.append(_questionId)
        _surveyQuestionId = post_data_sl(query, _params)

        count = count + 1

    # nice to know
    # for question, answer in zip(questions, answers):
    #     print("{}:{}".format(question, ", ".join(answer)))

    return str(_surveyMasterId)



# ex. http://127.0.0.1:5000/pysurveyor/result/post?result={ "1": "5", "2": "2", "3": "3", "4": "4", "5": "5", "6": "1", "7": "2", "8": "3", "9": "4", "10": "5", "11": "1", "12": "2", "13": "3", "14": "4", "15": "5", "16": "1", "17": "2", "18": "3", "19": "4", "20": "5", "21": "1", "22": "2", "23": "3", "24": "2", "25": "1" }&session=1&survey=1
@app.route("/pysurveyor/result/post", methods=["GET", "POST"])
def result_post():

    query_parameters = request.args
    result = query_parameters.get('result')
    session = query_parameters.get('session')
    # Note: passing in both session and survey params - a session may have multi surveys (someday)
    # as of May 10 2020 - 1:1 session to survey
    survey = query_parameters.get('survey')

    # parse param for easier processing
    row = result.replace('"', '')
    row = row.replace(' ', '')
    row = row.replace('{', '')
    row = row.replace('}', '')
    row = row.split(',')

    query = '''INSERT INTO Result ([SessionId],[SurveyMasterId],[QuestionId],[AnswerOptionId]) 
                VALUES(?,?,?,?)'''
    
    records=0
    for x in row:
        pos = x.find(":")
        question = x[0:pos]
        answer = x[pos+1:len(x)]

        _params = []
        _params.append(session)
        _params.append(survey)
        _params.append(question)
        _params.append(answer)

        _id = post_data_sl(query, _params)
        records = records + 1

    return str(records)

# GETS survey for respondent
# ex. http://127.0.0.1:5000/pysurveyor/survey/entry?session=1&survey=1&qgroup=1
@app.route("/pysurveyor/survey/entry", methods=["GET"])
def survey_entry():
# params: sessionId, surveyId, qgroup

    query_parameters = request.args
    session = query_parameters.get('session')
    survey = query_parameters.get('survey')
    qgroup = query_parameters.get('qgroup')

    query = "SELECT s.Id SessionId, sm.Id SurveyId, sm.Name, q.Id QuestionId, q.QuestionText, q.[Order] FROM Session s inner join SurveyMaster sm on s.SurveyMasterId = sm.Id inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId inner join Question q on q.Id = sq.QuestionId WHERE"   

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

    rows = get_data_sl(query, to_filter)

    jsondata = {}
    jsondata['sessionid'] = session
    jsondata['surveyid'] = survey

    # FOR all questions for the survey ...
    questions=[] 
    for row in rows:
        jsondata['surveyname'] = row['Name']

        question={}      
        question['id'] = row['QuestionId']
        question['text'] = row['QuestionText']
        questions.append(question)

        # get all answer options per each questionId (above) - based on the Question.AnswerGroupId
        query2 = "SELECT q.Id QuestionId, q.QuestionText, ao.Id AnswerOptionId, ao.AnswerText FROM Question q inner join AnswerOption ao on q.AnswerGroupId = ao.AnswerGroupId WHERE q.Id = " + str(row['QuestionId'])

        to_filter.clear()
        rows2 = get_data_sl(query2, to_filter)

        option=[]
        for row2 in rows2:
            opt={}           
            opt['id'] = row2['AnswerOptionId']
            opt['text'] = row2['AnswerText']
            option.append(opt)

        options={}
        options['option'] = option
        question['options'] = options

    jsondata['data'] = questions  

    return jsonify(jsondata)

@app.route("/pysurveyor/summary", methods=["GET"])
def summary_header():
    
    query = "SELECT Id, [Name], Purpose, DateOpen, DateClose, Active FROM SurveyMaster WHERE Active = 1"

    to_filter = []
    rows = get_data_sl(query, to_filter)

    objects_list = []
    
    for row in rows:
        d = {}
        d['Id'] = row['Id']
        d['Name'] = row['Name']
        d['Purpose'] = row['Purpose']
        d['DateOpen'] = str(row['DateOpen'])
        d['DateClose'] = str(row['DateClose'])
        if row['Active'] == 1:
            d['Active'] = "Open"
        else:
            d['Active'] = "Closed"
       
        objects_list.append(d)

    response = json.dumps(objects_list)
    return response

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def post_data_sl(query, params):

    conn = sqlite3.connect(dbName)
    cur = conn.cursor()
    cur.execute(query, params)
    conn.commit()
    newId = cur.lastrowid
    conn.close()

    return newId

def get_data_sl(q,f):

    # print('get_data_sl -q', q)
    # print('get_data_sl -f', f)
    conn = sqlite3.connect(dbName)
    # conn.row_factory = dict_factory
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(q,f)
    rows = cur.fetchall()
    # print('get_data.sl -rows', rows)
    conn.close()
    
    return rows
    # return jsonify(rows)

def get_data(q,f):

    conn = pyodbc.connect('Driver={SQL Server Native Client 11.0};'
                            'Server=DESKTOP-GQKKU00;'
                            'Database=Surveyor;'
                            'Trusted_Connection=yes;')
    cursor = conn.cursor()
    cursor.execute(q,f)
    rows = cursor.fetchall()
    # print(rows)
    conn.close()
    return rows

# http://127.0.0.1:5000/pysurveyor/session/post?guid=0E984725-C51C-4BF4-9960-E1C80E27ABA0&survey=1
@app.route("/pysurveyor/session/post", methods=["GET", "POST"])
def session_post():
    
    query_parameters = request.args
    guid = query_parameters.get('guid')
    survey = query_parameters.get('survey')
    dateEntered = datetime.datetime.now().date()
    origin = '' # future use

    query = '''INSERT INTO Session(Guid,DateEntered,Origin,SurveyMasterId) VALUES(?,?,?,?)'''

    _params = []
    _params.append(guid)
    _params.append(dateEntered)
    _params.append(origin)
    _params.append(survey)
    _id = post_data_sl(query, _params)

    # return id for new insert ... compare to _id
    # query_id = 'SELECT Id FROM Session WHERE Guid = ?'
    # _params.clear()
    # _params.append(guid)
    # row = get_data_sl(query_id, _params)
    # # print(row)
    # for r in row:
    #     new_id = r['Id']

    if _id is None:
        return 'error'
    else:
        return str(_id)

# GETS results for specified survey
# http://127.0.0.1:5000/pysurveyor/survey?survey=1&session=0
@app.route("/pysurveyor/survey", methods=["GET"])
def survey_detail():
# params: sessionId, qgroup

    query_parameters = request.args
    survey = query_parameters.get('survey')
    session = query_parameters.get('session')

    _total = 0

    # get all questions per survey
    # NOTE: query does NOT include RESULT table, as it will not capture zero vote questions/options ...
    query = '''SELECT sm.Id SurveyMasterId, sm.Name, q.Id QuestionId, q.QuestionText, ag.Id AnswerGroupId 
                FROM SurveyMaster sm
                inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
                inner join Question q on q.Id = sq.QuestionId 
                inner join AnswerGroup ag on q.AnswerGroupId = ag.Id
                WHERE ''' 

    to_filter = []
    if survey:
        query += ' sm.Id=? AND'
        to_filter.append(survey)
    if not (survey):
        return page_not_found(404)

    query = query[:-4]
    query += " ORDER BY q.[Order];"
    rows = get_data_sl(query, to_filter)

    jsondata = {}
    jsondata['surveyid'] = survey

    # get all answer options for each quesiton of the survey ...
    questions=[] 
    for row in rows:
        jsondata['surveyname'] = row['Name']

        question={}      
        question['id'] = row['QuestionId']
        question['text'] = row['QuestionText']

        # now, get total vote tally per question
        query_total = '''
            SELECT r.SurveyMasterId, QuestionId, count(*) [Total]
                FROM Result r inner join Question q on r.QuestionId = q.Id 
                WHERE r.AnswerOptionId != 0 AND r.SurveyMasterId = ''' + str(survey)
        query_total += ''' AND QuestionId = ''' + str(row['QuestionId'])
        query_total += ''' GROUP BY r.SurveyMasterId, QuestionId'''

        to_filter.clear()
        row_total = get_data_sl(query_total, to_filter)

        if len(row_total) == 0:
            question['total'] = 0
            _total = 0

        if row_total is None:
            question['total'] = 0
            _total = 0
        else:
            for tot in row_total:
                question['total'] = tot['Total']
                _total = tot['Total']

        questions.append(question)

        # do not need first 4 fields but leaving them in for troubleshooting purposes...
        query2 = '''SELECT sm.Id SurveyMasterId, q.Id QuestionId, q.QuestionText, ag.Id AnswerGroupId, 
                ao.Id AnswerOptionId, ao.AnswerText 
                FROM SurveyMaster sm
                inner join SurveyQuestion sq on sm.Id = sq.SurveyMasterId
                inner join Question q on q.Id = sq.QuestionId 
                inner join AnswerGroup ag on q.AnswerGroupId = ag.Id
                inner join AnswerOption ao on ag.Id = ao.AnswerGroupId WHERE q.Id = ''' + str(row['QuestionId'])
        query2 += ''' AND sm.Id = ''' + str(survey)

        to_filter.clear()
        rows2 = get_data_sl(query2, to_filter)

        option=[]
        for row2 in rows2:
            opt={}           
            opt['id'] = row2['AnswerOptionId']
            opt['text'] = row2['AnswerText']

            # get answer option tallies per question/option
            query3 = 'SELECT COUNT(*) Tally FROM Result WHERE SurveyMasterId = ' + str(survey)
            query3 += ' AND QuestionId = ' + str(row['QuestionId']) 
            query3 += ' AND AnswerOptionId = ' + str(row2['AnswerOptionId'])

            # print(query3)
            to_filter.clear()
            rows3 = get_data_sl(query3, to_filter)

            for row3 in rows3: 
                if _total != 0:
                    p = round((row3['Tally'] / _total) * 100,1)
                    # print('Perc ', str(p)) 
                    opt['percentage'] = p
                else:
                    opt['percentage'] = 0

                opt['tally'] = row3['Tally']
                
                # determine if current user choose this (current AnswerOptionId) answer
                query_choice = '''SELECT COUNT(*) UserChoice FROM Result WHERE SurveyMasterId = ''' + str(survey)
                query_choice += ''' AND QuestionId = ''' + str(row['QuestionId']) 
                query_choice += ''' AND AnswerOptionId = ''' + str(row2['AnswerOptionId'])
                query_choice += ''' AND SessionId = ''' + str(session) 
                
                to_filter.clear()
                row_choice = get_data_sl(query_choice, to_filter)
                for choice in row_choice:
                    opt['choice'] = choice['UserChoice']

                option.append(opt)
           
            options={}
            options['option'] = option
            question['options'] = options
   
    jsondata['data'] = questions  
    return jsonify(jsondata)

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

@app.route('/', methods=['GET'])
def home():
    return '''
        <span><h1>pysurveyor-api</h1></span>     
        '''

app.run()