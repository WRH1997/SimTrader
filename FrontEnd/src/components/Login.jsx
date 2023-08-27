import React from "react";
import { useNavigate } from "react-router-dom";
import './Style.css';


export default function Login(){

    const nav = useNavigate();

    const VerifyUser = async () => {
        try{
            let username = document.getElementById('username').value;
            let pwd = document.getElementById('pwd').value;
            let data = await fetch(process.env.REACT_APP_API_GATEWAY + '/auth/login', {
                method: 'POST',
                body: JSON.stringify({"username": username, "password": pwd})
            });
            let res = await data.json();
            if(res['statusCode']==200){
                localStorage.clear();
                localStorage.setItem("user", username);
                nav('/Homepage');
            }
            else{
                console.log(res);
                alert(res['error']);
            }
        }
        catch(Exception){
            console.log(Exception);
        }
    }

    return(
        <div className='login-div'>
            <center>
                <h1>Sim Trader</h1>
                <i><h4>Stock Market Simulation (Paper Trading) Using Real-Time Market Data</h4></i>
                Username: <input type='text' id='username' className='lgn-txt'></input>
                <br></br><br></br>
                Password:  &nbsp;<input type='password' id='pwd' className='lgn-txt'></input>
                <br></br><br></br>
                <input type='button' value='Log In' onClick={VerifyUser} className='login-btn'></input>
                <hr></hr>
                <br></br><br></br>
                <i>Don't have an account?</i>
                <br></br>
                <a href='/signup'>Sign Up</a>
            </center>
        </div>
    )
}