import json
import hashlib
import requests

def lambda_handler(event, context):

    endpoint = event['course_uri']
    plainText = event['value']
    
    """
    CITATION NOTE:
    The following sources was referenced when implementing the SHA256 hashing:
    URL: https://datagy.io/python-sha256/
    URL: https://stackoverflow.com/questions/48613002/sha-256-hashing-in-python
    """
    cypherText = hashlib.sha256(plainText.encode('UTF-8')).hexdigest()

    response = {}
    response['banner'] = "B00919848"
    response['result'] = cypherText
    response['arn'] = "arn:aws:lambda:us-east-1:363707741195:function:SHA256"
    response['value'] = plainText
    response['action'] = event['action']

    try:
        res = requests.post(endpoint, json=response)
        print(res)
        return res.json()
    except Exception as e:
        print('hit')
        print(e)



