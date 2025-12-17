import { useState, useEffect } from "react";
import api from "../../api";
import './wishlist.css'
import MemberNavbar from "./MemberNavbar";

function Wishlist(){
    const [wishlist, setWishlist] = useState([])
    const [bookDetails, setBookDetails] = useState(null)

    useEffect(()=>{
        fetchWishlist();
    },[])

    const fetchWishlist = async () =>{
        try{
            const res = await api.get('/api/books/wishlist/my/')
            setWishlist(res.data)
        }catch(error){
            console.log("Fetch wishlist error", error)
        }
    }

    const removeWishlist = async(wishlistId) =>{
        try{
            await api.delete(`/api/books/wishlist/remove/${wishlistId}/`)
            fetchWishlist()
        }catch(error){
            console.log("Remove wishlist error", error.response?.data || error)
        }
    }

    const loadBookDetails = async (bookId) =>{
        try{
            const res = await api.get(`/api/books/details/${bookId}`)
            setBookDetails(res.data)
        }catch(error){
            console.log("Book details error", error.response?.data || error)
        }
    }

    return(
        <div className="with-navbar">
            <MemberNavbar/>
                <div className="wishlist-page">
                <h2 className="wishlist-title"> ❤️ My Wishlist </h2>
                {wishlist.length === 0 ?(
                    <p className="empty-text"> No books in wishlist </p>
                ):(
                    <ul className="wishlist-list">
                        {wishlist.map((item)=>(
                            <li key={item.id} className="wishlist-item">
                                <div className="wishlist-info">
                                    <b>{item.book_title}</b> 
                                    <span className="author"> {item.book_author} </span> 
                                </div>

                                <div className="wishlist-actions">
                                    <button className="btn-view" onClick={() => loadBookDetails(item.book)}> View Details </button>
                                    <button className="btn-remove" onClick={()=>removeWishlist(item.id)} style={{color:"red", marginLeft:"10px"}}>
                                        ❤️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {bookDetails && (
                    <div className="details-card">
                        <h2> Book Details </h2>

                        <p><b> Title: </b>{bookDetails.book.title}</p>
                        <p><b> Author: </b>{bookDetails.book.author}</p>
                        <p><b> Category: </b>{bookDetails.book.category?.name}</p>
                        <p><b> Description: </b>{bookDetails.book.description}</p>
                        <p>
                            <b> Status: </b>{' '}
                            <span className={bookDetails.book.available ? "available" : "not"}>
                                {bookDetails.book.available ? "Available" : "Not Available"}
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )

}

export default Wishlist;