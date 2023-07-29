import json
import boto3
from boto3.dynamodb.conditions import Attr
import hashlib

def lambda_handler(event, context):
    
    username = event['username']
    password = event['password']
    encryptedPass = hashlib.md5(password.encode('UTF-8')).hexdigest()
    
    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')
    
    res1 = table.get_item(Key={'username':username})
    
    if 'Item' in res1:
        if res1['Item']['password'] == encryptedPass:
            return{
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': res1['Item']
            }
        else:
            return{
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'error': 'Error: The password you entered for user [' + username + '] is incorrect! Please try again.'
            }
    else:
        return{
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'error': 'Error: The user [' + username + '] does not exist in our system! Please check the spelling of your username and try again.'
        }

