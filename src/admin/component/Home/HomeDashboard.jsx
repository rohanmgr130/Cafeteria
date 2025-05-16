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
  FaExclamationTriangle
} from "react-icons/fa";
import { HiOutlineSearch } from "react-icons/hi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// API base URL - replace with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const AdminDashboard = () => {
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
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

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
          
          // Properly handle different response structures
          if (ordersResponse.data && ordersResponse.data.orders) {
            ordersData = ordersResponse.data.orders;
          } else if (Array.isArray(ordersResponse.data)) {
            ordersData = ordersResponse.data;
          } else {
            ordersData = [];
            console.warn("Orders data structure unexpected:", ordersResponse.data);
          }
          
          setRecentOrders(ordersData);
          
          // Calculate order statistics - use optional chaining and nullish coalescing
          const stats = {
            total: ordersData?.length || 0,
            pending: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "PENDING")?.length || 0,
            completed: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "COMPLETED")?.length || 0,
            canceled: ordersData?.filter(order => (order?.orderStatus || "").toUpperCase() === "CANCELED")?.length || 0
          };
          setOrderStats(stats);
          
          // Generate sales data from orders
          generateSalesData({orders: ordersData});
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
          const userData = usersResponse.data || [];
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
          
          // Generate category data with menu items that were fetched
          generateCategoryData(menuData, categoriesData);
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
  
  // Generate sales data from orders
  const generateSalesData = (ordersObj) => {
    // Ensure orders is an array
    const orders = ordersObj?.orders || [];
    
    // Get orders from last 5 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // Initialize data for last 5 months
    const data = [];
    for (let i = 4; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      data.push({
        name: months[monthIndex],
        sales: 0
      });
    }
    
    // Populate with real data if orders exists and is an array
    if (Array.isArray(orders)) {
      orders.forEach(order => {
        if (!order) return;
        
        const orderDate = new Date(order.createdAt || order.date || Date.now());
        const orderMonth = orderDate.getMonth();
        const monthName = months[orderMonth];
        
        // If order is from last 5 months, add to appropriate month
        const monthData = data.find(m => m.name === monthName);
        if (monthData) {
          monthData.sales += parseFloat(order.total || 0);
        }
      });
    }
    
    setSalesData(data);
  };
  
  // Generate category data
  const generateCategoryData = (menuItems, categories) => {
    const catData = [];
    const categoryMap = {};
    
    // Create a map of category ids to names - ensure categories.categories exists
    if (categories?.categories && Array.isArray(categories.categories)) {
      categories.categories.forEach(cat => {
        if (cat && cat._id) {
          categoryMap[cat._id] = cat.name || 'Unknown';
        }
      });
    }
    
    // Count items per category - ensure menuItems is an array
    if (Array.isArray(menuItems)) {
      menuItems.forEach(item => {
        if (!item) return;
        
        const catName = item.category ? (categoryMap[item.category] || 'Other') : 'Other';
        
        const existingCat = catData.find(c => c.name === catName);
        if (existingCat) {
          existingCat.value++;
        } else {
          catData.push({
            name: catName,
            value: 1
          });
        }
      });
    }
    
    setCategoryData(catData);
  };

  // Function to calculate total sales from orders
  const calculateTotalSales = () => {
    if (!Array.isArray(recentOrders) || recentOrders.length === 0) return 0;
    
    return recentOrders.reduce((sum, order) => {
      if (!order) return sum;
      return sum + parseFloat(order.total || 0);
    }, 0).toFixed(2);
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <p className="mt-2">Please check your connection and try again.</p>
        </div>
      );
    }

    return (
      <>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded shadow flex items-center">
            <FaDollarSign className="text-green-500 text-3xl mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Sales</h2>
              <p className="text-2xl font-bold mt-2">${calculateTotalSales()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center">
            <FaClipboardList className="text-orange-500 text-3xl mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-500">Orders</h2>
              <p className="text-2xl font-bold mt-2">{orderStats.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center">
            <FaUsers className="text-purple-500 text-3xl mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
              <p className="text-2xl font-bold mt-2">{Array.isArray(users) ? users.length : 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center">
            <FaUtensils className="text-blue-500 text-3xl mr-4" />
            <div>
              <h2 className="text-sm font-medium text-gray-500">Menu Items</h2>
              <p className="text-2xl font-bold mt-2">{Array.isArray(menuItems) ? menuItems.length : 0}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Monthly Sales</h2>
            {Array.isArray(salesData) && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Menu Categories</h2>
            {Array.isArray(categoryData) && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Order ID</th>
                    <th className="py-3 px-6 text-left">Customer</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {recentOrders.slice(0, 5).map((order, index) => order && (
                    <tr key={order._id || order.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{order.orderNumber || order._id || 'N/A'}</td>
                      <td className="py-3 px-6 text-left">{order.userName || (order.user && order.user.name) || 'N/A'}</td>
                      <td className="py-3 px-6 text-left">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-right">${parseFloat(order.total || 0).toFixed(2)}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          (order.orderStatus || "").toLowerCase() === 'completed' ? 'bg-green-200 text-green-800' :
                          (order.orderStatus || "").toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          (order.orderStatus || "").toLowerCase() === 'canceled' ? 'bg-red-200 text-red-800' :
                          'bg-blue-200 text-blue-800'
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
            <div className="flex justify-center items-center h-16">
              <p className="text-gray-500">No orders available</p>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">All Orders</h2>
          <div className="flex space-x-2">
            <select className="border rounded-lg px-3 py-1">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
            <div className="relative">
              <input type="text" placeholder="Search orders..." className="border rounded-lg pl-8 pr-3 py-1" />
              <HiOutlineSearch className="absolute left-2 top-2 text-gray-500" />
            </div>
          </div>
        </div>
        
        {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Order ID</th>
                  <th className="py-3 px-6 text-left">Customer</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {recentOrders.map((order, index) => order && (
                  <tr key={order._id || order.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{order.orderNumber || order._id || 'N/A'}</td>
                    <td className="py-3 px-6 text-left">{order.userName || (order.user && order.user.name) || 'N/A'}</td>
                    <td className="py-3 px-6 text-left">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-right">${parseFloat(order.total || 0).toFixed(2)}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (order.orderStatus || "").toLowerCase() === 'completed' ? 'bg-green-200 text-green-800' :
                        (order.orderStatus || "").toLowerCase() === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        (order.orderStatus || "").toLowerCase() === 'canceled' ? 'bg-red-200 text-red-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {order.orderStatus || 'Processing'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">Showing {recentOrders.length} orders</p>
              <div className="flex">
                <button className="px-3 py-1 border rounded mr-2 text-sm">Previous</button>
                <button className="px-3 py-1 border rounded text-sm bg-blue-900 text-white">Next</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No orders available</p>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading menu items...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      );
    }

    const categoriesArray = categories?.categories || [];

    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Menu Items</h2>
          <div className="flex space-x-2">
            <select className="border rounded-lg px-3 py-1">
              <option value="all">All Categories</option>
              {Array.isArray(categoriesArray) && categoriesArray.map(cat => cat && (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <button className="bg-blue-900 text-white px-4 py-1 rounded-lg flex items-center">
              <span className="mr-1">+</span> Add Item
            </button>
          </div>
        </div>
        
        {Array.isArray(menuItems) && menuItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-right">Price</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {menuItems.map((item, index) => item && (
                  <tr key={item._id || item.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img src={`${API_BASE_URL}/uploads/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">
                      {getCategoryName(item.category, categoriesArray)}
                    </td>
                    <td className="py-3 px-6 text-right">${parseFloat(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.inStock ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No menu items available</p>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">User Management</h2>
          <div className="flex space-x-2">
            <select className="border rounded-lg px-3 py-1">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <button className="bg-blue-900 text-white px-4 py-1 rounded-lg flex items-center">
              <span className="mr-1">+</span> Add User
            </button>
          </div>
        </div>
        
        {Array.isArray(users) && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Role</th>
                  <th className="py-3 px-6 text-right">Orders</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {users.map((user, index) => user && (
                  <tr key={user._id || user.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</td>
                    <td className="py-3 px-6 text-left">{user.email}</td>
                    <td className="py-3 px-6 text-left">{user.role || 'Customer'}</td>
                    <td className="py-3 px-6 text-right">{user.orders || 0}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive !== false ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No users available</p>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading promo codes...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Promo Codes</h2>
          <button className="bg-blue-900 text-white px-4 py-1 rounded-lg flex items-center">
            <span className="mr-1">+</span> Add Promo Code
          </button>
        </div>
        
        {Array.isArray(promoCodes) && promoCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Code</th>
                  <th className="py-3 px-6 text-left">Discount</th>
                  <th className="py-3 px-6 text-left">Valid From</th>
                  <th className="py-3 px-6 text-left">Valid Until</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {promoCodes.map((code, index) => code && (
                  <tr key={code._id || index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left font-medium">{code.code}</td>
                    <td className="py-3 px-6 text-left">
                      {code.discountType === 'percentage' 
                        ? `${code.discountValue}%` 
                        : `$${parseFloat(code.discountValue || 0).toFixed(2)}`}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {code.validFrom ? new Date(code.validFrom).toLocaleDateString() : 'Always'}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isPromoActive(code) ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {isPromoActive(code) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <div className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No promo codes available</p>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-4"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm text-gray-500">Total Sales</h3>
              <p className="text-2xl font-bold">${calculateTotalSales()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm text-gray-500">Average Order Value</h3>
              <p className="text-2xl font-bold">
                ${Array.isArray(recentOrders) && recentOrders.length ? 
                  (calculateTotalSales() / recentOrders.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold">
                {Array.isArray(users) && users.length && Array.isArray(recentOrders) && recentOrders.length ? 
                  `${((recentOrders.length / users.length) * 100).toFixed(1)}%` : 
                  '0%'}
              </p>
            </div>
          </div>
          
          {Array.isArray(salesData) && salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" name="Monthly Sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 p-3 rounded">
                <h3 className="text-sm text-gray-500">Pending</h3>
                <p className="text-xl font-bold">{orderStats.pending}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="text-sm text-gray-500">Processing</h3>
                <p className="text-xl font-bold">{orderStats.total - orderStats.pending - orderStats.completed - orderStats.canceled}</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <h3 className="text-sm text-gray-500">Completed</h3>
                <p className="text-xl font-bold">{orderStats.completed}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h3 className="text-sm text-gray-500">Canceled</h3>
                <p className="text-xl font-bold">{orderStats.canceled}</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
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
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Top Menu Items</h2>
            
            {Array.isArray(menuItems) && menuItems.length > 0 ? (
              <div className="space-y-3">
                {menuItems.slice(0, 5).map((item, index) => item && (
                  <div key={item._id || item.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name || 'Unnamed Item'}</p>
                        <p className="text-xs text-gray-500">
                          {getCategoryName(item.category, categories?.categories || [])}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">${parseFloat(item.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No menu items available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render content for the Settings tab
  const renderSettingsContent = () => (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-6">System Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium mb-3">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Cafe Name
              </label>
              <input 
                type="text" 
                className="border rounded-lg px-3 py-2 w-full max-w-md" 
                defaultValue="Cafe Management System"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Contact Email
              </label>
              <input 
                type="email" 
                className="border rounded-lg px-3 py-2 w-full max-w-md" 
                defaultValue="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number
              </label>
              <input 
                type="text" 
                className="border rounded-lg px-3 py-2 w-full max-w-md" 
                defaultValue="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-3">Order Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="autoApproveOrders" 
                className="mr-2"
                defaultChecked={true}
              />
              <label htmlFor="autoApproveOrders" className="text-gray-700 text-sm">
                Auto-approve new orders
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Default Order Status
              </label>
              <select className="border rounded-lg px-3 py-2 w-full max-w-md">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-3">Payment Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="enableKhalti" 
                className="mr-2"
                defaultChecked={true}
              />
              <label htmlFor="enableKhalti" className="text-gray-700 text-sm">
                Enable Khalti Payments
              </label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="enableCashOnDelivery" 
                className="mr-2"
                defaultChecked={true}
              />
              <label htmlFor="enableCashOnDelivery" className="text-gray-700 text-sm">
                Enable Cash on Delivery
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-3">
            Save Settings
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-4 text-center font-bold text-xl border-b border-blue-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <FaClipboardList className="mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "users" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("users")}
              >
                <FaUsers className="mr-3" />
                Users
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "orders" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("orders")}
              >
                <FaShoppingCart className="mr-3" />
                Orders
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "menu" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("menu")}
              >
                <FaUtensils className="mr-3" />
                Menu
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "promocodes" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("promocodes")}
              >
                <FaTag className="mr-3" />
                Promo Codes
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "reports" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("reports")}
              >
                <FaChartBar className="mr-3" />
                Reports
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center py-2 px-4 rounded ${activeTab === "settings" ? "bg-blue-700" : "hover:bg-blue-700"}`}
                onClick={() => setActiveTab("settings")}
              >
                <FaCogs className="mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="flex items-center">
            <div className="relative mr-4">
              <HiOutlineSearch className="text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search..."
                className="border rounded-lg pl-10 pr-3 py-2"
              />
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center mr-2">
                <FaUserCog />
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-6 space-y-6 overflow-auto">
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

export default AdminDashboard;