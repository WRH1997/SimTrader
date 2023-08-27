import json
import boto3
from boto3.dynamodb.conditions import Attr
import hashlib
from decimal import Decimal


def lambda_handler(event, context):
    
    username = event['username']
    portfolioName = event['portfolioName']
    initialBalance = Decimal(str(event['balance']))
    
    if initialBalance <= 0:
        return{
            'statusCode': 400,
            'error': 'Initial balance must be a positive number.'
        }
    
    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')
    
    response = table.get_item(Key={'username':username})
    portfolios = response['Item']['portfolios']
    
    if portfolioName in portfolios:
        return{
            'statusCode': 400,
            'error': 'The portfolio [' + portfolioName + '] already exists. Portfolio names must be unique!'
        }
    
    
    portfolios[portfolioName] = {'balance': Decimal(str(initialBalance))}
    updateRes = table.update_item(
        Key={'username': username},
        UpdateExpression = 'set portfolios = :portfolios',
        ExpressionAttributeValues = {
            ':portfolios': portfolios
        }
    )

    return {
        'statusCode': 200,
        'body': updateRes
    }
