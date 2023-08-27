import React from "react";
import { useNavigate } from "react-router-dom";



export default function Signup(){

    const nav = useNavigate();

    const UserSignUp = async () => {
        let username = document.getElementById('username').value;
        let pwd = document.getElementById('pwd1').value;
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;

        if(username == "" || pwd == "" || name == "" || email == ""){
            alert("Error: Username, Password, Name, or Email blank!\nPlease check and try again!");
            return;
        }

        try{
            let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/auth/signup', {
                method: 'POST',
                body: JSON.stringify({"username": username, "password": pwd, "name": name, "email": email})
            });
            let res = await data.json();
            if(res['statusCode']==200){
                localStorage.clear();
                alert("Registered user [" + username + "]\nPlease check your email to confirm registration!");
                setTimeout(function(){
                    nav('/Login');
                }, 1000);
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
        <div className='signup-div'>
            <center>
                <h3>Sign Up Form</h3>
                <span className='dvdr'></span>
                Username: &nbsp;&nbsp;<input type='text' id='username' className='signup-input'></input>
                <br></br><br></br>
                <span className='dvdr2'></span>
                Password: &nbsp;&nbsp;&nbsp;<input type='password' id='pwd1' className='signup-input'></input>
                <br></br><br></br>
                <span className='dvdr2'></span>
                Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='name' className='signup-input'></input>
                <br></br><br></br>
                <span className='dvdr2'></span>
                Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='email' id='email' className='signup-input'></input>
                <br></br><br></br>
                <span className='dvdr2'></span>
                <input type='button' onClick={UserSignUp} value='Submit' className='signup-submit'></input>
            </center>
        </div>
    )
}