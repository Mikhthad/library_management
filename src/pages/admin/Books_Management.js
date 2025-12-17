import { useState, useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './books_management.css'

function Books() {
  const [books, setBooks] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [shelves, setshelves] = useState([])
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("form")
  const [formData, setFormData] = useState({
    title:"",
    author:"",
    isbn:'',
    genre:"",
    category:"",
    publicationyear:"",
    description:"",
    shelf_id:"",
    coverimg:null,
    uplodedfile:null
  })
  const [importFile, setImportFile] = useState(null)
  const [bulkImages, setBulkImages] = useState([])
  const [newCategory, setNewCategory] = useState("");


  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchShelves();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/api/books/list/");
      setBooks(res.data);
    } catch (error) {
      console.log("Error fetching books", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/books/category_list/");
      setCategoryList(res.data);
    } catch (error) {
      console.log("Fetch categories error", error);
    }
  };

  const fetchShelves = async () =>{
    try{
      const res = await api.get('/api/inventory/shelves/')
      setshelves(res.data)
    }catch(error){
      console.log("Fetch shelves error", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("author", formData.author);
      payload.append("isbn", formData.isbn);
      payload.append("genre", formData.genre);
      payload.append("category_id", formData.category);
      payload.append("publication_year", formData.publicationyear);
      payload.append("description", formData.description);
      payload.append("shelf_id", formData.shelf_id);

      if (formData.coverimg) {
        payload.append("coverimg", formData.coverimg);
      }

      if (formData.uplodedfile) {
        payload.append("uploaded_files", formData.uplodedfile);
      }

      if (editingId) {
        await api.put(`/api/books/edit/${editingId}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Book updated successfully");
      } else {
        await api.post("/api/books/add/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Book added successfully");
      }

      resetForm();
      fetchBooks();
      setActiveTab("list");

    } catch (error) {
      console.error("Save error:", error.response?.data || error);
      alert("Add Book failed");
    }
  };


  const resetForm = () =>{
    setFormData({
        title:"",
        author:"",
        isbn:"",
        genre:"",
        category:"",
        publicationyear:"",
        description:"",
        shelf_id:"",
        coverimg:null,
        uplodedfile:null,
      })
  }


  const handleEdit = (book) =>{
    setEditingId(book.id);
    setFormData({
      title:book.title,
      author:book.author,
      isbn:book.isbn,
      genre:book.genre,
      category:book.category?.id || "",
      publicationyear:book.publicationyear || "",
      description:book.description || "",
      shelf_id:book.shelf?.id || "",
      coverimg:null,
      uplodedfile:null
    })
    setActiveTab('form')
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/api/books/delete/${id}/`,);
      fetchBooks();
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  const handleImportBooks = async () =>{
    if(!importFile) return alert("Please select a file");

    const form = new FormData();
    form.append('file', importFile)

    try{
      await api.post('/api/books/import/', form,{
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert("Books imported successfully")
      fetchBooks();
    }catch(error){
      console.log(error)
      alert("import failed")
    }
  }

  const addCategory = async ()=>{
    if(!newCategory.trim()){
      alert("Category name required")
      return;
    }
    try{
      await api.post('/api/books/add_category/',{
        name:newCategory
      })
      setNewCategory('')
      fetchCategories()
      alert('Category added')
    }catch(error){
      console.log("Add category error", error.response?.data || error);
      alert("Failed to add category");
    }
  }

  const deleteCategory = async (id) =>{
    if(!window.confirm("Delete this Category")) return;
    try{
      await api.delete(`/api/books/delete_category/${id}`)
      fetchCategories();
    }catch(error){
      console.log("Delete category error", error.response?.data || error);
    }
  }

  const handleBulkUpload = async () =>{
    if(!bulkImages.length) return alert("Please select images.");

    const form = new FormData();
    Array.from(bulkImages).forEach((file) =>{
      form.append('images', file)
    })

    try{
      await api.post('/api/books/bulk-upload/',form,{
        headers: { "Content-Type": "multipart/form-data" },
      })
      alert("images uploaded")
    }catch(error){
      console.log(error);
      alert("Bulk upload failed");
    }
  }

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="content">
        <h2 className="page-title"> Book Management </h2>

        <div className="tabs">
          <button className='tab-btn' onClick={()=> setActiveTab('form')}> Add / Edit </button>
          <button className="tab-btn" onClick={()=>setActiveTab('category')}> Category </button>
          <button className='tab-btn' onClick={()=> setActiveTab('list')}> Book List </button>
          <button className='tab-btn' onClick={()=> setActiveTab('import')}> Import </button>
        </div>

        {activeTab === "form" && (
          <form className='book-form' onSubmit={handleSubmit}>
            <input className="form-input" placeholder="Title" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} required/>
            <input className="form-input" placeholder="Author" value={formData.author} onChange={(e)=>setFormData({...formData, author:e.target.value})} required/>
            <input className="form-input" placeholder="ISBN" value={formData.isbn} onChange={(e)=>setFormData({...formData, isbn:e.target.value})} required/>
            <input className="form-input" placeholder="Genre" value={formData.genre} onChange={(e)=>setFormData({...formData, genre:e.target.value})}/>
            <select className="form-select" value={formData.category} onChange={(e)=>setFormData({...formData,category:e.target.value})}required>
              <option value = ""> Select Category </option>
              {categoryList.map((cat)=>(
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select className="form-select" value={formData.shelf_id} onChange={(e)=>setFormData({...formData,shelf_id:e.target.value})}required>
              <option value=""> Select Shelf </option>
              {shelves.map((shelf)=>(
                <option key={shelf.id} value={shelf.id}>
                  {shelf.name}
                </option>
              ))}
            </select>
            <input className="form-input" placeholder="Publication Year" value={formData.publicationyear} onChange={(e)=>setFormData({...formData, publicationyear:e.target.value})} />
            <input className="form-input" placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} />
            <br/>
            <label> Image: </label>
            <input className="form-file" type="file" accept="image/" onChange={(e)=>setFormData({...formData, coverimg:e.target.files[0]})} />
            <input className="form-file" type="file" onChange={(e)=>setFormData({...formData, uplodedfile:e.target.files[0]})} />

            <button className="submit-btn" type="submit"> 
              {editingId ? "Update Book" : "Add Book"}
            </button>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="book-list">
            {books.map((book)=>(
              <div className="book-card" key={book.id}>
                <p className="book-title"> {book.title} — {book.author} ({book.isbn}) </p>
                <p className="book-shelf"> Shelf: {book.shelf?.name || "N/A"} </p>
                <div className="book-actions">
                  <button className="btn edit-btn" onClick={()=>handleEdit(book)}> Edit </button>
                  <button className="btn delete-btn" onClick={()=>handleDelete(book.id)}> Delete </button>
                  <button className="btn qr-btn" onClick={()=>{
                    setActiveTab('qr')
                    }}>
                    Qr
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="import-section">
            <h3> Import CSV/Excel</h3>
            <input className="form-file" type="file" accept=".csv,.xlsx" onChange={(e)=>setImportFile(e.target.files[0])}/>
            <button className="submit-btn" onClick={handleImportBooks}> Import </button>

            <h3> Bulk Image Upload</h3>
            <input className="form-file" type="file" multiple onChange={(e)=>setBulkImages(e.target.files)}/>
            <button className="submit-btn" onClick={handleBulkUpload}> Upload Images </button>
          </div>
        )}
        {activeTab === 'category' && (
          <div className="category-section">
            <h3>📂 Category Management</h3>
            <div className="category-add">
              <input className="form-input" placeholder="New Category Name" value={newCategory}
                onChange={(e)=>setNewCategory(e.target.value)}/>
              <button className="submit-btn" onClick={addCategory}> Add Category </button>
            </div>
            <div className="category-list">
              {categoryList.length === 0 ? (
                <p>No category found</p>
              ):(
                <ul>
                  {categoryList.map((cat)=>(
                    <li key={cat.id} className="category-item">
                      <span>{cat.name}</span>
                      <button className="category-item"
                        onClick={()=>deleteCategory(cat.id)}> Delete </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;
