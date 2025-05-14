import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Heart, ShoppingCart, Star, Leaf, Coffee, Search, Filter, ArrowUpRight, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

// Helper function to properly handle image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/api/placeholder/400/300";
  
  // Check if the path already includes '/uploads/'
  if (imagePath.startsWith('/uploads/')) {
    return `${process.env.REACT_APP_API_BASE_URL}${imagePath}`;
  } else if (imagePath.includes('/uploads/')) {
    // Handle cases where the full path might be stored
    return `${process.env.REACT_APP_API_BASE_URL}${imagePath.substring(imagePath.indexOf('/uploads/'))}`;
  } else {
    // Just append the path to the uploads directory
    return `${process.env.REACT_APP_API_BASE_URL}/uploads/${imagePath}`;
  }
};

// Memoized item card component to reduce re-renders
const FavoriteItem = memo(({ item, onRemove, onAddToCart, onViewDetails, isRemoving }) => {
  // Helper function to get the appropriate icon based on item type
  const getTypeIcon = (type) => {
    if (!type) return null;

    switch (type.toLowerCase()) {
      case 'vegetarian':
        return <Leaf className="text-green-500 w-4 h-4" />;
      case 'non-vegetarian':
        return <div className="text-red-500 font-bold text-xs">NON-VEG</div>;
      case 'drinks':
      case 'beverage':
        return <Coffee className="text-blue-400 w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />
        <img
          src={getImageUrl(item.image)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/api/placeholder/400/300";
          }}
          loading="lazy" // Add lazy loading
        />

        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-lg flex items-center space-x-1 z-20 shadow-md">
            <Star className="text-yellow-500 w-4 h-4 fill-yellow-500" />
            <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{item.rating}</span>
          </div>
        )}

        {/* Menu Type Badge */}
        {item.menuType && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow-md">
              {item.menuType
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </div>
          </div>
        )}
        
        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button 
            onClick={() => onViewDetails(item)}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center"
          >
            Quick View <ArrowUpRight className="ml-1 w-4 h-4" />
          </button>
        </div>
        
        {/* Type Icon */}
        {item.type && (
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-lg shadow-md">
              {getTypeIcon(item.type)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h2>
          <div className="font-bold text-blue-600 dark:text-blue-400 ml-2">Rs{item.price}</div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}

{/* Categories */}
{Array.isArray(item.categories) && item.categories.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
    {item.categories.slice(0, 3).map((category, index) => (
      <span
        key={index}
        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md"
      >
        {category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </span>
    ))}
    {item.categories.length > 3 && (
      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
        +{item.categories.length - 3}
      </span>
    )}
  </div>
)}


        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-auto space-x-2">
          <button
            onClick={() => onRemove(item._id)}
            disabled={isRemoving}
            className={`flex-1 py-2 px-3 rounded-lg bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center ${isRemoving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isRemoving ? (
              <div className="h-4 w-4 border-2 border-t-red-500 rounded-full animate-spin mr-2"></div>
            ) : (
              <Heart className="text-red-500 w-4 h-4 fill-red-500 mr-2" />
            )}
            <span className="text-sm font-medium">{isRemoving ? 'Removing...' : 'Remove'}</span>
          </button>
          <button
            onClick={() => onAddToCart(item)}
            className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <ShoppingCart className="text-white w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Custom filter dropdown component
const FilterDropdown = memo(({ options, value, onChange, label, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {icon}
        <span className="text-sm font-medium">{label}:</span>
        <span className="text-sm">{options.find(opt => opt.value === value)?.label}</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium' 
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Main component
function MyFavorite() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    sortBy: "newest",
    priceRange: "all"
  });
  
  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  
  // Show toast message
  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
    
    // Auto-hide toast after delay
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "" });
    }, 3000);
  }, []);
  
  // Fetch favorites from API
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        setIsLoading(false);
        showToast("Please login to view your favorites", "error");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/favourite/user-favorites`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setFavorites(response.data.favorites.items || []);
        } else {
          showToast(response.data.message || "Failed to load favorites", "error");
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showToast(error.response?.data?.message || "Failed to load favorites", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [token, API_BASE_URL, showToast]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      type: "all",
      sortBy: "newest",
      priceRange: "all"
    });
    setSearchQuery("");
  }, []);

  // Handle updating a specific filter
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Apply multiple filters and sorting to favorites
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title?.toLowerCase().includes(query)) || 
        (item.description?.toLowerCase().includes(query)) ||
        (item.categories?.some(cat => cat.toLowerCase().includes(query)))
      );
    }
    
    // Apply type filter
    if (filters.type !== "all") {
      result = result.filter(item => item.type === filters.type);
    }
    
    // Apply price range filter
    if (filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under100":
          result = result.filter(item => item.price < 100);
          break;
        case "100to200":
          result = result.filter(item => item.price >= 100 && item.price <= 200);
          break;
        case "200to300":
          result = result.filter(item => item.price > 200 && item.price <= 300);
          break;
        case "300plus":
          result = result.filter(item => item.price > 300);
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        // Assuming newest is already the default order from your API
        break;
    }
    
    return result;
  }, [favorites, searchQuery, filters]);
  
  // Get filter counts for badges
  const filterCounts = useMemo(() => {
    const counts = {
      all: favorites.length,
      vegetarian: 0,
      'non-vegetarian': 0,
      drinks: 0
    };
    
    favorites.forEach(item => {
      if (item.type && counts[item.type] !== undefined) {
        counts[item.type]++;
      }
    });
    
    return counts;
  }, [favorites]);
  
  // Type filter options
  const typeOptions = useMemo(() => [
    { value: 'all', label: 'All Types', count: filterCounts.all },
    { 
      value: 'vegetarian', 
      label: 'Vegetarian', 
      count: filterCounts.vegetarian,
      icon: <Leaf className="text-green-500 w-4 h-4 inline" />
    },
    { 
      value: 'non-vegetarian', 
      label: 'Non-Vegetarian', 
      count: filterCounts['non-vegetarian'],
      icon: <div className="text-red-500 text-xs font-bold inline">NON-VEG</div>
    },
    { 
      value: 'drinks', 
      label: 'Drinks', 
      count: filterCounts.drinks,
      icon: <Coffee className="text-blue-400 w-4 h-4 inline" />
    }
  ], [filterCounts]);
  
  // Sort options
  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Newest' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'priceAsc', label: 'Price (Low to High)' },
    { value: 'priceDesc', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Rating' }
  ], []);
  
  // Price range options
  const priceOptions = useMemo(() => [
    { value: 'all', label: 'All Prices' },
    { value: 'under100', label: 'Under Rs. 100' },
    { value: '100to200', label: 'Rs. 100 to Rs. 200' },
    { value: '200to300', label: 'Rs. 200 to Rs. 300' },
    { value: '300plus', label: 'Above Rs. 300' }
  ], []);
  
  // Handle removing from favorites
  const removeFromFavorites = useCallback(async (id) => {
    if (!token) {
      showToast("Please login to manage favorites", "error");
      return;
    }
    
    // Prevent multiple removes of the same item
    if (removingItems.has(id)) return;
    
    // Add item to removing set
    setRemovingItems(prev => new Set(prev).add(id));
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/favorite/remove`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { itemId: id }
      });
      
      if (response.data.success) {
        // Update local state only after API call succeeds
        setFavorites(prev => prev.filter(item => item._id !== id));
        showToast("Item removed from favorites", "success");
      } else {
        showToast(response.data.message || "Failed to remove from favorites", "error");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showToast(error.response?.data?.message || "Failed to remove from favorites", "error");
    } finally {
      // Remove item from removing set
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [API_BASE_URL, removingItems, showToast, token]);
  
  // Handle adding to cart
  const handleAddToCart = useCallback((item) => {
    if (!userId || !token) {
      showToast("Please login to add to cart", "error");
      return;
    }
    
    // In a real app, you would make an API call here
    showToast(`${item.title} added to cart`, "success");
  }, [showToast, token, userId]);

  // Handle viewing item details
  const viewItemDetails = useCallback((item) => {
    // In a real app, you would redirect to the item's detail page
    console.log("View details for:", item.title);
    showToast(`Viewing details for ${item.title}`, "info");
  }, [showToast]);

  // Check if any filters are active for the UI
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' || 
           filters.type !== 'all' || 
           filters.priceRange !== 'all' || 
           filters.sortBy !== 'newest';
  }, [filters.priceRange, filters.sortBy, filters.type, searchQuery]);

  return (
    <div className="min-h-screen bg-white mt-11 pt-6 pb-12 px-4 sm:px-6">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl transition-all duration-300 transform ${
          toast.type === "success" ? "bg-green-600" :
          toast.type === "error" ? "bg-red-600" :
          "bg-blue-600"
        }`}>
          <p className="text-white text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray">
            My Favorites
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {favorites.length}
            </span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Your personal collection of favorite items
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search favorites by name, description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                label="Type"
                icon={<Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                value={filters.type}
                onChange={(value) => updateFilter('type', value)}
                options={typeOptions.map(opt => ({
                  ...opt,
                  label: `${opt.label} ${opt.count > 0 ? `(${opt.count})` : ''}`
                }))}
              />
              
              <FilterDropdown
                label="Price"
                icon={<span className="text-gray-500 dark:text-gray-400">Rs</span>}
                value={filters.priceRange}
                onChange={(value) => updateFilter('priceRange', value)}
                options={priceOptions}
              />
              
              <FilterDropdown
                label="Sort By"
                icon={<ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                value={filters.sortBy}
                onChange={(value) => updateFilter('sortBy', value)}
                options={sortOptions}
              />
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Active Filters:</span>
              {searchQuery && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md flex items-center">
                  Search: "{searchQuery}"
                  <button onClick={clearSearch} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.type !== 'all' && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md flex items-center">
                  Type: {typeOptions.find(opt => opt.value === filters.type)?.label.split(' ')[0]}
                  <button onClick={() => updateFilter('type', 'all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.priceRange !== 'all' && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md flex items-center">
                  Price: {priceOptions.find(opt => opt.value === filters.priceRange)?.label}
                  <button onClick={() => updateFilter('priceRange', 'all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.sortBy !== 'newest' && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md flex items-center">
                  Sort: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
                  <button onClick={() => updateFilter('sortBy', 'newest')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {favorites.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="inline-flex justify-center items-center p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <Heart className="text-blue-600 dark:text-blue-300 w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Favorites Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Items you mark as favorites will appear here for easy access. Start exploring our menu to find your favorites!
                </p>
                <button 
                  onClick={() => window.location.href = '/menu'} 
                  className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Browse Menu
                </button>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="inline-flex justify-center items-center p-3 bg-amber-100 dark:bg-amber-900 rounded-full mb-3">
                  <Search className="text-amber-600 dark:text-amber-300 w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Matching Items</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No items match your current search or filter criteria.
                </p>
                <button 
                  onClick={resetFilters}
                  className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredFavorites.length} of {favorites.length} items
                </div>
                
                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFavorites.map((item) => (
                    <FavoriteItem 
                      key={item._id}
                      item={item}
                      onRemove={removeFromFavorites}
                      onAddToCart={handleAddToCart}
                      onViewDetails={viewItemDetails}
                      isRemoving={removingItems.has(item._id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyFavorite;