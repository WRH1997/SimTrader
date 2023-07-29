import json
import boto3
from decimal import Decimal


def lambda_handler(event, context):
    
    username = event['username']
    portfolioName = event['portfolioName']
    targetStock = event['ticker']
    stockQuote = event['quote']
    quantity = event['quantity']
    
    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')
    
    try:
        response = table.get_item(Key={'username':username})
        email = response['Item']['email']
        portfolios = response['Item']['portfolios']
        
        portfolio = portfolios[portfolioName]
        #return portfolio
        
        if quantity > Decimal(portfolio[targetStock]):
            return{
                'statusCode': 400,
                'error': 'The quantity you are trying to sell is greater than quantity owned!'
            }
            
        portfolio['balance'] = round((Decimal(portfolio['balance']) + Decimal((quantity * stockQuote))), 2)
        if quantity == portfolio[targetStock]:
            del portfolio[targetStock]
        else:
            portfolio[targetStock] = portfolio[targetStock] - quantity
        
        portfolios[portfolioName] = portfolio
        
        updateRes = table.update_item(
            Key={'username': username},
            UpdateExpression = 'set portfolios = :portfolios',
            ExpressionAttributeValues = {
                ':portfolios': portfolios
            }
        )
        
        msg = "Sales Reciept:\n---------\nUsername: " + username + "\nStock: " + targetStock + "\nQuantity Sold: " + str(quantity) + "\nQuantity Remaining: " + str(targetStock) + "\n---------\nBalance: " + str(portfolio['balance']) + "\n\n\n\n\n" 
        emailPrefix = email.split('@')[0]
        
        sns = boto3.client('sns')
        snsRes = sns.publish(
            TargetArn = 'arn:aws:sns:us-east-1:363707741195:StockSNS_P1',
            Message = msg,
            MessageAttributes = {
                emailPrefix: {'DataType': 'String','StringValue': 'ps'}
            },
            MessageStructure = 'text'
        )
      
        return {
          'statusCode': 200,
          'body': json.dumps(snsRes)
        }
        
    except Exception as e:
        return{
            'statusCode': 500,
            'error': 'Error: An error occurred trying to sell your target stock!',
            'errorMessage': repr(e)
        }
    
    
