import React from "react";
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginForm from './Views/LoginForm';
import RegisterForm from './Views/RegisterForm';
import TopicPage from "./Views/TopicPage";
import HomePage from "./Views/HomePage";
import CreateTopic from "./Views/CreateTopic";
import Profile from "./Views/Profile";
import NavBar from "./Components/NavBar";

import './Assets/App.css';

function App() {
	const checkAuth = () => {
		const token = Cookies.get('jwt-token');
		return token && token !== '';
	};

	const ProtectedRoute = ({ children }) => {
		if (!checkAuth()) {
			return <Navigate to="/login" />;
		}
		return children;
	};

	ProtectedRoute.propTypes = {
		children: PropTypes.node.isRequired,
	};

	return (
		<Router>
		<ToastContainer position="top-right" autoClose={1600} hideProgressBar={false} />
		<NavBar />
			<Routes>
				<Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
				<Route path="/login" element={<LoginForm/>}/>
				<Route path="/register" element={<RegisterForm/>}/>
				<Route path="/create/topic" element={<ProtectedRoute><CreateTopic/></ProtectedRoute>} />
				<Route path="/topic/:topicId" element={<ProtectedRoute><TopicPage/></ProtectedRoute>} />
				<Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
			</Routes>
		</Router>
	);
}

export default App;
