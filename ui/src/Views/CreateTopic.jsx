import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../Services/axiosInstance';
import '../Assets/CreateTopic.css';

function CreateTopic() {
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const payload = {
			title,
			content
		};

		try {
			const response = await axiosInstance.post("/topics/create", payload);
			if (response.status === 200) {
				navigate("/");
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
			console.error(`Error creating topic: `, error);
		}
	};

	return (
		<div className="create-topic-container">
			<h1>Create a New Topic</h1>
			<form onSubmit={handleSubmit} className="create-topic-form">
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} id="title" placeholder="Title" className="form-control" />
				</div>
				<div className="form-group">
					<label htmlFor="content">Content</label>
					<textarea value={content} onChange={(e) => setContent(e.target.value)} id="content" placeholder="Content" className="form-control"></textarea>
				</div>				
				<button type="submit" className="submit-button">Create Topic</button>
			</form>
		</div>
	);
}

export default CreateTopic;