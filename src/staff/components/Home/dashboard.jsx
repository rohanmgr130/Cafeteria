import React, { useState } from 'react';
import { Bell, ChevronDown, Search, Menu, Package, Users, Clock, DollarSign, BarChart2, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Sample order data
  const orders = [
    { id: "ORD-4829", customer: "Emily Johnson", total: "$129.99", status: "pending", date: "13 Apr 2025", items: 3 },
    { id: "ORD-4828", customer: "Michael Chen", total: "$89.50", status: "processing", date: "13 Apr 2025", items: 2 },
    { id: "ORD-4827", customer: "Sarah Williams", total: "$235.00", status: "completed", date: "12 Apr 2025", items: 5 },
    { id: "ORD-4826", customer: "David Rodriguez", total: "$54.75", status: "pending", date: "12 Apr 2025", items: 1 },
    { id: "ORD-4825", customer: "Amanda Lee", total: "$178.25", status: "completed", date: "11 Apr 2025", items: 4 },
  ];

  // Filter orders based on active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-gray-800 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-xl font-bold">OrderFlow</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md bg-gray-700">
              <Package className="mr-3 h-5 w-5" />
              Orders
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <Users className="mr-3 h-5 w-5" />
              Customers
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <Clock className="mr-3 h-5 w-5" />
              History
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <DollarSign className="mr-3 h-5 w-5" />
              Transactions
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <BarChart2 className="mr-3 h-5 w-5" />
              Analytics
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          <a href="#" className="flex items-center text-sm font-medium text-gray-300 hover:text-white">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-500 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            
            <h2 className="text-lg font-medium md:hidden">OrderFlow</h2>
            
            <div className="flex items-center">
              {/* Search */}
              <div className="relative mx-4 lg:mx-0 hidden md:block">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search orders..." />
              </div>
              
              {/* Notifications */}
              <button className="p-1 ml-3 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Profile dropdown */}
              <div className="ml-4 relative flex-shrink-0">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    S
                  </div>
                  <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-700">Staff User</span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="pb-5 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
              Create Order
            </button>
          </div>

          {/* Dashboard stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">142</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">24</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">18</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Revenue (Today)</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">$1,482</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order filter tabs */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab('processing')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'processing'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Completed
                </button>
              </nav>
            </div>

            {/* Orders list */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
              <div className="flex justify-between flex-1 sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">20</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-gray-50">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      3
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}