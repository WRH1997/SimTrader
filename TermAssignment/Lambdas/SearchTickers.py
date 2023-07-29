import json
import boto3
from botocore.vendored import requests
import base64
import urllib3

def lambda_handler(event, context):
    
    searchTerm = event['searchTerm']
    
    session = boto3.session.Session()
    secretClient = session.client(
        service_name = 'secretsmanager',
        region_name = 'us-east-1'
    )
    secretRes = secretClient.get_secret_value(SecretId = 'AlphaVantage1')
    secretJson = json.loads(secretRes['SecretString'])
    apiKey = secretJson['APIKey']

    alphaURL = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + searchTerm + '&apikey=' + apiKey


    http = urllib3.PoolManager()
    resp = http.request('GET', alphaURL)
    tickers = json.loads(resp.data.decode('utf-8'))
    
    return{
        'statusCode': 200,
        'body': tickers
    }

