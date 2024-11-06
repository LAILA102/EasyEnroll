import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'

function Login(){
    const[email, setEmail] = useState('')
    const[password, setPassword] = useState('')
    const [message, setMessage] = useState('');  // State to hold the error message
    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8081/login', { email, password })
            .then(res => {
                if (res.data === "Login Successfully") {
                    console.log(res);
                    setMessage('');  // Clear the message on successful login
                } else {
                    setMessage('Login unsuccessful');  // Set the error message on failure
                }
            })
            .catch(err => {
                console.log(err);
                setMessage('An error occurred. Please try again later.');
            });
    }
    return(
        <div className='d-flex justify-content-center align-items-center'>
            <div className='p-3 bg-white w-25'>
               <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email">Email</label>
                        <input type="email" placeholder='Enter Email' className='form-control'
                        onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password">Password</label>
                        <input type="password" placeholder='Enter Password' className='form-control'
                        onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <button type ="submit" className='btn btn-success'>Login</button>
               </form>
               {message && <div style={{ color: 'red', marginTop: '10px' }}>{message}</div>}  {/* Display error message */}
            </div>
        </div>
    )
}

export default Login