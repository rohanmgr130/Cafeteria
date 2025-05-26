
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

function RewardPoints() {
  const [rewardItems, setRewardItems] = useState([])
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortOption, setSortOption] = useState('name-asc')
  const [isLoading, setIsLoading] = useState(true)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toggleLoading, setToggleLoading] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' })

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

  const fetchRewardItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/reward-point/get-all-rewards`)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      
      // Process data to ensure every item has required properties
      const processedData = data.map(item => {
        // Ensure category exists, default to "Uncategorized" if not set
        if (!item.categories) {
          return { ...item, categories: "Uncategorized" };
        }
        // Ensure isAvailable exists, default to true if not set
        if (item.isAvailable === undefined) {
          return { ...item, isAvailable: true };
        }
        return item;
      });
      
      setRewardItems(processedData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch reward items. Please try again later.')
      console.error('Error fetching reward items:', err)
      toast.error("Failed to fetch reward items")
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    fetchRewardItems()
    fetchCategories()
  }, [fetchRewardItems, fetchCategories])

  // Handle toggle availability
  const handleToggleAvailability = async (id, currentStatus) => {
    // Prevent multiple clicks
    if (toggleLoading[id]) return;
    
    // Set loading state for this specific item
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reward-point/toggle-availability/${id}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update availability');
      }
      
      const data = await response.json();
      
      // Update reward items locally without refetching
      setRewardItems(prevItems => 
        prevItems.map(item => 
          item._id === id 
            ? { ...item, isAvailable: data.isAvailable } 
            : item
        )
      );
      
      toast.success(data.message || `Item is now ${data.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error(`Failed to update availability: ${error.message}`);
    } finally {
      // Clear loading state for this item
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Delete confirmation functions
  const openDeleteConfirm = (id, title) => {
    setDeleteConfirm({ show: true, id, title })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ show: false, id: null, title: '' })
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reward-point/delete-reward/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      fetchRewardItems()
      toast.success("Reward item deleted successfully")
      setDeleteConfirm({ show: false, id: null, title: '' })
    } catch (err) {
      console.error('Error deleting reward item:', err)
      toast.error("Failed to delete reward item. Please try again.")
    }
  }

  const handleSort = (e) => setSortOption(e.target.value)
  const handleCategoryFilter = (e) => setCategoryFilter(e.target.value)
  const handleAvailabilityFilter = (e) => setAvailabilityFilter(e.target.value)
  const handleTypeFilter = (e) => setTypeFilter(e.target.value)

  const getSortedAndFilteredItems = () => {
    let filtered = [...rewardItems]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.categories === categoryFilter
      )
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
      const isAvailable = availabilityFilter === 'available';
      filtered = filtered.filter(item => item.isAvailable === isAvailable);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'points-asc':
        filtered.sort((a, b) => parseFloat(a.rewardPoints) - parseFloat(b.rewardPoints))
        break
      case 'points-desc':
        filtered.sort((a, b) => parseFloat(b.rewardPoints) - parseFloat(a.rewardPoints))
        break
      case 'category':
        filtered.sort((a, b) => (a.categories || '').localeCompare(b.categories || ''))
        break
      case 'available':
        filtered.sort((a, b) => {
          // Sort by availability (available first)
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return 0;
        })
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

  const formatPoints = (points) => {
    if (typeof points === 'number') return points
    if (!points) return 0
    return parseInt(points) || 0
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, availabilityFilter, typeFilter, sortOption])

  // Function to safely render category
  const renderCategory = (item) => {
    return item.categories || "Uncategorized";
  }

  return (
    <div className="ml-64 pt-20 px-6 md:px-11 bg-gray-50 min-h-screen w-full flex justify-center">  
      <div className="w-full max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reward Points Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your reward items here</p>
          </div>
          <div className="mt-3 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Link to='/staff-rewardpoints/add-reward'>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm">
                <span className="mr-1">+</span> Add New Reward
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-md mb-4 sticky top-20 z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="md:w-1/6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortOption}
                onChange={handleSort}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="points-asc">Points (Low to High)</option>
                <option value="points-desc">Points (High to Low)</option>
                <option value="category">Category</option>
                <option value="available">Availability</option>
              </select>
            </div>
            
            <div className="md:w-1/6">
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

            <div className="md:w-1/6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={handleTypeFilter}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
            
            <div className="md:w-1/6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={availabilityFilter}
                onChange={handleAvailabilityFilter}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
            
            <div className="md:w-2/6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search reward items..."
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
            <div className="text-center p-8 text-gray-500">No reward items found. Add your first reward item!</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-96 md:max-h-[calc(100vh-280px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-30 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                            {item.image ? (
                              <img 
                                src={`${API_BASE_URL}${item.image}`} 
                                alt={item.title} 
                                className={`h-full w-full object-cover ${!item.isAvailable ? 'filter grayscale' : ''}`}
                              />
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
                          <div className="text-sm text-gray-900 capitalize">{item.type}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPoints(item.rewardPoints)} pts</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                            disabled={toggleLoading[item._id]}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                              item.isAvailable 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } transition-colors`}
                          >
                            {toggleLoading[item._id] ? (
                              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                {item.isAvailable ? (
                                  <>
                                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span>Available</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                    <span>Unavailable</span>
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/staff-rewardpoints/edit-reward/${item._id}`}>
                              <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">Edit</button>
                            </Link>
                            <button
                              onClick={() => openDeleteConfirm(item._id, item.title)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<span className="font-medium">{deleteConfirm.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RewardPoints