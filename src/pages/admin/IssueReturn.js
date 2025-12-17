import { useState,useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './issueReturn.css'


function IssueReturn(){
    const [books, setBooks] = useState([])
    const [members, setMembers] = useState([])
    const [copies, setCopies] = useState([])
    const [transactions, setTransactions] = useState([])
    const [memberQuerry, setMemberQuerry] = useState('')
    const [bookQuerry, setBookQuerry] = useState('')
    const [selectedMember, setSelectedMember] = useState(null)
    const [selectedBook, setSelectedBook] = useState(null)
    const [availableCopy, setAvailableCopy] = useState(null)
    const [dueDate, setDueDate] = useState('')
    useEffect(()=>{
        fetchmembers();
        fetchbooks();
        fetchcopies();
    },[])

    const fetchmembers = async () =>{
        const res = await api.get('/api/users/all/')
        setMembers(res.data)
    }

    const fetchbooks = async () =>{
        const res = await api.get('/api/books/list/')
        setBooks(res.data)
    }

    const fetchcopies = async () =>{
        const res = await api.get('/api/inventory/copies/')
        setCopies(res.data)
    }

    const fetchMemberTransactions = async (memberId) =>{
        const res = await api.get(`/api/transactions/member/${memberId}/`)
        setTransactions(res.data)
    }

    const calculateDueDate = () =>{
        const date = new Date();
        date.setDate(date.getDate()+14)
        setDueDate(date.toISOString().split('T')[0])
    }

    const checkAvailability = (bookId) =>{
        const available = copies.find(
            (c) => c.book?.id === bookId && c.status === 'available'
        )
        setAvailableCopy(available || null)
        calculateDueDate();
    }

    const issuebook = async () =>{
        if (!selectedMember || !availableCopy) return;
        try{
            await api.post('/api/transactions/issue/',{
                member:selectedMember.id,
                book_copy:availableCopy.id,
                due_date:dueDate,
            })    
            alert('Book Issued Successfully')
            fetchcopies()
            fetchMemberTransactions(selectedMember.id)
            setSelectedBook(null)
            setSelectedMember(null)
        }catch(error){
            console.log("issue error",error.response?.data || error)
        }
    }

    const returnBook = async (transactionId)=>{
        await api.put(`/api/transactions/return/${transactionId}/`)
        alert("Book returned")
        fetchcopies();
        if(selectedMember){
            fetchMemberTransactions(selectedMember.id)
        }
    }

    const filteredMembers = members.filter((m)=>
        m.user.username.toLowerCase().includes(memberQuerry.toLowerCase())
    )

    const filteredBooks = books.filter((b)=>
        b.title.toLowerCase().includes(bookQuerry.toLowerCase())
    )

    return(
        <div className="page-with-sidebar">
            <Sidebar/>
            <div className="content">
                <h2> Issue / Return System </h2>

                <h3> Search Member </h3>
                <input placeholder="Search User" value={memberQuerry}
                    onChange={(e)=>setMemberQuerry(e.target.value)}/>
                <ul className="search-list">
                    {filteredMembers.map((m)=>(
                        <li key={m.id} onClick={()=>{
                            setSelectedMember(m); 
                            fetchMemberTransactions(m.id)}}> {m.user.username} </li>
                    ))}
                </ul>
                {selectedMember && (
                    <p> Selected Member: <b> {selectedMember.user.username} </b></p>
                )}

                <hr/>

                <h3> Issue Book </h3>
                <input placeholder="Search Book" value={bookQuerry}
                    onChange={(e)=>setBookQuerry(e.target.value)}/>
                <ul className="search-list">
                    {filteredBooks.map((b)=>(
                        <li key={b.id} onClick={()=>{
                            setSelectedBook(b);
                            checkAvailability(b.id)
                        }}> {b.title} </li>
                    ))}
                </ul>
                {selectedBook && (
                    <p>Selected Book: <b> {selectedBook.title} </b></p>
                )}

                {availableCopy ? (
                    <p style={{color:"green"}}> Copy Available </p>
                ) : (
                    <p style={{color:"red"}}>No copy available </p>
                )}

                {dueDate && <p>Due Date: {dueDate} </p>}

                { selectedMember && availableCopy && (
                    <button className="btn issue-btn" onClick={issuebook}>Issue Book</button>
                )}

                <hr/>
                
                <h3> Return Book </h3>
                {transactions.length === 0 ? (
                    <p> No active issued book </p>
                ):(
                    <table className="return-table">
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Issued</th>
                                <th>Due</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t)=>(
                                <tr key={t.id}>
                                    <td> {t.book_title} </td>
                                    <td> {t.issue_date?.slice(0, 10)}</td>
                                    <td>{t.due_date}</td>
                                    <td>
                                        <button className="return-btn" onClick={()=>returnBook(t.id)}>
                                            Return
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default IssueReturn;
