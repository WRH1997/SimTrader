import json
import sys
import bcrypt
import glob
import requests


def lambda_handler(event, context):
    endpoint = event['course_uri']
    plainText = event['value']

    """
    CITATION NOTE:
    The following source was referenced in implementing the bcrypt hashing:
    URL: https://www.geeksforgeeks.org/hashing-passwords-in-python-with-bcrypt/
    """
    bytes = plainText.encode('utf-8')
    salt = bcrypt.gensalt()
    cypherText = bcrypt.hashpw(bytes, salt).decode("utf-8") 

    response = {}
    response['banner'] = "B00919848"
    response['result'] = cypherText
    response['arn'] = "arn:aws:lambda:us-east-1:363707741195:function:BCrypt2"
    response['value'] = plainText
    response['endpoint'] = endpoint
    response['action'] = event['action']

    try:
        res = requests.post(endpoint, json=response)
        print(res)
        return res.json()
    except Exception as e:
        print('hit')
        print(e)