/*
CITATION NOTE: The following code, which constitutes container 1 server, was adapted from my Assignment 1
submission (since the A3's instructions allowed for the re-use of A1's code). However, the necessary modifications have been made.
The original code being referenced can be found at the following URL.
URL: https://git.cs.dal.ca/courses/2023-summer/csci4145-5409/alhindi/-/tree/main/A1/Container1
*/


const express = require('express');
const fetch = require('node-fetch');
const app = express();
const ip = require('ip')
const parser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
var path = require('path');



app.use(parser.urlencoded({
  extended: true,
}))
app.use(parser.json());



app.post("/store-file", (request, res) => {
  var file = null;
  var data = null;
  try{
      if(Object.keys(request.body).length==0){
        res.json({"file": null, "error": "Invalid JSON input."});
        return;
    }
    data = request.body;
    if(!data.hasOwnProperty('file')){
        res.json({"file": null, "error":"Invalid JSON input."});
        return;
    }
    file = data['file'];
    if(file==null || file.trim()==''){
        res.json({"file": null, "error":"Invalid JSON input."});
        return;
    }
    fs.writeFileSync("/waleed_PV_dir/"+file, data['data']);
  }
  catch(e){
    response.json({"file": file, "error":"Error while storing the file to the storage.", "errMess":e});
    return;
  }
  res.json({"file":file, "message":"Success."});
})



app.post('/calculate', (request, res) => {
  if(request.body['file']==null){
      res.json({"file": null, "error": "Invalid JSON input."});
      return;
  }
  var file = '';
  var prod = '';
  if(Object.keys(request.body).length==0){
      res.json({"file": null, "error": "Invalid JSON input."});
      return;
  }        
  var data = request.body;
  if(!data.hasOwnProperty('file')){
      res.json({"file": null, "error":"Invalid JSON input."});
      return;
  }
  if(data.hasOwnProperty('product')){
      prod = data['product'];
  }
  file = data['file'];
  var filePath = "/waleed_PV_dir/" + file;
  if(!fileExists(filePath)){
      res.json({"file":file, "error":"File not found."});
      return;
  }
  if(!validateCSV(filePath)){
      res.json({"file": file, "error":"Input file not in CSV format."});
      return;
  }
  var jsonObj = new Object();
  jsonObj.file = file;
  if(prod==''){
      jsonObj.prod = null;
  }
  else{
      jsonObj.prod = prod;
  }
  var userJson = JSON.parse(JSON.stringify(jsonObj));
  getSum(userJson).then((response) => {
      res.json(response.data);
  })
})


app.get('/test', (req, res) => {
  let testData = "UPDATED THRPUGH CICD";
  res.json({"Result":testData});
})


function fileExists(filePath){
  if(fs.existsSync(filePath)){
      return true;
  }
  else{
      return false;
  }
}

async function getSum(reqBody){
  var resp = await axios.post('http://104.198.182.183:5000/getSum', reqBody);
  return resp;
}


function validateCSV(filePath){
  var content = fs.readFileSync(filePath, 'utf-8');
  if(content.trim()==''){
      return false;
  }
  if(!content.includes(",")){
      return false;
  }
  var lines = content.split('\n');
  if(lines[0].trim().length==0){
      return false;
  }
  var headers = lines[0].trim().split(",");
  if(headers.length!=2 || headers[0].toLowerCase().trim()!='product' || headers[1].toLowerCase().trim()!='amount'){
      return false;
  }
  for(var x=0; x<lines.length; x++){
      if(x==0){
          continue;
      }
      var values = lines[x].trim().split(",");
      if(values.length!=2 || typeof values[0]!='string' || isNaN(values[1])){
          return false;
      }
  }
  return true;
}




const port = 6000;

app.listen(port, () => {
  console.log(`Server 1 started on ${ip.address()}:${port}`)
})
