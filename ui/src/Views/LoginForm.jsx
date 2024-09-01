import React, { useState } from "react";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../Services/axiosInstance';

function LoginForm() {
	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		const loginData = {
			email: email,
			password: pass
		};

		axiosInstance.post("/users/login", loginData)
			.then(response => {
				const token = response.data["access_token"];
				Cookies.set('jwt-token', token, { expires: 7, secure: true, sameSite: 'Strict' });
				navigate('/');
			})
			.catch(error => {
				console.error('Error during login:', error);
				toast(error.message)
			});
	}

	const navigateToRegister = () => {
		navigate('/register');
	};

	return (
		<div className="App">
		<div className="auth-form-container">
			<h2>Login</h2>
			<form className="login-form" onSubmit={handleSubmit}>
				<label htmlFor="email">email</label>
				<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" name="email" />
				<label htmlFor="password">password</label>
				<input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
				<button type="submit">Log In</button>
			</form>
			<button className="link-btn" onClick={navigateToRegister}>Don't have an account? Register here.</button>
		</div>
		</div>
	)
}

export default LoginForm;
