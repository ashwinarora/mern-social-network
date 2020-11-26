import React, { useState,useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../App'
import { useParams } from 'react-router-dom'

const Profile = () => {
    const { state, dispatch } = useContext(UserContext)
    const [data, setData] = useState(null)
    const [user, setUser] = useState(null)
    const { userId } = useParams()
    const [showFollow, setShowFollow] = useState(state ? !state.following.includes(userId) : true)

    useEffect( () => {
        fetch(`/user/${userId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            setUser(result.user)
            setData(result.posts)
            // setProfile(result)
            // if(state) {
            //     if(state.following.indexOf(result.user._id) === -1 ){
            //         setShowFollow(true)
            //     } else {
            //         setShowFollow(false)
            //     }
            // } else {
            //     console.log('no state yet')
            // }
        })
    }, [])

    const followUser = () => {
        fetch('/follow', {
            method: 'put',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                followId: userId
            })
        })
        .then( res => res.json())
        .then(data => {
            console.log(data)
            dispatch({type: 'UPDATE', payload: {following: data.following, followers: data.followers}})
            localStorage.setItem('user', JSON.stringify(data))
            // setProfile((pervState) => {
            //     return {
            //         ...pervState,
            //         user: {
            //             ...pervState.user,
            //             followers: [...pervState.user.followers, data._id]
            //         }
            //     }
            // })
            setUser((prevState) => {
                return {
                    ...prevState,
                    followers: [...prevState.followers, data._id]
                }
            })
            setShowFollow(false)
        })
    }
    const unfollowUser = () => {
        fetch('/unfollow', {
            method: 'put',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                unfollowId: userId
            })
        })
        .then( res => res.json())
        .then(data => {
            // console.log(data)
            dispatch({type: 'UPDATE', payload: {following: data.following, followers: data.followers}})
            localStorage.setItem('user', JSON.stringify(data))
            // setProfile((prevState)=>{
            //     const newFollower = prevState.user.followers.filter(item=>item != data._id )
            //     return {
            //         ...prevState,
            //         user:{
            //             ...prevState.user,
            //             followers:newFollower
            //         }
            //     }
            //  })
             setUser((prevState) => {
                const newFollower = prevState.followers.filter(item=>item !== data._id )
                return {
                    ...prevState,
                    followers: newFollower
                }
            })
            setShowFollow(true)
        })
    }

    const likePost = (id) => {
        fetch('/like', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId: id
            })
        })
        .then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return  { ...item, likes: result.likes}
                } else {
                    return item
                }
            })
            setData(newData)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const unlikePost = (id) => {
        fetch('/unlike', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId: id
            })
        })
            .then(res => res.json())
            .then(result => {
                // console.log(result)
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        // return result
                        return  { ...item, likes: result.likes}
                    } else {
                        return item
                    }
                })
                setData(newData)
            })
            .catch(err => {
                console.log(err)
            })
    }

    const makeComment = (text, postId) => {
        fetch('/comment', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                postId,
                text
            })
        })
        .then(res => res.json() )
        .then(result => {
            // console.log(result)
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return result
                } else {
                    return item
                }
            })
            setData(newData)
            // commentInput.current.value = null
        })
        .catch( err => {
            console.log(err)
        })
    }

    const deletePost = (postId) => {
        console.log('delete clicked')
        fetch(`/deletePost/${postId}`, {
            method: 'delete',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
        .then( res => res.json() )
        .then( result => {
            console.log(result)
            const newData = data.filter(item => {
                return item._id !== result._id
            })
            setData(newData)
        })
    }

    return (
        <>
        {
        !!(user && data)
        ?
        <div style={{
            maxWidth: "60vw",
            margin: "0px auto"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                margin: "18px 0px",
                borderBottom:"1px solid grey"
            }}>
                <div>
                    <img style={{ width: "160px", height: "160px", borderRadius: "80px", objectFit: "cover" }}
                        src={user.pic} />
                </div>
                <div className="white-text">
                    <h4>{user.name}</h4>
                    <h6>{user.email}</h6>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "108%"
                    }}>
                        <h6>{data.length} posts</h6>
                        <h6>{user.followers.length} Followers</h6>
                        <h6>{user.following.length} Follwing</h6>
                    </div>
                    {
                        showFollow
                        ?
                        <button
                            style={{margin: "10px"}}
                            className="btn waves-effect waves-light #64b5f6 blue darken-1"
                            onClick={() => {followUser()}}
                        >Follow</button>
                        :
                        <button
                            style={{margin: "10px"}}
                            className="btn waves-effect waves-light #64b5f6 blue darken-1"
                            onClick={() => {unfollowUser()}}
                        >Unfollow</button>
                    }
                </div>
            </div>

            {/* <div className="gallery">
            {
                userProfile.posts.map(item => {
                    return (
                        <img className="item" src={item.photo} alt={item.title} key={item._id} />
                    )
                })
            }
            </div> */}
            <div className="home">
            {
                data.slice(0).reverse().map(item => {
                    return (
                        <div className="card home-card grey darken-4" key={item._id}>
                            <h5 style={{padding: "5px"}}>
                                <Link to={item.postedBy !== state._id ? `/profile/${item.postedBy}` : `/profile`} >
                                    <span>
                                        {/* <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px"}}
                                            src={item.postedBy.pic} alt="hello"
                                        /> */}
                                        <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px"}}
                                            src={user.pic} alt="hello"
                                        />
                                    </span>
                                    {/* <span className="white-text white-hover">{item.postedBy.name}</span> */}
                                    <span className="white-text white-hover">{user.name}</span>
                                </Link>
                                {
                                    item.postedBy == state._id
                                    && 
                                    <i
                                        className="material-icons white-text"
                                        style={{float: "right"}}
                                        onClick= {() => {deletePost(item._id)}}
                                    >delete</i>
                                }
                            </h5>
                            {/* <div className="card-image">
                                <img src={item.photo} />
                            </div> */}
                            <div className="card-content white-text">
                                <h6><b>{item.title}</b></h6>
                                <p>{item.body}</p>
                                
                                
                            </div>
                            <div className="card-image" style={{marginTop: "0.5rem"}}>
                                <img src={item.photo} alt="" style={{objectFit: "cover"}} />
                            </div>
                            <div className="card-content white-text">
                                <h6 style={{display:"inline-block"}}>{item.likes.length} likes</h6>
                                {/* <i className="material-icons" style={{ color: "red" }}>favorite</i> */}
                                {
                                    item.likes.includes(state._id)
                                    ?
                                    <i
                                    className="material-icons"
                                    style={{display:"inline", position: "relative", top: "5px", marginLeft: "5px"}}
                                    onClick={() => { unlikePost(item._id) }}
                                    >thumb_down</i>
                                    :
                                    <i
                                    className="material-icons"
                                    style={{display:"inline", position: "relative", top: "5px", marginLeft: "5px"}}
                                    onClick={() => { likePost(item._id) }}
                                    >thumb_up</i>
                                }
                                {
                                    item.comments.map( record => {
                                        return (
                                            <h6 key={record._id}>
                                                <Link to={record.postedBy._id !== state._id ? `/profile/${record.postedBy._id}` : `/profile`} >
                                                <span style={{fontWeight:"700", marginRight:"5px"}} className="white-text white-hover">
                                                    {record.postedBy.name}
                                                </span>
                                                </Link>
                                                {record.text}
                                            </h6>
                                        )
                                    })
                                }
                                <form
                                    onSubmit= {(e) => {
                                        e.preventDefault()
                                        makeComment(e.target[0].value, item._id)
                                        e.target[0].value = null
                                    }}
                                >
                                    <input type="text" className="input-white validate" placeholder="write a comment" />
                                </form>
                            </div>
                        </div>
                    )
                })
            }
            </div>
        </div>

        : <h3 className="white-text">Loading...</h3>
        }
        </>
    )
}

export default Profile