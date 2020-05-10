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

#MSSQL config ******************************************************************************************START
# must import pyodbc

@app.route("/pySurveyor/Summary", methods=["GET"])
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

@app.route("/pySurveyor/Survey", methods=["GET"])
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

# /pySurveyor/survey/entry?session=1&qgroup=1
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
        
        #top object
        d['SessionId'] = row.SessionId
        d['SurveyId'] = row.SurveyId
        d['Name'] = row.Name

        #outer array
        d['QuestionId'] = row.QuestionId
        d['QuestionText'] = row.QuestionText

        #inner array
        d['AnswerVal'] = row.AnswerVal
        d['AnswerText'] = row.AnswerText

        objects_list.append(d)

    #essentially, the same thing... nice thing about jsonify is that response is formatted in browswer...
    # response = json.dumps(objects_list, indent=2)
    response = jsonify(objects_list)
    
    conn.close()
    return response


#MSSQL config ******************************************************************************************END


#This will run run.py at 11PM daily. Note that we kick off the run 
# at 11PM and fetch the results at 12AM. This gives ParseHub plenty of margin to finish the job.
# crontab -e
# 0 23 * * * python /tmp/parsehub/run.py

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.route('/api/download', methods=['GET'])
def api_download():

    # api_url_base = 'https://pomber.github.io/covid19/timeseries.json'
    api_url_base = 'https://newsapi.org/v2/top-headlines?q=corona&country=ca&apiKey=de67b2237afe4fb1b77bfbe773987fca'
    headers = {'Content-Type': 'application/json'}

    response = requests.get(api_url_base, headers=headers)
    if response.status_code == 200:
        data = json.loads(response.content.decode('utf-8'))
        
        # print('data ', data)
        for inner in data['articles']:
            # print('A ', inner['source']['name'])
            _author = inner['author']
            _content = inner['content']
            _description = inner['description']
            _publishedAt = inner['publishedAt']
            _source = inner['source']['name']
            _title = inner['title']
            _url = inner['url']
            _urlToImage = inner['urlToImage']
          
            print(_title)

        return data

        # conn = sqlite3.connect('data.sqlite')
        # conn.row_factory = dict_factory
        # cur = conn.cursor()

        # for record in result:
        #     country = record
            # print(country)
            # date1 = record["confirmed"]          
            # print(date1)
            # for r in record:
            #     confirmed = r['confirmed']
                # print(confirmed)

            # print(json.dumps(response.content.decode('utf-8')))
            # cur.execute('INSERT INTO dbo.Moth (cols) VALUES( vals )')
            # conn.commit()

        # cur.close()
        # conn.close()

        # return data

        # country = result
        # return country

    else:
        return None
        
    # return jsonify(all_rows)


@app.route('/', methods=['GET'])
def home():
    return '''
        <span><h1>SURVEYOR-API</h1></span>
        <p>Project: <h4>./repos/ngSurveyor/pySurveyorAPI</h4></p>
        <p>Python File: <h4>./surveyor_api.py</h4></p>

        <p><h2>Development Notes (Last Update: 5/04/2020):</h2></p>

        <ul>
            <li>Development uses MSSQL db: SURVEYOR (extracted from .NET project - NEWSMAN db)</li>
            <li><i>Coming</i> This python API <em>will</em> deploy with sqlite database named: <em>data.sqlite</em></li>
            
        </ul>
        <h2>Endpoints:</h2>
        <p>/pySurveyor/Summary</p>--- Returns list of surveys (open/closed)
        <p>/pySurveyor/Survey?survey=1</p>--- Returns total votes/percentage of questions & answer options per survey (param)
        
        '''

@app.route('/api/daily', methods=['GET'])
def api_daily():
# Note: This python API uses a sqlite database named: data.sqlite
# The 'data.sqlite' database is created through converting SQL database: Googster_dump to sqlite
# *** Googster_dump resides in the 'DESKTOP-x?x?x' SQL connected ***
# The conversion of SQL => SQLITE is done through rebasedata.com. 
# The originating data is retrieved through the 'Googster' (/Bug) .NET/MVC project.
# After running the download of data through .NET, running the custom SQL scripts developed 
# (found in /Googster/SQL folder) will parse the data into the Googster.Moth table. 
# This table is then IMPORTED into the Googster_dump database (through Tasks-Import in SQL)

    conn = sqlite3.connect('data.sqlite')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_rows = cur.execute('''SELECT Country, Province, CASE WHEN Category = '1' THEN 'Cases' 
        WHEN Category = '2' THEN 'Deaths' ELSE 'Recovered' END Category, Date1, Actual FROM "dbo.Moth"''').fetchall()

    return jsonify(all_rows)

@app.route('/api/daily/country', methods=['GET'])
def api_daily_country():
    # obtain params:
    # country, province + category?

    conn = sqlite3.connect('data.sqlite')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_rows = cur.execute('''SELECT Date1, Actual FROM "dbo.Moth"
        WHERE Category = "1" and Country = "Canada" and Province = "ontario" order by Date1''').fetchall()

    return jsonify(all_rows)

@app.route('/api/v1/resources/books/all', methods=['GET'])
def api_all():
    conn = sqlite3.connect('books.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_books = cur.execute('SELECT * FROM books;').fetchall()

    return jsonify(all_books)

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

@app.route('/api/v1/resources/books', methods=['GET'])
def api_filter():
    query_parameters = request.args

    id = query_parameters.get('id')
    published = query_parameters.get('published')
    author = query_parameters.get('author')

    query = "SELECT * FROM books WHERE"
    to_filter = []

    if id:
        query += ' id=? AND'
        to_filter.append(id)
    if published:
        query += ' published=? AND'
        to_filter.append(published)
    if author:
        query += ' author=? AND'
        to_filter.append(author)
    if not (id or published or author):
        return page_not_found(404)

    query = query[:-4] + ';'

    conn = sqlite3.connect('books.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    results = cur.execute(query, to_filter).fetchall()

    return jsonify(results)

app.run()
