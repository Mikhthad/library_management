import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/admin/Dashboard";
import Books from "./pages/admin/Books_Management";
import InventoryStock from "./pages/admin/Inventory&Stock";
import MemberManagement from "./pages/admin/MemberManagement";
import IssueReturn from "./pages/admin/IssueReturn";
import Reservation from "./pages/admin/Reservation";
import FinesPayments from "./pages/admin/FinesPayments";
import ReportDashboard from "./pages/admin/ReportsDashboards";
import Home from "./pages/member/Home";
import Wishlist from "./pages/member/Wishlist";
import BorrowHistory from "./pages/member/BorrowHistory";
import ReservationHistory from "./pages/member/ReservationHistory";
import FinesPaymentUser from "./pages/member/FinesPaymentUser";
import Profile from "./pages/member/Profile";
import Notifications from "./pages/member/Notifications";

function App(){
  return(
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element = {<Login/>}/>
      <Route path='/register' element = {<Register/>}/>
      <Route path="/admin/dashboard" element = {<Dashboard/>}/>
      <Route path="/admin/books" element = {<Books/>}/>
      <Route path='/admin/Inventory-Stock' element = {<InventoryStock/>}/>
      <Route path="/admin/member" element = {<MemberManagement/>}/>
      <Route path = '/admin/issue-return' element = {<IssueReturn/>}/>
      <Route path = '/admin/reservation' element = {<Reservation/>}/>
      <Route path="/admin/fines" element = {<FinesPayments/>}/>
      <Route path = '/admin/report' element = {<ReportDashboard/>}/>
      <Route path="/member/home" element={<Home/>} />
      <Route path="/member/wishlist" element={<Wishlist/>}/>
      <Route path="/member/borrow-history" element={<BorrowHistory/>}/>
      <Route path = "/member/reservation-history" element = {<ReservationHistory/>}/>
      <Route path = "/member/fine-payment" element = {<FinesPaymentUser/>}/>
      <Route path = "/member/profile" element = {<Profile/>}/>
      <Route path = '/member/notification' element = {<Notifications/>}/>
    </Routes>
  )
}
export default App;