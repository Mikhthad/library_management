import { useState, useEffect } from "react";
import api from "../../api";
import MemberNavbar from "./MemberNavbar";
import './reservationHistory.css'

function ReservationHistory(){
    const [books, setBooks] = useState([])
    const [reservation, setReservation] = useState([])
    const [selectedBook,setSelectedBook] = useState('')
    const [days, SetDays] = useState(3)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(()=>{
        fetchBooks();
        fetchMyReservations();
    },[])

    const fetchBooks = async () =>{
        try{
            const res = await api.get('/api/books/list/')
            setBooks(res.data)
        }catch(error){
            console.log("Fetch book error", error)
        }
    }

    const fetchMyReservations = async () =>{
        try{
            const res = await api.get('/api/reservations/user/history/')
            setReservation(res.data)
        }catch(error){
            console.log("Reservation Fetch error", error)
        }
    }

    const createReservation = async () =>{
        if (!selectedBook){
            setMessage("Please select a book")
            return
        }
        setLoading(true)
        setMessage('')
        try{
            const res = await api.post('/api/reservations/add/',{
                book : selectedBook,
                days
            })
            setMessage(res.data.detail || "Reservation created")
            setSelectedBook("")
            SetDays(3)
            fetchMyReservations()
        }catch(error){
            setMessage(error.response?.data?.detail || "Reservation Failed")
        }
        setLoading(false)
    }

    const cancelReservation = async (id) =>{
        if(!window.confirm("Cancel this reservation?")) return;
        try{
            await api.delete(`/api/reservations/cancel/${id}/`)
            setMessage("Reservation cancel successfully")
            fetchMyReservations()
        }catch(error){
            alert(error.response?.data?.detail || "Cancel error")
        }
    }

    return(
        <div className="with-navbar">
            <MemberNavbar/>
            <div className="reservation-system">
                <h2>📚 Reservation System</h2>
                <div className="card">
                    <h3> Make Reservation</h3>
                    <select value={selectedBook}
                        onChange={(e) => setSelectedBook(e.target.value)}>
                            <option value="">Select Book</option>
                            {books.map((b)=>(
                                <option key={b.id} value={b.id}> {b.title} {b.available ? "(Available)" : "(Reserved)"} </option>
                            ))}
                        </select>
                        <br/>
                        <label> Days </label>
                        <br/>
                        <input type="number" min="1" max="14" value={days}
                            onChange={(e)=>SetDays(Number(e.target.value))}/>
                        <br/>
                        <button onClick={createReservation} disabled={loading}> {loading ? "Processing..." : "Reserve Book"} </button>
                        {message && <p className="message">{message}</p>}
                </div>
                <div className="card">
                    <h3> My Reservation </h3>
                    {reservation.length === 0 ? (
                        <p> No Reservation </p>
                    ) : (
                        <table className="reservation-table">
                            <thead>
                                <tr>
                                    <th> Book </th>
                                    <th> Status </th>
                                    <th> Created </th>
                                    <th> Expires </th>
                                    <th> Notified </th>
                                    <th> Action </th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservation.map((r)=>(
                                    <tr key={r.id}>
                                        <td> {r.book_title} </td>
                                        <td> {r.status} </td>
                                        <td> {r.created_at?.slice(0,10)} </td>
                                        <td> {r.expired_at} </td>
                                        <td> {r.notified ? "Yes" : "No"} </td>
                                        <td>
                                            {r.status === 'active' && (
                                                <button className="btn-cancel"
                                                    onClick={()=>cancelReservation(r.id)}>Cancel</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
export default ReservationHistory;
