import React from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePortfolio(){

    const nav = useNavigate();

    const CreatePort = async () =>{
        let user = localStorage.user;
        try{
            let portName = document.getElementById('portName').value;
            let balance = document.getElementById('balance').value;
            let data =  await fetch(process.env.REACT_APP_API_GATEWAY +'/portfolios/create', {
                method: 'POST',
                body: JSON.stringify({"username": user, "portfolioName": portName, "balance": balance})
            });
            let res = await data.json();
            if(res['statusCode']==200){
                alert("Portfolio [" + portName + "] Successfully Created!");
                setTimeout(function(){
                    window.location.reload(); 
                }, 300);
            }
            else{
                alert("Error: "+res['error']+"\nStatus Code: " + res['statusCode']);
            }
        }
        catch(Exception){
            console.log(Exception);
        }
    }

    return(
        <div className='create-div'>
            <center>
                Portfolio Name: <input type='text' id='portName'></input>
                <br></br><br></br>
                Initial Balance: &nbsp;<input type='number' id='balance'></input>
                <br></br><br></br>
                <input type='button' value='Create' onClick={CreatePort}></input>
            </center>
        </div>
    )
}