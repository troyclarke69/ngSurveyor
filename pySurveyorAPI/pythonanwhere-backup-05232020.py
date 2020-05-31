def get_data_sl(q,f):
    conn = sqlite3.connect('/home/troyclarke69/mysite/data.sqlite')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(q,f)
    rows = cur.fetchall()
    conn.close()

    return rows

@app.route("/pysurveyor/summary", methods=["GET"])
def summary_header():

    query = '''SELECT Id, [Name], Purpose, DateOpen, DateClose, Active
            FROM SurveyMaster WHERE Active = 1'''

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

    conn = sqlite3.connect('/home/troyclarke69/mysite/data.sqlite')
    query = '''INSERT INTO Result ([SessionId],[SurveyMasterId],[QuestionId],[AnswerOptionId]) VALUES(?,?,?,?)'''
    cursor = conn.cursor()

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

        cursor.execute(query, _params)
        records = records + 1

    # bulk insert
    conn.commit()
    conn.close()
    return str(records)

# ex. /pysurveyor/survey/entry?session=1&survey=1&qgroup=1
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

@app.route("/pysurveyor/session/post", methods=["GET", "POST"])
def session_post():

    query_parameters = request.args
    guid = query_parameters.get('guid')
    survey = query_parameters.get('survey')
    dateEntered = datetime.datetime.now().date()
    origin = '' # future use

    query = '''INSERT INTO Session(Guid,DateEntered,Origin,SurveyMasterId) VALUES(?,?,?,?)'''

    conn = sqlite3.connect('/home/troyclarke69/mysite/data.sqlite')
    cur = conn.cursor()

    _params = []
    _params.append(guid)
    _params.append(dateEntered)
    _params.append(origin)
    _params.append(survey)

    cur.execute(query, _params)
    conn.commit()
    conn.close()

    # return id for new insert
    query_id = 'SELECT Id FROM Session WHERE Guid = ?'

    _params.clear()
    _params.append(guid)

    row = get_data_sl(query_id, _params)
    print(row)
    for r in row:
        new_id = r['Id']

    if new_id is None:
        return 'error'
    else:
        return str(new_id)


# http://127.0.0.1:5000/pysurveyor/survey?survey=1&session=0
@app.route("/pysurveyor/survey", methods=["GET"])
def survey_detail():
# params: sessionId, surveyId

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
    #query += " ORDER BY q.[Order];"

    # print(query)
    rows = get_data_sl(query, to_filter)

    # print('q1 ', rows)

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

        # print('query_total: ', query_total)

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
        query2 += ''' ORDER BY ao.AnswerVal'''

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
