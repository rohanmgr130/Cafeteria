// import React, { useState, useEffect, useCallback } from 'react'
// import { Link } from 'react-router-dom'
// import axios from 'axios'
// import { toast } from 'react-toastify' // Assuming you're using react-toastify for notifications

// function MenuManage() {
//   const [menuItems, setMenuItems] = useState([])
//   const [categories, setCategories] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [categoryFilter, setCategoryFilter] = useState('all')
//   const [sortOption, setSortOption] = useState('name-asc')
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchLoading, setFetchLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const API_BASE_URL = 'http://localhost:4000'
//   const itemsPerPage = 5

//   // Fetch categories with error handling and retry
//   const fetchCategories = useCallback(async (retry = true) => {
//     setFetchLoading(true)
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/category/get-all-category`)
//       setCategories(res.data.categories || [])
//     } catch (err) {
//       console.error("Failed to load categories", err)
//       toast.error("Failed to load categories")
      
//       // Auto retry once after 2 seconds in case of network error
//       if (retry) {
//         setTimeout(() => fetchCategories(false), 2000)
//       }
//     } finally {
//       setFetchLoading(false)
//     }
//   }, [API_BASE_URL])

//   const fetchMenuItems = useCallback(async () => {
//     try {
//       setIsLoading(true)
//       const response = await fetch(`${API_BASE_URL}/api/staff/get-all-menu`)
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
//       const data = await response.json()
      
//       // Process data to ensure every item has a category property
//       const processedData = data.map(item => {
//         // If item has categories (plural) but not category (singular),
//         // extract the first category or use "Uncategorized"
//         if (item.categories && !item.category) {
//           // If categories is an array, use the first item
//           if (Array.isArray(item.categories) && item.categories.length > 0) {
//             return { ...item, category: item.categories[0] };
//           }
//           // If categories is a string, use that
//           else if (typeof item.categories === 'string') {
//             return { ...item, category: item.categories };
//           }
//           // Otherwise, set a default
//           else {
//             return { ...item, category: "Uncategorized" };
//           }
//         }
//         // Ensure category exists, even if empty
//         else if (!item.category) {
//           return { ...item, category: "Uncategorized" };
//         }
//         return item;
//       });
      
//       setMenuItems(processedData)
//       setError(null)
//     } catch (err) {
//       setError('Failed to fetch menu items. Please try again later.')
//       console.error('Error fetching menu items:', err)
//       toast.error("Failed to fetch menu items")
//     } finally {
//       setIsLoading(false)
//     }
//   }, [API_BASE_URL])

//   useEffect(() => {
//     fetchMenuItems()
//     fetchCategories()
//   }, [fetchMenuItems, fetchCategories])

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this item?')) {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/staff/delete-menu/${id}`, {
//           method: 'DELETE'
//         })
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
//         fetchMenuItems()
//         toast.success("Menu item deleted successfully")
//       } catch (err) {
//         console.error('Error deleting menu item:', err)
//         toast.error("Failed to delete menu item. Please try again.")
//       }
//     }
//   }

//   const handleSort = (e) => setSortOption(e.target.value)
//   const handleCategoryFilter = (e) => setCategoryFilter(e.target.value)

//   const getSortedAndFilteredItems = () => {
//     let filtered = [...menuItems]
    
//     // Apply search filter
//     if (searchTerm) {
//       filtered = filtered.filter(item =>
//         item.title.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }
    
//     // Apply category filter
//     if (categoryFilter !== 'all') {
//       filtered = filtered.filter(item => 
//         item.category === categoryFilter
//       )
//     }

//     // Apply sorting
//     switch (sortOption) {
//       case 'name-asc':
//         filtered.sort((a, b) => a.title.localeCompare(b.title))
//         break
//       case 'name-desc':
//         filtered.sort((a, b) => b.title.localeCompare(a.title))
//         break
//       case 'price-asc':
//         filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
//         break
//       case 'price-desc':
//         filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
//         break
//       case 'category':
//         filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
//         break
//       default:
//         break
//     }

//     return filtered
//   }

//   const totalPages = Math.ceil(getSortedAndFilteredItems().length / itemsPerPage)
//   const paginatedItems = getSortedAndFilteredItems().slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   )

//   const formatPrice = (price) => {
//     if (typeof price === 'number') return price.toFixed(2)
//     if (!price) return '0.00'
//     return parseFloat(price).toFixed(2)
//   }

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [searchTerm, categoryFilter, sortOption])

//   // Function to safely render category
//   const renderCategory = (item) => {
//     return item.category || "Uncategorized";
//   }

//   return (
//     <div className="ml-64 pt-20 px-6 left md:px-11 bg-gray-50 min-h-screen w-full flex justify-center">  
//       <div className="w-full p max-w-screen-lg">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
//           <div>
//             <h1 className="text-xl md:text-2xl font-bold text-gray-800">Menu Management</h1>
//             <p className="text-sm text-gray-600 mt-1">Manage your menu items here</p>
//           </div>
//           <div className="mt-3 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
//             <Link to='/staff-menu/add-menu'>
//               <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm">
//                 <span className="mr-1">+</span> Add New Menu
//               </button>
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white p-3 rounded-lg shadow-md mb-4 sticky top-20 z-10">
//           <div className="flex flex-col md:flex-row gap-3">
//             <div className="md:w-1/4">
//               <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
//               <select
//                 value={sortOption}
//                 onChange={handleSort}
//                 className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
//               >
//                 <option value="name-asc">Name (A-Z)</option>
//                 <option value="name-desc">Name (Z-A)</option>
//                 <option value="price-asc">Price (Low to High)</option>
//                 <option value="price-desc">Price (High to Low)</option>
//                 <option value="category">Category</option>
//               </select>
//             </div>
            
//             <div className="md:w-1/4">
//               <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
//               <select
//                 value={categoryFilter}
//                 onChange={handleCategoryFilter}
//                 className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 disabled={fetchLoading}
//               >
//                 <option value="all">All Categories</option>
//                 {categories.map((category, index) => (
//                   <option key={index} value={category.name || category}>
//                     {category.name || category}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="md:w-2/4">
//               <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
//               <input
//                 type="text"
//                 placeholder="Search menu items..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md flex flex-col flex-grow overflow-hidden">
//           {isLoading ? (
//             <div className="flex items-center justify-center p-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//             </div>
//           ) : error ? (
//             <div className="text-center p-8 text-red-500">{error}</div>
//           ) : getSortedAndFilteredItems().length === 0 ? (
//             <div className="text-center p-8 text-gray-500">No menu items found. Add your first menu item!</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <div className="overflow-y-auto max-h-96 md:max-h-[calc(100vh-280px)]">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-30 z-10">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {paginatedItems.map((item) => (
//                       <tr key={item._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
//                             {item.image ? (
//                               <img src={`http://localhost:4000${item.image}`} alt={item.title} className="h-full w-full object-cover" />
//                             ) : (
//                               <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">No IMG</div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{item.title}</div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{renderCategory(item)}</div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">Rs {formatPrice(item.price)}</div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
//                           <Link to={'/staff-menu/edit-menu/:id'}>
//                             <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200">Edit</button>
//                           </Link>
//                           <button
//                             onClick={() => handleDelete(item._id)}
//                             className="text-red-600 hover:text-red-800 transition-colors duration-200"
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {!isLoading && !error && totalPages > 1 && (
//             <div className="bg-white px-4 py-3 border-t border-gray-200 sticky bottom-0">
//               <div className="flex items-center justify-center">
//                 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//                   <button
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 text-sm font-medium ${
//                       currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
//                     }`}
//                   >
//                     &lt;
//                   </button>
//                   {[...Array(Math.min(totalPages, 5))].map((_, i) => {
//                     let pageNum
//                     if (totalPages <= 5) {
//                       pageNum = i + 1
//                     } else if (currentPage <= 3) {
//                       pageNum = i + 1
//                     } else if (currentPage >= totalPages - 2) {
//                       pageNum = totalPages - 4 + i
//                     } else {
//                       pageNum = currentPage - 2 + i
//                     }

//                     return (
//                       <button
//                         key={i}
//                         onClick={() => setCurrentPage(pageNum)}
//                         className={`relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium ${
//                           currentPage === pageNum
//                             ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
//                             : 'bg-white text-gray-500 hover:bg-gray-50'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     )
//                   })}
//                   <button
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 text-sm font-medium ${
//                       currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
//                     }`}
//                   >
//                     &gt;
//                   </button>
//                 </nav>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MenuManage




import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify' // Assuming you're using react-toastify for notifications

function MenuManage() {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState('name-asc')
  const [isLoading, setIsLoading] = useState(true)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  console.log(API_BASE_URL)
  const itemsPerPage = 5

  // Fetch categories with error handling and retry
  const fetchCategories = useCallback(async (retry = true) => {
    setFetchLoading(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/get-all-category`)
      setCategories(res.data.categories || [])
    } catch (err) {
      console.error("Failed to load categories", err)
      toast.error("Failed to load categories")
      
      // Auto retry once after 2 seconds in case of network error
      if (retry) {
        setTimeout(() => fetchCategories(false), 2000)
      }
    } finally {
      setFetchLoading(false)
    }
  }, [API_BASE_URL])

  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/staff/get-all-menu`)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      
      // Process data to ensure every item has a category property
      const processedData = data.map(item => {
        // If item has categories (plural) but not category (singular),
        // extract the first category or use "Uncategorized"
        if (item.categories && !item.category) {
          // If categories is an array, use the first item
          if (Array.isArray(item.categories) && item.categories.length > 0) {
            return { ...item, category: item.categories[0] };
          }
          // If categories is a string, use that
          else if (typeof item.categories === 'string') {
            return { ...item, category: item.categories };
          }
          // Otherwise, set a default
          else {
            return { ...item, category: "Uncategorized" };
          }
        }
        // Ensure category exists, even if empty
        else if (!item.category) {
          return { ...item, category: "Uncategorized" };
        }
        return item;
      });
      
      setMenuItems(processedData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch menu items. Please try again later.')
      console.error('Error fetching menu items:', err)
      toast.error("Failed to fetch menu items")
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [fetchMenuItems, fetchCategories])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/staff/delete-menu/${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        fetchMenuItems()
        toast.success("Menu item deleted successfully")
      } catch (err) {
        console.error('Error deleting menu item:', err)
        toast.error("Failed to delete menu item. Please try again.")
      }
    }
  }

  const handleSort = (e) => setSortOption(e.target.value)
  const handleCategoryFilter = (e) => setCategoryFilter(e.target.value)

  const getSortedAndFilteredItems = () => {
    let filtered = [...menuItems]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category === categoryFilter
      )
    }

    // Apply sorting
    switch (sortOption) {
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'category':
        filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
        break
      default:
        break
    }

    return filtered
  }

  const totalPages = Math.ceil(getSortedAndFilteredItems().length / itemsPerPage)
  const paginatedItems = getSortedAndFilteredItems().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatPrice = (price) => {
    if (typeof price === 'number') return price.toFixed(2)
    if (!price) return '0.00'
    return parseFloat(price).toFixed(2)
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, sortOption])

  // Function to safely render category
  const renderCategory = (item) => {
    return item.category || "Uncategorized";
  }

  return (
    <div className="ml-64 pt-20 px-6 left md:px-11 bg-gray-50 min-h-screen w-full flex justify-center">  
      <div className="w-full p max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Menu Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your menu items here</p>
          </div>
          <div className="mt-3 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Link to='/staff-menu/add-menu'>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm">
                <span className="mr-1">+</span> Add New Menu
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-md mb-4 sticky top-20 z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="md:w-1/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortOption}
                onChange={handleSort}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="category">Category</option>
              </select>
            </div>
            
            <div className="md:w-1/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={handleCategoryFilter}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={fetchLoading}
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.name || category}>
                    {category.name || category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:w-2/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md flex flex-col flex-grow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : getSortedAndFilteredItems().length === 0 ? (
            <div className="text-center p-8 text-gray-500">No menu items found. Add your first menu item!</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-96 md:max-h-[calc(100vh-280px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-30 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                            {item.image ? (
                              <img src={`${API_BASE_URL}${item.image}`} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">No IMG</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{renderCategory(item)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs {formatPrice(item.price)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <Link to={`/staff-menu/edit-menu/${item._id}`}>
                            <button className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200">Edit</button>
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sticky bottom-0">
              <div className="flex items-center justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &lt;
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &gt;
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuManage