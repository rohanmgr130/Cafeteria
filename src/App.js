import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from './user/Pages/Home';
import MenuPage from './user/Pages/MenuPage';
import OrderHistory from './user/Pages/OrderHistory';
import CartPage from './user/Pages/CartPage';
import Checkout from './user/Pages/Checkout';
import UserProfile from './user/Pages/Profile';
import Favorite from './user/Pages/Favorite';
import CreateItem from "./staff/components/Menu/addmenuform";
import EditMenu from "./staff/components/Menu/EditMenuStaff";
import StaffMenu from "./staff/Pages/Menu";
import StaffOrderRequestPage from "./staff/Pages/Orders";
import StaffCategoryPage from "./staff/Pages/Categorypage";
import Login from "./auth/pages/Login";
import Register from "./auth/pages/Register";
import AdminPromoCode from "./admin/Pages/Promocode";
import AdminStaff from "./admin/Pages/Staff";
import StaffHome from "./staff/Pages/Home";
import AdminHome from "./admin/Pages/Home";
import Usermanagement from './admin/Pages/Usermanagement';
import VerifyEmail from './auth/components/Verifyemail';
import NotificationPage from './staff/Pages/Notificationpage';
import AdminNotificationPage from './admin/Pages/Notificationpage';
import UserNotification from './user/Pages/UserNotificationPage';


function App() {
  return (
      <Router>
        <Routes>
          {/* Root path redirects to home */}
          <Route path="/" element={<Navigate to="/user-home" />} />

          {/*all*/}
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/verifyemail' element={<VerifyEmail/>} />

          {/*user*/}
          <Route path='/user-home' element={<Home/>} />
          <Route path='/user-menus' element={<MenuPage/>} />
          <Route path='/user-order-history' element={<OrderHistory/>} />
          <Route path='/user-cart' element={<CartPage/>} />
          <Route path='/user-checkout' element={<Checkout/>} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path='/user-favorites' element={<Favorite/>} />
          <Route path='/user-notification' element={<UserNotification/>} />

          {/*staff*/}
          <Route path='/staff-dashboard' element={<StaffHome/>} />
          <Route path='/staff-menu' element={<StaffMenu/>} />
          <Route path='/staff-orders' element={<StaffOrderRequestPage/>} />
          <Route path='/staff-category' element={<StaffCategoryPage/>} />
          <Route path='/staff-menu/add-menu' element={<CreateItem/>} />
          <Route path='/staff-menu/edit-menu/:id' element={<EditMenu/>} />
          <Route path='/staff-notification' element={<NotificationPage/>} />

          {/*admin*/}
          <Route path='/admin-home' element={<AdminHome/>} />
          <Route path='/admin-staff' element={<AdminStaff/>} />
          <Route path='/admin-promocode' element={<AdminPromoCode/>} />
          <Route path='/admin-Usermanagement' element={<Usermanagement/>} />
          <Route path='/admin-notification' element={<AdminNotificationPage/>} />

        </Routes>
      </Router>
  );
}

export default App;
