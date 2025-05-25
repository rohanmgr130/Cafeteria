import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';

// Import your components
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
import AdminOrderHistoryPage from './admin/Pages/Orderdetails';
import ForgotPasswordPage from './auth/components/Forgetpassword';
import ResetPasswordPage from './auth/components/Resetpassword';
import StaffRewardpoints from './staff/Pages/Reward';
import AddReward from './staff/components/Rewardpoints/addreward';
import EditReward from './staff/components/Rewardpoints/editreward';

// =============== Auth Utility Functions ===============
// Get the current user from localStorage
const getCurrentUser = () => {
  // Check for the user token or any user data in localStorage
  const userId = localStorage.getItem('id');
  const userEmail = localStorage.getItem('email');
  const userRole = localStorage.getItem('role');
  const userName = localStorage.getItem('fullname');
  const userToken = localStorage.getItem('token');
  
  // If we have the essential user info, construct a user object
  if (userId && userRole) {
    return {
      id: userId,
      email: userEmail || '',
      role: userRole,
      fullname: userName || '',
      token: userToken || ''
    };
  }
  
  return null;
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Check if user has the specified role
const hasRole = (allowedRoles) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  return allowedRoles.includes(user.role);
};

// Login and logout functions (you can export these for use in your login/logout components)
export const login = (userData) => {
  // Store user data as individual items in localStorage
  if (userData.id) localStorage.setItem('id', userData.id);
  if (userData.email) localStorage.setItem('email', userData.email);
  if (userData.role) localStorage.setItem('role', userData.role);
  if (userData.fullname) localStorage.setItem('fullname', userData.fullname);
  if (userData.token) localStorage.setItem('token', userData.token);
  if (userData.firebase) localStorage.setItem('firebase:host', userData.firebase);
};

export const logout = () => {
  // Clear all user-related data
  localStorage.removeItem('id');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('fullname');
  localStorage.removeItem('token');
  localStorage.removeItem('firebase:host');
  
  window.location.href = '/login'; // Force redirect to login
};

// =============== Protected Route Components ===============
// Route guard for user role
const UserRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Using replace: true prevents the protected route from being added to history
    return <Navigate to="/login" replace={true} />;
  }
  
  if (!hasRole(['user'])) {
    const user = getCurrentUser();
    // Redirect based on user role with replace: true
    if (user && user.role === 'staff') {
      return <Navigate to="/staff-dashboard" replace={true} />;
    } else if (user && user.role === 'admin') {
      return <Navigate to="/admin-home" replace={true} />;
    } else {
      return <Navigate to="/login" replace={true} />;
    }
  }
  
  return children;
};

// Route guard for staff role
const StaffRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace={true} />;
  }
  
  if (!hasRole(['staff', 'admin'])) {
    const user = getCurrentUser();
    // Redirect based on user role with replace: true
    if (user && user.role === 'user') {
      return <Navigate to="/user-home" replace={true} />;
    } else {
      return <Navigate to="/login" replace={true} />;
    }
  }
  
  return children;
};

// Route guard for admin role
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace={true} />;
  }
  
  if (!hasRole(['admin'])) {
    const user = getCurrentUser();
    // Redirect based on user role with replace: true
    if (user && user.role === 'user') {
      return <Navigate to="/user-home" replace={true} />;
    } else if (user && user.role === 'staff') {
      return <Navigate to="/staff-dashboard" replace={true} />;
    } else {
      return <Navigate to="/login" replace={true} />;
    }
  }
  
  return children;
};

// Custom Login component wrapper to handle back button
const LoginWrapper = () => {
  const navigate = useNavigate();
  
  // Add event listener for the popstate event (triggered by back/forward buttons)
  useEffect(() => {
    const handleBackButton = () => {
      // If user presses back on login page, redirect to home
      navigate('/user-home', { replace: true });
    };
    
    window.addEventListener('popstate', handleBackButton);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);
  
  return <Login />;
};

// =============== Main App Component ===============
function App() {
  return (
    <Router>
      <Routes>
        {/* Root path redirects to home */}
        <Route path="/" element={<Navigate to="/user-home" />} />

        {/* Public routes */}
        <Route path='/login' element={<LoginWrapper />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verifyemail' element={<VerifyEmail />} />
        <Route path='/user-home' element={<Home />} />
        <Route path='/user-menus' element={<MenuPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected user routes */}
        <Route path='/user-order-history' element={
          <UserRoute>
            <OrderHistory />
          </UserRoute>
        } />
        <Route path='/user-cart' element={
          <UserRoute>
            <CartPage />
          </UserRoute>
        } />
        <Route path='/user-checkout' element={
          <UserRoute>
            <Checkout />
          </UserRoute>
        } />
        <Route path='/user-profile' element={
          <UserRoute>
            <UserProfile />
          </UserRoute>
        } />
        <Route path='/user-favorites' element={
          <UserRoute>
            <Favorite />
          </UserRoute>
        } />
        <Route path='/user-notification' element={
          <UserRoute>
            <UserNotification />
          </UserRoute>
        } />


        {/* Protected staff routes */}
        <Route path='/staff-dashboard' element={
          <StaffRoute>
            <StaffHome />
          </StaffRoute>
        } />
        <Route path='/staff-menu' element={
          <StaffRoute>
            <StaffMenu />
          </StaffRoute>
        } />
        <Route path='/staff-orders' element={
          <StaffRoute>
            <StaffOrderRequestPage />
          </StaffRoute>
        } />
        <Route path='/staff-category' element={
          <StaffRoute>
            <StaffCategoryPage />
          </StaffRoute>
        } />
        <Route path='/staff-menu/add-menu' element={
          <StaffRoute>
            <CreateItem />
          </StaffRoute>
        } />
        <Route path='/staff-menu/edit-menu/:id' element={
          <StaffRoute>
            <EditMenu />
          </StaffRoute>
        } />
        <Route path='/staff-notification' element={
          <StaffRoute>
            <NotificationPage />
          </StaffRoute>
        } />
          <Route path='/staff-rewardpoints' element={
          <StaffRoute>
            < StaffRewardpoints/>
          </StaffRoute>
        } />
        <Route path='/staff-rewardpoints/add-reward' element={
          <StaffRoute>
            <AddReward />
          </StaffRoute>
        } />
        <Route path='/staff-rewardpoints/edit-reward/:id' element={
          <StaffRoute>
            <EditReward/>
          </StaffRoute>
        } />

        {/* Protected admin routes */}
        <Route path='/admin-home' element={
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        } />
        <Route path='/admin-staff' element={
          <AdminRoute>
            <AdminStaff />
          </AdminRoute>
        } />
        <Route path='/admin-promocode' element={
          <AdminRoute>
            <AdminPromoCode />
          </AdminRoute>
        } />
        <Route path='/admin-Usermanagement' element={
          <AdminRoute>
            <Usermanagement />
          </AdminRoute>
        } />
        <Route path='/admin-notification' element={
          <AdminRoute>
            <AdminNotificationPage />
          </AdminRoute>
        } />


        <Route path='/admin-orderhistory' element={
          <AdminRoute>
            <AdminOrderHistoryPage />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;