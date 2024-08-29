import { AxiosClient } from "./AxiosClient";

// Promeni apsolutno sve

// Get topic
export const GetTopicAsync = async (id) => {
	return await AxiosClient.get(
		`${process.env.REACT_APP_API_URL}/post/get-post?postId=${id}`
	);
};

// New topic
export const CreateNewTopicAsync = async (data) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/post/new-post`
	);
};

// TODO
// delete post
// new comment, delete comment
// etc.
