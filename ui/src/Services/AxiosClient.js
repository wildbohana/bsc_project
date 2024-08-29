import axios from "axios";
import Cookies from 'js-cookie';

const createAxiosClient = (options) => {
    const client = axios.create(options);

    client.interceptors.request.use(
		(config) => {
			if (config.authorization !== false) {
				const token = Cookies.get('jwt-token');
				if (token) {
					config.headers.authorization = `Bearer ${token}`;
				}
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
    );
    return client;
};

export const AxiosClient = createAxiosClient({ headers: {} });
