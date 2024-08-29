import { AxiosClient } from "./AxiosClient";

// Promeni apsolutno sve

// Get comments
export const GetCommentAsync = async (id) => {
	return await AxiosClient.get(
		`${process.env.REACT_APP_API_URL}/comments/get-comment`
	);
};

// New comment
export const CreateNewCommentAsync = async (data) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/comment/new-comment`
	);
};
