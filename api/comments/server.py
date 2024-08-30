from flask import Flask, jsonify, request, json
from pymongo import MongoClient
from bson import ObjectId
from jsonschema import validate, ValidationError
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
import datetime
import os

from schemas import comment_id_only_schema, create_comment_schema
from helpers import serialize_doc


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET")

# CORS and JWT
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient('mongo-service', 27017)
db_comments = client.comments
comments = db_comments["comments"]


# UPVOTE
@app.route('/comments/upvote', methods=['POST'])
@jwt_required()
def comment_upvote():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=comment_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    commentId = request.json['commentId']

    comment = comments.find_one({"_id": ObjectId(commentId)})

    if comment:
        if user_id in comment["downvotedBy"]:
            comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfDownvotes": -1}, "$pull": {"downvotedBy": user_id}})

        if user_id in comment["upvotedBy"]:
            comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfUpvotes": -1}, "$pull": {"upvotedBy": user_id}})
            updated_comment = comments.find_one({"_id": ObjectId(commentId)})
            return jsonify({"message": "Comment upvote cancelled", "comment": serialize_doc(updated_comment)}), 200

        comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfUpvotes": 1}, "$push": {"upvotedBy": user_id}})
        updated_comment = comments.find_one({"_id": ObjectId(commentId)})
        
        return jsonify({"message": "Comment upvoted", "comment": serialize_doc(updated_comment)}), 200
    else:
        return jsonify({"message": "Comment not found"}), 404

# DOWNVOTE
@app.route('/comments/downvote', methods=['POST'])
@jwt_required()
def comment_downvote():

    user_id = get_jwt_identity()

    try:
        validate(instance=request.json, schema=comment_id_only_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    commentId = request.json['commentId']

    comment = comments.find_one({"_id": ObjectId(commentId)})

    if comment:
        if user_id in comment["downvotedBy"]:
            comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfDownvotes": -1}, "$pull": {"downvotedBy": user_id}})
            updated_comment = comments.find_one({"_id": ObjectId(commentId)})
            return jsonify({"message": "Comment downvote cancelled", "comment": serialize_doc(updated_comment)}), 200


        if user_id in comment["upvotedBy"]:
            comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfUpvotes": -1}, "$pull": {"upvotedBy": user_id}})


        comments.update_one({"_id": ObjectId(commentId)}, {"$inc": {"numOfDownvotes": 1}, "$push": {"downvotedBy": user_id}})
        updated_comment = comments.find_one({"_id": ObjectId(commentId)})
        
        return jsonify({"message": "Comment downvoted", "comment": serialize_doc(updated_comment)}), 200
    else:
        return jsonify({"message": "Comment not found"}), 404

# ADD COMMENT TO TOPIC
@app.route('/comments/add', methods=['POST'])
@jwt_required()
def comment_add():
    user_id = get_jwt_identity()
    topicId = request.json['topicId']
    content = request.json['content']
    jwt_data = get_jwt()
    claims_full_name = jwt_data["full_name"]

    comment = {
        "content": content,
        "ownerId": user_id,
        "ownerFullName": claims_full_name,
        "topicId": ObjectId(topicId),
        "upvotedBy": [],
        "downvotedBy": [],
        "numOfUpvotes": 0,
        "numOfDownvotes": 0,
        "parentId": None,
        "createdAt": datetime.datetime.now(),
    }

    insert_result = comments.insert_one(comment)
    comment_id = insert_result.inserted_id
    comment = comments.find_one({"_id": comment_id})

    # if "subscribers" in topic and topic["subscribers"]:
    #     subscriber_ids = [ObjectId(subscriber_id) for subscriber_id in topic["subscribers"]]
    #     subscriber_profiles = user_profiles.find({"_id": {"$in": subscriber_ids}})

    #     for profile in subscriber_profiles:
    #         if "email" in profile:
    #             executor.submit(send_email, profile["email"], topic["title"], comment["content"], comment["ownerFullName"])

    if comment is not None:
        return jsonify({"message": "Comment created", "comment": serialize_doc(comment)}), 200
    else:
        return jsonify({"error": "Comment was not found after insertion"}), 500

# GET COMMENTS FOR TOPIC
@app.route('/comments/<topic_id>', methods=['GET'])
@jwt_required()
def get_all_comments_for_topic(topic_id):
    try:

        user_id = get_jwt_identity()
        comments_list = list(comments.find({"topicId": ObjectId(topic_id)}))
        comments_list = [serialize_doc(comment) for comment in comments_list]
        return jsonify({"message": "Topics fetched", "comments": comments_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# TODO comment delete


# RUN SERVICE
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
    