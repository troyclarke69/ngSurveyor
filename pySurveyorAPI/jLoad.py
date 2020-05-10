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

# ex. http://127.0.0.1:5000/pySurveyor/survey/submit?result={ "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "1", "7": "2", "8": "3", "9": "4", "10": "5", "11": "1", "12": "2", "13": "3", "14": "4", "15": "5", "16": "1", "17": "2", "18": "3", "19": "4", "20": "5", "21": "1", "22": "2", "23": "3", "24": "4", "25": "5" }&session=1&survey=1
@app.route("/pySurveyor/survey/submit", methods=["GET", "POST"])
# @app.route("/test", methods=["GET", "POST"])
def test():

    query_parameters = request.args
    result = query_parameters.get('result')
    session = query_parameters.get('session')
    survey = query_parameters.get('survey')

    # with open("data_file.json", "r") as read_file:
    #     data = json.load(read_file)
    # print(type(data))

    # test
    # result = '{ "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "1", "7": "2", "8": "3", "9": "4", "10": "5", "11": "1", "12": "2", "13": "3", "14": "4", "15": "5", "16": "1", "17": "2", "18": "3", "19": "4", "20": "5", "21": "1", "22": "2", "23": "3", "24": "4", "25": "5" }'

    row = result.replace('"', '')
    row = row.replace(' ', '')
    row = row.replace('{', '')
    row = row.replace('}', '')
    # print(row.split(','))
    row = row.split(',')

    for x in row:
        print('**************')
        print('>>    row: ', x)

        pos = x.find(":")
        print('>>pos: ', pos)
        print('>>len: ', len(x))

        q = x[0:pos]
        a = x[pos+1:len(x)]

        print('>> >> QuestionId ', q)
        print('>> >> AnswerId ', a)

    return 'success'

app.run()