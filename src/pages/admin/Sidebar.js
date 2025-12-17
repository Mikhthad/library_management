import { Link, useNavigate } from "react-router-dom";
import './sidebar.css';
import api from "../../api";

function Sidebar(){
    const navigate = useNavigate()

    const handleLogout = async () =>{
        try{
            await api.post('/api/users/logout/')
            navigate('/login')
        }catch(error){
            console.log("Logout error", error)
        }
    }
    return(
        <div className="sidebar">
            <ul className="sidebar-menu">
                <li><Link to = '/admin/dashboard'> Dashboard </Link></li>
                <li><Link to = '/admin/books'> Books </Link></li>
                <li><Link to = '/admin/Inventory-Stock'> Inventory & Stock </Link></li>
                <li><Link to = '/admin/member'> Members </Link></li>
                <li><Link to = '/admin/issue-return'> Issue / Return </Link></li>
                <li><Link to = '/admin/reservation'> Reservation </Link></li>
                <li><Link to = '/admin/fines'> Fines </Link></li>
                <li><Link to = '/admin/report'> Report </Link></li>
            </ul>
            <div className="sidebar-logout">
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}

export default Sidebar;