from flask import Flask, jsonify, request, json
from pymongo import MongoClient
from bson import ObjectId
from jsonschema import validate, ValidationError
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
import datetime
import os

from schemas import topic_create_schema, topic_id_only_schema
from helpers import transform_doc_to_user 


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET")

# CORS and JWT
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient('mongo-topics-service', 27017)
db_topic = client.topics
topics = db_topic["topics"]


# CREATE NEW TOPIC
@app.route('/topics/create/', methods=['POST'])
@jwt_required()
def topic_create():

    user_id = get_jwt_identity()
    jwt_data = get_jwt()
    claims_email = jwt_data["email"]
    claims_full_name = jwt_data["full_name"]

    try:
        validate(instance=request.json, schema=topic_create_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
        
    title = request.json['title']
    content = request.json['content']
    
    topics.insert_one({
        "title": title,
        "content": content,
        "ownerId": user_id,
        "ownerFullName": claims_full_name,
        "locked": False,
        "subscribers": [],
        "createdAt": datetime.datetime.now(),
        "numOfUpvotes": 0,
        "numOfDownvotes": 0,
        "upvotedBy": [],
        "downvotedBy": [],
    })

    return jsonify({"message": "Topic Created"}), 200

# SUBSCRIBE TO TOPIC
@app.route('/topics/subscribe/', methods=['POST'])
@jwt_required()
def topic_subscribe():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=topic_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    topicId = request.json['topicId']

    topic = topics.find_one({"_id": ObjectId(topicId)})

    if topic:
        if user_id in topic["subscribers"]:
            topics.update_one({"_id": ObjectId(topicId)}, {"$pull": {"subscribers": user_id}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})
            return jsonify({"message": "Unsubscribed from Topic", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
        else:
            topics.update_one({"_id": ObjectId(topicId)}, {"$push": {"subscribers": user_id}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})
            return jsonify({"message": "Subscribed to Topic", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
    else:
        return jsonify({"message": "Topic not found"}), 404

# LOCK TOPIC
@app.route('/topics/lock/', methods=['POST'])
@jwt_required()
def topic_lock():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=topic_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    topicId = request.json['topicId']

    topic = topics.find_one({"_id": ObjectId(topicId)})

    if topic and topic["ownerId"] == user_id:
        if topic["locked"] == True:
            topics.update_one({"_id": ObjectId(topicId)}, {"$set": {"locked": False}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})
            return jsonify({"message": "Topic Unlocked", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
        else:
            topics.update_one({"_id": ObjectId(topicId)}, {"$set": {"locked": True}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})
            return jsonify({"message": "Topic Locked", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
    else:
        return jsonify({"message": "Topic not found"}), 404

# DELETE TOPIC (if you are owner)
@app.route('/topics/delete/', methods=['POST'])
@jwt_required()
def topic_delete():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=topic_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    topicId = request.json['topicId']

    topic = topics.find_one({"_id": ObjectId(topicId)})

    if topic and topic["ownerId"] == user_id:
        topics.delete_one({"_id": ObjectId(topicId)})
        return jsonify({"message": "Topic deleted"}), 200
    else:
        return jsonify({"message": "You can only delete your topics"}), 403

# UPVOTE TOPIC
@app.route('/topics/upvote/', methods=['POST'])
@jwt_required()
def topic_upvote():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=topic_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    topicId = request.json['topicId']

    topic = topics.find_one({"_id": ObjectId(topicId)})

    if topic:
        if user_id in topic["downvotedBy"]:
            topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfDownvotes": -1}, "$pull": {"downvotedBy": user_id}})

        if user_id in topic["upvotedBy"]:
            topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfUpvotes": -1}, "$pull": {"upvotedBy": user_id}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})
            return jsonify({"message": "Topic upvote cancelled", "topic": transform_doc_to_user(updated_topic, user_id)}), 200

        topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfUpvotes": 1}, "$push": {"upvotedBy": user_id}})
        updated_topic = topics.find_one({"_id": ObjectId(topicId)})
        
        return jsonify({"message": "Topic upvoted", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
    else:
        return jsonify({"message": "Topic not found"}), 404

# DOWNVOTE TOPIC
@app.route('/topics/downvote/', methods=['POST'])
@jwt_required()
def topic_downvote():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=topic_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    topicId = request.json['topicId']

    topic = topics.find_one({"_id": ObjectId(topicId)})

    if topic:
        if user_id in topic["upvotedBy"]:
            topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfUpvotes": -1}, "$pull": {"upvotedBy": user_id}})

        if user_id in topic["downvotedBy"]:
            topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfDownvotes": -1}, "$pull": {"downvotedBy": user_id}})
            updated_topic = topics.find_one({"_id": ObjectId(topicId)})

            return jsonify({"message": "Topic downvote cancelled", "topic": transform_doc_to_user(updated_topic, user_id)}), 200

        topics.update_one({"_id": ObjectId(topicId)}, {"$inc": {"numOfDownvotes": 1}, "$push": {"downvotedBy": user_id}})
        updated_topic = topics.find_one({"_id": ObjectId(topicId)})

        return jsonify({"message": "Topic downvoted", "topic": transform_doc_to_user(updated_topic, user_id)}), 200
    else:
        return jsonify({"message": "Topic not found"}), 404

# GET ALL TOPICS
@app.route('/topics/all/', methods=['GET'])
@jwt_required()
def get_all_topics():
    try:

        user_id = get_jwt_identity()
        topics_list = list(topics.find({}))
        topics_list = [transform_doc_to_user(topic, user_id) for topic in topics_list]
        return jsonify({"message": "Topics fetched", "topics": topics_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET SPECIFIED TOPIC
@app.route('/topics/<topic_id>/', methods=['GET'])
@jwt_required()
def get_single_topic(topic_id):
    try:
        user_id = get_jwt_identity()
        topic = topics.find_one({'_id': ObjectId(topic_id)})
        
        if not topic:
            return jsonify({"error": "Topic not found"}), 404
        
        topic = transform_doc_to_user(topic, user_id)
        return jsonify({"message": "Topics fetched", "topic": topic}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# RUN SERVER
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
    