import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { notifyOrderStatusUpdate } from '../../../services/notification.services'; 

function ViewOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  // Status configurations
  const statusConfig = {
    'Pending': { color: 'yellow' },
    'Preparing': { color: 'purple' },
    'Verified': { color: 'blue' },
    'Completed': { color: 'green' },
    'Cancelled': { color: 'red' }
  };

  // Fetch orders with debounced search
  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayedFetch);
  }, [searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/order/get-all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const processedOrders = await Promise.all(
          data.orders.map(async (order) => {
            let userData = null;
            
            if (order.cartData && order.cartData.userId) {
              userData = await fetchUserData(order.cartData.userId);
            }
            
            return {
              ...order,
              userData
            };
          })
        );
        
        setOrders(processedOrders);
        setCurrentPage(1); // Reset to first page when data changes
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  const canUpdateStatus = (currentStatus) => {
    return currentStatus.toLowerCase() !== 'cancelled' && currentStatus.toLowerCase() !== 'completed';
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const order = orders.find(order => order._id === orderId);
    
    if (!order || !canUpdateStatus(order.orderStatus)) {
      showNotification('This order cannot be updated', 'error');
      return;
    }
    
    // Get user ID from order
    const userId = order.cartData?.userId;
    if (!userId) {
      showNotification('User ID not found in order', 'error');
      return;
    }
    
    setIsUpdating(true);
    try {
      // Update order status in database
      const response = await fetch(`${API_BASE_URL}/api/order/update-order/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update order in the state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        // Update selected order if modal is open
        if (showModal && selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }

        // 🚀 SEND NOTIFICATION TO USER
        try {
          await notifyOrderStatusUpdate(userId, {
            orderId: orderId,
            status: newStatus,
            items: order.cartData?.items || [],
            total: order.cartData?.finalTotal || 0,
            userName: order.userData?.fullname || 'User'
          });

          // 🎁 GIVE REWARD POINTS FOR COMPLETED ORDERS
          if (newStatus.toLowerCase() === 'completed') {
            const orderTotal = order.cartData?.finalTotal || 0;
            const rewardPoints = Math.max(1, Math.floor(orderTotal / 100)); // 1 point per Rs 100, minimum 1 point
            
            try {
              // Create reward notification directly using Firebase
              const { ref, set, push } = await import('firebase/database');
              const { database } = await import('../../../services/firebase');
              
              const rewardNotificationData = {
                type: 'reward',
                userId,
                rewardType: "points",
                points: rewardPoints,
                message: `🎉 Order completed! You earned ${rewardPoints} reward points!`,
                details: {
                  rewardType: "points",
                  points: rewardPoints,
                  description: `Order completion reward for order ${orderId}`
                },
                userName: order.userData?.fullname || 'User',
                timestamp: Date.now(),
                read: false
              };

              const notifRef = ref(database, `notifications/user`);
              const newRef = push(notifRef);
              await set(newRef, rewardNotificationData);
              
              console.log(`✅ Reward notification sent: ${rewardPoints} points`);
              showNotification(`Order completed! User earned ${rewardPoints} reward points and was notified`, 'success');
            } catch (rewardError) {
              console.error('Error sending reward notification:', rewardError);
              showNotification(`Order completed and user notified, but reward notification failed`, 'error');
            }
          } else {
            console.log(`✅ Status update notification sent to user ${userId}`);
            showNotification(`Order status updated to ${newStatus} and user notified`, 'success');
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          showNotification(`Order status updated to ${newStatus} but user notification failed`, 'error');
        }
      } else {
        showNotification('Failed to update order status', 'error');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotification('Error updating order status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      setIsUpdating(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/order/delete/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setOrders(orders.filter(order => order._id !== orderId));
          
          if (showModal && selectedOrder && selectedOrder._id === orderId) {
            setShowModal(false);
          }
          
          showNotification('Order deleted successfully', 'success');
        } else {
          showNotification('Failed to delete order', 'error');
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        showNotification('Error deleting order', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Notification system
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 4000);
  };

  const getStatusBadgeClass = (status) => {
    const config = statusConfig[status];
    if (!config) return 'bg-gray-100 text-gray-800 border border-gray-200';
    
    const colorMap = {
      yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border border-blue-200',
      green: 'bg-green-100 text-green-800 border border-green-200',
      red: 'bg-red-100 text-red-800 border border-red-200'
    };
    
    return colorMap[config.color] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusButtonClass = (status, currentStatus) => {
    const isActive = status === currentStatus;
    const isDisabled = !canUpdateStatus(currentStatus);
    
    if (isDisabled) {
      return 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70';
    }
    
    const config = statusConfig[status];
    if (!config) return 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100';
    
    const colorMap = {
      yellow: isActive ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100',
      purple: isActive ? 'bg-purple-500 text-white shadow-md' : 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100',
      blue: isActive ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100',
      green: isActive ? 'bg-green-500 text-white shadow-md' : 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100',
      red: isActive ? 'bg-red-500 text-white shadow-md' : 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100'
    };
    
    return colorMap[config.color] || 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100';
  };

  const getPaymentMethodBadgeClass = (method) => {
    return method === 'khalti' 
      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
      : 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  };

  const formatItemsList = (items) => {
    if (!items || items.length === 0) return 'No items';
    
    const productNames = items
      .slice(0, 2)
      .map(item => {
        const name = item.productId?.name || 
                    item.product?.name || 
                    item.name || 
                    item.productName || 
                    item.productId?.title ||
                    (typeof item.productId === 'string' ? item.productId : null);
                    
        return name || 'Unknown Product';
      })
      .join(', ');
    
    return items.length > 2 
      ? `${productNames} and ${items.length - 2} more` 
      : productNames;
  };

  // Enhanced filtering and sorting
  const filteredAndSortedOrders = orders
    .filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) return false;
      
      // Date range filter
      if (dateRange !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
        
        switch (dateRange) {
          case 'today':
            if (daysDiff > 1) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }
      
      // Search filter
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const userName = order.userData?.fullname || '';
      const items = order.cartData?.items || [];
      const itemNames = items.map(item => item.productId?.name || '').join(' ');
      
      return userName.toLowerCase().includes(searchLower) || 
             itemNames.toLowerCase().includes(searchLower) ||
             order._id.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high':
          return (b.cartData?.finalTotal || 0) - (a.cartData?.finalTotal || 0);
        case 'amount-low':
          return (a.cartData?.finalTotal || 0) - (b.cartData?.finalTotal || 0);
        case 'status':
          return a.orderStatus.localeCompare(b.orderStatus);
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'Pending').length,
    preparing: orders.filter(o => o.orderStatus === 'Preparing').length,
    completed: orders.filter(o => o.orderStatus === 'Completed').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    totalRevenue: orders
      .filter(o => o.orderStatus === 'Completed')
      .reduce((sum, o) => sum + (o.cartData?.finalTotal || 0), 0)
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          buttons.push(i);
        }
        buttons.push('...');
        buttons.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1);
        buttons.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          buttons.push(i);
        }
      } else {
        buttons.push(1);
        buttons.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(i);
        }
        buttons.push('...');
        buttons.push(totalPages);
      }
    }
    
    return buttons;
  };

  return (
    <div className="ml-64 px-6 py-6 bg-gray-50 min-h-screen">
      {/* Enhanced Notification */}
      {notification.visible && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-3 ${
            notification.type === 'success' ? 'bg-green-400' :
            notification.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
          }`}></div>
          {notification.message}
          <button 
            onClick={() => setNotification({...notification, visible: false})}
            className="ml-4 text-gray-500 hover:text-gray-700 text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Track and manage all customer orders</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Preparing</p>
                <p className="text-2xl font-bold text-purple-600">{orderStats.preparing}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-bold text-green-600">Rs {orderStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-full">
        {/* Enhanced Header Section */}
        <div className="border-b border-gray-200 p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by customer name, order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Filters and Sort */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    statusFilter === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Orders
                </button>
                
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                      statusFilter === status 
                        ? `bg-${config.color}-600 text-white shadow-md` 
                        : `bg-${config.color}-50 text-${config.color}-700 hover:bg-${config.color}-100 border border-${config.color}-200`
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="status">Status</option>
              </select>
              
              {/* Clear Filters */}
              {(statusFilter !== 'all' || searchTerm || dateRange !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-96 bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start">
            <div>
              <p className="font-semibold text-lg">{error}</p>
              <p className="text-sm mt-1">Please try refreshing the page or check your internet connection.</p>
              <button 
                onClick={fetchOrders}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <>
            {filteredAndSortedOrders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 border-t border-gray-100">
                <div className="mx-auto max-w-md p-6">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? "No orders match your search criteria." 
                      : statusFilter !== 'all'
                        ? `No orders with "${statusFilter}" status found.`
                        : "There are no orders in the system yet."}
                  </p>
                  {(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                          Customer
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                          Items
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                          Date & Time
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/8">
                          Total Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/12">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/12">
                          Payment
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/8">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => {
                        const userName = order.userData?.fullname || 'Unknown User';
                        const formattedDate = order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A';
                        const formattedTime = order.createdAt ? format(new Date(order.createdAt), 'h:mm a') : 'N/A';
                        const items = order.cartData?.items || [];

                        return (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                  <span className="text-blue-600 font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium truncate">{formatItemsList(items)}</div>
                                <div className="text-xs text-gray-500">
                                  {items.length} {items.length === 1 ? 'item' : 'items'}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">{formattedDate}</div>
                                <div className="text-xs text-gray-500">{formattedTime}</div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-sm font-bold text-gray-900">
                                Rs {(order.cartData?.finalTotal || 0).toLocaleString()}
                              </div>
                              {order.cartData?.discount > 0 && (
                                <div className="text-xs text-green-600">
                                  Saved Rs {order.cartData.discount}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getPaymentMethodBadgeClass(order.orderMethod)}`}>
                                {order.orderMethod === 'khalti' ? 'Khalti' : 'COD'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => viewOrderDetails(order)}
                                  className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs rounded hover:bg-blue-50 transition-colors"
                                  title="View Details"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="text-red-600 hover:text-red-800 px-2 py-1 text-xs rounded hover:bg-red-50 transition-colors"
                                  title="Delete Order"
                                  disabled={isUpdating}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{startIndex + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(endIndex, filteredAndSortedOrders.length)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{filteredAndSortedOrders.length}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {getPaginationButtons().map((button, index) => {
                            if (button === '...') {
                              return (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              );
                            }
                            
                            return (
                              <button
                                key={button}
                                onClick={() => handlePageChange(button)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === button
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {button}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order count summary without pagination */}
                {totalPages <= 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{filteredAndSortedOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
                      {statusFilter !== 'all' && (
                        <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {statusFilter} only
                        </span>
                      )}
                    </div>
                    
                    {filteredAndSortedOrders.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Total value: <span className="font-semibold text-green-600">
                          Rs {filteredAndSortedOrders.reduce((sum, order) => sum + (order.cartData?.finalTotal || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Enhanced Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg">📦</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                    <p className="text-sm text-gray-500">Order ID: {selectedOrder._id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* Order Status Banner */}
                <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                  selectedOrder.orderStatus === 'Completed' ? 'bg-green-50 border-green-400' :
                  selectedOrder.orderStatus === 'Cancelled' ? 'bg-red-50 border-red-400' :
                  selectedOrder.orderStatus === 'Pending' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order Status: {selectedOrder.orderStatus}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.createdAt 
                            ? `Placed on ${format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')}` 
                            : 'Date not available'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        Rs {(selectedOrder.cartData?.finalTotal || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Order Information Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Order Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedOrder._id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="text-gray-900 font-medium">
                          {selectedOrder.createdAt 
                            ? format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy h:mm a') 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentMethodBadgeClass(selectedOrder.orderMethod)}`}>
                          {selectedOrder.orderMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
                        </span>
                      </div>
                      {selectedOrder.khaltiPayment && selectedOrder.orderMethod === 'khalti' && (
                        <>
                          <div className="flex justify-between items-center py-2 border-t border-blue-200">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className="text-gray-900 font-medium">{selectedOrder.khaltiPayment.status}</span>
                          </div>
                          {selectedOrder.khaltiPayment.pidx && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedOrder.khaltiPayment.pidx}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Customer Information Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold text-gray-900">{selectedOrder.userData?.fullname || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedOrder.cartData?.userId || 'N/A'}</span>
                      </div>
                      {selectedOrder.additionalInfo?.notes && (
                        <div className="border-t border-green-200 pt-4">
                          <p className="text-gray-600 mb-2 font-medium">Customer Notes:</p>
                          <p className="text-gray-900 italic bg-white p-3 rounded-lg border">{selectedOrder.additionalInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Order Items ({selectedOrder.cartData?.items?.length || 0})
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.cartData?.items.map((item, index) => {
                            const productName = item.productId?.name || 
                                              item.product?.name || 
                                              item.name || 
                                              item.productName || 
                                              item.productId?.title || 
                                              (typeof item.productId === 'string' ? item.productId : 'Unknown Product');
                                              
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">{productName}</div>
                                      {item.productId?.description && (
                                        <div className="text-xs text-gray-500 mt-1">{item.productId.description}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                                    {item.productQuantity || 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-medium text-gray-900">
                                    Rs {(item.price || 0).toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-bold text-gray-900">
                                    Rs {(item.total || (item.price * (item.productQuantity || 1))).toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                              Subtotal:
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                              Rs {(selectedOrder.cartData?.orderTotal || 0).toLocaleString()}
                            </td>
                          </tr>
                          {selectedOrder.cartData?.discount > 0 && (
                            <tr>
                              <td colSpan="3" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                Discount:
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                                - Rs {(selectedOrder.cartData?.discount || 0).toLocaleString()}
                              </td>
                            </tr>
                          )}
                          <tr className="border-t-2 border-gray-300">
                            <td colSpan="3" className="px-6 py-4 text-right text-base font-bold text-gray-900">
                              Total Amount:
                            </td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-green-600">
                              Rs {(selectedOrder.cartData?.finalTotal || 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* Status Update Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="w-full lg:w-auto">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Order Status</h3>
                      {!canUpdateStatus(selectedOrder.orderStatus) && (
                        <div className="flex items-center mb-4 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                          <span className="mr-3 text-amber-600 text-lg">🔒</span>
                          <div>
                            <p className="font-semibold">Status Locked</p>
                            <p className="text-sm">Status cannot be changed for {selectedOrder.orderStatus.toLowerCase()} orders</p>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <button 
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg font-semibold transition-all ${getStatusButtonClass(status, selectedOrder.orderStatus)}`}
                            disabled={isUpdating || !canUpdateStatus(selectedOrder.orderStatus)}
                          >
                            {status}
                            {isUpdating && status === selectedOrder.orderStatus && (
                              <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(selectedOrder._id)}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center font-medium disabled:opacity-70"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Deleting...' : 'Delete Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewOrder;