"use client"

import { useState } from 'react';

const CustomersPage = () => {
  // Sample customer data - replace with your actual data from API
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 9876543210',
      accountCreated: '2023-05-15',
      totalOrders: 12,
      totalRevenue: '₹45,600',
      lastOrder: '2023-10-28',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 8765432109',
      accountCreated: '2023-06-22',
      totalOrders: 8,
      totalRevenue: '₹32,400',
      lastOrder: '2023-10-25',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+91 7654321098',
      accountCreated: '2023-07-10',
      totalOrders: 5,
      totalRevenue: '₹18,750',
      lastOrder: '2023-09-15',
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      phone: '+91 6543210987',
      accountCreated: '2023-08-05',
      totalOrders: 15,
      totalRevenue: '₹67,800',
      lastOrder: '2023-10-30',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Sanjay Verma',
      email: 'sanjay.verma@example.com',
      phone: '+91 9432109876',
      accountCreated: '2023-09-18',
      totalOrders: 3,
      totalRevenue: '₹9,900',
      lastOrder: '2023-10-10',
      status: 'Active'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6 ml-64 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            className="pl-10 text-black pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
          <div 
            className="col-span-3 flex items-center cursor-pointer"
            onClick={() => requestSort('name')}
          >
            Customer
            {sortConfig.key === 'name' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => requestSort('accountCreated')}
          >
            Account Created
            {sortConfig.key === 'accountCreated' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-1 flex items-center cursor-pointer"
            onClick={() => requestSort('totalOrders')}
          >
            Orders
            {sortConfig.key === 'totalOrders' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => requestSort('totalRevenue')}
          >
            Total Revenue
            {sortConfig.key === 'totalRevenue' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => requestSort('lastOrder')}
          >
            Last Order
            {sortConfig.key === 'lastOrder' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div 
            className="col-span-1 flex items-center cursor-pointer"
            onClick={() => requestSort('status')}
          >
            Status
            {sortConfig.key === 'status' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {sortedCustomers.length > 0 ? (
          sortedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-12 p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="col-span-3 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center text-gray-700">
                {new Date(customer.accountCreated).toLocaleDateString('en-IN')}
              </div>
              <div className="col-span-1 flex items-center text-gray-700">
                {customer.totalOrders}
              </div>
              <div className="col-span-2 flex items-center font-medium text-green-600">
                {customer.totalRevenue}
              </div>
              <div className="col-span-2 flex items-center text-gray-700">
                {new Date(customer.lastOrder).toLocaleDateString('en-IN')}
              </div>
              <div className="col-span-1 flex items-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <button className="text-blue-600 hover:text-blue-800 mr-3">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No customers found matching your search criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">5</span> of{' '}
          <span className="font-medium">{customers.length}</span> customers
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded-md bg-white text-gray-700 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded-md bg-white text-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;