//configure imports
const express = require('express');
var app = express();
const parser = require('body-parser');
const fs = require('fs');


/*CITATION NOTE:
The following code was adapted from the source provided
and is used to configure express to use the body-parser library to
quickly extract an HTTP request's body (data).
URL: https://flaviocopes.com/node-request-data/
*/
app.use(parser.urlencoded({
    extended: true,
}))
app.use(parser.json());


//start express server
app.listen(3000, ()=>{
    console.log("Server running on port 3000...");
});


app.post('/getSum', (req, res)=>{

    //since the host machine volume is mounted to this container's
    //"/data" directory, so the file' specified in the user's request
    //is preceeded by that path
    var originalFile = req.body['file'];
    var file =  "data/" + originalFile;

    //check if the file exists
    if(!fileExists(file)){
        res.json({"file":originalFile, "error":"File not found."});
        return;
    }

    //check that the file conforms to a CSV format
    if(!validateCSV(file)){
        res.json({"file":originalFile, "error": "Input file not in CSV format."});
        return;
    }

    //if a product is specified in the user's request, then invoke a function
    //that access the file and calculates the sum of that product. If no product
    //is specified, then a response is sent with a "sum" of 0.
    if(req.body.hasOwnProperty('product')){
        var sum = calcSum(file, req.body['product'].trim().toLowerCase());
        res.json({"file":originalFile, "sum":sum});
    }
    else{
        res.json({"file":originalFile, "sum":0});
    }
})



function fileExists(file){
    /*CITATION NOTE:
    The following lines of code (lines ) were adapted from the provided source.
    Specifically, the function "existsSync" was referenced, which is used to
    simply check whether a file exists in the file system using the fs library.
    URL: https://flaviocopes.com/how-to-check-if-file-exists-node/
    */
    if(fs.existsSync(file)){
        return true;
    }
    else{
        return false;
    }
}


function validateCSV(file){
    //read file contents
    var fileContent = fs.readFileSync(file, 'utf8');
    //check that file is not empty
    if(fileContent.trim()==''){
        return false;
    }
    //check if the file is in CSV-format (i.e., must include ',')
    if(!fileContent.includes(",")){
        return false;
    }
    //store each CSV line in an array of strings (by spliiting it on new lines)
    var fileLines = fileContent.split("\n");
    //check that the file contains at least one line of content
    if(fileLines[0].trim().length==0){
        return false;
    }
    //check that the first line of the csv (i.e., the headers) is some form of "product, amount"
    var csvHeaders = fileLines[0].trim().split(",");
    if(csvHeaders.length!=2 || csvHeaders[0].toLowerCase().trim()!='product' || csvHeaders[1].toLowerCase().trim()!='amount'){
        return false;
    }
    //check that each line after the header (starting at line 2) has two values; a string and a numeric value, seperated by a comma
    for(var i=0; i<fileLines.length; i++){
        if(i==0){
            continue;
        }
        var lineVals = fileLines[i].trim().split(",");
        if(lineVals.length!=2 || typeof lineVals[0]!='string' || isNaN(lineVals[1])){
            return false;
        }
    }
    return true;
}


function calcSum(file, product){
    var sum = 0;
    //read file's contents
    var fileContent = fs.readFileSync(file, 'utf8');
    //split each line into an array of strings
    var fileLines = fileContent.split("\n");
    //loop through each line after the header-line (i.e., start at line 2), and
    //check whether the product matches the user's product. If so, it will add
    //that product's amount to the running total (sum)
    for(var i=0; i<fileLines.length; i++){
        if(i==0){
            continue;
        }
        var lineVals = fileLines[i].trim().split(",");
        if(lineVals[0].toLowerCase()==product.toLowerCase()){
            sum += Number(lineVals[1]);
        }
    }
    //note that the returned sum is 0 when the product is not found
    //in the file
    return sum;
}