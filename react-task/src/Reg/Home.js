import { signOut } from "firebase/auth";
import React from "react";
import { auth } from '../services/firebase.config';
import { useNavigate } from "react-router-dom";

function Home(){
    const navigate = useNavigate()

    const handleClick = () =>{
        signOut(auth).then(val=>{
            console.log(val,"val")
            navigate('/')
        })
    }
    return(
        <div>
            <h1>Home</h1>
            <button onClick={handleClick}>SignOut</button>
        </div>
    )
}
export default Home;