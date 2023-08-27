import json
import boto3

def lambda_handler(event, context):
    
    username = event['username']
    
    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')
    
    try:
        response = table.get_item(Key={'username':username})
        portfolios = response['Item']['portfolios']
        if 'viewPort' in event:
            singlePort = event['viewPort']
            return{
                'statusCode': 200,
                'body': portfolios[singlePort]
            }
        return{
            'statusCode': 200,
            'body': portfolios
        }
    except Exception as e:
        return{
            'statusCode': 500,
            'error': 'An error occurred trying to fetch your portfolio(s).',
            'errorMessage': repr(e)
        }
    
