

import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaLeaf,
  FaDrumstickBite,
  FaMugHot,
  FaTag,
  FaBan
} from 'react-icons/fa';
import { useCartValue } from '../../contexts/CartValueCountProvider';

// Modern Toast implementation (your existing Toast implementation)
const Toast = {
  container: null,
  toasts: [],
  
  // Initialize the toast container
  init() {
    if (this.container) return;
    
    // Create container if it doesn't exist
    this.container = document.createElement('div');
    this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(this.container);
  },
  
  // Create a new toast notification
  show(message, type = 'info', duration = 4000) {
    this.init();
    
    // Create toast element
    const toast = document.createElement('div');
    const id = 'toast-' + Date.now();
    toast.id = id;
    
    // Set classes based on type
    const baseClasses = 'flex items-center py-3 px-4 rounded-xl shadow-xl backdrop-blur-sm max-w-sm pointer-events-auto transition-all duration-500 transform translate-x-full opacity-0 border-l-4';
    const typeClasses = {
      success: 'bg-green-50 bg-opacity-90 border-green-500 text-green-800',
      error: 'bg-red-50 bg-opacity-90 border-red-500 text-red-800',
      info: 'bg-blue-50 bg-opacity-90 border-blue-500 text-blue-800',
      warning: 'bg-yellow-50 bg-opacity-90 border-yellow-500 text-yellow-800',
    };
    
    const progressClasses = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
    };
    
    toast.className = `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    toast.setAttribute('role', 'alert');
    
    // Add icon based on toast type
    const iconHTML = this.getIconHTML(type);
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = `absolute bottom-0 left-0 h-1 ${progressClasses[type] || progressClasses.info} transition-all duration-${duration}`;
    progressBar.style.width = '100%';
    
    // Add close button
    const closeButton = `
      <button class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" 
              aria-label="Close" 
              onclick="document.getElementById('${id}').classList.add('translate-x-full', 'opacity-0'); setTimeout(() => document.getElementById('${id}')?.remove(), 500);">
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    `;
    
    // Set the toast content with icon
    toast.innerHTML = `
      <div class="relative w-full">
        <div class="flex items-center">
          <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
            ${iconHTML}
          </div>
          <div class="flex-1 text-sm font-medium pr-2">
            ${message}
          </div>
          ${closeButton}
        </div>
        ${progressBar.outerHTML}
      </div>
    `;
    
    // Add to container and store reference
    this.container.appendChild(toast);
    this.toasts.push({ id, timer: null });
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      // Start progress bar animation
      const progress = toast.querySelector('.h-1');
      if (progress) {
        progress.style.width = '0';
      }
    }, 10);
    
    // Auto remove after delay
    const timerIndex = this.toasts.length - 1;
    this.toasts[timerIndex].timer = setTimeout(() => {
      if (document.getElementById(id)) {
        document.getElementById(id).classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
          // Remove from toasts array
          const index = this.toasts.findIndex(t => t.id === id);
          if (index !== -1) {
            this.toasts.splice(index, 1);
          }
        }, 500);
      }
    }, duration);
    
    return id;
  },
  
  // Helper to generate icon HTML
  getIconHTML(type) {
    const iconColors = {
      success: 'text-green-500 bg-green-100',
      error: 'text-red-500 bg-red-100',
      info: 'text-blue-500 bg-blue-100',
      warning: 'text-yellow-500 bg-yellow-100',
    };
    
    const iconClass = iconColors[type] || iconColors.info;
    
    const iconMap = {
      success: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`,
      error: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`,
      info: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
      warning: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>`
    };
    
    return `<div class="rounded-lg ${iconClass} p-1.5">${iconMap[type] || iconMap.info}</div>`;
  },
  
  // Helper to dismiss a specific toast
  dismiss(id) {
    const toast = document.getElementById(id);
    if (toast) {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        // Clear the timeout
        const index = this.toasts.findIndex(t => t.id === id);
        if (index !== -1) {
          clearTimeout(this.toasts[index].timer);
          this.toasts.splice(index, 1);
        }
      }, 500);
    }
  },
  
  // Helper to dismiss all toasts
  dismissAll() {
    document.querySelectorAll('[id^="toast-"]').forEach(toast => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    });
    
    // Clear all timeouts
    this.toasts.forEach(toast => {
      clearTimeout(toast.timer);
    });
    this.toasts = [];
  },
  
  // Helper methods for different toast types
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  },
  
  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  },
  
  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  },
  
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }
};

// Memoized Card component to prevent unnecessary re-renders
const Card = memo(({ item, addToCart, isFavorited = false, toggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isLoadingFavoriteStatus, setIsLoadingFavoriteStatus] = useState(true);
  
  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  
  // Check if the item is available - default to true if not specified
  const isAvailable = item.isAvailable !== false;

    //context provider
      const {cartValue, setCartValue} = useCartValue()
  
  // Check favorite status on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userId || !token) {
        setIsLoadingFavoriteStatus(false);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorite/user-favorites`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ itemId: item._id }),
        });

        const data = await response.json();
        
        if (data.success) {
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoadingFavoriteStatus(false);
      }
    };
    
    // Only check if not already provided through props
    if (isFavorited === undefined || isFavorited === null) {
      checkFavoriteStatus();
    } else {
      setIsLoadingFavoriteStatus(false);
    }
  }, [item._id, token, userId, isFavorited]);

  // Function to parse and clean categories
  const parseCategories = useCallback((categories) => {
    if (!categories) return [];
    
    // Handle if categories is already an array
    if (Array.isArray(categories)) {
      return categories.map(cat => typeof cat === 'string' ? cat.trim() : String(cat).trim());
    }
    
    // Handle string format like "["category1", "category2"]"
    if (typeof categories === 'string') {
      try {
        // Try to parse as JSON if it looks like JSON
        if (categories.startsWith('[') && categories.endsWith(']')) {
          const parsed = JSON.parse(categories);
          if (Array.isArray(parsed)) {
            return parsed.map(cat => typeof cat === 'string' ? cat.trim() : String(cat).trim());
          }
        }
        
        // Handle comma-separated categories
        return categories.split(',').map(cat => cat.trim().replace(/["'\[\]]/g, ''));
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated or single value
        return categories.split(',').map(cat => cat.trim().replace(/["'\[\]]/g, ''));
      }
    }
    
    return [];
  }, []);

  // Function to clean category strings (for backward compatibility)
  const cleanCategoryString = useCallback((category) => {
    if (typeof category === 'string') {
      // Remove brackets, quotes, and extra characters
      return category.replace(/[\[\]"']/g, '');
    }
    
    if (Array.isArray(category)) {
      // If it's an array, return the first item without brackets
      return category[0]?.toString().replace(/[\[\]"']/g, '') || '';
    }
    
    return String(category).replace(/[\[\]"']/g, '');
  }, []);

  // Helper function to get the appropriate icon based on item type
  const getTypeIcon = useCallback((type) => {
    if (!type) return null;

    switch (type.toLowerCase()) {
      case 'vegetarian':
        return <FaLeaf className="text-green-500" title="Vegetarian" />;
      case 'non-vegetarian':
        return <FaDrumstickBite className="text-red-500" title="Non-Vegetarian" />;
      case 'drinks':
      case 'beverage':
        return <FaMugHot className="text-orange-400" title="Drinks" />;
      default:
        return null;
    }
  }, []);

  // Helper function to fix image URL path
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/api/placeholder/400/300";
    
    // Check if the path already includes '/uploads/'
    if (imagePath.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_BASE_URL}${imagePath}`;
    } else if (imagePath.includes('/uploads/')) {
      // This handles cases where the full path might be stored
      return `${process.env.REACT_APP_API_BASE_URL}${imagePath.substring(imagePath.indexOf('/uploads/'))}`;
    } else {
      // Just append the path to the uploads directory
      return `${process.env.REACT_APP_API_BASE_URL}/uploads/${imagePath}`;
    }
  }, []);



  // Handle token expiration
  const handleTokenExpiration = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    Toast.warning("Your session has expired. Please login again.");
  }, []);

  // Handle adding to cart - modified to check availability
  const handleAddToCart = useCallback(async (menuId) => {
    // First check if item is available
    if (!isAvailable) {
      Toast.warning(`${item.title} is currently unavailable`);
      return;
    }
    
    if (!userId || !token) {
      Toast.warning("Please login to add to cart");
      return;
    }
    
    // Prevent multiple clicks
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: menuId,
          userId: userId,
          productQuantity: 1,
        }),
      });

      const data = await response.json();
      
      // Check for token expiration
      if (!data.success && data.message === "Token expired") {
        handleTokenExpiration();
        return;
      }
      
      if (data.success) {
        Toast.success(`${item.title} added to cart`);
        // If you have a parent addToCart function, call it
        if (typeof addToCart === 'function') {
          addToCart(item);
        }
        setCartValue(cartValue + 1)
      } else {
        Toast.error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.log("error while adding to cart : ", error);
      Toast.error("Error adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, handleTokenExpiration, isAddingToCart, item, token, userId, isAvailable]);

  // Handle toggle favorite - your existing implementation
  const handleToggleFavorite = useCallback(async (menuId) => {
    if (!userId || !token) {
      Toast.warning("Please login to add to favorites");
      return;
    }

    // Prevent multiple clicks
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    
    try {
      // If already favorite, remove it
      if (isFavorite) {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorites/remove`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ itemId: menuId }),
        });

        const data = await response.json();
        
        if (data.success) {
          setIsFavorite(false);
          Toast.success("Removed from favorites");
          if (typeof toggleFavorite === 'function') {
            toggleFavorite(menuId, false);
          }
        } else {
          // Check for token expiration
          if (data.message === "Token expired") {
            handleTokenExpiration();
          } else {
            Toast.error(data.message || "Failed to remove from favorites");
          }
        }
      } 
      // If not favorite, add it
      else {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorite/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ itemId: menuId }),
        });

        const data = await response.json();
        
        if (data.success) {
          setIsFavorite(true);
          
          // Show appropriate message based on the response
          if (data.message === "Item already in favorites") {
            Toast.info("Item is already in your favorites");
          } else {
            Toast.success("Added to favorites");
          }
          
          if (typeof toggleFavorite === 'function') {
            toggleFavorite(menuId, true);
          }
        } else if (data.message === "Item already in favorites") {
          // For backward compatibility with old API response format
          setIsFavorite(true);
          Toast.info("Item is already in your favorites");
          
          if (typeof toggleFavorite === 'function') {
            toggleFavorite(menuId, true);
          }
        } else {
          // Check for token expiration
          if (data.message === "Token expired") {
            handleTokenExpiration();
          } else {
            Toast.error(data.message || "Failed to add to favorites");
          }
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      Toast.error("Error updating favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [handleTokenExpiration, isFavorite, isTogglingFavorite, token, toggleFavorite, userId]);

  // Parse categories into array format
  const categories = parseCategories(item.categories);

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-gray-700">
      {/* Enhanced Unavailable Indicator */}
      {!isAvailable && (
        <>
          {/* Diagonal ribbon-style unavailable banner */}
          <div className="absolute top-0 right-0 z-40 overflow-hidden w-28 h-28 pointer-events-none">
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-600 text-white font-bold py-1 w-44 text-center shadow-lg border-b-2 border-red-800">
              UNAVAILABLE
            </div>
          </div>
          
          {/* Semi-transparent overlay with grayscale */}
          <div className="absolute inset-0 z-30 bg-black bg-opacity-40 backdrop-filter backdrop-grayscale"></div>
        </>
      )}

      {/* Menu Type Badge */}
      {item.menuType && (
        <div className="absolute top-0 left-0 z-20">
          <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
            {item.menuType
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        <img
          src={getImageUrl(item.image)}
          alt={item.title}
          className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 ${!isAvailable ? 'filter grayscale' : ''}`}
          onError={(e) => {
            e.target.src = "/api/placeholder/400/300";
          }}
          loading="lazy"
        />


        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full shadow-lg">
            Rs. {item.price}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-white">{item.title}</h2>
          <div className="ml-2">{item.type && getTypeIcon(item.type)}</div>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {categories.map((category, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                <FaTag className="w-3 h-3 mr-1" />
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Enhanced Availability Badge */}
        <div className="mt-1 mb-3">
          {isAvailable ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 border border-green-200 text-green-700">
              <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Available Now
            </span>
          ) : (
            <div className="relative">
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 border border-red-200 text-red-700">
                <FaBan className="h-3 w-3 mr-2" />
                Currently Unavailable
              </span>
              {/* Add pulsing dot animation for emphasis */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          {!isLoadingFavoriteStatus && (
            <button
              onClick={() => handleToggleFavorite(item._id)}
              disabled={isTogglingFavorite}
              className={`flex-1 mr-2 py-2 px-4 rounded-lg ${
                isFavorite 
                  ? 'bg-red-700 hover:bg-red-800' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } text-white transition-colors flex items-center justify-center space-x-2 ${
                isTogglingFavorite ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isTogglingFavorite ? (
                <span className="h-4 w-4 border-2 border-t-white rounded-full animate-spin mr-2"></span>
              ) : (
                <FaHeart className={`${isFavorite ? "text-red-300" : "text-white"} mr-2`} />
              )}
              <span className="text-sm font-medium">
                {isTogglingFavorite ? 'Updating...' : (isFavorite ? 'Remove' : 'Favorite')}
              </span>
            </button>
          )}
          <button
            onClick={() => handleAddToCart(item._id)}
            disabled={isAddingToCart || !isAvailable}
            className={`${!isLoadingFavoriteStatus ? 'flex-1' : 'w-full'} py-2 px-4 rounded-lg ${
              !isAvailable 
                ? 'bg-gray-600 border-2 border-gray-700 cursor-not-allowed opacity-80' 
                : isAddingToCart
                  ? 'bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-500'
            } text-white transition-colors flex items-center justify-center space-x-2`}
          >
            {isAddingToCart ? (
              <span className="h-4 w-4 border-2 border-t-white rounded-full animate-spin mr-2"></span>
            ) : (
              <>
                {!isAvailable ? (
                  <div className="relative">
                    <FaShoppingCart className="text-white mr-2" />
                    <FaBan className="absolute -top-1 -right-2 text-red-500 text-xs" />
                  </div>
                ) : (
                  <FaShoppingCart className="text-white mr-2" />
                )}
              </>
            )}
            <span className="text-sm font-medium">
              {isAddingToCart ? 'Adding...' : (!isAvailable ? 'Out of Stock' : 'Add to Cart')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default Card;