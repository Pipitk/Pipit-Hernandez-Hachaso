import os
import sys
if sys.platform == "win32":
    os.environ["WERKZEUG_RUN_MAIN"] = "true"  # Fixes some import issues

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json

app = Flask(__name__) 
CORS(app)

with open("supabase_config.json", "r") as config_file:
    config = json.load(config_file)

db = mysql.connector.connect(
    host=config["host"],
    user=config["user"],
    password=config["password"],
    database=config["database"]
)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    role = data.get('role')
    passcode = data.get('passcode')

    cursor = db.cursor(dictionary=True)
    if role == 'teacher':
        if passcode != "schooladmin":
            return jsonify({"error": "Invalid teacher passcode"}), 401
        cursor.execute("SELECT * FROM teachers WHERE username = %s", (username,))
    else:
        cursor.execute("SELECT * FROM students WHERE username = %s", (username,))

    user = cursor.fetchone()
    cursor.close()

    if user:
        return jsonify({"username": username, "role": role}), 200
    else:
        return jsonify({"error": "Invalid username"}), 401

@app.route('/courses', methods=['POST'])
def add_course():
    data = request.json
    course_name = data.get('course_name')
    description = data.get('description')

    cursor = db.cursor()
    cursor.execute("INSERT INTO courses (name, description) VALUES (%s, %s)", (course_name, description))
    db.commit()
    cursor.close()
    return jsonify({"message": "Course added successfully!"}), 201

@app.route('/courses', methods=['GET'])
def get_courses():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM courses")
    courses = cursor.fetchall()
    cursor.close()
    return jsonify(courses), 200

if __name__ == '__main__':
    app.run(debug=True, threaded=False)  # Prevents circular import issues

