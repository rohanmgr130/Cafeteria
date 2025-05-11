import React, { useState, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';

function Search() {
  const navigate = useNavigate();
  const imageUrl = "bgimg.jpg";
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const popularSearches = ['Pizza', 'Burger', 'Sushi', 'Salad', 'Noodles', 'Ice Cream'];

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/staff/get-all-menu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch menu details: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    
    if (value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    filterMenuItems(value);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const filterMenuItems = (query) => {
    if (!query) {
      setFilteredItems(menuItems);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const result = menuItems.filter(item =>
      (item.title || '').toLowerCase().includes(lowercaseQuery) ||
      (item.description || '').toLowerCase().includes(lowercaseQuery) ||
      (item.categories || []).some(cat => cat.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredItems(result);
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    filterMenuItems(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setFilteredItems(menuItems);
  };

  const handleItemClick = (item) => {
    navigate(`/menu/${item._id}`, { state: { itemDetails: item } });
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/menu', { 
      state: { 
        searchTerm
      } 
    });
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full h-[540px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/60" />

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 max-w-4xl mx-auto">
        {/* Header Text */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Find Your <span className="text-yellow-400">Favorite</span> Food
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Search from our wide selection of delicious dishes
          </p>
        </div>

        {/* Search Container */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative group">
            {/* Search Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="What are you craving today?"
              className="w-full px-6 py-4 pr-24 text-lg rounded-xl
                       bg-white/95 backdrop-blur-sm
                       placeholder-gray-400 text-gray-700
                       shadow-xl outline-none
                       transition-all duration-300
                       focus:ring-2 focus:ring-blue-300/30
                       border-2 border-transparent
                       focus:border-blue-400"
            />

            {/* Clear and Loading Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-2
                        text-gray-400 hover:text-gray-600
                        transition-colors"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <RxCross1 className="w-5 h-5"/>
                )}
              </button>
            )}

            {/* Search Button */}
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2
                           w-12 h-12 flex items-center justify-center
                           bg-blue-500 rounded-lg text-white
                           transition-all duration-300
                           hover:bg-blue-600 active:scale-95
                           shadow-lg"
            >
              <IoSearch className="w-5 h-5"/>
            </button>

            {/* Search Suggestions */}
            {showSuggestions && searchTerm && filteredItems.length > 0 && (
              <div className="absolute w-full mt-2 py-2 bg-white rounded-xl shadow-xl 
                          border border-gray-100 z-50 max-h-[320px] overflow-y-auto">
                {filteredItems.slice(0, 6).map((item) => (
                  <button
                    type="button"
                    key={item._id || item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 
                            flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'placeholder-food.jpg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">{item.title}</span>
                        <span className="text-xs text-gray-400">{item.description?.substring(0, 60)}...</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-500 group-hover:text-blue-600">
                      {item.price ? `₹${item.price}` : ''}
                    </span>
                  </button>
                ))}
                {filteredItems.length > 6 && (
                  <div 
                    className="text-center py-2 text-sm text-blue-500 cursor-pointer hover:underline"
                    onClick={handleSearchSubmit}
                  >
                    Show all {filteredItems.length} results
                  </div>
                )}
              </div>
            )}
          </form>

          {/* No Results Message */}
          {searchTerm && filteredItems.length === 0 && !isSearching && (
            <div className="w-full mt-2 p-3 bg-white/90 backdrop-blur-sm rounded-xl text-center">
              <p className="text-gray-600">No results found for "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}

          {/* Popular Searches */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-gray-300">Popular:</span>
              {popularSearches.map((term, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => handlePopularSearch(term)}
                  className="px-3 py-1 rounded-full 
                          bg-white/10 hover:bg-white/20
                          text-white
                          transition-all duration-300
                          backdrop-blur-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;