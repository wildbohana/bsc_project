create_comment_schema = {
    "type": "object",
    "properties": {
        "content": {"type":"string"},
        "topicId": {"type":"string"},
        "parentId": {"type":"string"}
    },
    "required": ["content"],
    "additionalProperties": False,
}

comment_id_only_schema = {
    "type": "object",
    "properties": {
        "commentId": {"type":"string"},
    },
    "required": ["commentId"],
    "additionalProperties": False,
}
