import React, { useContext, useRef, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { UserContext } from '../App'
import M from 'materialize-css'

const NavBar = () => {
    const history = useHistory()
    const { state, dispatch } = useContext(UserContext)
    const [search, setSearch] = useState('')
    const [userDetails, setUserDetails] = useState([])
    const searchModal = useRef(null)

    useEffect(() => {
        M.Modal.init(searchModal.current)
    }, [])

    const renderList = () => {
        if(state){
            return [
                // <li key="11"><Link to="/about">About</Link></li>,
                <li key="12">
                    <a className="logo-div" href="https://ashwinarora.com/" target="_blank">
                        Developer Portfolio
                        <svg style={{width: '2rem', height:"2rem"}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </li>,
                <li key="1"><i data-target="modal1" className="large material-icons modal-trigger" style={{marginLeft: "1rem", marginRight: "1rem"}}>search</i></li>,
                <li key="2"><Link to="/profile">{state.name}</Link></li>,
                <li key="3"><Link to="/create">New Post</Link></li>,
                <li key="4"><Link to="/myFollowersPosts">Followed</Link></li>,
                <li key="5">
                    <button
                        className="btn waves-effect waves-light #64b5f6 blue-button"
                        onClick={() => {
                            localStorage.clear()
                            dispatch({type: 'CLEAR'})
                            history.push('/signin')
                        }}
                    >Log Out</button>
                </li>
            ]
        } else {
            return [
                // <li key="11"><Link to="/about">About</Link></li>,
                <li key="12">
                    <a className="logo-div" href="https://ashwinarora.com/" target="_blank">
                        Developer Portfolio
                        <svg style={{width: '2rem', height:"2rem"}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </li>,
                <li key="6"><Link to="/signin">Sign In</Link></li>,
                <li key="7"><Link to="/signup">Sign Up</Link></li>
            ]
        }
    }

    const fetchUsers = (query)=>{
        setSearch(query)
        if(!query) return setUserDetails([])
        fetch('/search-users',{
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                query
            })
        })
        .then(res=>res.json())
        .then(results=>{
            setUserDetails(results.user)
        })
    }

    return (
        <nav style={{position:"sticky", top:"0", zIndex:"100"}}>
            <div className="nav-wrapper grey darken-4">
                <Link to={state? '/' : '/signin'} className="brand-logo left white-text" style={{marginLeft: "1rem"}}>Social Network</Link>
                <ul id="nav-mobile" className="right white-text white-hover" style={{marginRight: "1rem"}}>
                    {renderList()}
                </ul>
            </div>
            <div id="modal1" className={`${!state ? 'hidden' : '' } modal`} ref={searchModal} style={{color:"black"}}>
                <div className="modal-content grey darken-4">
                    <form autoComplete="off">
                        <input
                            type="text"
                            className="white-text"
                            placeholder="Search User Email"
                            autoComplete="off"
                            value={search}
                            onChange={(e)=>fetchUsers(e.target.value)}
                        />
                    </form>
                    <ul className="collection" style={{display: "flex", flexDirection: "column"}}>
                        {userDetails.map(item=>{
                            return (
                                <Link
                                    key={item._id}
                                    to={item._id !== state._id ? "/profile/"+item._id:'/profile'} 
                                    onClick={()=>{
                                        M.Modal.getInstance(searchModal.current).close()
                                        setSearch('')
                                        setUserDetails([])
                                    }}>
                                    <li className="collection-item grey darken-4 white-hover" style={{display: "flex", justifyContent: "start", alignItems: "center"}}>
                                        <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px", objectFit: "cover"}}
                                            src={item.pic} alt="hello"
                                        />
                                        <b style={{marginRight:"1rem"}}>{item.name}</b> {item.email}
                                    </li>
                                </Link>
                            )
                        })}
                    </ul>
                </div>
                <div className="modal-footer grey darken-4">
                    <button className="modal-close waves-effect waves-green btn-flat white-text white-hover" onClick={()=>setSearch('')}>Close</button>
                </div>
            </div>
        </nav>
    )
}

export default NavBar