import { useState,useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './memberManagement.css'


function MemberManagement(){
    const [members, setMembers] = useState([])
    const [pendingMembers, setPendingMembers] = useState([])
    const [activeTab, setActiveTab] = useState("manage")
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        username:"",
        password:"",
        email:"",
        phone:"",
        address:"",
        role:"member",
        membership_plan:"basic"
    })

    useEffect(()=>{
        fetchMembers();
        fetchPendingMembers();
    },[])

    const fetchMembers = async () =>{
        try{
            const res = await api.get('/api/users/all/')
            setMembers(res.data)
        }catch(error){
            console.log('Fetch members error',error)
        }
    }

    const fetchPendingMembers = async () =>{
        try{
            const res = await api.get('/api/users/pending/')
            setPendingMembers(res.data)
        }catch(error){
            console.log("Fetch pending error", error)
        }
    }


    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            if(editingId){
                await api.put(`/api/users/me/update/${editingId}/`,formData,)
            }else{
                await api.post('/api/users/register/',formData,)
            }
            resetForm();
            fetchMembers();
        }catch(error){
            console.log('Save member error',error.response?.data || error)
        }
    }

    const handleEdit = (member)=>{
        setEditingId(member.id)
        setFormData({
            username:member.user.username,
            email:member.user.email,
            role:member.role,
            phone:member.phone,
            address:member.address,
            membership_plan:member.membership_plan || "basic",
            password:""
        })
    }

    const resetForm = () =>{
        setEditingId(null);
        setFormData({
            username:"",
            password:"",
            email:"",
            phone:"",
            address:'',
            role:"member",
            membership_plan:"basic"
        })
    }

    const handleDelete = async(id) =>{
        if (!window.confirm("Are you sure you want to delete this member?")) return;
        try{
            await api.delete(`/api/users/delete/${id}/`)
            fetchMembers();
        }catch(error){
            console.log("Delete error",error)
        }
    }

    const toggleStatus = async (id) =>{
        await api.post(`/api/users/status/${id}/`)
        fetchMembers();
    }

    const approveMembers = async (id)=>{
        await api.post(`/api/users/approve/${id}/`)
        fetchPendingMembers();
        fetchMembers();
    }

    return(
        <div className="page-with-sidebar">
            <Sidebar/>
            <div className="member-content">
                <h2> Member Management </h2>
                <div className="tabs">
                    <button onClick={()=>setActiveTab('manage')}>Members</button>
                    <button onClick={()=>setActiveTab("approve")}> Approvals </button>
                    <button onClick={()=>setActiveTab("history")}> History </button>
                </div>
                {activeTab === "manage" && (
                    <>
                        <div className="member-card">
                            <h3> {editingId ? "Edit Member" : "Add Member"} </h3>
                            <form onSubmit={handleSubmit}>
                                <input placeholder="Username" value={formData.username}
                                    onChange={(e)=>setFormData({...formData, username:e.target.value})}/>
                                {!editingId && (
                                    <input type="password" placeholder="Password" value={formData.password}
                                        onChange={(e)=>setFormData({...formData,password:e.target.value})}/>
                                )}
                                <input placeholder="Email" value={formData.email}
                                    onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
                                <input placeholder="Phone" value={formData.phone}
                                    onChange={(e)=>setFormData({...formData, phone:e.target.value})}/>
                                <input placeholder="Address" value={formData.address}
                                    onChange={(e)=>setFormData({...formData, address:e.target.value})}/>
                                <select value={formData.membership_plan}
                                    onChange={(e)=>setFormData({...formData,membership_plan:e.target.value})}>
                                        <option value="basic"> Basic </option>
                                        <option value="premium"> Premium </option>
                                        <option value="student"> Student </option>
                                    </select>
                                <select value={formData.role}
                                    onChange={(e)=>setFormData({...formData,role:e.target.value})}>
                                        <option value='member'> Member </option>
                                        <option value='librarian'> Librarian </option>
                                        <option value='admin'> Admin </option>
                                    </select>
                                <button type="submit"> {editingId ? "Update Member" : "Add Member"} </button>

                                {editingId && (
                                    <button type="button" onClick={resetForm}> Cancel </button>
                                )}
                            </form>
                        </div>
                        <div className="member-card">
                            <h3> All Members </h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th> Name </th>
                                        <th> Role </th>
                                        <th> Phone </th>
                                        <th> Address </th>
                                        <th> Plan </th>
                                        <th> Status </th>
                                        <th> Action </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m)=>(
                                        <tr key={m.id}>
                                            <td> {m.user.username} </td>
                                            <td> {m.role} </td>
                                            <td> {m.phone} </td>
                                            <td> {m.address} </td>
                                            <td> {m.membership_plan} </td>
                                            <td> {m.user.is_active ? "Active" : "Suspend"} </td>
                                            <td>
                                                <button onClick={()=>handleEdit(m)}> Edit </button>
                                                <button onClick={()=>toggleStatus(m.id)}>
                                                    {m.user.is_active ? "Suspend" : "Reinstate"}
                                                </button>
                                                <button onClick={()=>handleDelete(m.id)}> Delete </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {activeTab === 'approve' && (
                    <div className="member-card">
                        <h3> Pending Approvals </h3>
                        {pendingMembers.map((p)=>(
                            <div key={p.id} className="approve-card">
                                {p.user.username} ({p.user.email})
                                <button onClick={()=>approveMembers(p.id)}> Approve </button>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "history" && (
                    <div className="member-card">
                        <h3> User History & Penalties </h3>
                        <p>Coming soon: issued books, fines, late returns, suspensions.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MemberManagement;