import { useState,useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './inventoryStock.css';

function InventoryStock(){
    const [books, setBooks] = useState([])
    const [copies, setCopies] = useState([])
    const [shelves, setShelves] = useState([])
    const [formData, setFormData] = useState({
        book:"",
        shelf:"",
        copy_number:""
    })
    const [editId, setEditId] = useState(null)
    const [newShelf, setNewShelf] = useState('')

    useEffect(()=>{
        fetchCopies();
        fetchShelves();
        fetchBooks();
    },[]);

    const fetchCopies = async () =>{
        try{
            const res = await api.get('/api/inventory/copies/')
            setCopies(res.data)
        }catch(error){
            console.log("Error fetching copies",error)
        }
    }

    const fetchShelves = async ()=>{
        try{
            const res = await api.get('/api/inventory/shelves/')
            setShelves(res.data)
        }catch(error){
            console.log("Error fetchin shelves",error)
        }
    }

    const fetchBooks = async ()=>{
        try{
            const res = await api.get('/api/books/list/')
            setBooks(res.data)
        }catch(error){
            console.log("Fetch books error", error)
        }
    }
    const handleCopySubmit = async(e) =>{
        e.preventDefault();
        try{
            if (editId){
                await api.put(`/api/inventory/copies/edit/${editId}/`,{
                    book_id:formData.book,
                    shelf_id:formData.shelf,
                    copy_number:formData.copy_number
                })
            }else{
                await api.post('/api/inventory/copies/add/',{
                    book_id:formData.book,
                    shelf_id:formData.shelf,
                    copy_number:formData.copy_number
                })
            }
            setEditId(null)
            setFormData({
                book:"",
                shelf:"",
                copy_number:""
            })
            fetchCopies();
        }catch(error){
            console.log("Error saving Copy", error.response?.data)
        }
    }

    const deleteCopy = async(id)=>{
        if(!window.confirm('Delete this copy?')) return;
        try{
            await api.delete(`/api/inventory/copies/delete/${id}/`,
            )
            fetchCopies();
        }catch(error){
            console.log("Delete Copy error",error)
        }
    }

    const setEditCopy = (copy)=>{
        setEditId(copy.id)
        setFormData({
            book:copy.book?.id || "",
            shelf:copy.shelf?.id || "",
            copy_number:copy.copy_number
        })
    }
    const handleShelfSubmit = async(e)=>{
        try{
            e.preventDefault()
            await api.post('/api/inventory/shelves/add/',
                {name:newShelf},
            )
            setNewShelf("")
            fetchShelves()
        }catch(error){
            console.log("shelf add error",error)
        }
    }

    const deleteShelf = async(id)=>{
        if (!window.confirm("Delete this Shelf?")) return;
        try{
            await api.delete(`/api/inventory/shelve/delete/${id}/`)
            fetchShelves();
        }catch(error){
            console.log("Delete Shelf error",error)
        }
    }

    const totalCopies = copies.length;
    const damagedBooks = copies.filter((c) => c.status==='damaged').length
    const lostBooks = copies.filter((c) => c.status==='lost').length
    const availableBooks = copies.filter((c)=>c.status==='available').length

    const lowStockAlert = totalCopies > 0 && availableBooks / totalCopies <0.3;

    return(
        <div className="inventory-with-sidebar">
            <Sidebar/>
            <div className="inventory-content">
                <h2 className="page-title"> Inventory & Stocks </h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4> Total Copies </h4>
                        <p> {totalCopies} </p>
                    </div>
                    <div className="stat-card available">
                        <h4> Available </h4>
                        <p> {availableBooks} </p>
                    </div>
                    <div className="stat-card damaged">
                        <h4> Damaged </h4>
                        <p> {damagedBooks} </p>
                    </div>
                    <div className="stat-card lost">
                        <h4> Lost </h4>
                        <p> {lostBooks} </p>
                    </div>
                </div>
                {lowStockAlert && (
                    <div className="alert">
                        ⚠️ Low Stock Alert! Available copies below minimum level.
                    </div>
                )}

                <div className="inventory-card">
                    <h3> {editId ? "Edit Copy" : "Add Copy"} </h3>
                    <form className="inventory-form" onSubmit={handleCopySubmit}>
                        <select value={formData.book} onChange={(e)=>setFormData({...formData, book:e.target.value})} required>
                            <option value=""> Select Book </option>
                            {books.map((book)=>(
                                <option key={book.id} value={book.id}> {book.title} </option>
                            ))}
                        </select>
                        <select value={formData.shelf} onChange={(e)=>setFormData({...formData, shelf:e.target.value})} required>
                            <option value=""> Select Shelf </option>
                            {shelves.map((s)=>(
                                <option key={s.id} value={s.id}> {s.name} </option>
                            ))}
                        </select>
                        <input placeholder="Copy Number" value={formData.copy_number} 
                            onChange={(e)=>setFormData({...formData, copy_number:e.target.value})} required/>
                        <button type="submit"> {editId ? "Update Copy" : "Add Copy"} </button>
                    </form>
                </div>
                <div className="inventory-card">
                    <h3> Shelf Management </h3>
                    <form className="shelf-form" onSubmit={handleShelfSubmit}>
                        <input placeholder="New Shelf Name" value={newShelf} 
                            onChange={(e)=>setNewShelf(e.target.value)} required/>
                        <button type="submit"> Add Shelf </button>
                    </form>
                    <ul className="shelf-list">
                        {shelves.map((shelf)=>(
                            <li key={shelf.id}> 
                                {shelf.name} 
                                <button className="btn delete" onClick={()=>deleteShelf(shelf.id)}> Delete </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="inventory-card">
                    <h3> All Copies </h3>
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th> ID </th>
                                <th> Book </th>
                                <th> Shelf </th>
                                <th> Copy No </th>
                                <th> Status </th>
                                <th> Action </th>
                            </tr>
                        </thead>
                        <tbody>
                            {copies.map((copy)=>(
                                <tr key={copy.id}>
                                    <td> {copy.id} </td>
                                    <td> {copy.book?.title || "N/A"} </td>
                                    <td> {copy.shelf?.name || "N/A"} </td>
                                    <td> {copy.copy_number} </td>
                                    <td>
                                        <span className={`status ${copy.status?.toLowerCase()}`}> {copy.status} </span>
                                    </td>
                                    <td>
                                        <button className="btn edit" onClick={()=>setEditCopy(copy)}> Edit </button>
                                        <button className="btn delete" onClick={()=>deleteCopy(copy.id)}> Delete </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
    
}

export default InventoryStock;