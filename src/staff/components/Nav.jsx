// SideNav.js - Modified to communicate its state to parent
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaHome, FaListAlt, FaClipboardList, FaUtensils, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Nav({ onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
  
  const navItems = [
    { path: '/staff-dashboard', icon: <FaHome className="text-lg" />, label: 'Dashboard' },
    { path: '/staff-orders', icon: <FaClipboardList className="text-lg" />, label: 'Orders' },
    { path: '/staff-category', icon: <FaListAlt className="text-lg" />, label: 'Category' },
    { path: '/staff-menu', icon: <FaUtensils className="text-lg" />, label: 'Menu Management' },
    { path: '/settings', icon: <FaCog className="text-lg" />, label: 'Settings' }
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
        <div className={`p-5 border-b border-gray-700 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!collapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
          {!collapsed && (
            <button 
              onClick={toggleCollapse}
              className="text-gray-400 hover:text-white"
            >
              <FaBars />
            </button>
          )}
          {collapsed && (
            <button 
              onClick={toggleCollapse}
              className="text-gray-400 hover:text-white"
            >
              <FaBars />
            </button>
          )}
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
