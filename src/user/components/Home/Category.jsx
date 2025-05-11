// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Category = () => {
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [scrollPosition, setScrollPosition] = useState(0);
//   const [maxScroll, setMaxScroll] = useState(0);
//   const navigate = useNavigate();
  
//   // Create a ref for the scroll container
//   const scrollContainerRef = useRef(null);

//   // Calculate max scroll width on mount and when categories change
//   useEffect(() => {
//     if (scrollContainerRef.current && categories.length > 0) {
//       const containerWidth = scrollContainerRef.current.clientWidth;
//       const scrollWidth = scrollContainerRef.current.scrollWidth;
//       setMaxScroll(scrollWidth - containerWidth);
//     }
//   }, [categories, scrollContainerRef]);

//   // Update scroll position when scrolling
//   useEffect(() => {
//     const handleScroll = () => {
//       if (scrollContainerRef.current) {
//         setScrollPosition(scrollContainerRef.current.scrollLeft);
//       }
//     };

//     const scrollContainer = scrollContainerRef.current;
//     if (scrollContainer) {
//       scrollContainer.addEventListener('scroll', handleScroll);
//       return () => scrollContainer.removeEventListener('scroll', handleScroll);
//     }
//   }, []);

//   // Fetch categories from the backend
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/category/get-all-category`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();
        
//         if (data.success && data.categories) {
//           setCategories(data.categories);
//         } else {
//           throw new Error('Invalid data format received from server');
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         setError('Failed to load categories. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);
  
//   // Handle category click
//   const handleCategoryClick = (categoryName) => {
//     // Navigate to menu page with category filter
//     navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
//   };

//   // Handle "See All" click
//   const handleSeeAllClick = () => {
//     navigate('/user-menus');
//   };

//   // Scroll functions with improved smooth scrolling
//   const scrollLeft = () => {
//     if (scrollContainerRef.current) {
//       const newPosition = Math.max(0, scrollPosition - 300);
//       scrollContainerRef.current.scrollTo({
//         left: newPosition,
//         behavior: 'smooth'
//       });
//     }
//   };

//   const scrollRight = () => {
//     if (scrollContainerRef.current) {
//       const newPosition = Math.min(maxScroll, scrollPosition + 300);
//       scrollContainerRef.current.scrollTo({
//         left: newPosition,
//         behavior: 'smooth'
//       });
//     }
//   };

//   // Show/hide scroll buttons based on scroll position
//   const showLeftButton = scrollPosition > 0;
//   const showRightButton = scrollPosition < maxScroll;

//   return (
//     <div className="w-full flex flex-col justify-center items-center mx-auto p-6 bg-white mt-6">
//       {/* Header Section with animated gradient underline */}
//       <div className="flex max-w-7xl w-full justify-between items-center mb-5">
//         <div className="relative">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Categories
//           </h1>
//           <div className="absolute -bottom-2 left-0 w-3/4 h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-400 rounded-full"></div>
//         </div>
        
//         <button 
//           onClick={handleSeeAllClick}
//           className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
//         >
//           <span className="font-medium text-sm">See All</span>
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//           </svg>
//         </button>
//       </div>

//       {/* Loading State with improved animation */}
//       {isLoading && (
//         <div className="w-full flex justify-center items-center h-48">
//           <div className="relative w-16 h-16">
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
//           </div>
//         </div>
//       )}

//       {/* Error State */}
//       {!isLoading && error && (
//         <div className="w-full flex justify-center items-center h-48 bg-red-50 rounded-lg">
//           <div className="text-center text-red-500 font-medium px-4 py-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             {error}
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {!isLoading && !error && categories.length === 0 && (
//         <div className="w-full flex justify-center items-center h-48 bg-gray-50 rounded-lg">
//           <div className="text-center text-gray-500">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
//             </svg>
//             No categories available
//           </div>
//         </div>
//       )}

//       {/* Categories Display with improved styling */}
//       {!isLoading && !error && categories.length > 0 && (
//         <div className="max-w-7xl w-full relative my-2">
//           {/* Left scroll button with conditional display */}
//           <button 
//             onClick={scrollLeft}
//             className={`absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 focus:outline-none ${showLeftButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
//             aria-label="Scroll left"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
          
//           {/* Right scroll button with conditional display */}
//           <button 
//             onClick={scrollRight}
//             className={`absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 focus:outline-none ${showRightButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
//             aria-label="Scroll right"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
          
//           {/* Left gradient fade effect - enhanced */}
//           <div className={`absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`}></div>
          
//           {/* Right gradient fade effect - enhanced */}
//           <div className={`absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`}></div>
          
//           {/* Actual scroll container with improved scroll behavior */}
//           <div 
//             ref={scrollContainerRef} 
//             className="flex overflow-x-auto py-4 px-6 scrollbar-hide scroll-smooth"
//             style={{ 
//               scrollbarWidth: 'none', 
//               msOverflowStyle: 'none',
//               scrollSnapType: 'x mandatory',
//               paddingBottom: '20px' // Extra padding to avoid clipping shadows
//             }}
//           >
//             <div className="flex space-x-10 px-2">
//               {categories.map((category) => (
//                 <div 
//                   key={category._id}
//                   className="relative group flex-shrink-0" 
//                   onClick={() => handleCategoryClick(category.name)}
//                   style={{ scrollSnapAlign: 'center' }}
//                 >
//                   {/* Circle Container with enhanced shadows and effects */}
//                   <div className="w-28 h-28 md:w-32 md:h-32 relative overflow-hidden rounded-full bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transform transition-all duration-500 group-hover:scale-105 cursor-pointer">
//                     {/* Category Image with better scaling */}
//                     <img
//                       src={`http://localhost:4000${category.image}`}
//                       alt={category.name}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                       onError={(e) => {
//                         e.target.src = 'https://via.placeholder.com/150?text=Category';
//                       }}
//                     />
                    
//                     {/* Background glow effect on hover */}
//                     <div className="absolute inset-0 -z-10 bg-blue-400 opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
                    
//                     {/* Hover Overlay with enhanced gradient and text */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 
//                                   group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
//                       <span className="text-white text-base md:text-lg font-medium text-center px-2 py-1 tracking-wide">
//                         {category.name}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           {/* Scroll indicators - visual dots to show position */}
//           <div className="flex justify-center mt-4 space-x-1">
//             {Array.from({ length: Math.min(5, Math.ceil(categories.length / 3)) }).map((_, index) => {
//               const isActive = 
//                 scrollPosition >= (maxScroll * index / 4) && 
//                 scrollPosition < (maxScroll * (index + 1) / 4);
              
//               return (
//                 <div 
//                   key={index}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${
//                     isActive ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
//                   }`}
//                 ></div>
//               );
//             })}
//           </div>
//         </div>
//       )}
      
//       {/* Custom scrollbar styling */}
//       <style jsx>{`
//         /* Hide scrollbar for Chrome, Safari and Opera */
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
        
//         /* Hide scrollbar for IE, Edge and Firefox */
//         .scrollbar-hide {
//           -ms-overflow-style: none;  /* IE and Edge */
//           scrollbar-width: none;  /* Firefox */
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Category;



import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the placeholder image outside the component to ensure it's defined before usage
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIgcng9Ijc1IiByeT0iNzUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTA5MDkwIj5DYXRlZ29yeTwvdGV4dD48L3N2Zz4=';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const navigate = useNavigate();
  
  // Create a ref for the scroll container
  const scrollContainerRef = useRef(null);

  // Calculate max scroll width on mount and when categories change
  useEffect(() => {
    if (scrollContainerRef.current && categories.length > 0) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      setMaxScroll(scrollWidth - containerWidth);
    }
  }, [categories, scrollContainerRef]);

  // Update scroll position when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setScrollPosition(scrollContainerRef.current.scrollLeft);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        // Use the correct API URL - ensure your env variable is set correctly
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'}/api/category/get-all-category`;
        console.log('Fetching categories from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Categories data:', data);
        
        if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  // Handle category click
  const handleCategoryClick = (categoryName) => {
    // Navigate to menu page with category filter
    navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
  };

  // Handle "See All" click
  const handleSeeAllClick = () => {
    navigate('/user-menus');
  };

  // Scroll functions with improved smooth scrolling
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 300);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const newPosition = Math.min(maxScroll, scrollPosition + 300);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  // Show/hide scroll buttons based on scroll position
  const showLeftButton = scrollPosition > 0;
  const showRightButton = scrollPosition < maxScroll;

  // Category rendering function with proper image error handling
  const renderCategory = (category) => {
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
    const imagePath = category.image && (
      category.image.startsWith('/')
        ? `${apiBase}${category.image}`
        : `${apiBase}/${category.image}`
    );

    return (
      <div 
        key={category._id}
        className="relative group flex-shrink-0" 
        onClick={() => handleCategoryClick(category.name)}
        style={{ scrollSnapAlign: 'center' }}
      >
        {/* Circle Container with enhanced shadows and effects */}
        <div className="w-28 h-28 md:w-32 md:h-32 relative overflow-hidden rounded-full bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transform transition-all duration-500 group-hover:scale-105 cursor-pointer">
          {/* Category Image with better scaling */}
          <img
            src={imagePath || PLACEHOLDER_IMAGE}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.log('Image load error, using placeholder for:', category.name);
              e.target.onError = null; // Prevent infinite loop
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
          
          {/* Background glow effect on hover */}
          <div className="absolute inset-0 -z-10 bg-blue-400 opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
          
          {/* Hover Overlay with enhanced gradient and text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 
                        group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white text-base md:text-lg font-medium text-center px-2 py-1 tracking-wide">
              {category.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-center items-center mx-auto p-6 bg-white mt-6">
      {/* Header Section with animated gradient underline */}
      <div className="flex max-w-7xl w-full justify-between items-center mb-5">
        <div className="relative">
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>
          <div className="absolute -bottom-2 left-0 w-3/4 h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-400 rounded-full"></div>
        </div>
        
        <button 
          onClick={handleSeeAllClick}
          className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="font-medium text-sm">See All</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Loading State with improved animation */}
      {isLoading && (
        <div className="w-full flex justify-center items-center h-48">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="w-full flex justify-center items-center h-48 bg-red-50 rounded-lg">
          <div className="text-center text-red-500 font-medium px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && categories.length === 0 && (
        <div className="w-full flex justify-center items-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            No categories available
          </div>
        </div>
      )}

      {/* Categories Display with improved styling */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="max-w-7xl w-full relative my-2">
          {/* Left scroll button with conditional display */}
          <button 
            onClick={scrollLeft}
            className={`absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 focus:outline-none ${showLeftButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right scroll button with conditional display */}
          <button 
            onClick={scrollRight}
            className={`absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 focus:outline-none ${showRightButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Left gradient fade effect - enhanced */}
          <div className={`absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showLeftButton ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Right gradient fade effect - enhanced */}
          <div className={`absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showRightButton ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Actual scroll container with improved scroll behavior */}
          <div 
            ref={scrollContainerRef} 
            className="flex overflow-x-auto py-4 px-6 scrollbar-hide scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              paddingBottom: '20px' // Extra padding to avoid clipping shadows
            }}
          >
            <div className="flex space-x-10 px-2">
              {categories.map(renderCategory)}
            </div>
          </div>
          
          {/* Scroll indicators - visual dots to show position */}
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: Math.min(5, Math.ceil(categories.length / 3)) }).map((_, index) => {
              const isActive = 
                scrollPosition >= (maxScroll * index / 4) && 
                scrollPosition < (maxScroll * (index + 1) / 4);
              
              return (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                ></div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Custom scrollbar styling */}
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Category;