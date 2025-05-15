import React, { useState, useEffect, useRef } from "react";
import { IoCartOutline } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';

function Navbar() {
  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Refs for detecting outside clicks
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // User data from localStorage with fallbacks
  const fullname = localStorage.getItem("fullname");
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("id");
  
  // Check login status on component mount
  useEffect(() => {
    if (fullname && email) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [fullname, email]);
  
  // Fetch unread notifications count
  useEffect(() => {
    if (!userId) return;
    
    const fetchUnreadNotificationsCount = () => {
      const userNotifRef = ref(database, `notifications/user`);
      
      onValue(userNotifRef, (snapshot) => {
        if (snapshot.exists()) {
          const allNotifications = snapshot.val();
          
          // Filter notifications for this user and count unread ones
          const unreadCount = Object.values(allNotifications)
            .filter(notification => notification.userId === userId && !notification.read)
            .length;
          
          setUnreadCount(unreadCount);
        } else {
          setUnreadCount(0);
        }
      });
    };
    
    fetchUnreadNotificationsCount();
  }, [userId]);

  // Fetch cart items count
  useEffect(() => {
    if (!userId) return;

    const fetchCartCount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/get-cart/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch cart");
          return;
        }

        const data = await response.json();
        if (data && data.items) {
          setCartItemCount(data.items.length);
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error("Error while fetching cart count:", error);
        setCartItemCount(0);
      }
    };

    fetchCartCount();

    // Setup interval to refresh cart count every 30 seconds
    const intervalId = setInterval(fetchCartCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId]);
  
  // Handle scroll detection - make navbar consistent
  const handleScroll = () => {
    if (window.scrollY > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  // Set up event listeners
  useEffect(() => {
    // Set initial scrolled state based on current position
    if (window.scrollY > 20) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    
    window.addEventListener("scroll", handleScroll);
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Handle escape key to close modals and menus
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
        setShowLogoutModal(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-gray-800 shadow-lg h-14" : "bg-gray-800 h-16"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">
                Logo
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                aria-label="Toggle menu"
                className="text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <ul className="flex space-x-4 lg:space-x-8">
                <li>
                  <Link
                    to="/"
                    className="text-white text-lg hover:text-red-500 px-3 py-2 transition-all duration-300"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user-menus"
                    className="text-white text-lg hover:text-red-500 px-3 py-2 transition-all duration-300"
                  >
                    Menu
                  </Link>
                </li>
                {isLoggedIn && (
                  <>
                    <li>
                      <Link
                        to="/user-favorites"
                        className="text-white text-lg hover:text-red-500 px-3 py-2 transition-all duration-300"
                      >
                        Favorites
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/user-order-history"
                        className="text-white text-lg hover:text-red-500 px-3 py-2 transition-all duration-300"
                      >
                        Order History
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Right side icons and profile */}
            <div className="flex items-center space-x-3 md:space-x-6">
              
              {isLoggedIn ? (
                <>
                  {/* Notification icon - only for logged in users */}
                  <Link
                    to="/user-notification"
                    className="text-white hover:text-red-500 transition-all duration-300 relative"
                  >
                    <FaBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Shopping cart icon - only for logged in users */}
                  <Link
                    to="/user-cart"
                    className="text-white hover:text-red-500 transition-all duration-300 relative"
                  >
                    <IoCartOutline className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile dropdown - only for logged in users */}
                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      className="flex text-sm rounded-full focus:outline-none"
                      onClick={toggleProfile}
                    >
                      <img
                        src="/profile.jpg"
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-white hover:border-red-500 transition-all"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=Profile";
                        }}
                      />
                    </button>

                    {/* Profile dropdown menu */}
                    <div
                      className={`absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-20 transition-all duration-300 ${
                        showProfileDropdown ? "opacity-100 visible" : "opacity-0 invisible"
                      }`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <img
                            src="/profile.jpg"
                            alt="User"
                            className="w-10 h-10 rounded-full mr-3 border border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=Profile";
                            }}
                          />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{fullname}</p>
                            <p className="text-xs text-gray-500 truncate">{email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/user-profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-red-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        <span className="truncate">My Account</span>
                      </Link>

                      <Link
                        to="/user-settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-red-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                        <span className="truncate">Settings</span>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Logout button */}
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full px-4 py-2 flex items-center text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Login button for non-logged in users */
                <Link
                  to="/login"
                  className="flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <FiLogIn className="mr-2" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden fixed inset-0 top-14 bg-gray-800 z-40 flex flex-col py-4 px-2"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/user-menus"
                className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/user-favorites"
                    className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/user-order-history"
                    className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Order History
                  </Link>
                  <Link
                    to="/user-notification"
                    className="text-white hover:bg-gray-700 flex items-center justify-between px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FaBell className="mr-3 h-5 w-5" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/user-cart"
                    className="text-white hover:bg-gray-700 flex items-center justify-between px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <IoCartOutline className="mr-3 h-5 w-5" />
                      <span>Cart</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/user-profile"
                    className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/user-settings"
                    className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full text-left text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:bg-gray-700 block px-3 py-4 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
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

export default Navbar;