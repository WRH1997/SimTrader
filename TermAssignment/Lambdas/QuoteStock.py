import json
import boto3
from botocore.vendored import requests
import base64
import urllib3


def lambda_handler(event, context):
    
    ticker = event['ticker']
    
    session = boto3.session.Session()
    secretClient = session.client(
        service_name = 'secretsmanager',
        region_name = 'us-east-1'
    )
    secretRes = secretClient.get_secret_value(SecretId = 'RealStonks1')
    secretJson = json.loads(secretRes['SecretString'])
    apiKey = secretJson['RealStonks']
    
    import http.client
    conn = http.client.HTTPSConnection("realstonks.p.rapidapi.com")

    headers = {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': "realstonks.p.rapidapi.com"
    }

    conn.request("GET", "/"+ticker, headers=headers)
    res = conn.getresponse()
    data = res.read()

    stockQuote = json.loads(data.decode('utf-8'))
    print(stockQuote)
    return {
        'statusCode': 200,
        'body': stockQuote
    }
