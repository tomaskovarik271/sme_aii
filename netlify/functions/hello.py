import json

def handler(event, context):
    """
    Netlify Function handler in Python.
    """
    print("Received event:", event) # Optional: Log the event data

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "message": "Hello from the Python backend!"
        })
    } 