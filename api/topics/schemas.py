topic_create_schema = {
    "type": "object",
    "properties": {
        "title": {"type":"string"},
        "content": {"type":"string"}
    },
    "required": ["title","content"],
    "additionalProperties": False,
}

topic_id_only_schema = {
    "type": "object",
    "properties": {
        "topicId": {"type":"string"},
    },
    "required": ["topicId"],
    "additionalProperties": False,
}
