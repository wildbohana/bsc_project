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

