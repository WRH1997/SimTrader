import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [loggedIn, setLoggedIn] = React.useState(false);
    const [userId, setUserId] = React.useState();


    const checkLogin = () => {
        if(localStorage.id==null){
            return(
                <div>Logged Out</div>
            )
        }
        else{
            return(
                <div>{localStorage.id}</div>
            )
        }
    }

    return(checkLogin());
}