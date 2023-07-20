import json
import hashlib
import requests

def lambda_handler(event, context):

    endpoint = event['course_uri']
    plainText = event['value']

    """
    CITATION NOTE: 
    The following source was referenced while implementing the MD5 hashing:
    URL: https://www.geeksforgeeks.org/md5-hash-python/
    """
    cypherText = hashlib.md5(plainText.encode('UTF-8')).hexdigest()

    response = {}
    response['banner'] = "B00919848"
    response['result'] = cypherText
    response['arn'] = "arn:aws:lambda:us-east-1:363707741195:function:MD5"
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

    
