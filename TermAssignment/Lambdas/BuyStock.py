import json
import boto3
from decimal import Decimal

def lambda_handler(event, context):
    
    username = event['username']
    portfolioName = event['portfolioName']
    stockTicker = event['ticker']
    quote = Decimal(str(event['quote']))
    quantity = Decimal(str(event['quantity']))

    
    ddb = boto3.resource('dynamodb')
    table = ddb.Table('SimTradeDB')

    response = table.get_item(Key={'username':username})
    email = response['Item']['email']
    portfolios = response['Item']['portfolios']
    portfolio = portfolios[portfolioName]
    balance = portfolio['balance']
    saleTotal = quote * quantity
    
    if saleTotal > balance:
        return{
            'statusCode': 400,
            'error': 'Error: You do not have enough funds to make this purchase!',
            'errorMessage': 'Total purchase price [$' + str(saleTotal) + '] exceeds current funds [$' + str(balance) + '].'
        }
    
    if stockTicker in portfolio:
        portfolio[stockTicker] = Decimal(str(portfolio[stockTicker])) + quantity
    else:
        portfolio[stockTicker] = quantity
    
    newBalance = balance - Decimal(str(saleTotal))
    newBalance = round(newBalance, 2)
    portfolio['balance'] = newBalance
    
    portfolios[portfolioName] = portfolio
    
    updateRes = table.update_item(
        Key={'username': username},
        UpdateExpression = 'set portfolios = :portfolios',
        ExpressionAttributeValues = {
            ':portfolios': portfolios
        }
    )
    
    msg = "Purchase Reciept:\n---------\nUsername: " + username + "\n\nStock: " + stockTicker + "\nQuantity Purchased: " + str(quantity) + "\n\nCurrent [" + stockTicker + "] Quantity: " + str(portfolio[stockTicker]) + "\n---------\nBalance: " + str(portfolio['balance']) + "\n\n\n\n\n" 
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
        
    
