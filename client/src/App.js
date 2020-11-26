import React, { useEffect, createContext, useReducer, useContext } from 'react';
import NavBar from './components/Navbar'
import './App.css'
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom'
import Home from './components/screens/Home'
import Signin from './components/screens/Signin'
import Profile from './components/screens/Profile'
import Signup from './components/screens/Signup'
import CreatePost from './components/screens/CreatePost'
import UserProfle from './components/screens/UserProfile'
import FollowedPosts from './components/screens/followedPosts'
import Reset from './components/screens/Reset'
import Newpassword from './components/screens/Newpassword'
// import HireTheDev from './components/screens/HireTheDev'
import Footer from './components/Footer.jsx'
import { reducer, initialState } from './reducers/userReducers'

export const UserContext = createContext()

const Routing = () => {
	const history = useHistory()
	const { state, dispatch } = useContext(UserContext)
	useEffect( () => {
		const user = JSON.parse(localStorage.getItem('user'))
		if(user){
			dispatch({ type: 'USER', payload: user })
			// history.push('/')
		} else {
			if(!history.location.pathname.startsWith('/reset')) history.push('/signin')
		}
	}, [])
	
	return (
		<Switch>
			<Route exact path="/">
				<Home />
			</Route>
			<Route exact path="/signin">
				<Signin />
			</Route>
			<Route exact path="/signup">
				<Signup />
			</Route>
			<Route exact path="/profile">
				<Profile />
			</Route>
			<Route exact path="/create">
				<CreatePost />
			</Route>
			<Route exact path="/profile/:userId">
				<UserProfle />
			</Route>
			<Route exact path="/myFollowersPosts">
				<FollowedPosts />
			</Route>
			<Route exact path="/reset">
				<Reset />
			</Route>
			<Route exact path="/reset/:token">
				<Newpassword />
			</Route>
			{/* <Route exact path="/hire-the-developer">
				<HireTheDev />
			</Route> */}
		</Switch>
	)
}

function App() {
	const [state, dispatch] = useReducer(reducer, initialState)
	return (
		<UserContext.Provider value={{ state, dispatch }}>
			<BrowserRouter>
				<NavBar />
				<Routing />
				<Footer />
			</BrowserRouter>
		</UserContext.Provider>
	);
}

export default App;