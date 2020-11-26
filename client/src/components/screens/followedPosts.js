import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import { Link } from 'react-router-dom'

const Home = () => {
    const { state, dispatch } = useContext(UserContext)
    const [data, setData] = useState([])
    
    useEffect(() => {
        fetch('/followedPosts', {
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
            console.log(result)
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return result
                } else {
                    return item
                }
            })
            setData(newData)
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
        // <div className="home">
        //     {
        //         data.map(item => {
        //             return (
        //                 <div className="card home-card" key={item._id}>
        //                     <h5 style={{padding: "5px"}}>
        //                         <Link to={item.postedBy._id !== state._id ? `/profile/${item.postedBy._id}` : `/profile`} >
        //                             <span>
        //                                 <img 
        //                                     style={{ width: "50px", float:"left"}}
        //                                     src={item.postedBy.pic} alt="hello"
        //                                 />
        //                             </span>
        //                             {item.postedBy.name}
        //                         </Link>
        //                         {
        //                             item.postedBy._id == state._id
        //                             && 
        //                             <i
        //                                 className="material-icons"
        //                                 style={{float: "right"}}
        //                                 onClick= {() => {deletePost(item._id)}}
        //                             >delete</i>
        //                         }
        //                     </h5>
        //                     <div className="card-image">
        //                         <img src={item.photo} />
        //                     </div>
        //                     <div className="card-content">
        //                         <i className="material-icons" style={{ color: "red" }}>favorite</i>
        //                         {
        //                             item.likes.includes(state._id)
        //                             ?
        //                             <i
        //                             className="material-icons"
        //                             onClick={() => { unlikePost(item._id) }}
        //                             >thumb_down</i>
        //                             :
        //                             <i
        //                             className="material-icons"
        //                             onClick={() => { likePost(item._id) }}
        //                             >thumb_up</i>
        //                         }
                                
        //                         <h6>{item.likes.length} likes</h6>
        //                         <h6>{item.title}</h6>
        //                         <p>{item.body}</p>
        //                         {
        //                             item.comments.map( record => {
        //                                 return (
        //                                     <h6 key={record._id}><span style={{fontWeight:"500"}}>{record.postedBy.name}</span> {record.text}</h6>
        //                                 )
        //                             })
        //                         }
        //                         <form
        //                             onSubmit= {(e) => {
        //                                 e.preventDefault()
        //                                 makeComment(e.target[0].value, item._id)
        //                             }}
        //                         >
        //                             <input type="text" placeholder="write a comment" />
        //                         </form>
        //                     </div>
        //                 </div>
        //             )
        //         })
        //     }
        // </div>

        <div className="home">
            {
                data.map(item => {
                    return (
                        <div className="card home-card grey darken-4" key={item._id}>
                            <h5 style={{padding: "5px"}}>
                                <Link to={item.postedBy._id !== state._id ? `/profile/${item.postedBy._id}` : `/profile`} >
                                    <span>
                                        <img 
                                            style={{ width: "35px", height:"35px", float:"left", borderRadius: "50%", marginRight: "15px", objectFit: "cover"}}
                                            src={item.postedBy.pic} alt="hello"
                                        />
                                    </span>
                                    <span className="white-text white-hover">{item.postedBy.name}</span>
                                </Link>
                                {
                                    item.postedBy._id == state._id
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
                                <img src={item.photo} alt="" style={{objectFit: "cover"}}/>
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
    )
}

export default Home