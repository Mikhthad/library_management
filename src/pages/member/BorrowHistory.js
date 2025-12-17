import { useState,useEffect } from "react";
import api from '../../api';
import MemberNavbar from "./MemberNavbar";
import './borrowHistory.css'

function BorrowHistory(){
    const [history, setHistory] = useState([])

    useEffect(()=>{
        fetchBorrowHistory();
    },[])

    const fetchBorrowHistory = async () =>{
        try{
            const res = await api.get('/api/transactions/user/borrow-history/')
            setHistory(res.data)
        }catch(error){
            console.log("Borrow history error", error)
        }
    }

    return(
        <div className="with-navbar">
            <MemberNavbar/>
            <div className="borrow-history-page">
                <h2 className="page-title">📖 My Borrow History</h2>

                <div className="table-wrapper">
                    <table className="borrow-table">
                        <thead>
                            <tr>
                                <th> ID </th>
                                <th> Book Copy </th>
                                <th> Issue Date </th>
                                <th> Due Date </th>
                                <th> Return Date </th>
                                <th> Status </th>
                                <th> Fine </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((t) =>(
                                    <tr key={t.id}>
                                        <td> {t.book_copy} </td>
                                        <td> {t.issue_date?.slice(0,10)} </td>
                                        <td> {t.due_date} </td>
                                        <td> {t.return_rate?t.return_rate : "Not returned"} </td>
                                        <td className={`status ${t.status}`}> {t.status} </td>
                                        <td className={t.fine_amount > 0 ? "fine" : ""}> {t.fine_amount} </td>
                                    </tr>
                                ))
                            ):(
                                <tr>
                                    <td colSpan="7" className="no-data"> No Borrow history found </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

}

export default BorrowHistory;