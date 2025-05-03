import React from "react";
import { FaUsers, FaClipboardList, FaChartBar, FaCogs, FaDollarSign } from "react-icons/fa";
import { HiOutlineSearch } from "react-icons/hi";

const AdminDashboard = () => {
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
              <a href="#" className="flex items-center py-2 px-4 rounded hover:bg-blue-700">
                <FaClipboardList className="mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-2 px-4 rounded hover:bg-blue-700">
                <FaUsers className="mr-3" />
                Users
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-2 px-4 rounded hover:bg-blue-700">
                <FaClipboardList className="mr-3" />
                Orders
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-2 px-4 rounded hover:bg-blue-700">
                <FaChartBar className="mr-3" />
                Reports
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-2 px-4 rounded hover:bg-blue-700">
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
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div className="flex items-center">
            <HiOutlineSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-lg px-3 py-1"
            />
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded shadow flex items-center">
              <FaDollarSign className="text-green-500 text-3xl mr-4" />
              <div>
                <h2 className="text-sm font-medium text-gray-500">Total Sales</h2>
                <p className="text-2xl font-bold mt-2">$15,230</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded shadow flex items-center">
              <FaClipboardList className="text-orange-500 text-3xl mr-4" /> q
              <div>
                <h2 className="text-sm font-medium text-gray-500">Orders History</h2>
                <p className="text-2xl font-bold mt-2">98</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded shadow flex items-center">
              <FaUsers className="text-purple-500 text-3xl mr-4" />
              <div>
                <h2 className="text-sm font-medium text-gray-500">Total Staff</h2>
                <p className="text-2xl font-bold mt-2">25</p>
              </div>
            </div>
          </div>

          {/* Placeholder for Charts/Tables */}
          <div className="bg-white p-6 rounded shadow h-64 flex items-center justify-center">
            <p className="text-gray-500">Charts or Tables go here</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
