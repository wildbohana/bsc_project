import { AxiosClient } from "./AxiosClient";

// Register
export const RegisterAsync = async (requestBody) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/auth/register`,
		requestBody
	);
};

// Login
export const LoginAsync = async (requestBody) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/auth/login`, 
		requestBody
	);
};


// MyProfile
export const GetUserProfileAsync = async () => {
	return await AxiosClient.get(
		`${process.env.REACT_APP_API_URL}/users/profile`
	);
};

// Update profile
export const UpdateUserAsync = async (requestBody) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/users/update`,
		requestBody
	);
};
