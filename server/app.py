from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

def load_courses():
    with open("courses.json", "r") as f:
        return json.load(f)
    
def get_eligible_courses(completed_courses,all_courses):
    eligible = []
    for course in all_courses:
        prereqs = course["prerequisites"]
        if all(prereq in completed_courses for prereq in prereqs):
            eligible.append(course)
    return eligible

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        courses = load_courses()
        return jsonify(courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/eligible', methods=['POST'])
def get_eligible():
    try:
        data = request.json
        completed_courses = data.get("completed_courses", [])
        all_courses = load_courses()
        eligible = get_eligible_courses(completed_courses, all_courses)
        return jsonify(eligible)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to CS Curr API"})


if __name__ == "__main__":
    app.run(debug=True, port=8080)