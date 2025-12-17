import { useState, useEffect } from "react";
import api from "../../api";
import MemberNavbar from './MemberNavbar'

function FinesPaymentUser(){
    const [fines, setFines] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    useEffect(()=>{
        fetchFines();
    },[])

    const fetchFines = async () =>{
        setLoading(true)
        try{
            const res = await api.get('/api/transactions/fines/my/')
            setFines(res.data)
        }catch(error){
            console.log("Fetch fines error", error)
            setError("Failed to load fines");
        }
        setLoading(false)
    }


    const formData = (s) =>{
        if (!s) return "-"
        return s.slice(0, 10)
    }

    return(
        <div className="with-navbar">
            <MemberNavbar/>
            <div className="fines-user-container">
                <h2 className="page-title">💸 My Fines & Payments </h2>

                {loading ? (
                    <p className="loading-text">Loading Fines..</p>
                ) : error ? (
                    <p className="error-text">{error}</p>
                ) : (
                    <div>
                        <div className="card">
                            <table className="fines-user-table">
                                <thead>
                                    <tr>
                                        <th> ID </th>
                                        <th> Reason </th>
                                        <th> Amount </th>
                                        <th> Status </th>
                                        <th> Created </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fines.length === 0 ? (
                                        <tr>
                                            <td colSpan="6"> You have no files </td>
                                        </tr>
                                    ) : (
                                        fines.map((f)=>(
                                            <tr key={f.id}>
                                                <td> {f.id} </td>
                                                <td> {f.reason} </td>
                                                <td> {Number(f.amount).toFixed(2)} </td>
                                                <td> {f.is_paid ? "Paid" : "Unpaid"} </td>
                                                <td> {formData(f.created_at)} </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

}
export default FinesPaymentUser;