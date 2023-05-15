//Configure imports
const express = require('express');
var app = express();
const parser = require('body-parser');
const axios = require('axios');


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


//Start the express server
app.listen(6000, ()=>{
    console.log("Server running on port 6000...");
})



app.post("/calculate", (req, res)=> {
    var file = null;
    var product = null;
    try{
        /*CITATION NOTE:
        The following lines of code (lines ) were adapted from the source cited
        which checks whether the request's body (JSON) contains any keys. Specifically,
        the "Objects.keys(..)" function was adapted from the source.
        URL: https://stackoverflow.com/questions/71815346/check-if-req-body-is-empty-doesnt-work-with-express
         */
        //(validation) check that the request body JSON contains keys
        if(Object.keys(req.body).length==0){
            res.json({"file":null, "error": "Invalid JSON input."});
            return;
        }
        var reqData = req.body;
        //(validation) check that the request body JSON contains file key-value pair
        if(!reqData.hasOwnProperty('file')){
            res.json({"file":null, "error": "Invalid JSON input."});
            return;
        }
        file = reqData['file'];
        if(file==null){
            res.json({"file":null, "error": "Invalid JSON input."});
            return;
        }
        if(file.trim()==''){
            res.json({"file":null, "error": "Invalid JSON input."});
            return;
        }
        //(validation) check that the request body JSON contains product key-value pair
        if(reqData.hasOwnProperty('product')){
            product = reqData['product'];
        }
    }
    catch(err){
        res.json({"file":null, "error":"Invalid JSON input."});
        return;
    }
    /*CITATION NOTE:
    The following lines of code (lines ) were adapted from the provided source.
    The source was used to construct the code below that creates an object, then
    converts that object into a JSON string.
    URL: https://stackoverflow.com/questions/8963693/how-to-create-json-string-in-javascript
     */
    //create JSON string using request body's file and product data
    var obj = new Object();
    obj.file = file;
    if(product!=null){
        obj.product = product;
    }
    var userJson = JSON.parse(JSON.stringify(obj));
    //pass request JSON string to async function that sends it to container2,
    //and receives a response that is then displayed to the user through
    //the console (terminal)
    getSum(userJson).then((output)=>{
        console.log(output.data);
        res.send(output.data);
    })
});


//function to make API call to container2. Invoked after container1 has validated
//the user's request, this function will send the user's file and product request to 
//container2, which will return a response based on the file/product queried
async function getSum(userJson){
    var response = await axios.post('http://host.docker.internal:3000/getSum', userJson);
    return response;
}
