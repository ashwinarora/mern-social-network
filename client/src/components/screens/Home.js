import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../../App'
import { Link } from 'react-router-dom'

const Home = () => {
    const { state, dispatch } = useContext(UserContext)
    const [data, setData] = useState([])
    const commentInput = useRef(null)
    useEffect(() => {
        fetch('/allpost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then(result => {
                setData(result.posts)
            })
    }, [])

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
        <div className="home feed" data-empty="No posts yet. Be the first to share something!">
            {
                data.map(item => {
                    return (
                        <article className="card home-card" key={item._id}>
                            <h5 className="post-head">
                                <Link to={item.postedBy._id !== state._id ? `/profile/${item.postedBy._id}` : `/profile`} >
                                    <span>
                                        <img 
                                            className="post-avatar"
                                            src={item.postedBy.pic} alt="hello"
                                        />
                                    </span>
                                    <span className="post-author">{item.postedBy.name}</span>
                                </Link>
                                {
                                    item.postedBy._id == state._id
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
                                    <input type="text" ref={commentInput} className="input-white validate comment-input" placeholder="write a comment" />
                                </form>
                            </div>
                        </article>
                    )
                })
            }
        </div>
    )
}

export default Home