import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../Services/axiosInstance';
import '../Assets/Profile.css'; 

function Profile() {
	const [profile, setProfile] = useState({
		first_name: '',
		last_name: '',
		country: '',
		address: '',
		city: '',
		phone: ''
	});

	useEffect(() => {
		axiosInstance.get('/profile').then(response => {
			setProfile(response.data);
			console.log(response.data);
		}).catch(error => {
			console.error("Error fetching profile: ", error);
			toast("Error fetching profile");
		});
	}, []);

	const handleInputChange = (e) => {
		setProfile({
			...profile,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			console.log(profile);
			const response = await axiosInstance.post('/profile', profile);
			if (response.status === 200) {
				toast("Profile updated successfully");
			}
		} catch (error) {
			toast("Error updating profile");
			console.error("Error updating profile: ", error);
		}
	};

	const labelMap = {
		first_name: 'First Name',
		last_name: 'Last Name',
		country: 'Country',
		address: 'Address',
		city: 'City',
		phone: 'Phone',
	};

	return (
		<div className="profile-container">
			<h1>Edit Profile</h1>
			<form onSubmit={handleSubmit} className="profile-form">
				{Object.entries(labelMap).map(([labelKey, labelValue]) => (
					<div key={labelKey} className="form-group">
						<label htmlFor={labelKey}>{labelMap[key] || key.replace('_', ' ')}</label>						
							<input
								type="text"
								id={labelKey}
								name={labelKey}
								value={profile[labelKey]}
								onChange={handleInputChange}
								className="form-control"
								disabled={labelKey === "_id" || labelKey === "user_id"}
							/>
					</div>
				))}
				<button type="submit" className="submit-button">Update Profile</button>
			</form>
		</div>
	);
}

export default Profile;
