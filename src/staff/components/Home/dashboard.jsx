import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUsers, 
  FaClipboardList, 
  FaChartBar, 
  FaCogs, 
  FaDollarSign,
  FaUtensils,
  FaShoppingCart,
  FaTag,
  FaUserCog,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaFilter
} from "react-icons/fa";
import {  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// API base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    canceled: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        let ordersData = [];
        try {
          const ordersResponse = await axios.get(`${API_BASE_URL}/api/order/get-all-orders`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          console.log('ordersResponse', ordersResponse);
          
          // Properly handle different response structures
          if (ordersResponse.data && ordersResponse.data.orders) {
            ordersData = ordersResponse.data.orders;
          } else if (Array.isArray(ordersResponse.data)) {
            ordersData = ordersResponse.data;
          } else {
            ordersData = [];
            console.warn("Orders data structure unexpected:", ordersResponse.data);
          }

          const ordersWithUsers = await Promise.all(
            ordersData.map(async (order) => {
              const userId = order?.cartData?.userId;
              const userData = await fetchUserData(userId);

              console.log('userData', userData)
              return {
                ...order,
                user: userData?.fullname
              };
            })
          );

          console.log('set ordersWithUsers', ordersWithUsers);
          
          setRecentOrders(ordersWithUsers);

          
          // Calculate order statistics - use optional chaining and nullish coalescing
          const stats = {
            total: ordersData?.length || 0,
            pending: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "PENDING")?.length || 0,
            completed: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "COMPLETED")?.length || 0,
            canceled: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "CANCELED")?.length || 0
          };
          setOrderStats(stats);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setRecentOrders([]);
        }
        
        // Fetch menu items
        let menuData = [];
        try {
          const menuResponse = await axios.get(`${API_BASE_URL}/api/staff/get-all-menu`);
          menuData = menuResponse.data || [];
          setMenuItems(Array.isArray(menuData) ? menuData : []);
        } catch (err) {
          console.error("Error fetching menu items:", err);
          setMenuItems([]);
        }
        
        // Fetch users
        try {
          const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          console.log('usersResponse', usersResponse);
          const userData = usersResponse.data.data || [];
          setUsers(Array.isArray(userData) ? userData : []);
        } catch (err) {
          console.error("Error fetching users:", err);
          setUsers([]);
        }
        
        // Fetch categories
        let categoriesData = [];
        try {
          const categoriesResponse = await axios.get(`${API_BASE_URL}/api/category/get-all-category`);
          if (categoriesResponse.data && categoriesResponse.data.categories) {
            categoriesData = categoriesResponse.data;
          } else if (Array.isArray(categoriesResponse.data)) {
            categoriesData = { categories: categoriesResponse.data };
          } else {
            categoriesData = { categories: [] };
          }
          setCategories(categoriesData);
        } catch (err) {
          console.error("Error fetching categories:", err);
          setCategories({ categories: [] });
        }
        
        // Fetch promo codes
        try {
          const promoResponse = await axios.get(`${API_BASE_URL}/api/adminpromo/get-all-code`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const promoData = promoResponse.data || [];
          setPromoCodes(Array.isArray(promoData) ? promoData : []);
        } catch (err) {
          console.error("Error fetching promo codes:", err);
          setPromoCodes([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchUserData = async (userId) => {
    const token = localStorage.getItem('token'); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      // Assume API response format: { success: true, data: { ...userData } }
      return data.success ? data.data : null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  // Function to calculate total sales from orders
  const calculateTotalSales = () => {
    console.log('recentOrders', recentOrders)
    if (!Array.isArray(recentOrders) || recentOrders.length === 0) return 0;
    
    return recentOrders.reduce((sum, order) => {
      if (!order) return sum;
      return sum + parseFloat(order.cartData.finalTotal || 0);
    }, 0).toFixed(2);
  };

  // Calculate percentage change (mock data for demonstration)
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Something went wrong!</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <p className="text-red-600 text-sm mt-2">Please check your connection and try refreshing the page.</p>
            </div>
          </div>
        </div>
      );
    }

    // Mock previous data for percentage calculations
    const prevSales = 12500;
    const prevOrders = orderStats.total - 5;
    const prevUsers = users.length - 3;
    const prevMenuItems = menuItems.length - 2;

    return (
      <>
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <FaDollarSign className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Total Sales</h2>
                  <p className="text-2xl font-bold text-gray-900">Rs.{calculateTotalSales()}</p>
                  <div className="flex items-center mt-1">
                    {/* <FaArrowUp className="text-green-500 text-sm mr-1" /> */}
                    <span className="text-green-600 text-sm font-medium">
                      {/* +{getPercentageChange(calculateTotalSales(), prevSales)}% */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <FaClipboardList className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Total Orders</h2>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                  <div className="flex items-center mt-1">
                    {/* <FaArrowUp className="text-blue-500 text-sm mr-1" /> */}
                    <span className="text-blue-600 text-sm font-medium">
                      {/* +{getPercentageChange(orderStats.total, prevOrders)}% */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Total Users</h2>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(users) ? users.length : 0}</p>
                  <div className="flex items-center mt-1">
                    {/* <FaArrowUp className="text-purple-500 text-sm mr-1" /> */}
                    <span className="text-purple-600 text-sm font-medium">
                      {/* +{getPercentageChange(users.length, prevUsers)}% */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <FaUtensils className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Menu Items</h2>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(menuItems) ? menuItems.length : 0}</p>
                  <div className="flex items-center mt-1">
                    {/* <FaArrowUp className="text-orange-500 text-sm mr-1" /> */}
                    <span className="text-orange-600 text-sm font-medium">
                      {/* +{getPercentageChange(menuItems.length, prevMenuItems)}% */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Pending Orders</h3>
                  <p className="text-2xl font-bold text-yellow-900">{orderStats.pending}</p>
                </div>
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <FaClipboardList className="text-yellow-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Processing</h3>
                  <p className="text-2xl font-bold text-blue-900">{orderStats.total - orderStats.pending - orderStats.completed - orderStats.canceled}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <FaCogs className="text-blue-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Completed</h3>
                  <p className="text-2xl font-bold text-green-900">{orderStats.completed}</p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <FaShoppingCart className="text-green-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-800">Cancelled</h3>
                  <p className="text-2xl font-bold text-red-900">{orderStats.canceled}</p>
                </div>
                <div className="p-2 bg-red-200 rounded-lg">
                  <FaExclamationTriangle className="text-red-700" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Status Chart */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: orderStats.pending || 0 },
                    { name: 'Processing', value: (orderStats.total - orderStats.pending - orderStats.completed - orderStats.canceled) || 0 },
                    { name: 'Completed', value: orderStats.completed || 0 },
                    { name: 'Cancelled', value: orderStats.canceled || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  <Cell fill="#EAB308" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#22C55E" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <button 
              onClick={() => setActiveTab("orders")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              View All Orders →
            </button>
          </div>
          {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 8).map((order, index) => order && (
                    <tr key={order._id || order.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-900">{order.user || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">Rs.{parseFloat(order.cartData.finalTotal || 0).toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          (order.orderStatus || "").toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                          (order.orderStatus || "").toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (order.orderStatus || "").toLowerCase() === 'canceled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.orderStatus || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FaClipboardList className="text-gray-300 text-4xl mb-4" />
              <p className="text-gray-500 text-lg">No orders available</p>
              <p className="text-gray-400 text-sm">Orders will appear here once customers start placing them</p>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render content for the Orders tab
  const renderOrdersContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading orders!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
        
        {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-900">Amount</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order, index) => order && (
                  <tr key={order._id || order.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{order.orderNumber || order._id?.slice(-8) || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{order.user || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-right font-medium">Rs.{parseFloat(order.cartData?.finalTotal || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        (order.orderStatus || "").toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                        (order.orderStatus || "").toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        (order.orderStatus || "").toLowerCase() === 'canceled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus || 'Processing'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing {recentOrders.length} orders</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Previous</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Next</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaClipboardList className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-xl">No orders available</p>
            <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start placing them</p>
          </div>
        )}
      </div>
    );
  };

  // Render content for the Menu tab
  const renderMenuContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading menu items...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading menu!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    const categoriesArray = categories?.categories || [];

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Categories</option>
              {Array.isArray(categoriesArray) && categoriesArray.map(cat => cat && (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
              <FaPlus className="mr-2" />
              Add Item
            </button>
          </div>
        </div>
        
        {Array.isArray(menuItems) && menuItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menuItems.map((item, index) => item && (
                  <tr key={item._id || item.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {item.image ? (
                          <img src={`${API_BASE_URL}/uploads/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaUtensils />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {getCategoryName(item.category, categoriesArray)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-right font-medium">Rs.{parseFloat(item.price || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaUtensils className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-xl">No menu items available</p>
            <p className="text-gray-400 text-sm mt-2">Start by adding your first menu item</p>
          </div>
        )}
      </div>
    );
  };

  // Helper function to get category name
  const getCategoryName = (categoryId, categoriesArray) => {
    if (!categoryId) return 'Uncategorized';
    if (!Array.isArray(categoriesArray)) return 'Uncategorized';
    
    const category = categoriesArray.find(cat => cat && cat._id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Render content for the Users tab
  const renderUsersContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading users...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading users!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
              <FaPlus className="mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        {Array.isArray(users) && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-900">Orders</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => user && (
                  <tr key={user._id || user.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{user.role || 'Customer'}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-right">{user.orders || 0}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaUsers className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-xl">No users available</p>
            <p className="text-gray-400 text-sm mt-2">Users will appear here once they register</p>
          </div>
        )}
      </div>
    );
  };

  // Render content for the Promo Codes tab
  const renderPromoCodesContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading promo codes...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading promo codes!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Promo Codes</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center">
            <FaPlus className="mr-2" />
            Add Promo Code
          </button>
        </div>
        
        {Array.isArray(promoCodes) && promoCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Code</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Discount</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Valid From</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Valid Until</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promoCodes.map((code, index) => code && (
                  <tr key={code._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-medium text-gray-900 bg-gray-50 rounded">{code.code}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {code.discountType === 'percentage' 
                        ? `${code.discountValue}%` 
                        : `${parseFloat(code.discountValue || 0).toFixed(2)}`}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {code.validFrom ? new Date(code.validFrom).toLocaleDateString() : 'Always'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        isPromoActive(code) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPromoActive(code) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaTag className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-xl">No promo codes available</p>
            <p className="text-gray-400 text-sm mt-2">Create your first promo code to attract customers</p>
          </div>
        )}
      </div>
    );
  };

  // Check if a promo code is active
  const isPromoActive = (promoCode) => {
    if (!promoCode) return false;
    
    const now = new Date();
    const validFrom = promoCode.validFrom ? new Date(promoCode.validFrom) : null;
    const validUntil = promoCode.validUntil ? new Date(promoCode.validUntil) : null;
    
    if (promoCode.isActive === false) return false;
    if (validFrom && now < validFrom) return false;
    if (validUntil && now > validUntil) return false;
    
    return true;
  };

  // Render content for the Reports tab
  const renderReportsContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading reports...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3 text-xl" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading reports!</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Total Sales</h3>
              <p className="text-3xl font-bold text-blue-900">Rs.{calculateTotalSales()}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-2">Average Order Value</h3>
              <p className="text-3xl font-bold text-green-900">
                Rs.{Array.isArray(recentOrders) && recentOrders.length ? 
                  (calculateTotalSales() / recentOrders.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold text-purple-900">
                {Array.isArray(users) && users.length && Array.isArray(recentOrders) && recentOrders.length ? 
                  `${((recentOrders.length / users.length) * 100).toFixed(1)}%` : 
                  '0%'}
              </p>

            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status Distribution</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                <p className="text-2xl font-bold text-yellow-900">{orderStats.pending}</p>
                <p className="text-xs text-yellow-700 mt-1">Awaiting processing</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Processing</h3>
                <p className="text-2xl font-bold text-blue-900">{orderStats.total - orderStats.pending - orderStats.completed - orderStats.canceled}</p>
                <p className="text-xs text-blue-700 mt-1">Being prepared</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Completed</h3>
                <p className="text-2xl font-bold text-green-900">{orderStats.completed}</p>
                <p className="text-xs text-green-700 mt-1">Successfully delivered</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-800">Canceled</h3>
                <p className="text-2xl font-bold text-red-900">{orderStats.canceled}</p>
                <p className="text-xs text-red-700 mt-1">Order canceled</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: orderStats.pending || 0 },
                    { name: 'Processing', value: (orderStats.total - orderStats.pending - orderStats.completed - orderStats.canceled) || 0 },
                    { name: 'Completed', value: orderStats.completed || 0 },
                    { name: 'Canceled', value: orderStats.canceled || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  <Cell fill="#EAB308" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#22C55E" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Menu Items</h2>
            
            {Array.isArray(menuItems) && menuItems.length > 0 ? (
              <div className="space-y-4">
                {menuItems.slice(0, 6).map((item, index) => item && (
                  <div key={item._id || item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3">
                          {item.image ? (
                            <img src={`${API_BASE_URL}/uploads/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaUtensils />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name || 'Unnamed Item'}</p>
                          <p className="text-sm text-gray-500">
                            {getCategoryName(item.category, categories?.categories || [])}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Rs.{parseFloat(item.price || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Price</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FaUtensils className="text-gray-300 text-4xl mb-4" />
                <p className="text-gray-500 text-lg">No menu items available</p>
                <p className="text-gray-400 text-sm">Add menu items to see analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render content for the Settings tab
  const renderSettingsContent = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cafe Name
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                defaultValue="Cafe Management System"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                defaultValue="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                defaultValue="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                defaultValue="123 Main Street, City"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto-approve new orders</p>
                <p className="text-sm text-gray-600">Automatically approve orders when they are placed</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={true}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-600">Send email notifications for new orders</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={false}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Order Status
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Khalti Payments</p>
                <p className="text-sm text-gray-600">Accept payments through Khalti digital wallet</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={true}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Cash on Delivery</p>
                <p className="text-sm text-gray-600">Allow customers to pay when order is delivered</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={true}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Credit Card Payments</p>
                <p className="text-sm text-gray-600">Accept credit and debit card payments</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={false}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Send SMS updates to customers</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={false}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Send push notifications to mobile app users</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={true}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Save Settings
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-blue-700">
          <h1 className="font-bold text-xl">Admin Panel</h1>
          <p className="text-blue-200 text-sm mt-1">Cafe Management</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "dashboard" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FaClipboardList className="mr-3 text-lg" />
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "users" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <FaUsers className="mr-3 text-lg" />
                <span className="font-medium">Users</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "orders" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                <FaShoppingCart className="mr-3 text-lg" />
                <span className="font-medium">Orders</span>
                {orderStats.pending > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {orderStats.pending}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "menu" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("menu")}
              >
                <FaUtensils className="mr-3 text-lg" />
                <span className="font-medium">Menu</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "promocodes" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("promocodes")}
              >
                <FaTag className="mr-3 text-lg" />
                <span className="font-medium">Promo Codes</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "reports" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <FaChartBar className="mr-3 text-lg" />
                <span className="font-medium">Reports</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === "settings" 
                    ? "bg-blue-700 shadow-md transform scale-105" 
                    : "hover:bg-blue-700 hover:transform hover:scale-105"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <FaCogs className="mr-3 text-lg" />
                <span className="font-medium">Settings</span>
              </button>
            </li>
          </ul>
        </nav>
        
        {/* User Info Section */}
        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
              <FaUserCog />
            </div>
            <div>
              <p className="font-medium text-sm">{localStorage.getItem('fullname') || 'Admin User'}</p>
              <p className="text-blue-200 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Enhanced Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'promocodes' ? 'Promo Codes' : activeTab}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === 'dashboard' && 'Overview of your cafe management system'}
                {activeTab === 'users' && 'Manage your customer and staff accounts'}
                {activeTab === 'orders' && 'Track and manage all customer orders'}
                {activeTab === 'menu' && 'Manage your cafe menu items and categories'}
                {activeTab === 'promocodes' && 'Create and manage promotional discount codes'}
                {activeTab === 'reports' && 'View detailed analytics and reports'}
                {activeTab === 'settings' && 'Configure your system preferences'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back!</p>
                <p className="font-medium text-gray-900">{localStorage.getItem('fullname') || 'Admin'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center shadow-md">
                <FaUserCog />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {activeTab === "dashboard" && renderDashboardContent()}
          {activeTab === "users" && renderUsersContent()}
          {activeTab === "orders" && renderOrdersContent()}
          {activeTab === "menu" && renderMenuContent()}
          {activeTab === "promocodes" && renderPromoCodesContent()}
          {activeTab === "reports" && renderReportsContent()}
          {activeTab === "settings" && renderSettingsContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;