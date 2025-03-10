from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

def load_courses():
    response = supabase.table("courses").select("*").execute()
    courses = response.data
    for course in courses:
        course["prerequisites"] = course["prerequisites"] if isinstance(course["prerequisites"], list) else []
    return courses

def get_eligible_courses(completed_courses, all_courses, category=None):
    eligible = []
    for course in all_courses:
        prereqs = course["prerequisites"]
        if all(prereq in completed_courses for prereq in prereqs):
            if course["code"] not in completed_courses:
                if not category or course["category"] == category:
                    eligible.append(course)
    return eligible

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        courses = load_courses()
        return jsonify(courses)
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/eligible', methods=['POST'])
def get_eligible():
    try:
        data = request.json
        completed_courses = data.get("completed_courses", [])
        category = data.get("category")
        all_courses = load_courses()
        eligible = get_eligible_courses(completed_courses, all_courses, category)
        return jsonify(eligible)
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    
# @app.route('/api/sync_user', methods=['POST'])
# def sync_user():
#     try:
#         payload = request.json
#         if not payload or "data" not in payload:
#             return jsonify({"error": "Invalid request: Missing 'data' field"}), 400
        
#         data = payload["data"]
#         print("Received Data:", json.dumps(data, indent=2)) 

#         user_id = data.get("id")
#         email_addresses = data.get("email_addresses", [])
#         email = email_addresses[0]["email_address"] if email_addresses else None
#         first_name = data.get("first_name", "").strip()
#         last_name = data.get("last_name", "").strip()
#         name = f"{first_name} {last_name}".strip()  # Combine first and last name

#         if not user_id or not email:
#             return jsonify({"error": "Missing required user fields (ID or email)"}), 400

#         response = supabase.table("users").upsert({
#             "id": user_id,
#             "email": email,
#             "name": name
#         }).execute()

#         print("Supabase Response:", response)

#         if response.data:
#             return jsonify({"message": "User synced successfully", "data": response.data}), 200
#         else:
#             return jsonify({"error": "Failed to sync user to Supabase", "details": response}), 500

#     except Exception as e:
#         print("Error syncing user:", str(e))
#         return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to CS Curr API"})


if __name__ == "__main__":
    app.run(debug=True, port=8080, load_dotenv=True)