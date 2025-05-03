import React, { useState } from "react";
import { IoCartOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { IoMdSettings, IoMdPerson } from "react-icons/io";
import { FiSearch, FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fullname=localStorage.getItem("fullname")
  const email=localStorage.getItem("email")
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears all localStorage data
    alert('You have been logged out.');
    window.location.href = '/login';
  };
  
  return (
    <div className="fixed top-0 left-0 z-10 w-full h-16 text-white flex items-center px-5 shadow-md transition-all duration-300 bg-gray-800">
      {/* Logo on the left */}
      <div className="text-2xl font-bold truncate">
        <h2>Logo</h2>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden ml-auto flex items-center">
        <button 
          onClick={toggleMenu}
          className="text-white focus:outline-none"
        >
          {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Desktop menu - centered */}
      <ul className="hidden md:flex list-none items-center space-x-4 lg:space-x-8 m-0 p-0 mx-auto">
        <li className="whitespace-nowrap">
          <a
            href="/user-home"
            className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
          >
            Home
          </a>
        </li>
        
        <li className="whitespace-nowrap">
          <a
            href="/user-menus"
            className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
          >
            Menu
          </a>
        </li>


        <li className="whitespace-nowrap">
          <a
            href="/user-favorites"
            className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
          >
            Favorites
          </a>
        </li>
        
        <li className="whitespace-nowrap">
          <a
            href="/user-order-history"
            className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
          >
            Order History
          </a>
        </li>
      </ul>

      {/* Mobile menu - full screen overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-gray-800 z-20 flex flex-col items-center py-5">
          <ul className="list-none flex flex-col items-center space-y-6 m-0 p-0 w-full">
            <li className="whitespace-nowrap">
              <a
                href="/user-home"
                className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
              >
                Home
              </a>
            </li>
            
            <li className="whitespace-nowrap">
              <a
                href="/user-menus"
                className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
              >
                Menu
              </a>
            </li>
            <li className="whitespace-nowrap">
              <a
                href="/user-search"
                className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
              >
                Search
              </a>
            </li>
            <li className="whitespace-nowrap">
              <a
                href="/user-favorites"
                className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
              >
                Favorites
              </a>
            </li>
            
            <li className="whitespace-nowrap">
              <a
                href="/user-order-history"
                className="text-lg cursor-pointer transition-all duration-300 hover:text-gray-300"
              >
                Order History
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Right side icons */}
      <div className="hidden md:flex justify-center items-center gap-4 lg:gap-6">
        <a href="/user-message" className="cursor-pointer transition-all duration-300 hover:text-red-500">
          <FaRegMessage size={20} />
        </a>
        <a href="/user-cart" className="cursor-pointer transition-all duration-300 hover:text-red-500">
          <IoCartOutline size={30} />
        </a>
        
        {/* Profile with dropdown - click based instead of hover */}
        <div className="relative cursor-pointer">
          <img 
            src="profile.jpg" 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover" 
            onClick={toggleProfile}
          />
          
          {/* Profile Dropdown Menu - Using click instead of hover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <img src="profile.jpg" alt="User" className="w-8 h-8 rounded-full mr-3" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{fullname}</p>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                </div>
              </div>
              
              <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <IoMdPerson className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
              <Link to={"/user-profile"}>
              <span className="truncate">My Account</span>
              </Link>
              </a>
              
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <IoMdSettings className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </a>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              {/* Logout Button - Styled like other menu items for consistency */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FiLogOut className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                <span className="truncate">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile right corner - added cart and message icons */}
      <div className="md:hidden flex items-center gap-4 ml-4">
        <a href="/message" className="cursor-pointer transition-all duration-300 hover:text-red-500">
          <FaRegMessage size={18} />
        </a>
        <a href="/cart" className="cursor-pointer transition-all duration-300 hover:text-red-500">
          <IoCartOutline size={22} />
        </a>
        <div className="relative cursor-pointer">
          <img 
            src="profile.jpg"
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover" 
            onClick={toggleProfile}
          />
          
          {/* Mobile Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <img src="profile.jpg" alt="User" className="w-8 h-8 rounded-full mr-3" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">Rohan Magar</p>
                    <p className="text-xs text-gray-500 truncate">rohanmgr@gmail.com</p>
                  </div>
                </div>
              </div>
              
              <a href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <IoMdPerson className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <Link to={"/profile"}>
              <span className="truncate">My Account</span>
              </Link>
              </a>
              
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <IoMdSettings className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </a>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FiLogOut className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                <span className="truncate">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
