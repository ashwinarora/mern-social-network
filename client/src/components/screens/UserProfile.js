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
        <div className="profile-page">
            <div className="profile-card profile-head">
                <div className="profile-avatar-wrap">
                    <img className="profile-avatar" alt={user.name}
                        src={user.pic} />
                </div>
                <div className="profile-meta">
                    <h4 className="profile-name">{user.name}</h4>
                    <h6 className="profile-email">{user.email}</h6>
                    <div className="profile-stats">
                        <h6><b>{data.length}</b> posts</h6>
                        <h6><b>{user.followers.length}</b> Followers</h6>
                        <h6><b>{user.following.length}</b> Follwing</h6>
                    </div>
                    {
                        showFollow
                        ?
                        <button
                            className="btn waves-effect waves-light btn-primary follow-btn"
                            onClick={() => {followUser()}}
                        >Follow</button>
                        :
                        <button
                            className="btn waves-effect waves-light btn-secondary follow-btn"
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
            <div className="home feed" data-empty="No posts from this user yet.">
            {
                data.slice(0).reverse().map(item => {
                    return (
                        <article className="card home-card" key={item._id}>
                            <h5 className="post-head">
                                <Link to={item.postedBy !== state._id ? `/profile/${item.postedBy}` : `/profile`} >
                                    <span>
                                        {/* <img 
                                            className="post-avatar"
                                            src={item.postedBy.pic} alt="hello"
                                        /> */}
                                        <img 
                                            className="post-avatar"
                                            src={user.pic} alt="hello"
                                        />
                                    </span>
                                    {/* <span className="post-author">{item.postedBy.name}</span> */}
                                    <span className="post-author">{user.name}</span>
                                </Link>
                                {
                                    item.postedBy == state._id
                                    && 
                                    <i
                                        className="material-icons post-delete"
                                        title="Delete post"
                                        onClick= {() => {deletePost(item._id)}}
                                    >delete</i>
                                }
                            </h5>
                            {/* <div className="card-image">
                                <img src={item.photo} />
                            </div> */}
                            <div className="card-content post-body">
                                <h6 className="post-title"><b>{item.title}</b></h6>
                                <p className="post-text">{item.body}</p>
                                
                                
                            </div>
                            <div className="card-image post-media">
                                <img src={item.photo} alt="" style={{objectFit: "cover"}} />
                            </div>
                            <div className="card-content post-footer">
                                <h6 className="post-likes">{item.likes.length} likes</h6>
                                {/* <i className="material-icons" style={{ color: "red" }}>favorite</i> */}
                                {
                                    item.likes.includes(state._id)
                                    ?
                                    <i
                                    className="material-icons like-btn is-liked"
                                    title="Unlike"
                                    onClick={() => { unlikePost(item._id) }}
                                    >thumb_down</i>
                                    :
                                    <i
                                    className="material-icons like-btn"
                                    title="Like"
                                    onClick={() => { likePost(item._id) }}
                                    >thumb_up</i>
                                }
                                {
                                    item.comments.map( record => {
                                        return (
                                            <h6 key={record._id} className="comment">
                                                <Link to={record.postedBy._id !== state._id ? `/profile/${record.postedBy._id}` : `/profile`} >
                                                <span className="comment-author">
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
                                    <input type="text" className="input-white validate comment-input" placeholder="write a comment" />
                                </form>
                            </div>
                        </article>
                    )
                })
            }
            </div>
        </div>

        : <h3 className="page-loading">Loading...</h3>
        }
        </>
    )
}

export default Profile