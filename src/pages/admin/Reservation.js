import { useState,useEffect } from "react";
import api from '../../api';
import Sidebar from "./Sidebar";
import './reservation.css'

function Reservation(){
    const [reservations, setReservations] = useState([])
    const [members, setMembers] = useState([])
    const [books, setBooks] = useState([])
    const [memberId, setMemberId] = useState('')
    const [bookId, setBookId] = useState('')
    const [days, setDays] = useState(3)
    const [filter, setFilter] = useState('')

    useEffect(() =>{
        fetchReservations();
        fetchMembers();
        fetchBooks();   
    },[])

    const fetchReservations = async ()=>{
        try{
            const res = await api.get('/api/reservations/list/')
            setReservations(res.data)
        }catch(error){
            console.log("Fetch reservation error",error)
        }
    }

    const fetchMembers = async () =>{
        try{    
            const res = await api.get('/api/users/all/')
            setMembers(res.data)
        }catch(error){
            console.log("Fetch members error",error)
        }
    }

    const fetchBooks = async () =>{
        try{
            const res = await api.get('/api/books/list/')
            setBooks(res.data)
        }catch(error){
            console.log('Fetch Books Error',error)
        }
    }

    const handleCreate = async (e) =>{
        e.preventDefault();

        if (!memberId || !bookId){
            alert("Select member and book")
            return
        }
        try{
            await api.post('/api/reservations/add/',{
                member:memberId,
                book:bookId,
                days
            })
            setBookId('')
            setMemberId('')
            setDays(3)
            fetchReservations()
        }catch(error){
            console.log("Create Reservation error",error.response?.data || error)
            alert("Failed to create reservation")
        }
    }

    const updateStatus = async (id, status) =>{
        try{
            await api.put(`/api/reservations/update/${id}/`,{status})
            fetchReservations()
        }catch(error){
            console.log("Update reservation error", error.response?.data || error)
        }
    }    

    const filteredReservation = filter
        ?reservations.filter((r)=> r.status===filter) 
        : reservations;

    return (
        <div className="layout-with-sidebar">
            <Sidebar />

            <div className="reservation-page">
                <h2 className="reservation-title">Reservation Management</h2>

                <div className="reservation-card">
                    <h3>Create Reservation</h3>

                    <form className="reservation-form" onSubmit={handleCreate}>
                        <div className="form-control">
                            <label>Member</label>
                            <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                                <option value="">Select Member</option>
                                {members.map((m) => (
                                <option key={m.id} value={m.id}> {m.user.username} </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label>Book</label>
                            <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
                                <option value="">Select Book</option>
                                {books.map((b) => (
                                <option key={b.id} value={b.id}> {b.title} </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label>Hold Days</label>
                            <input type="number" min="1" max="14" value={days}
                                onChange={(e) => setDays(Number(e.target.value))}/>
                        </div>

                        <button type="submit" className="btn-primary"> Add Reservation </button>
                    </form>
                </div>

                <div className="reservation-filter">
                    <label>Filter by status</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="ready">Ready</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                <div className="reservation-card">
                    <h3>All Reservations</h3>

                    <table className="reservation-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member</th>
                                <th>Book</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Expires</th>
                                <th>Notified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReservation.map((r) => (
                                <tr key={r.id} className={r.status === "ready" ? "ready-row" : ""}>
                                    <td>{r.id}</td>
                                    <td>{r.member_name}</td>
                                    <td>{r.book_title}</td>
                                    <td>{r.status}</td>
                                    <td>{r.created_at?.slice(0, 10)}</td>
                                    <td>{r.expired_at}</td>
                                    <td>{r.notified ? "Yes" : "No"}</td>
                                    <td>
                                        {r.status === "active" && (
                                            <button className="btn-danger"
                                                onClick={() => updateStatus(r.id, "cancelled")}> Cancel </button>
                                        )}
                                        {r.status === "ready" && (
                                            <>
                                                <button className="btn-success"
                                                    onClick={() => updateStatus(r.id, "fulfilled")}> Fulfill </button>
                                                <button className="btn-danger"
                                                    onClick={() => updateStatus(r.id, "cancelled")}> Cancel </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reservation;