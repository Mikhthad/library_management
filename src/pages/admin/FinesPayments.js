import { useState, useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './finesPayments.css'

function FinesPayments(){
    const [fines, setFines] = useState([])
    const [selectedFine, setSelectedFine] = useState(null)
    const [members, setMembers] = useState([])
    const [memberId, setMemberId] = useState('')
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [paymentMode, setPaymentMode] = useState('cash')
    const [receipt, setReceipt] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        fetchFines();
        fetchMembers();
    },[])

    const fetchFines = async ()=>{
        try{
            const res = await api.get('/api/transactions/fines/')
            setFines(res.data)
        }catch(error){
            console.log("Fetch fines error", error)
        }
    }

    const fetchMembers = async ()=>{
        try{
            const res = await api.get('/api/users/all/')
            setMembers(res.data)
        }catch(error){
            console.log("Fetch members error", error)
        }
    }

    const addFine = async ()=>{
        if(!memberId || !amount || !reason){
            alert("All feilds are required")
            return;
        }
        try{
            setLoading(true)
            await api.post('/api/transactions/fines/add/',{
                member:memberId,
                amount,
                reason
            })
            alert("Fine added successfully")
            resetForm();
            fetchFines();
        }catch(error){
            console.log("Add fine error", error.response?.data || error)
        }finally{
            setLoading(false)
        }
    }

    const updateFine = async () =>{
        if(!selectedFine || !amount){
            alert("Select Fine and enter amount")
            return
        }
        try{
            setLoading(true)
            await api.put(`/api/transactions/fines/update/${selectedFine.id}/`,{
                amount,
                reason,
            })
            alert('Fine update Successfully')
            resetForm();
            fetchFines();
        }catch(error){
            console.log("Fine update error", error.response?.data || error)
        }finally{
            setLoading(false)
        }
    }

    const payFine = async () =>{
        if (!selectedFine) return;
        try{
            setLoading(true)
            const res = await api.post('/api/transactions/pay/',{
                fine:selectedFine.id,
                amount:selectedFine.amount,
                payment_mode:paymentMode
            })
            alert('Payment Successful')
            setReceipt(res.data.receipt)
            resetForm();
            fetchFines()
        }catch(error){
            console.log("Payment error", error.response?.data || error)
        }finally{
            setLoading(false)
        }
    }
    const resetForm = () => {
        setSelectedFine(null);
        setMemberId("");
        setAmount('')
        setReason("");
        setPaymentMode("cash");
    };

    const deleteFine = async (id)=>{
        if(!window.confirm("Are you sure you want to delete this fine?")) return;
        try{
            setLoading(true)
            await api.delete(`/api/transactions/fines/delete/${id}/`)
            alert("Fine deleted successfully")
            fetchFines();
        }catch(error){
            alert(error.response?.data?.detail || "Deleted Failed")
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="page-with-sidebar">
            <Sidebar/>
            <div className="fines-content">
                <h2> Fines & Payments </h2>

                <div className="card">
                    <h3>Add Manual Fine</h3>

                    <div className="form-row">
                        <label> Member </label>
                        <select value={memberId} onChange={(e)=>setMemberId(e.target.value)}>
                            <option value = ''> Select Member </option>
                            {members.map((m)=>(
                                <option key={m.id} value={m.id}> {m.user.username} </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <label>Amount</label>
                        <input type="number" placeholder="Fine Amount" value={amount}
                            onChange={(e)=>setAmount(e.target.value)}/>
                    </div>
                    <div className="form-row">
                        <label> Reason </label>
                        <input type="text" placeholder="Reason" value={reason}
                            onChange={(e)=>setReason(e.target.value)}/>
                    </div>

                    <button className="btn primary" onClick={addFine} disabled={loading}> Add Fine </button>
                </div>

                <div className="card">
                    <h3> All Fines </h3>
                    <table className="fines-table">
                        <thead>
                            <tr>
                                <th> ID </th>
                                <th> Member </th>
                                <th> Amount </th>
                                <th> Reason </th>
                                <th> Status </th>
                                <th> Created </th>
                                <th> Action </th>
                            </tr>
                        </thead>
                        <tbody>
                            {fines.map((f)=>(
                                <tr key={f.id}>
                                    <td> {f.id} </td>
                                    <td> {f.member_name || f.member} </td>
                                    <td> {f.amount} </td>
                                    <td> {f.reason} </td>
                                    <td> {f.is_paid? "Paid" : "Unpaid"} </td>
                                    <td> {f.created_at?.slice(0,10)} </td>   
                                    <td> 
                                        {!f.is_paid && (
                                            <>
                                                <button className="btn manage" onClick={()=>{
                                                    setSelectedFine(f)
                                                    setAmount(f.amount)
                                                    setReason(f.reason)
                                                }}> Manage </button>
                                                <button className="btn delete"
                                                    onClick={()=>deleteFine(f.id)} disabled = {loading}> Delete </button>
                                            </>
                                        )} 
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedFine && (
                    <div className="card">
                        <h3> Fine Management </h3>

                        <p><b> Fine ID:</b>{selectedFine.id}</p>

                        <div className="form-row">
                            <label> Amount</label>
                            <input type="number" value={amount}
                                onChange={(e) => setAmount(e.target.value)}/>
                        </div>
                        <div className="form-row">
                            <label> Reason </label>
                            <input type="text" value={reason}
                                onChange={(e) => setReason(e.target.value)}/>
                        </div>
                        <button className="btn primary" onClick={updateFine} disabled={loading}> Update Fine </button>

                        <hr />

                        <select value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}>
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                            </select>

                        <button className="btn success" onClick={payFine} disabled={loading}> Pay Fine </button>
                    </div>
                )}

                {receipt && (
                    <div className="card receipt-card">
                    <h3> Payment Reciept: </h3>
                    <p><b>Receipt No: </b> {receipt.receipt_no} </p>
                    <p><b> Amount Paid: </b> {receipt.amount_paid}</p>
                    <p><b>Mode: </b> {receipt.payment_mode} </p>
                    <p><b>Date: </b> {receipt.paid_at?.slice(0,10)}</p>
                    </div>
                )}
            </div>
        </div>
    )

}

export default FinesPayments;