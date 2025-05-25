import React, { useState, useEffect } from 'react';
import { FaHome, FaShoppingCart, FaUsers, FaUserFriends, FaSignOutAlt, FaTicketAlt } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase'; // Ensure this path matches your project structure

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [role] = useState('admin'); // Default role - same as your Notification component
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "bg-gray-700" : "";
  };

  // Fetch notification count directly from Firebase
  useEffect(() => {
    // Reference to the notifications for the admin role
    const notificationsRef = ref(database, `notifications/${role}`);
    
    // Set up a real-time listener
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        // Count the number of notifications
        const notificationsData = snapshot.val();
        const count = Object.keys(notificationsData).length;
        setNotificationCount(count);
      } else {
        setNotificationCount(0);
      }
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setNotificationCount(0);
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [role]);

  // Show logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
    setShowLogoutModal(false);
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="w-64 h-screen bg-gray-800 text-gray-200 flex flex-col p-5 fixed shadow-lg">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <img src="Cafe1.png" alt="Logo" className="w-28 h-auto rounded-md" />
        </div>

        {/* Menu Section */}
        <div className="flex-1 space-y-1">
          <p className="text-xs uppercase text-gray-400 font-semibold ml-2 mb-2">Main</p>
          <Link to="/admin-home">
            <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-dashboard')}`}>
              <div className="w-8 flex justify-center">
                <FaHome className="text-xl" />
              </div>
              <span className="text-lg font-medium">Dashboard</span>
            </div>
          </Link>

          <div className="py-2">
            <p className="text-xs uppercase text-gray-400 font-semibold ml-2 mb-2">Management</p>
            <Link to="/admin-orderhistory">
              <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-orders')}`}>
                <div className="w-8 flex justify-center">
                  <FaShoppingCart className="text-xl" />
                </div>
                <span className="text-lg font-medium">Order History</span>
              </div>
            </Link>

            <Link to="/admin-staff">
              <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-staff')}`}>
                <div className="w-8 flex justify-center">
                  <FaUsers className="text-xl" />
                </div>
                <span className="text-lg font-medium">Staff</span>
              </div>
            </Link>

            <Link to="/admin-Usermanagement">
              <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-users')}`}>
                <div className="w-8 flex justify-center">
                  <FaUserFriends className="text-xl" />
                </div>
                <span className="text-lg font-medium">Users</span>
              </div>
            </Link>

            <Link to="/admin-promocode">
              <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-promocode')}`}>
                <div className="w-8 flex justify-center">
                  <FaTicketAlt className="text-xl" />
                </div>
                <span className="text-lg font-medium">Promo Codes</span>
              </div>
            </Link>

            <Link to="/admin-notification">
              <div className={`flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200 ${isActive('/admin-notification')}`}>
                <div className="w-8 flex justify-center relative">
                  <Bell className="text-xl" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <span className="text-lg font-medium">
                  Notification
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Logout Section */}
        <div className="mt-auto border-t border-gray-700 pt-5">
          <button
            className="w-full flex items-center space-x-4 p-3 rounded-md hover:bg-gray-700 transition-all duration-200"
            onClick={handleLogoutClick}
          >
            <div className="w-8 flex justify-center">
              <FaSignOutAlt className="text-xl" />
            </div>
            <span className="text-lg font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;