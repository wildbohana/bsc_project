from flask import Flask, jsonify, request, json
from pymongo import MongoClient
from werkzeug.security import generate_password_hash,check_password_hash
from bson import ObjectId
from jsonschema import validate, ValidationError
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_cors import CORS
from datetime import timedelta
import os

from schemas import user_login_schema, user_registration_schema
from helpers import serialize_doc 


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET")

# CORS and JWT
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient('mongo-users-service', 27017)
#client = MongoClient("host.minikube.internal", 27017)
db_credentials = client.credentials
db_profiles = client.profiles
user_credentials = db_credentials["user_credentials"]
user_profiles = db_profiles["user_profiles"]


# REGISTER USER
@app.route('/users/register/', methods=['POST'])
def register():
    try:
        validate(instance=request.json, schema=user_registration_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    email = request.json['email']
    password = request.json['password']
    first_name = request.json['first_name']
    last_name = request.json['last_name']
    country = request.json['country']
    address = request.json['address']
    city = request.json['city']
    phone = request.json['phone']

    if user_credentials.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    user_id = user_credentials.insert_one({
        "email": email,
        "password": hashed_password
    }).inserted_id

    user_profiles.insert_one({
        "email": email,
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "country": country,
        "address": address,
        "city": city,
        "phone": phone
    })
    
    if not user_profiles.find_one({"email": email}):
        return jsonify({"error": "Failed to insert to db"}), 400

    return jsonify({"message": "User created successfully", "user_id": str(user_id)}), 201

# LOGIN USER
@app.route('/users/login/', methods=['POST'])
def login():
    try:
        validate(instance=request.json, schema=user_login_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    email = request.json['email']
    password = request.json['password']
    user = user_credentials.find_one({"email": email})

    if user:
        user_details = user_profiles.find_one({"user_id": user['_id']})

    if user and check_password_hash(user['password'], password):
        expires = timedelta(days=7)
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={"email": email, "full_name": user_details['first_name'] + " " + user_details['last_name']},
            expires_delta=expires
        )
        
        if access_token is not None:
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error creating access token": str(e)}), 400            
        
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# GET USER PROFILE
@app.route('/users/profile/', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user_profile = user_profiles.find_one({"user_id": ObjectId(user_id)})
        serialized_profile = serialize_doc(user_profile)
        if serialized_profile is None:
            return jsonify({"error": "Profile not found"}), 404
        return jsonify({"profile": serialized_profile}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# UPDATE USER PROFILE
@app.route('/users/profile/', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user_profile = request.json
        update_fields = {
            "first_name": user_profile.get("first_name"),
            "last_name": user_profile.get("last_name"),
            "country": user_profile.get("country"),
            "address": user_profile.get("address"),
            "city": user_profile.get("city"),
            "phone": user_profile.get("phone"),
        }
        update_fields = {k: v for k, v in update_fields.items() if v is not None}

        user_profiles.update_one({"user_id": ObjectId(user_id)}, {"$set": update_fields})
        
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# RUN SERVER
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
