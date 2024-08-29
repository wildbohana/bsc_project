import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../Services/axiosInstance';
import '../Assets/HomePage.css';

function TopicPage() {
	const navigate = useNavigate();
	const { topicId } = useParams();
	const { commentId } = useParams();
	const [topic, setTopic] = useState(null);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");

	useEffect(() => {
		axiosInstance.get(`/topic/${topicId}`).then(response => {
			console.log("fetched");
			console.log(response.data);
			setTopic(response.data);
		}).catch(error => {
			console.error("Error fetching topic details: ", error);
		});

		axiosInstance.get(`/comments/${topicId}`).then(response => {
		    setComments(response.data.comments);
		}).catch(error => {
		    console.error("Error fetching comments: ", error);
		});
	}, [topicId]);

	const handleAddComment = async () => {
		try {
			const response = await axiosInstance.post("comments/add", { topicId, content: newComment});
			if (response.status === 200) {
				console.log(response);
				setComments([...comments, response.data.comment]);
				setNewComment("");
				toast("Comment added successfully");
			}
		} catch (error) {
			toast("Error adding comment");
			console.error("Error adding comment: ", error);
		}
	};

	const handleVoteComment = async (commentId, action) => {	
		try {
			const endpoint = `/comments/${action}`;
			const response = await axiosInstance.post(endpoint, { commentId });
			if (response.status === 200) {
				setComments(comments.map(comment => comment._id === commentId ? response.data.comment : comment));
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error voting on comment");
			console.error(`Error ${action} comment: `, error);
		}
	};

	const handleTopicSubscribe = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);
	
		try {
			const endpoint = `/topic/subscribe`;
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				//setTopic({...topic, IsSubscribed: topic.IsSubscribed})
				setTopic(prevTopic => ({
					...prevTopic,
					IsSubscribed: !prevTopic.IsSubscribed
				}))
			}
		} catch (error) {
			toast("Error happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const handleDelete = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);
	
		try {
			const endpoint = `topic/delete`;
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				navigate("/");
				//toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const handleDeleteComment = async (commentId) => {
		try {
			const endpoint = `comment/delete`;
			const response = await axiosInstance.post(endpoint, { commentId });
			if (response.status === 200) {
				//navigate("/");
				setComments(comments.filter(comment => comment.RowKey !== commentId))
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
		}
	};

	const handleTopicAction = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);
	
		try {
			const endpoint = `/topic/vote/${action}`;
			const response = await axiosInstance.post(endpoint, { topicId });
			
			if (response.status === 200) {
				if (action !== 'delete') {
					axiosInstance.get(`/topic/${topicId}`).then(response => {
						console.log("fetched");
						console.log(response.data);
						setTopic(response.data);
					}).catch(error => {
						console.error("Error fetching topic details: ", error);
					});
					toast(`${action} succesful`)
				} else {
					navigate("/")
				}
			}
		} catch (error) {
			toast("Error happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
		return new Intl.DateTimeFormat('en-US', options).format(date);
	};

	if (!topic) {
		return <div>Loading...</div>; 
	}

	return (
		<div className="topic-page">
			<div className={`topic-card ${topic.locked ? 'locked-topic' : ''}`}>
				<h1 className="topic-title">{topic.title}</h1>
				<p className="topic-content">{topic.content}</p>
				<p className="topic-info">Created at: {formatDate(topic.createdAt)}</p>
				<p className="topic-info">Owner: {topic.ownerFullName}</p>
				<p className="topic-info">Upvotes: {topic.numOfUpvotes} | Downvotes: {topic.numOfDownvotes}</p>
				<p className="topic-info">Locked: {topic.locked ? 'Yes' : 'No'}</p>
				<p className="topic-info">Comments: {topic.numOfComments}</p>
				<div>
					<button className={`vote-button ${topic.userAction === 'UPVOTED' ? 'active-upvote-button' : ''}`}
							onClick={() => handleTopicAction(topic._id, "upvote")}>
						{topic.userAction === 'UPVOTED' ? '✓ UPVOTED' : 'Upvote'}
					</button>
					<button className={`vote-button ${topic.userAction === 'DOWNVOTED' ? 'active-downvote-button' : ''}`}
							onClick={() => handleTopicAction(topic._id, "downvote")}>
						{topic.userAction === 'DOWNVOTED' ? '✕ DOWNVOTED' : 'Downvote'}
					</button>
					<button className={`vote-button ${topic.isSubscribed ? 'subscribed-button' : 'subscribe-button'}`}
							onClick={() => handleTopicSubscribe(topic._id, "subscribe")}>
						{topic.isSubscribed ? '✓ Subscribed' : 'Subscribe'}
					</button>
				</div>

				{topic.isOwner && (
					<div className="topic-controls">
						<button
							className={`control-button ${topic.locked ? 'unlock-button' : 'lock-button'}`}
							onClick={() => handleDelete(topic._id, "lock")}>
							{topic.locked ? 'UNLOCK' : 'LOCK'}
						</button>
						<button
							className="control-button delete-button"
							onClick={() => handleDelete(topic._id, "delete")}>
							DELETE
						</button>
					</div>
				)}
			</div>

			<div className="comment-section">
			{
				topic.locked ? (
					<p className="locked-message">This topic is locked. Comments are disabled.</p>
				) : (
					<>
					<textarea 
						className="comment-box" 
						placeholder="Write a comment..." 
						value={newComment}
						disabled={topic.locked} 
						onChange={(e) => setNewComment(e.target.value)}>
					</textarea>
					<button className="submit-comment" onClick={handleAddComment} disabled={topic.locked}>Submit Comment</button>
					</>
				)
			}

			{comments.map(comment => (
				<div key={comment._id} className="comment">
					<div className="comment-header">
						<span className="comment-author">{comment.ownerFullName}</span>
						<span className="comment-date"> at {formatDate(comment.createdAt)}</span>
							<button
								className="delete-comment-button"
								onClick={() => handleDeleteComment(comment._id)}>
								Delete
							</button>
					</div>
					<p className="comment-content">{comment.content}</p>	
					<div className="comment-votes">
						<button onClick={() => handleVoteComment(comment._id, "upvote")}>Upvote</button>
						<span>{comment.numOfUpvotes - comment.numOfDownvotes}</span>
						<button onClick={() => handleVoteComment(comment._id, "downvote")}>Downvote</button>
					</div>
				</div>
			))}
			</div>
		</div>
	);
}

export default TopicPage;
