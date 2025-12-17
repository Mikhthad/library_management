import { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import MemberNavbar from "./MemberNavbar";
import './profile.css'


function Profile() {
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
        address: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/api/users/me/");
            setEditForm({
                username: res.data.username || "",
                email: res.data.email || "",
                password: "",
                phone: res.data.phone || "",
                address: res.data.address || ""
            });
        } catch (error) {
            console.log("Profile load error", error);
        }
        setLoading(false);
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put("/api/users/profile/update/", editForm);

            if (res.data.password_changed) {
                alert("Password updated! Please login again.");
                navigate("/login");
                return;
            }

            alert("Profile Updated!");
            navigate("/member/home");
        } catch (error) {
            console.log("Update error", error);
        }
    };

    if (loading) return <p className="profile-loading">Loading...</p>;

    return (
        <div className="with-navbar">
            <MemberNavbar/>

            <div className="profile-container">
            <h2 className="profile-title">👤 My Profile</h2>

                <div className="profile-card">
                    <h3 className="profile-subtitle">Edit Profile</h3>

                    <form className="profile-form" onSubmit={updateProfile}>
                        <div className="form-group">
                            <label>Username:</label>
                            <input value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}/>
                        </div>

                        <div className="form-group">
                        <label>Email:</label>
                        <input value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}/>
                        </div>
                        
                        <div className="form-group">
                        <label>New Password (optional):</label>
                        <input type="password" value={editForm.password}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}/>
                        </div>
                        
                        <div className="form-group">
                        <label>Phone:</label>
                        <input value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}/>
                        </div>

                        <div className="form-group">
                            <label>Address:</label>
                            <input value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}/>
                        </div>

                        <button className="btn-save" type="submit">Save</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
