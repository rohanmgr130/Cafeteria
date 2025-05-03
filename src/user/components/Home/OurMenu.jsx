import React, { useEffect, useState } from 'react';
import Card from '../Card';

const MenuHome = () => {
  const [menuItems, setMenuItems] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const slicedData = data.slice(0,6)
      setMenuItems(slicedData);
     
  
      
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllMenu();
  }, []); // Added empty dependency array to prevent infinite loop

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-4 text-center">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <a href="/menus" className="text-lg font-medium text-blue-500 hover:text-blue-700">
            See All
          </a>
        </div>
        <p className="text-gray-800 text-lg">Explore our wide range of delicious dishes</p>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Menu Grid */}
      {!isLoading && !error && menuItems && menuItems.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <Card item={item} key={index} />
          ))}
        </div>
      ) : !isLoading && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600">No menu items available.</p>
        </div>
      )}
    </div>
  );
};

export default MenuHome;