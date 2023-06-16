/*
CITATION NOTE: The following code, which constitutes container 1 server, was adapted from my Assignment 1
submission (since the A3's instructions allowed for the re-use of A1's code). However, the necessary modifications have been made.
The original code being referenced can be found at the following URL.
URL: https://git.cs.dal.ca/courses/2023-summer/csci4145-5409/alhindi/-/tree/main/A1/Container2
*/

const express = require('express');
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



app.post('/test', (req, res) => {
  let filePath = "/waleed_PV_dir/" + req.body['file'];
  let contents = null;
  let exists = fileExists(filePath);
  if(exists){
    contents = fs.readFileSync(filePath, 'utf-8');
  }
  res.json({"exists?2:":exists, "contents2":contents});
})



app.post("/getSum", (req, res) => {
  var file = req.body['file'];
  var product = req.body['prod'];
  if(product==''){
    product = null;
  }
  var prodSum = sum(file, product);
  res.json({"file": req.body['file'], "sum": prodSum.toString()});
})



function fileExists(filePath){
  if(fs.existsSync(filePath)){
      return true;
  }
  else{
      return false;
  }
}


function sum(file, product){
  var sum = 0;
  var filePath = '/waleed_PV_dir/' + file;
  var content = fs.readFileSync(filePath, 'utf-8');
  var lines = content.split("\n");
  if(product==null){
      return 0;
  }
  for(var x=0; x<lines.length; x++){
      if(x==0){
          continue;
      }
      else{
          var vals = lines[x].trim().split(",");
          if(vals[0].toLowerCase()==product.toLowerCase()){
              sum += Number(vals[1]);
          }
      }
  }
  return sum;
}



const port = 5000;

app.listen(port, () => {
  console.log(`Server 2 started on ${ip.address()}:${port}`)
})
