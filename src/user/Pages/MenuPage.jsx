import React, { useState, useEffect } from 'react';
import { FaHeart, FaShoppingCart, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from "../components/FooterPart";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

const OurMenu = () => {
  const navigate = useNavigate();

  // State for menu items and API handling
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Filtering states
  const [priceRange, setPriceRange] = useState(1250);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");

  // Function to normalize categories (handle both string and array formats)
  const normalizeCategories = (item) => {
    if (!item.categories) return [];
    
    // If categories is a string, convert to array
    if (typeof item.categories === 'string') {
      return [item.categories];
    }
    
    // If it's already an array, return it
    if (Array.isArray(item.categories)) {
      return item.categories;
    }
    
    // Default case - convert to string and wrap in array
    return [String(item.categories)];
  };

  // Helper function to safely convert price to a number
  const safePrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      // Remove currency symbol and non-numeric characters
      const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
      return isNaN(numericPrice) ? 0 : numericPrice;
    }
    return 0;
  };

  // Function to check if an item is in favorites
  const isFavorited = (itemId) => {
    return favorites.includes(itemId);
  };

  // Toggle favorite status
  const toggleFavorite = async (itemId) => {
    const token = localStorage.getItem('token');
    
    // If not logged in, use localStorage and prompt to login
    if (!token) {
      // Update local state
      let updatedFavorites;
      if (isFavorited(itemId)) {
        // Remove from favorites
        updatedFavorites = favorites.filter(id => id !== itemId);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        updatedFavorites = [...favorites, itemId];
        toast.success('Added to favorites');
      }
      
      // Update state and localStorage
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      return;
    }

    // If logged in, use the API
    try {
      const isCurrentlyFavorite = favorites.includes(itemId);
      const endpoint = isCurrentlyFavorite ? 'remove' : 'add';
      
      const response = await fetch(`http://localhost:4000/api/favorites/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isCurrentlyFavorite ? 'remove from' : 'add to'} favorites`);
      }

      // Update local state
      if (isCurrentlyFavorite) {
        setFavorites(prev => prev.filter(id => id !== itemId));
        toast.success('Removed from favorites');
      } else {
        setFavorites(prev => [...prev, itemId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message);
    }
  };

  // Modified addToCart function to navigate to cart page after adding
  const addToCart = async (item) => {
    try {
      // Make the POST request to the backend
      const response = await fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {  
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });
  
      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }
  
      // Parse the JSON response
      const data = await response.json();
  
      // Update the cart state with the response from the backend
      setCart(data.cart);
      
      // Show success toast
      toast.success(`${item.title} added to cart!`);
      
      // Navigate to the cart page
      navigate('/cart');
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };
  
  const handleGetAllMenu = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:4000/api/staff/get-all-menu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Failed to fetch menu details: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      
      // Process the data to ensure categories are properly normalized
      const processedData = data.map(item => ({
        ...item,
        categories: normalizeCategories(item)
      }));
      
      setMenuItems(processedData);
      setFilteredItems(processedData); // Initially set filtered items to all menu items
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      // Instead of setting error state, just log to console and show toast
      toast.error('Failed to load some menu items. Showing what we can.');
      // Try to recover by using whatever data we have
      setFilteredItems(menuItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch menu items on component mount
  useEffect(() => {
    handleGetAllMenu();
    
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Error parsing favorites from localStorage:", e);
      }
    }
  }, []);

  // Extract all unique categories and types from menu items
  const getUniqueCategories = () => {
    const allCategories = menuItems.flatMap(item => normalizeCategories(item));
    // Use Set to get unique categories and convert back to array
    return ["All", ...new Set(allCategories)];
  };

  const getUniqueTypes = () => {
    const allTypes = menuItems.map(item => item.type || "");
    return ["All", ...new Set(allTypes.filter(type => type))];
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...menuItems]; // Create a copy of menuItems to avoid mutation
    
    // Filter by category
    if (activeCategory !== "All") {
      result = result.filter(item => {
        const categories = normalizeCategories(item);
        return categories.some(cat => 
          cat.toLowerCase() === activeCategory.toLowerCase()
        );
      });
    }
    
    // Filter by type (vegetarian, non-vegetarian, drinks, etc.)
    if (activeType !== "All") {
      result = result.filter(item => 
        item.type && item.type.toLowerCase() === activeType.toLowerCase()
      );
    }
    
    // Filter by price
    result = result.filter(item => {
      const itemPrice = safePrice(item.price);
      return itemPrice <= priceRange;
    });
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.title || '').toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(result);
  }, [menuItems, activeCategory, activeType, priceRange, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setActiveCategory("All");
    setActiveType("All");
    setPriceRange(1250);
    setSearchQuery("");
    toast.info("Filters have been reset");
  };

  // Get background color based on item type
  const getTypeColor = (type) => {
    if (!type) return "bg-gray-500";
    
    type = type.toLowerCase();
    if (type === "vegetarian") return "bg-green-500";
    if (type === "non-vegetarian") return "bg-red-500";
    if (type === "drinks" || type === "beverage") return "bg-blue-500";
    
    return "bg-purple-500"; // Default for other types
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12 px-6 mt-10">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
        <p className="text-gray-800 text-lg">Explore our wide range of delicious dishes</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search our menu..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {getUniqueCategories().map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeCategory === category 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3">Type</h2>
            <div className="flex flex-wrap gap-2">
              {getUniqueTypes().map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeType === type 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-3">Max Price: ₹{priceRange}</h2>
            <input
              type="range"
              min="5"
              max="1250"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rs 5</span>
              <span>Rs 1250</span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            > 
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Category Pills (always visible) */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {getUniqueCategories().map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div key={item._id || index} className="relative">
                <Card 
                  item={{
                    ...item,
                    // Pass normalized categories to Card component
                    categories: normalizeCategories(item)
                  }}
                  addToCart={addToCart}
                  isFavorited={isFavorited(item._id)}
                  toggleFavorite={() => toggleFavorite(item._id)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No menu items found matching your filters</p>
              <button 
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default OurMenu;
