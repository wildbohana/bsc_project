from bson import ObjectId


def serialize_doc(doc):
    if doc is None:
        return None
    serialized_doc = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized_doc[key] = str(value)
        else:
            serialized_doc[key] = value
    return serialized_doc

def transform_doc_to_user(topic, user_id):
    topic["isSubscribed"] = get_is_subscribed_status(topic, user_id)
    topic["userAction"] = get_user_action(topic, user_id)
    topic["isOwner"] = is_topic_owner(topic, user_id)

    del topic["ownerId"]
    del topic["subscribers"]
    del topic["upvotedBy"]
    del topic["downvotedBy"]

    return serialize_doc(topic)

def get_is_subscribed_status(topic, user_id):
    if user_id in topic["subscribers"]:
        return True
    else:
        return False

def get_user_action(topic, user_id):
    if user_id in topic["upvotedBy"]:
        return "UPVOTED"
    elif user_id in topic["downvotedBy"]:
        return "DOWNVOTED"
    else:
        return "NONE"

def is_topic_owner(topic, user_id):
    if user_id in topic["ownerId"]:
        return True
    else:
        return False
