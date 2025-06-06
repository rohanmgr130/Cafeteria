
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaHome, FaListAlt, FaClipboardList, FaUtensils, FaBars, FaTimes, FaSignOutAlt, FaGift } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase'; // Ensure this path matches your project structure

function Nav({ onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [role] = useState('staff'); // Role is 'staff' for this component

  // Fetch notification count from Firebase
  useEffect(() => {
    // Reference to the notifications for the staff role
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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
    toast.success('Successfully logged out');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const isActive = (path) => location.pathname === path;
  
  // Fixed navItems array with proper structure
  const navItems = [
    { path: '/staff-dashboard', icon: <FaHome className="text-lg" />, label: 'Dashboard' },
    { path: '/staff-orders', icon: <FaClipboardList className="text-lg" />, label: 'Orders' },
    { path: '/staff-category', icon: <FaListAlt className="text-lg" />, label: 'Category' },
    { path: '/staff-menu', icon: <FaUtensils className="text-lg" />, label: 'Menu Management' },
    { path: '/staff-rewardpoints', icon: <FaGift className="text-lg" />, label: 'Reward Points' },
    { path: '/staff-promos', icon: <FaGift className="text-lg" />, label: 'Promo Codes' },
    // Special case for notifications with badge
    { 
      path: '/staff-notification', 
      icon: (
        <div className="relative">
          <Bell className="text-lg" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold">
              {notificationCount}
            </span>
          )}
        </div>
      ), 
      label: 'Notifications' 
    }
  ];

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-md bg-gray-800 text-white shadow-md hover:bg-gray-700"
        >
          {collapsed ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Navigation sidebar */}
      <div className={`fixed top-0 left-0 h-full ${collapsed ? 'w-20' : 'w-64'} bg-gray-800 text-white flex flex-col shadow-lg z-40 transition-all duration-300`}>
        {/* Logo Section */}
        <div className={`p-5 border-b border-gray-700 flex justify-center items-center ${collapsed ? 'p-3' : ''}`}>
          <img 
            src="Cafe1.png" 
            alt="Logo" 
            className={`${collapsed ? 'w-12 h-12' : 'w-28 h-auto'} rounded-md transition-all duration-300`} 
          />
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link to={item.path} key={item.path}>
              <div 
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start space-x-4'} p-3 rounded-md transition-colors 
                ${isActive(item.path) 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'}`}
              >
                <div className={`${collapsed ? '' : 'w-8'} flex justify-center`}>
                  {item.icon}
                </div>
                {!collapsed && <span className="text-base font-medium">{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start space-x-4'} p-3 rounded-md text-red-300 hover:bg-gray-700`}
          >
            <div className={`${collapsed ? '' : 'w-8'} flex justify-center`}>
              <FaSignOutAlt className="text-lg" />
            </div>
            {!collapsed && <span className="text-base font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-md p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Nav;