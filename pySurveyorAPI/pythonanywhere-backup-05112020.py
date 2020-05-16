
from flask import Flask, redirect, render_template, request, url_for
#from flask import request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import sqlite3
import requests
import json
#import decimal, datetime
#import pyodbc
#import numpy as np

app = Flask(__name__)
app.config["DEBUG"] = True
# pip install flask-cors in virtualFlask environment + made 'https'
# note: to access virtual env in bash console: source virtualenv, workon virtualFlask
CORS(app)

# MySQL config ******************************************************************************************START
SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="troyclarke69",
    password="Shadow234",
    hostname="troyclarke69.mysql.pythonanywhere-services.com",
    databasename="troyclarke69$comments",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
# MySQL config ********************************************************************************************END


# Class/Table Config  ***********************************************************************************START
class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(4096))

class News(db.Model):
    __tablename__ = "news"
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Numeric)
    author = db.Column(db.String(400))
    content = db.Column(db.String(4096))
    description = db.Column(db.String(4096))
    publishedAt = db.Column(db.Date)
    source = db.Column(db.String(200))
    title = db.Column(db.String(800))
    url = db.Column(db.String(800))
    urlToImage = db.Column(db.String(800))
# Class/Table Config  ************************************************************************************END

@app.route('/api/news', methods=['GET', 'POST'])
def api_news():
    api_url_base = 'https://newsapi.org/v2/top-headlines?country=ca&apiKey=de67b2237afe4fb1b77bfbe773987fca'
    headers = {'Content-Type': 'application/json'}
    response = requests.get(api_url_base, headers=headers)
    if response.status_code == 200:
        data = json.loads(response.content.decode('utf-8'))

        # Delete all data in table
        try:
            db.session.query(News).delete()
            db.session.commit()
        except:
            db.session.rollback()

        for inner in data['articles']:
            _author = inner['author']
            _content = inner['content']
            _description = inner['description']
            _publishedAt = inner['publishedAt']
            _source = inner['source']['name']
            _title = inner['title']
            _url = inner['url']
            _urlToImage = inner['urlToImage']

            # Add row to NEWS table
            newNews = News(rating = 0,author = _author,content = _content,description = _description,
                publishedAt = _publishedAt,source = _source,title = _title,url = _url,urlToImage = _urlToImage)

            db.session.add(newNews)
            db.session.commit()

        return data
    else:
        return None

def update_rating(id, rating):
    try:
        value = News.query.filter(News.id == id).first()
        value.rating = rating
        #db.session.flush()
        db.session.commit()
        #db.session.close()
    except:
        print('Error in def update_state')

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        #return render_template("index.html")
        return render_template("main_page.html",
            comments=Comment.query.all())

    comment = Comment(content=request.form["contents"])
    db.session.add(comment)
    db.session.commit()
    return redirect(url_for('index'))

@app.route("/home", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/news", methods=["GET", "POST"])
def news():
    return render_template("news.html", news=News.query.all())

@app.route("/api/mysql", methods=["GET"])
def api_mysql_select():

    res = Comment.query.all()
    return res

     # use special handler for dates and decimals
    #return json.dumps([dict(r) for r in res], default=alchemyencoder)

    #TypeError: Object of type Comment is not JSON serializable
    #return json.dumps(res)

    # SHIT THAT DOESN'T WORK >>
    #result = [d.__dict__ for d in data]
    #return jsonify(result=result)
    ## return specific cols:
    #cols = ['id', 'url', 'shipping']
    #data = Table.query.all()
    #result = [{col: getattr(d, col) for col in cols} for d in data]
    #return jsonify(result=result)

def alchemyencoder(obj):
    """JSON encoder function for SQLAlchemy special classes."""
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    elif isinstance(obj, decimal.Decimal):
        return float(obj)

# sqlite procedures below >
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.route('/api/download', methods=['GET'])
def api_download():

    api_url_base = 'https://pomber.github.io/covid19/timeseries.json'
    headers = {'Content-Type': 'application/json'}

    response = requests.get(api_url_base, headers=headers)

    if response.status_code == 200:
        return json.loads(response.content.decode('utf-8'))
    else:
        return None

@app.route('/api/v1/resources/books/all', methods=['GET'])
def api_all():
    conn = sqlite3.connect('/home/troyclarke69/mysite/books.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_books = cur.execute('SELECT * FROM books;').fetchall()

    return jsonify(all_books)

@app.route('/readme')
def hello_world():
    return '''<h2>API Endpoints:</h2>
        <p><i>&nbsp;&nbsp;>> uses sample 'https://pomber.github.io/covid19/timeseries.json':</i></p>
        <p>/api/download</p>
        <p><i>&nbsp;&nbsp;>> uses sample 'data.sqlite':</i></p>
        <p>/api/daily</p>
        <p>/api/daily/country **hardcoded to country: 'Canada', province: 'Ontario', category: 1 (cases)</p>
        <p><i>&nbsp;&nbsp;>> uses sample 'books.db':</i></p>
        <p>/api/v1/resources/books/all</p>
        <p>/api/v1/resources/books?published=2014</p>
        '''

@app.route('/api/daily', methods=['GET'])
def api_daily():

    conn = sqlite3.connect('/home/troyclarke69/mysite/data.sqlite')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_rows = cur.execute('''SELECT Country, Province, CASE WHEN Category = '1' THEN 'Cases'
        WHEN Category = '2' THEN 'Deaths' ELSE 'Recovered' END Category, Date1, Actual FROM "dbo.Moth"''').fetchall()

    return jsonify(all_rows)