import React, { useState, useEffect } from "react";
import { IoCartOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi"; // Added logout icon
import { Link } from "react-router-dom";

function Nav() {
  // State to track scroll position
  const [isScrolled, setIsScrolled] = useState(false);
  // State to manage logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // State to manage profile dropdown visibility
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const fullname = localStorage.getItem("fullname");
  const email = localStorage.getItem("email");
  
  // Detect scroll and update state
  const handleScroll = () => {
    if (window.scrollY > 160) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears all localStorage data
    window.location.href = '/login';
  };

  // Add scroll event listener on mount and clean up on unmount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    
    // Close profile dropdown when clicking outside
    const handleClickOutside = (event) => {
      const profileElement = document.getElementById('profile-element');
      if (profileElement && !profileElement.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-10 w-full h-16 text-white flex items-center px-5 shadow-md transition-all duration-300 ${
          isScrolled ? "bg-gray-800" : "bg-transparent"
        }`}
      >
        {/* Logo on the left */}
        <div className="text-2xl font-bold">
          <h2>Logo</h2>
        </div>

        {/* Centered menu */}
        <ul className="list-none flex items-center space-x-8 m-0 p-0 mx-auto">
          <li>
            <a
              href="/user-home"
              className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
            >
              Home
            </a>
          </li>
          
          <li>
            <a
              href="/user-menus"
              className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
            >
              Menu
            </a>
          </li>

          <li>
            <a
              href="/user-favorites"
              className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
            >
              Favorites
            </a>
          </li>
          
          <li>
            <a
              href="/user-order-history"
              className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
            >
              Order History
            </a>
          </li>
        </ul>

        {/* Right side icons and profile */}
        <div className="flex justify-center items-center gap-6">
          <a href="/message" className="cursor-pointer transition-all duration-300 hover:text-red-500">
            <FaRegMessage size={20} />
          </a>
          <a href="/user-cart" className="cursor-pointer transition-all duration-300 hover:text-red-500">
            <IoCartOutline size={30} />
          </a>
          
          {/* Profile with dropdown */}
          <div className="relative cursor-pointer" id="profile-element">
            <img 
              src="profile.jpg" 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white hover:border-red-500 transition-all" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />
            
            {/* Profile Dropdown Menu - Improved styling */}
            <div className={`absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-20 transition-all duration-300 ${
              showProfileDropdown ? "opacity-100 visible" : "opacity-0 invisible"
            }`}>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <img src="profile.jpg" alt="User" className="w-10 h-10 rounded-full mr-3 border border-gray-200" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{fullname}</p>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                </div>
              </div>
              
              <Link to="/user-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="truncate">My Account</span>
              </Link>
              
              <a href="/user-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="truncate">Settings</span>
              </a>
                            
              <div className="border-t border-gray-100 my-2"></div>
              
              {/* Improved Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full px-4 py-2 flex items-center text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logout Confirmation</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <FiLogOut className="mr-1" />
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