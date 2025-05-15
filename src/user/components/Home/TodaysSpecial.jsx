import React, { useState, useEffect } from 'react';
import Card from '../Card';

function TodaysSpecial() {
 const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetTodaysSpecialMenu = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/staff/todays-special`, {
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
      if(data.success){

        const slicedData = data.data.slice(0, 3);
        
        
        setMenuItems(slicedData);
      }
    
  
      
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log("first", menuItems)

  useEffect(() => {
    handleGetTodaysSpecialMenu();
  }, []); // Empty dependency array to prevent infinite loop

  return (
    <div className=" bg-gray-50 py-6 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Today's Special
        </h1>
        <p className="text-gray-800 text-lg">
          Discover our chef's specially curated menu items
        </p>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading today's specials...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* TodaysSpecial Grid */}
      {!isLoading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <Card item={item} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TodaysSpecial;