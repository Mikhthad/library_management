import { useState,useEffect } from "react";
import api from "../../api";
import Sidebar from "./Sidebar";
import './dashboard.css';
import {LuBookOpen, LuUsers, LuClockAlert, LuCalendarDays,LuUserPlus} from "react-icons/lu";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";


function Dashboard(){
    const [totalBooks, setTotalBooks] = useState(0)
    const [totalMembers, setTotalMember] = useState(0)
    const [totalTransactions, setTotalTransactions] = useState(0)
    const [overdueCount, setOverdueCount] = useState(0)
    const [dailyBorrows, setDailyBorrows] = useState(0)
    const [monthlyMembers, setMonthlyMembers] = useState(0)

    useEffect(()=>{
        fetchDashboardData()
    },[])

    const fetchDashboardData = async() =>{
        try{
            const booksres = await api.get('/api/books/list/');
            setTotalBooks(booksres.data.length);

            const membersres = await api.get("/api/users/all/");
            setTotalMember(membersres.data.length);

            const transactionres = await api.get("/api/transactions/list/");
            setTotalTransactions(transactionres.data.length);

            const overdueres = await api.get("/api/transactions/overdue/");
            setOverdueCount(overdueres.data.total_overdue || 0);

            const dailyres = await api.get("/api/transactions/daily/");
            setDailyBorrows(dailyres.data.total_borrows || 0);

            const monthlymembersres = await api.get("/api/users/monthly-members/");
            setMonthlyMembers(monthlymembersres.data.monthly_new_members || 0);
        }catch(error){
            console.log("Dashboard error",error)
        }
    }

    return(
        <div className="dashbord-container">
            <h2> Admin Dashboard </h2>
            <div className="dashbord-cards">
                <div className="cards card-blue">
                    <div className="icon"><LuBookOpen /></div>
                    <p className="card-title">Total Books</p>
                    <p className="card-value">{totalBooks}</p>
                </div>

                <div className="cards card-green">
                    <div className="icon"><LuUsers /></div>
                    <p className="card-title">Total Members</p>
                    <p className="card-value">{totalMembers}</p>
                </div>

                <div className="cards card-purple">
                    <div className="icon"><HiOutlineArrowsRightLeft /></div>
                    <p className="card-title">Total Transactions</p>
                    <p className="card-value">{totalTransactions}</p>
                </div>

                <div className="cards card-red">
                    <div className="icon"><LuClockAlert /></div>
                    <p className="card-title">Overdue Items</p>
                    <p className="card-value">{overdueCount}</p>
                </div>

                <div className="cards card-orange">
                    <div className="icon"><LuCalendarDays /></div>
                    <p className="card-title">Daily Borrows</p>
                    <p className="card-value">{dailyBorrows}</p>
                </div>

                <div className="cards card-yellow">
                    <div className="icon"><LuUserPlus /></div>
                    <p className="card-title">Monthly New Members</p>
                    <p className="card-value">{monthlyMembers}</p>
                </div>

            </div>
            <Sidebar/>
        </div>
    )
}
export default Dashboard;