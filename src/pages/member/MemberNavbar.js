import {Link, useNavigate} from "react-router-dom"
import api from "../../api"
import './memberNavbar.css'

function MemberNavbar(){
    const navigate = useNavigate();
    const logout = async () =>{
        await api.post('/api/users/logout/')
        navigate('/login')
    }

    return(
        <div className="member-navbar">
            <div className="nav-left">
                <h3>📚 Library</h3>
            </div>

            <div className="nav-links">
                <Link to = '/member/home'> Home </Link>
                <Link to="/member/borrow-history"> Borrow history </Link>
                <Link to="/member/reservation-history"> Reservaltion History </Link>
                <Link to="/member/fine-payment"> Fine & Payment </Link>
                <Link to="/member/notification"> Notification </Link>
                <Link to="/member/profile"> Profile </Link>
            </div>

            <div className="nav-right">
                <Link to = "/member/wishlist" className="wishlist-icon" title="wishlist"> ❤️ </Link>
                <button className="logout-btn" onClick={logout}> Logout </button>
            </div>
        </div>
    )
}

export default MemberNavbar;