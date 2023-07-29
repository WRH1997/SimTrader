import React from "react";
import { useNavigate } from "react-router-dom"
import './Style.css';

export default function Logout(){

    const nav = useNavigate();

    const logUserOut = () => {
        let user = localStorage.user;
        alert("Signed out from [" + user + "]!\nRedirecting to login page...");
        localStorage.clear();
        nav('/login');
    }

    if(localStorage.getItem("user") !== null){
        return(
            <div className="logout">
                <center>
                    <input type='button' value='Logout' onClick={logUserOut} className='logout-btn'></input>
                </center>
            </div>
        )
    }

}