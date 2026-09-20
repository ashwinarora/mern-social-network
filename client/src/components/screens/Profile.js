import React, { useState,useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import { Link } from 'react-router-dom'

const Profile = () => {
    const { state, dispatch } = useContext(UserContext)
    // const [pics, setPics] = useState([])
    const [data, setData] = useState([])
    const [image, setImage] = useState('')
    // const [url, setUrl] = useState('')

    useEffect( () => {
        fetch('/mypost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            // setPics(result.mypost)
            setData(result.mypost)
        })
    }, [])

    useEffect( () => {
        if(image){
            const data = new FormData()
            data.append('file', image)
            data.append('upload_preset', 'insta-clone')
            data.append('cloud_name', 'dgxvqhybh')

            fetch('https://api.cloudinary.com/v1_1/dgxvqhybh/image/upload', {
                method: 'post',
                body: data
            })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                // localStorage.setItem("user", JSON.stringify({ ...state, pic:data.url}))
                // dispatch({type:"UPDATEPIC", payload: data.url})
                fetch('/updatepic', {
                    method: 'put',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem('jwt')
                    },
                    body: JSON.stringify({
                        pic: data.url
                    })
                })
                .then(res => res.json())
                .then( result => {
                    console.log({result})
                    localStorage.setItem("user", JSON.stringify({ ...state, pic:result.pic}))
                    dispatch({type:"UPDATEPIC", payload: result.pic})
                })
            })
            .catch(err => {
                console.log(err)
            })
        }
    }, [image])

    const updatePhoto = (file) => {
        setImage(file)
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
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-head">
                    <div className="profile-avatar-wrap">
                        <img alt={state ? state.name : 'loading'} className="profile-avatar"
                            src={state? state.pic : "loading"} />
                    </div>
                    <div className="profile-meta">
                        <h4 className="profile-name">{state ? state.name : 'loading'}</h4>
                        <h6 className="profile-email">{state ? state.email : 'loading'}</h6>
                        <div className="profile-stats">
                            <h6><b>{data.length}</b> Posts</h6>
                            <h6><b>{state ? state.followers.length : 'loading'}</b> Followers</h6>
                            <h6><b>{state ? state.following.length : 'loading'}</b> Follwing</h6>
                        </div>
                    </div>
                </div>
                <div className="file-field input-field profile-upload">
                    <div className="btn btn-primary">
                        <span>Update</span>
                        <input type="file" onChange={(e) => { updatePhoto(e.target.files[0]) }} />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" placeholder="Choose a new profile photo" />
                    </div>
                </div>
            </div>
            
            {/* <div className="gallery">
            {
                pics.map(item => {
                    return (
                        <img className="item" src={item.photo} alt={item.title} key={item._id} />
                    )
                })
            }
            </div> */}
            <div className="home feed" data-empty="You haven't posted anything yet.">
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
                                            src={state.pic} alt="hello"
                                        />
                                    </span>
                                    {/* <span className="post-author">{item.postedBy.name}</span> */}
                                    <span className="post-author">{state.name}</span>
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
    )
}

export default Profile