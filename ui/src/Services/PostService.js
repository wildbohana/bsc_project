import { AxiosClient } from "./AxiosClient";

// Promeni apsolutno sve

// Get post
export const GetPostAsync = async (id) => {
	return await AxiosClient.get(
		`${process.env.REACT_APP_API_URL}/post/get-post?postId=${id}`
	);
};

// New post
export const CreateNewPostAsync = async (data) => {
	return await AxiosClient.post(
		`${process.env.REACT_APP_API_URL}/post/new-post`
	);
};

// TODO
// delete post
// new comment, delete comment
// etc.
