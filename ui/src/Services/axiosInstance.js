// Ovo ostavi za sad
// ALi promeni sa axiosClient kasnije sve

import axios from 'axios';
import Cookies from 'js-cookie';

//const url = "http://127.0.0.1";
//const url = "http://10.244.0.7";
const url = "http://discusswithme.com"
const port = "5000";
const usePort = false;

const axiosInstance = axios.create({
	baseURL: url + (usePort ? `:${port}` : ''),
});


axiosInstance.interceptors.request.use((config) => {
	const token = Cookies.get('jwt-token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
}, (error) => {
	return Promise.reject(error);
});

export default axiosInstance;
