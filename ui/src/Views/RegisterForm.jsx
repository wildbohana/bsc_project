import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from "../Services/axiosInstance";

function RegisterForm() {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const [country, setCountry] = useState('');
	const [city, setCity] = useState('');
	const [address, setAddress] = useState('');
	const [number, setNumber] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const userData = {
			email: email,
			password: pass,
			first_name: firstName,
			last_name: lastName,
			country: country,
			city: city,
			address: address,
			phone: number,
		};

		try {
			const response = await axiosInstance.post("/users/register", {...userData});
			console.log(response.data.message);
			if (response.status === 201) {
				navigate("/login")
			} else {
				console.log("That email has already been taken!");
				toast("That email has already been taken!");
			}
		} catch (error) {
			console.error("There was an error!", error);
			toast(error.message);
		}
	};

	const navigateToLogin = () => {
		navigate('/login');
	};

	return (
		<div className="App">
		<div className="auth-form-container">
			<h2>Register</h2>
			<form className="register-form" onSubmit={handleSubmit}>
				<label htmlFor="firstname">First Name</label>
				<input value={firstName} onChange={(e) => setFirstName(e.target.value)} id="firstname" placeholder="First Name" />

				<label htmlFor="lastname">Last Name</label>
				<input value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastname" placeholder="Last Name" />

				<label htmlFor="email">Email</label>
				<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="youremail@gmail.com" id="email" />

				<label htmlFor="password">Password</label>
				<input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" />

				<label htmlFor="country">Country</label>
				<input value={country} onChange={(e) => setCountry(e.target.value)} id="country" placeholder="Country" />

				<label htmlFor="city">City</label>
				<input value={city} onChange={(e) => setCity(e.target.value)} id="city" placeholder="City" />

				<label htmlFor="address">Address</label>
				<input value={address} onChange={(e) => setAddress(e.target.value)} id="address" placeholder="Address" />

				<label htmlFor="number">Phone Number</label>
				<input value={number} onChange={(e) => setNumber(e.target.value)} id="number" placeholder="Phone Number" />

				<button type="submit">Register</button>
			</form>
			<button className="link-btn" onClick={navigateToLogin}>Already have an account? Login here.</button>
		</div>
		</div>
	);
}

export default RegisterForm;
