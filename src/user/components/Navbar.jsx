import React, { useState, useEffect, useRef } from "react";
import { IoCartOutline } from "react-icons/io5";
import { FaBell } from "react-icons/fa"; 
import { HiMenu, HiX } from "react-icons/hi";
import { IoMdSettings, IoMdPerson } from "react-icons/io";
import {  FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const fullname = localStorage.getItem("fullname") || "Guest User";
  const email = localStorage.getItem("email") || "guest@example.com";
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicks outside menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = '/login';
  };
  
  return (
    <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
      scrolled ? "bg-gray-800 shadow-lg h-14" : "bg-gray-800/95 h-16"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              Logo
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4 lg:space-x-8">
              <Link to="/user-home" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-lg font-medium transition-colors">
                Home
              </Link>
              <Link to="/user-menus" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-lg font-medium transition-colors">
                Menu
              </Link>
              <Link to="/user-favorites" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-lg font-medium transition-colors">
                Favorites
              </Link>
              <Link to="/user-order-history" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-lg font-medium transition-colors">
                Order History
              </Link>
            </div>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center gap-3 md:gap-5">

            
            {/* Notification icon */}
            <Link
              to="/user-notification"
              className="text-white hover:text-red-500 transition-all duration-300"
            >
              <FaBell className="h-5 w-5" />
            </Link>
            
            {/* Cart Icon */}
            <Link to="/user-cart" className="text-white hover:text-gray-300 transition-colors">
              <IoCartOutline className="h-6 w-6 md:h-7 md:w-7" />
            </Link>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none"
                onClick={toggleProfile}
              >
                <img 
                  src="/profile.jpg" 
                  alt="Profile"
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Profile";
                  }}
                />
              </button>
              
              {/* Profile Dropdown Panel */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <img 
                          src="/profile.jpg" 
                          alt="User" 
                          className="h-10 w-10 rounded-full mr-3"
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
                    
                    <Link to="/user-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <IoMdPerson className="mr-3 text-purple-500 h-4 w-4" />
                        <span>My Account</span>
                      </div>
                    </Link>
                    
                    <Link to="/user-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <div className="flex items-center">
                        <IoMdSettings className="mr-3 text-purple-500 h-4 w-4" />
                        <span>Settings</span>
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <FiLogOut className="mr-3 text-red-500 h-4 w-4" />
                        <span>Log Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" ref={menuRef}>
          <div className="fixed inset-0 top-14 bg-gray-800 z-40 flex flex-col py-4 px-2 space-y-1 sm:px-3">
            <Link to="/user-home" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              Home
            </Link>
            <Link to="/user-menus" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              Menu
            </Link>
            <Link to="/user-favorites" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              Favorites
            </Link>
            <Link to="/user-order-history" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              Order History
            </Link>
            <Link to="/user-profile" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              My Account
            </Link>
            <Link to="/user-settings" className="text-white hover:bg-gray-700 hover:text-white block px-3 py-4 rounded-md text-base font-medium border-b border-gray-700">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-4 rounded-md text-base font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;