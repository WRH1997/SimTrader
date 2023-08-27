import json
import boto3
from boto3.dynamodb.conditions import Attr
import hashlib

def lambda_handler(event, context):

    username = event['username'].lower()
    email = event['email']
    name = event['name']
    password = event['password']

    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')
    
    
    res1 = table.get_item(Key={'username':username})
    if 'Item' in res1:
        if res1['Item']['username'] == username:
            return{
                'statusCode': 400,
                'error': 'Error: The username [' + username + '] is already in use! Please try another username.'
            }
            
    
    
    res2 = table.scan(FilterExpression=Attr("email").eq(email))
    records = res2['Items']
    for user in records:
        if user['email'].lower() == email.lower():
            return{
                'statusCode': 400,
                'error': 'Error: The email [' + email + '] is already in use! Please try another email.'
            }

    sns = boto3.client('sns')
    emailPrefix = email.split('@')[0]
    try:
        subscribeRes = sns.subscribe(
            TopicArn='arn:aws:sns:us-east-1:363707741195:StockSNS_P1',
            Protocol='email',
            Endpoint=email,
            Attributes={
                'FilterPolicy': json.dumps({emailPrefix: [{"exists": True}]})
            }
        )
    except Exception as e:
        return{
            'statusCode': 400,
            'error': 'Error: The email [' + email + '] is invalid! Please try again.',
            'errorMessage': repr(e)
        }
    
    
    encryptedPass = hashlib.md5(password.encode('UTF-8')).hexdigest()

    newUser = table.put_item(
        Item={
            'username': username,
            'password': encryptedPass,
            'email': email,
            'name': name,
            'portfolios': {}
        }
    )
    
    return {
        'statusCode': 200,
        'body': newUser
    }
