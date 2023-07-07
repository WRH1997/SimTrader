const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 80;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.post('/store-products', (req, res) => {
    try{
        /*
        CITATION NOTE: The following code used to create a connection between a Node application 
        and an AWS RDS was adapted from the following source.
        URL: https://stackabuse.com/using-aws-rds-with-node-js-and-express-js/
        */
        const con = mysql.createConnection({
            host: "a3x-db-instance-1.ccpvlnf0fhr1.us-east-1.rds.amazonaws.com",
            port: '3306',
            user: "admin",
            password: "admin1234",
            database: "A3"
        });
        let data = req.body;
        if(!data.hasOwnProperty('products')){
            con.end();
            res.status(400).send({"message":"Invalid Request JSON!", "error":"Request JSON Does Not Contain 'products' field!"});
            return;
        }
        let products = data['products'];
        con.connect(function(err) {
            if(err){
                con.end();
                res.status(500).send({"message":"An unexpected error occurred while inserting records into [products] table.", "error":err.message});
                return;
            } 
            let insertStr = "";
            for(var x=0; x<products.length; x++){
                let thisProduct = products[x];
                if(!thisProduct.hasOwnProperty('name') || !thisProduct.hasOwnProperty('price') || !thisProduct.hasOwnProperty('availability')){
                    con.end();
                    res.status(400).send({"message":"Invalid Request Data!", "error":"One or more products in the request JSON do not conform to the [product] table schema(name, price, availibility)!"});
                    return;
                }
                insertStr += "(\'" + thisProduct['name'] + "\', \'" + thisProduct['price'] + "\', " + thisProduct['availability'] + ")";
                if(x!=products.length-1){
                    insertStr += ", ";
                }
            }
            /*
            CITATION NOTE: The following code used to insert rows (of products in this case) into a 
            MySQL/Aurora AWS RDS was adapted from the following source.
            URL: https://www.tutorialkart.com/nodejs/nodejs-mysql-insert-into/
            */
            con.query("insert into products values " + insertStr + ";", function(err, result){
                if(err){
                    con.end();
                    res.status(500).send({"message":"An unexpected error occurred while inserting record(s) into [products] table.", "error":err.message});
                    return;
                }
                res.send({"message":"Success."});
            });
        });
    }
    catch(e){
        console.error(e, e.message);
        res.status(500).send({"message":"An unexprected error occurred while inserting record(s) into [products] table.", "error":e, "errorMessage":e.message});
    }
})




app.get('/list-products', (req, res) => {
    try{
    /*
    CITATION NOTE: The following code used to create a connection between a Node application 
    and an AWS RDS was adapted from the following source.
    URL: https://stackabuse.com/using-aws-rds-with-node-js-and-express-js/
    */
    const con = mysql.createConnection({
        host: "a3x-db-instance-1.ccpvlnf0fhr1.us-east-1.rds.amazonaws.com",
        port: '3306',
        user: "admin",
        password: "admin1234",
        database: "A3"
    });
    con.connect(function(err) {
        /*
        CITATION NOTE: The following code, which retrieves all the rows of the product table, from a 
        MySQL/Aurora AWS RDS was adapted from the following source.
        URL: https://www.tutorialkart.com/nodejs/node-js-mysql-select-from-query-examples/
        */
        con.query("select * from products", function (err, result, fields) {
          if(err){
              con.end();
              res.status(500).send({"message":"An unexpected error occurred while fetching record(s) from [products] table.", "error":err.message});
              return;
          }
          let products = [];
          for(var i=0; i<result.length; i++){
              let productInfo = {
                  "name": result[i]['name'],
                  "price": result[i]['price'],
                  "availability": result[i]['availability']
              }
              products.push(productInfo);
          }
          con.end();
          res.status(200).send({"products":products});
        });
    });
    }
    catch(e){
        console.error(e, e.message);
        res.status(500).send({"message":"An unexprected error occurred while reading record(s) from [products] table.", "error":e, "errorMessage":e.message});
    }
})



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})