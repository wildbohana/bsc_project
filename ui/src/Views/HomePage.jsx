import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../Services/axiosInstance';
import '../Assets/HomePage.css';

function HomePage() {
	const navigate = useNavigate();
	const [topics, setTopics] = useState([]);
	const [showMyTopics, setShowMyTopics] = useState(false);
	const [sortCriteria, setSortCriteria] = useState('');
	const [sortOrder, setSortOrder] = useState('asc');
	const [searchQuery, setSearchQuery] = useState('');

	const navigateToCreateTopic = () => {
		navigate('/create/topic');
	};

	const navigateToTopic = (topicId) => {
		navigate(`/topic/${topicId}`);
	};

	const handleApiResponse = (updatedTopic, isDelete = false, deleteId = null) => {
		setTopics((prevTopics) =>
			isDelete
				? prevTopics.filter((topic) => topic._id !== deleteId)
				: prevTopics.map((topic) => (topic._id === updatedTopic._id ? updatedTopic : topic))
		);
	};

	const filteredTopics = () => {
		let filtered = topics;
		if (showMyTopics) {
			filtered = filtered.filter(topic => topic.IsOwner);
		}

		if (searchQuery.trim() !== '') {
			const lowerCaseQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(topic => 
				topic.title.toLowerCase().includes(lowerCaseQuery) ||
				topic.content.toLowerCase().includes(lowerCaseQuery)
			);
		}

		if (sortCriteria) {
			filtered = [...filtered].sort((a, b) => b[sortCriteria] - a[sortCriteria]);
		}

		return filtered;
	};

	const handleDelete = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);
	
		try {
			const endpoint = `topic/delete`;
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				fetchTopics();
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const handleVote = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);

		try {
			const endpoint = `/topic/vote/${action}`;
			//console.log(endpoint);
			//console.log({topicId});
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				fetchTopics();
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const handleLock = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);

		try {
			const endpoint = `/topic/lock`;
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				fetchTopics();
				toast(response.data.message);
			}
		} catch (error) {
			toast("Error Happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const handleTopicSubscribe = async (topicId, action) => {
		console.log(`${action} Topic ID: ${topicId}`);
	
		try {
			const endpoint = `/topic/subscribe`;
			const response = await axiosInstance.post(endpoint, { topicId });
			if (response.status === 200) {
				fetchTopics();
			}
		} catch (error) {
			toast("Error happened");
			console.error(`Error ${action} topic: `, error);
		}
	};

	const fetchTopics = async () => {
		try {
			const response = await axiosInstance.get('topics');	
			console.log(response.data);
			setTopics(response.data);
		} catch (error) {
			toast("Error fetching data.");
			console.error("Error fetching data: ", error);
		}
	};

	useEffect(() => {
		fetchTopics();
	}, []);

	return (
		<div className="homepage-container">
			<button className="create-topic-btn" onClick={navigateToCreateTopic}>Create a new topic</button>
			
			<div className="filter-sort-section">
				<input
						type="text"
						placeholder="Search topics..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="search-input"
					/>
				<div className="filter-option">
					<input type="checkbox" id="myTopicsCheckbox" checked={showMyTopics} onChange={() => setShowMyTopics(!showMyTopics)} />
					<label htmlFor="myTopicsCheckbox">Show only my topics</label>
				</div>
				<div className="sort-order-option">
					<label htmlFor="sortSelect">Sort order:</label>
					<select id="sortSelect" value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
						<option value="">Default</option>
						<option value="numOfUpvotes">Upvotes</option>
						<option value="numOfDownvotes">Downvotes</option>
					</select>
				</div>
			</div>

			<h1>{showMyTopics ? 'My Topics' : 'All Topics'}</h1>
			{filteredTopics().map((topic) => (
				<div className={`topic-card ${topic.locked ? 'locked-topic' : ''}`} key={topic._id} onClick={() => navigateToTopic(topic._id)}>
					{/* ikonica za locked */ }
					<h1 className="topic-title">{topic.title}</h1>
					<p className="topic-content">{topic.content}</p>
					<p className="topic-info">Created At: {topic.createdAt}</p>
					<p className="topic-info">Owner: {topic.ownerFullName}</p>
					<p className="topic-info">Upvotes: {topic.numOfUpvotes} | Downvotes: {topic.numOfDownvotes}</p>
					<p className="topic-info">Locked: {topic.locked ? 'Yes' : 'No'}</p>

					<div>
						<button className={`vote-button ${topic.userAction === 'UPVOTED' ? 'active-upvote-button' : ''}`}
								onClick={(e) => 
								{
									e.stopPropagation(); 
									handleVote(topic._id, "upvote")}
								}>
							{topic.PostVoteStatus === 'UPVOTED' ? '✓ UPVOTED' : 'Upvote'}
						</button>

						<button className={`vote-button ${topic.userAction === 'DOWNVOTED' ? 'active-downvote-button' : ''}`}
								onClick={(e) => 
									{
										e.stopPropagation(); 
										handleVote(topic._id, "downvote")}
									}>
							{topic.PostVoteStatus === 'DOWNVOTED' ? '✕ DOWNVOTED' : 'Downvote'}
						</button>

						<button className={`vote-button ${topic.isSubscribed ? 'subscribed-button' : 'subscribe-button'}`}
								onClick={(e) => {
									e.stopPropagation(); 
									handleTopicSubscribe(topic._id, "subscribe")}}>
							{topic.IsSubscribed ? '✓ Subscribed' : 'Subscribe'}
						</button>
					</div>

					{topic.IsOwner && (
						<div className="topic-controls">
							<button
								className={`control-button ${topic.locked ? 'unlock-button' : 'lock-button'}`}
								onClick={(e) => {
									e.stopPropagation(); 
									handleLock(topic._id, "lock")}}>
								Delete
							</button>
							<button
								className="control-button delete-button"
								onClick={(e) => {
									e.stopPropagation(); 
									handleDelete(topic._id, "delete")}}>
								Delete
							</button>
						</div>
					)}

				</div>
			))}
		</div>
	);
}

export default HomePage;
