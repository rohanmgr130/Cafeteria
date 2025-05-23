// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { broadcastPromocode } from '../../../services/notification.services'; // Adjust path as needed

// function Promo() {
//    // States for form inputs
//    const [code, setCode] = useState('');
//    const [prefix, setPrefix] = useState('');
//    const [discountType, setDiscountType] = useState('percentage');
//    const [discountValue, setDiscountValue] = useState('');
//    const [expiryDate, setExpiryDate] = useState('');
//    const [minOrderValue, setMinOrderValue] = useState('0');
//    const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
//    const [bulkCount, setBulkCount] = useState('10');
   
//    // States for notification options
//    const [notifyUsers, setNotifyUsers] = useState(true);
//    const [notificationMessage, setNotificationMessage] = useState('');
   
//    // States for data
//    const [promoCodes, setPromoCodes] = useState([]);
//    const [loading, setLoading] = useState(false);
//    const [error, setError] = useState('');
//    const [success, setSuccess] = useState('');
//    const [currentPage, setCurrentPage] = useState(1);
//    const [totalPages, setTotalPages] = useState(1);
//    const [selectedPromoCode, setSelectedPromoCode] = useState(null);
//    const [view, setView] = useState('list'); // list, create, bulk, detail

//   const token = localStorage.getItem('token');

//   const config = useCallback(() => ({
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   }), [token]);

//   const fetchPromoCodes = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/get-all-code`, config());
//       if (res.data.success) {
//         setPromoCodes(res.data.promoCodes);
//         setTotalPages(res.data.totalPages);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch promo codes');
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, config]);

//   useEffect(() => {
//     fetchPromoCodes();
//   }, [fetchPromoCodes]);

//   const createPromoCode = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');

//       const data = {
//         code: code || undefined,
//         prefix,
//         discountType,
//         discountValue: Number(discountValue),
//         expiryDate,
//         minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
//         maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
//       };

//       const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/create`, data, config());

//       if (res.data.success) {
//         setSuccess('Promo code created successfully!');
        
//         // If notification is enabled, broadcast the promocode to all users
//         if (notifyUsers && res.data.promoCode) {
//           try {
//             const promoData = {
//               code: res.data.promoCode.code,
//               discount: res.data.promoCode.discountType === 'percentage' 
//                 ? res.data.promoCode.discountValue / 100 
//                 : res.data.promoCode.discountValue,
//               expiry: res.data.promoCode.expiryDate,
//               minPurchase: res.data.promoCode.minOrderValue,
//               maxDiscount: res.data.promoCode.maxDiscountAmount,
//               description: notificationMessage || `New promo code: ${res.data.promoCode.code} for ${res.data.promoCode.discountValue}${res.data.promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
//             };
            
//             await broadcastPromocode(promoData);
//             setSuccess('Promo code created and notification sent to all users!');
//           } catch (notifError) {
//             console.error('Failed to send promocode notifications:', notifError);
//             // Still show success since the promo code was created
//             setSuccess('Promo code created successfully, but failed to notify users.');
//           }
//         }
        
//         resetForm();
//         fetchPromoCodes();
//         setView('list');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create promo code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateBulkCodes = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');

//       const data = {
//         count: Number(bulkCount),
//         prefix,
//         discountType,
//         discountValue: Number(discountValue),
//         expiryDate,
//         minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
//         maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
//       };

//       const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/generate-bulk`, data, config());

//       if (res.data.success) {
//         setSuccess(`Generated ${bulkCount} promo codes successfully!`);
        
//         // If notification is enabled and there are codes generated, broadcast the first one
//         if (notifyUsers && res.data.promoCodes && res.data.promoCodes.length > 0) {
//           try {
//             const promoCode = res.data.promoCodes[0]; // Get the first generated code
//             const promoData = {
//               code: promoCode.code,
//               discount: promoCode.discountType === 'percentage' 
//                 ? promoCode.discountValue / 100 
//                 : promoCode.discountValue,
//               expiry: promoCode.expiryDate,
//               minPurchase: promoCode.minOrderValue,
//               maxDiscount: promoCode.maxDiscountAmount,
//               description: notificationMessage || `New promo code batch available! Use ${promoCode.code} for ${promoCode.discountValue}${promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
//             };
            
//             await broadcastPromocode(promoData);
//             setSuccess(`Generated ${bulkCount} promo codes and notification sent to all users!`);
//           } catch (notifError) {
//             console.error('Failed to send promocode notifications:', notifError);
//             // Still show success since the promo codes were created
//             setSuccess(`Generated ${bulkCount} promo codes successfully, but failed to notify users.`);
//           }
//         }
        
//         resetForm();
//         fetchPromoCodes();
//         setView('list');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to generate bulk promo codes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to broadcast an existing promo code
//   const broadcastExistingCode = async (promoCode) => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const promoData = {
//         code: promoCode.code,
//         discount: promoCode.discountType === 'percentage' 
//           ? promoCode.discountValue / 100 
//           : promoCode.discountValue,
//         expiry: promoCode.expiryDate,
//         minPurchase: promoCode.minOrderValue,
//         maxDiscount: promoCode.maxDiscountAmount,
//         description: `Don't miss out! Use promo code ${promoCode.code} for ${promoCode.discountValue}${promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
//       };
      
//       await broadcastPromocode(promoData);
//       setSuccess(`Notification for promo code ${promoCode.code} sent to all users!`);
//     } catch (err) {
//       setError('Failed to send promocode notification');
//       console.error('Error broadcasting promocode:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deletePromoCode = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this promo code?')) return;
//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');

//       const res = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());

//       if (res.data.success) {
//         setSuccess('Promo code deleted successfully!');
//         fetchPromoCodes();
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete promo code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getPromoCodeDetails = async (id) => {
//     try {
//       setLoading(true);
//       setError('');
//       const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());
//       if (res.data.success) {
//         setSelectedPromoCode(res.data.promoCode);
//         setView('detail');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch promo code details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePromoCode = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');
//       const data = {
//         isActive: selectedPromoCode.isActive,
//         expiryDate: selectedPromoCode.expiryDate,
//         minOrderValue: selectedPromoCode.minOrderValue,
//         maxDiscountAmount: selectedPromoCode.maxDiscountAmount,
//       };

//       const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${selectedPromoCode._id}`, data, config());

//       if (res.data.success) {
//         setSuccess('Promo code updated successfully!');
//         fetchPromoCodes();
//         setView('list');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update promo code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setCode('');
//     setPrefix('');
//     setDiscountType('percentage');
//     setDiscountValue('');
//     setExpiryDate('');
//     setMinOrderValue('0');
//     setMaxDiscountAmount('');
//     setBulkCount('10');
//     setNotifyUsers(true);
//     setNotificationMessage('');
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="promocode-container p-4 ml-64"> {/* FIXED: added ml-64 to avoid nav overlap */}
//       <h1 className="text-2xl font-bold mb-4">Promo Code Management</h1>

//       {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}
//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

//       <div className="flex gap-4 mb-6">
//         <button onClick={() => setView('list')} className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>View All</button>
//         <button onClick={() => setView('create')} className={`px-4 py-2 rounded ${view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Create New</button>
//         <button onClick={() => setView('bulk')} className={`px-4 py-2 rounded ${view === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Generate Bulk</button>
//       </div>
      
//       {/* Create single promo code form */}
//       {view === 'create' && (
//         <div className="bg-white p-6 rounded shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Create New Promo Code</h2>
//           <form onSubmit={createPromoCode}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Code (Optional)</label>
//                 <input
//                   type="text"
//                   value={code}
//                   onChange={(e) => setCode(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="Enter code or leave blank for auto-generation"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Prefix (Optional)</label>
//                 <input
//                   type="text"
//                   value={prefix}
//                   onChange={(e) => setPrefix(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., SUMMER"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Discount Type</label>
//                 <select
//                   value={discountType}
//                   onChange={(e) => setDiscountType(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                 >
//                   <option value="percentage">Percentage</option>
//                   <option value="fixed">Fixed Amount</option>
//                 </select>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">
//                   Discount Value ({discountType === 'percentage' ? '%' : 'Rs.'})
//                 </label>
//                 <input
//                   type="number"
//                   value={discountValue}
//                   onChange={(e) => setDiscountValue(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 25'}
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Expiry Date</label>
//                 <input
//                   type="date"
//                   value={expiryDate}
//                   onChange={(e) => setExpiryDate(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Minimum Order Value (Rs.)</label>
//                 <input
//                   type="number"
//                   value={minOrderValue}
//                   onChange={(e) => setMinOrderValue(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., 50"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Max Discount Amount (Rs.)</label>
//                 <input
//                   type="number"
//                   value={maxDiscountAmount}
//                   onChange={(e) => setMaxDiscountAmount(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., 100"
//                 />
//               </div>
//             </div>
            
//             {/* Notification options */}
//             <div className="mt-6 border-t pt-4">
//               <h3 className="text-lg font-medium mb-3">Notification Options</h3>
              
//               <div className="mb-4">
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={notifyUsers}
//                     onChange={(e) => setNotifyUsers(e.target.checked)}
//                     className="form-checkbox h-5 w-5 text-blue-600"
//                   />
//                   <span className="ml-2 text-gray-700">Notify all users about this promocode</span>
//                 </label>
//               </div>
              
//               {notifyUsers && (
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Custom Notification Message (Optional)</label>
//                   <textarea
//                     value={notificationMessage}
//                     onChange={(e) => setNotificationMessage(e.target.value)}
//                     className="w-full px-3 py-2 border rounded"
//                     placeholder="e.g., Special discount for the summer season! Use code SUMMER20 to get 20% off your order."
//                     rows="3"
//                   ></textarea>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Leave blank to use a default message based on the promo code details.
//                   </p>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-4">
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Creating...' : 'Create Promo Code'}
//               </button>
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded ml-2 hover:bg-gray-400"
//               >
//                 Reset
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* Generate bulk promo codes form */}
//       {view === 'bulk' && (
//         <div className="bg-white p-6 rounded shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Generate Bulk Promo Codes</h2>
//           <form onSubmit={generateBulkCodes}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Number of Codes</label>
//                 <input
//                   type="number"
//                   value={bulkCount}
//                   onChange={(e) => setBulkCount(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., 10"
//                   min="1"
//                   max="100"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Prefix (Optional)</label>
//                 <input
//                   type="text"
//                   value={prefix}
//                   onChange={(e) => setPrefix(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., SUMMER"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Discount Type</label>
//                 <select
//                   value={discountType}
//                   onChange={(e) => setDiscountType(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                 >
//                   <option value="percentage">Percentage</option>
//                   <option value="fixed">Fixed Amount</option>
//                 </select>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">
//                   Discount Value ({discountType === 'percentage' ? '%' : 'Rs.'})
//                 </label>
//                 <input
//                   type="number"
//                   value={discountValue}
//                   onChange={(e) => setDiscountValue(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 25'}
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Expiry Date</label>
//                 <input
//                   type="date"
//                   value={expiryDate}
//                   onChange={(e) => setExpiryDate(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Minimum Order Value (Rs.)</label>
//                 <input
//                   type="number"
//                   value={minOrderValue}
//                   onChange={(e) => setMinOrderValue(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., 50"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-2">Max Discount Amount (Rs.)</label>
//                 <input
//                   type="number"
//                   value={maxDiscountAmount}
//                   onChange={(e) => setMaxDiscountAmount(e.target.value)}
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., 100"
//                 />
//               </div>
//             </div>
            
//             {/* Notification options */}
//             <div className="mt-6 border-t pt-4">
//               <h3 className="text-lg font-medium mb-3">Notification Options</h3>
              
//               <div className="mb-4">
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={notifyUsers}
//                     onChange={(e) => setNotifyUsers(e.target.checked)}
//                     className="form-checkbox h-5 w-5 text-blue-600"
//                   />
//                   <span className="ml-2 text-gray-700">Notify all users about these promocodes</span>
//                 </label>
//                 <p className="text-xs text-gray-500 mt-1 ml-7">
//                   Note: Only one notification will be sent for the first code in the batch.
//                 </p>
//               </div>
              
//               {notifyUsers && (
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Custom Notification Message (Optional)</label>
//                   <textarea
//                     value={notificationMessage}
//                     onChange={(e) => setNotificationMessage(e.target.value)}
//                     className="w-full px-3 py-2 border rounded"
//                     placeholder="e.g., New batch of promo codes available! Get your discount today."
//                     rows="3"
//                   ></textarea>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Leave blank to use a default message based on the promo code details.
//                   </p>
//                 </div>
//               )}
//             </div>
            
//             <div className="mt-4">
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 disabled={loading}
//               >
//                 {loading ? 'Generating...' : 'Generate Promo Codes'}
//               </button>
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded ml-2 hover:bg-gray-400"
//               >
//                 Reset
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* Promo code detail/edit view */}
//       {view === 'detail' && selectedPromoCode && (
//         <div className="bg-white p-6 rounded shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Promo Code Details</h2>
          
//           <div className="mb-4">
//             <div className="flex items-center mb-2">
//               <span className="text-2xl font-bold">{selectedPromoCode.code}</span>
//               <span className={`ml-2 px-2 py-1 rounded text-xs ${
//                 selectedPromoCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//               }`}>
//                 {selectedPromoCode.isActive ? 'Active' : 'Inactive'}
//               </span>
//               <span className={`ml-2 px-2 py-1 rounded text-xs ${
//                 selectedPromoCode.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
//               }`}>
//                 {selectedPromoCode.isUsed ? 'Used' : 'Unused'}
//               </span>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//               <div>
//                 <p><strong>Discount:</strong> {selectedPromoCode.discountValue}{selectedPromoCode.discountType === 'percentage' ? '%' : ' Rs.'}</p>
//                 <p><strong>Minimum Order:</strong> Rs. {selectedPromoCode.minOrderValue}</p>
//                 <p><strong>Max Discount Amount:</strong> {selectedPromoCode.maxDiscountAmount ? `Rs. ${selectedPromoCode.maxDiscountAmount}` : 'No limit'}</p>
//               </div>
//               <div>
//                 <p><strong>Expiry Date:</strong> {formatDate(selectedPromoCode.expiryDate)}</p>
//                 <p><strong>Created On:</strong> {formatDate(selectedPromoCode.createdAt)}</p>
//                 <p><strong>Created By:</strong> {selectedPromoCode.createdBy?.name || 'N/A'}</p>
//               </div>
//             </div>
            
//             {selectedPromoCode.isUsed && (
//               <div className="mt-4 p-3 bg-gray-50 rounded">
//                 <h3 className="font-semibold mb-2">Usage Details</h3>
//                 <p><strong>Used By:</strong> {selectedPromoCode.usedBy?.name || 'N/A'}</p>
//                 <p><strong>Email:</strong> {selectedPromoCode.usedBy?.email || 'N/A'}</p>
//                 <p><strong>Used On:</strong> {selectedPromoCode.usedAt ? formatDate(selectedPromoCode.usedAt) : 'N/A'}</p>
//               </div>
//             )}
            
//             {/* Add broadcast option */}
//             {!selectedPromoCode.isUsed && selectedPromoCode.isActive && (
//               <div className="mt-6 pt-4 border-t">
//                 <h3 className="font-semibold mb-2">Broadcast Notification</h3>
//                 <p className="text-sm text-gray-600 mb-3">
//                   Send a notification about this promo code to all users.
//                 </p>
//                 <button
//                   onClick={() => broadcastExistingCode(selectedPromoCode)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//                   disabled={loading}
//                 >
//                   {loading ? 'Sending...' : 'Broadcast to All Users'}
//                 </button>
//               </div>
//             )}
//           </div>
          
//           {!selectedPromoCode.isUsed && (
//             <form onSubmit={updatePromoCode} className="mt-6">
//               <h3 className="font-semibold mb-2">Edit Promo Code</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Status</label>
//                   <select
//                     value={selectedPromoCode.isActive.toString()}
//                     onChange={(e) => setSelectedPromoCode({
//                       ...selectedPromoCode,
//                       isActive: e.target.value === 'true'
//                     })}
//                     className="w-full px-3 py-2 border rounded"
//                   >
//                     <option value="true">Active</option>
//                     <option value="false">Inactive</option>
//                   </select>
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Expiry Date</label>
//                   <input
//                     type="date"
//                     value={selectedPromoCode.expiryDate?.split('T')[0] || ''}
//                     onChange={(e) => setSelectedPromoCode({
//                       ...selectedPromoCode,
//                       expiryDate: e.target.value
//                     })}
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Minimum Order Value (Rs.)</label>
//                   <input
//                     type="number"
//                     value={selectedPromoCode.minOrderValue}
//                     onChange={(e) => setSelectedPromoCode({
//                       ...selectedPromoCode,
//                       minOrderValue: e.target.value
//                     })}
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-gray-700 mb-2">Max Discount Amount (Rs.)</label>
//                   <input
//                     type="number"
//                     value={selectedPromoCode.maxDiscountAmount || ''}
//                     onChange={(e) => setSelectedPromoCode({
//                       ...selectedPromoCode,
//                       maxDiscountAmount: e.target.value || null
//                     })}
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
//               </div>
              
//               <div className="flex gap-2 mt-4">
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                   disabled={loading}
//                 >
//                   {loading ? 'Updating...' : 'Update Promo Code'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => deletePromoCode(selectedPromoCode._id)}
//                   className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                   disabled={loading}
//                 >
//                   Delete
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setView('list')}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                 >
//                   Back to List
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       )}
      
//       {/* Promo codes list view */}
//       {view === 'list' && (
//         <div className="bg-white overflow-auto rounded shadow">
//           {loading && <p className="p-4 text-center">Loading promo codes...</p>}
          
//           {!loading && promoCodes.length === 0 && (
//             <p className="p-4 text-center">No promo codes found. Create one to get started.</p>
//           )}
          
//           {!loading && promoCodes.length > 0 && (
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {promoCodes.map((promoCode) => (
//                   <tr key={promoCode._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap font-medium">{promoCode.code}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {promoCode.discountValue}
//                       {promoCode.discountType === 'percentage' ? '%' : ' Rs.'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         !promoCode.isActive 
//                           ? 'bg-red-100 text-red-800' 
//                           : promoCode.isUsed 
//                             ? 'bg-gray-100 text-gray-800'
//                             : 'bg-green-100 text-green-800'
//                       }`}>
//                         {!promoCode.isActive 
//                           ? 'Inactive' 
//                           : promoCode.isUsed 
//                             ? 'Used'
//                             : 'Active'
//                         }
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {formatDate(promoCode.expiryDate)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => getPromoCodeDetails(promoCode._id)}
//                         className="text-blue-600 hover:text-blue-900 mr-3"
//                       >
//                         View
//                       </button>
                      
//                       {/* Add broadcast button for active, unused codes */}
//                       {!promoCode.isUsed && promoCode.isActive && (
//                         <button
//                           onClick={() => broadcastExistingCode(promoCode)}
//                           className="text-gray-600 hover:text-gray-900 mr-3"
//                           title="Notify all users about this promo code"
//                         >
//                           Broadcast
//                         </button>
//                       )}
                      
//                       {!promoCode.isUsed && (
//                         <button
//                           onClick={() => deletePromoCode(promoCode._id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
          
//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="px-6 py-3 flex justify-between items-center border-t">
//               <button
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Previous
//               </button>
              
//               <span className="text-sm text-gray-700">
//                 Page {currentPage} of {totalPages}
//               </span>
              
//               <button
//                 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       )}
      
//     </div>
//   );
// }

// export default Promo;



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { broadcastPromocode } from '../../../services/notification.services'; // Adjust path as needed

function Promo() {
  // States for form inputs
  const [code, setCode] = useState('');
  const [prefix, setPrefix] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [bulkCount, setBulkCount] = useState('10');
  
  // States for notification options
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // States for data
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [view, setView] = useState('list'); // list, create, bulk, detail

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});

  const token = localStorage.getItem('token');

  const config = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }), [token]);

  // Get today's date in YYYY-MM-DD format for min date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validation function
  const validateForm = (isCreateForm = true) => {
    const errors = {};

    // Code validation (only for single create, not bulk)
    if (isCreateForm && view === 'create' && code && code.trim().length < 3) {
      errors.code = 'Code must be at least 3 characters long';
    }

    // Prefix validation
    if (prefix && (prefix.trim().length < 2 || prefix.trim().length > 10)) {
      errors.prefix = 'Prefix must be between 2-10 characters';
    }

    // Discount value validation
    if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
      errors.discountValue = 'Discount value must be a positive number';
    }

    if (discountType === 'percentage' && Number(discountValue) > 100) {
      errors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (discountType === 'fixed' && Number(discountValue) > 10000) {
      errors.discountValue = 'Fixed discount cannot exceed Rs. 10,000';
    }

    // Expiry date validation
    if (!expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (expiryDate < getTodayDate()) {
      errors.expiryDate = 'Expiry date cannot be in the past';
    } else {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() + 2);
      
      if (expiry > maxDate) {
        errors.expiryDate = 'Expiry date cannot be more than 2 years from now';
      }
    }

    // Min order value validation
    if (minOrderValue && (isNaN(minOrderValue) || Number(minOrderValue) < 0)) {
      errors.minOrderValue = 'Minimum order value must be a positive number or zero';
    }

    if (minOrderValue && Number(minOrderValue) > 100000) {
      errors.minOrderValue = 'Minimum order value cannot exceed Rs. 1,00,000';
    }

    // Max discount amount validation
    if (maxDiscountAmount && (isNaN(maxDiscountAmount) || Number(maxDiscountAmount) <= 0)) {
      errors.maxDiscountAmount = 'Maximum discount amount must be a positive number';
    }

    if (maxDiscountAmount && Number(maxDiscountAmount) > 50000) {
      errors.maxDiscountAmount = 'Maximum discount amount cannot exceed Rs. 50,000';
    }

    // Bulk count validation
    if (view === 'bulk') {
      if (!bulkCount || isNaN(bulkCount) || Number(bulkCount) < 1 || Number(bulkCount) > 100) {
        errors.bulkCount = 'Bulk count must be between 1 and 100';
      }
    }

    // Custom notification message validation
    if (notifyUsers && notificationMessage && notificationMessage.trim().length > 500) {
      errors.notificationMessage = 'Notification message cannot exceed 500 characters';
    }

    // Cross-field validation
    if (discountType === 'fixed' && maxDiscountAmount && Number(discountValue) > Number(maxDiscountAmount)) {
      errors.discountValue = 'Fixed discount cannot be greater than maximum discount amount';
    }

    return errors;
  };

  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/get-all-code?page=${currentPage}`, 
        config()
      );
      if (res.data.success) {
        setPromoCodes(res.data.promoCodes);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, config]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const createPromoCode = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(true);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = {
        code: code.trim() || undefined,
        prefix: prefix.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        expiryDate,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      };

      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/create`, data, config());

      if (res.data.success) {
        setSuccess('Promo code created successfully!');
        
        // If notification is enabled, broadcast the promocode to all users
        if (notifyUsers && res.data.promoCode) {
          try {
            const promoData = {
              code: res.data.promoCode.code,
              discount: res.data.promoCode.discountType === 'percentage' 
                ? res.data.promoCode.discountValue / 100 
                : res.data.promoCode.discountValue,
              expiry: res.data.promoCode.expiryDate,
              minPurchase: res.data.promoCode.minOrderValue,
              maxDiscount: res.data.promoCode.maxDiscountAmount,
              description: notificationMessage.trim() || `New promo code: ${res.data.promoCode.code} for ${res.data.promoCode.discountValue}${res.data.promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
            };
            
            await broadcastPromocode(promoData);
            setSuccess('Promo code created and notification sent to all users!');
          } catch (notifError) {
            console.error('Failed to send promocode notifications:', notifError);
            setSuccess('Promo code created successfully, but failed to notify users.');
          }
        }
        
        resetForm();
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create promo code');
    } finally {
      setLoading(false);
    }
  };

  const generateBulkCodes = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(false);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = {
        count: Number(bulkCount),
        prefix: prefix.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        expiryDate,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      };

      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/generate-bulk`, data, config());

      if (res.data.success) {
        setSuccess(`Generated ${bulkCount} promo codes successfully!`);
        
        // If notification is enabled and there are codes generated, broadcast the first one
        if (notifyUsers && res.data.promoCodes && res.data.promoCodes.length > 0) {
          try {
            const promoCode = res.data.promoCodes[0];
            const promoData = {
              code: promoCode.code,
              discount: promoCode.discountType === 'percentage' 
                ? promoCode.discountValue / 100 
                : promoCode.discountValue,
              expiry: promoCode.expiryDate,
              minPurchase: promoCode.minOrderValue,
              maxDiscount: promoCode.maxDiscountAmount,
              description: notificationMessage.trim() || `New promo code batch available! Use ${promoCode.code} for ${promoCode.discountValue}${promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
            };
            
            await broadcastPromocode(promoData);
            setSuccess(`Generated ${bulkCount} promo codes and notification sent to all users!`);
          } catch (notifError) {
            console.error('Failed to send promocode notifications:', notifError);
            setSuccess(`Generated ${bulkCount} promo codes successfully, but failed to notify users.`);
          }
        }
        
        resetForm();
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bulk promo codes');
    } finally {
      setLoading(false);
    }
  };

  const broadcastExistingCode = async (promoCode) => {
    try {
      setLoading(true);
      setError('');
      
      const promoData = {
        code: promoCode.code,
        discount: promoCode.discountType === 'percentage' 
          ? promoCode.discountValue / 100 
          : promoCode.discountValue,
        expiry: promoCode.expiryDate,
        minPurchase: promoCode.minOrderValue,
        maxDiscount: promoCode.maxDiscountAmount,
        description: `Don't miss out! Use promo code ${promoCode.code} for ${promoCode.discountValue}${promoCode.discountType === 'percentage' ? '%' : ' Rs.'} off!`
      };
      
      await broadcastPromocode(promoData);
      setSuccess(`Notification for promo code ${promoCode.code} sent to all users!`);
    } catch (err) {
      setError('Failed to send promocode notification');
      console.error('Error broadcasting promocode:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePromoCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());

      if (res.data.success) {
        setSuccess('Promo code deleted successfully!');
        fetchPromoCodes();
        if (view === 'detail') {
          setView('list');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete promo code');
    } finally {
      setLoading(false);
    }
  };

  const getPromoCodeDetails = async (id) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());
      if (res.data.success) {
        setSelectedPromoCode(res.data.promoCode);
        setView('detail');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch promo code details');
    } finally {
      setLoading(false);
    }
  };

  const updatePromoCode = async (e) => {
    e.preventDefault();
    
    // Validate expiry date for update
    const updateErrors = {};
    if (selectedPromoCode.expiryDate && selectedPromoCode.expiryDate.split('T')[0] < getTodayDate()) {
      updateErrors.expiryDate = 'Expiry date cannot be in the past';
    }

    if (Object.keys(updateErrors).length > 0) {
      setError('Please fix the validation errors before updating');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const data = {
        isActive: selectedPromoCode.isActive,
        expiryDate: selectedPromoCode.expiryDate,
        minOrderValue: Number(selectedPromoCode.minOrderValue),
        maxDiscountAmount: selectedPromoCode.maxDiscountAmount ? Number(selectedPromoCode.maxDiscountAmount) : null,
      };

      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${selectedPromoCode._id}`, data, config());

      if (res.data.success) {
        setSuccess('Promo code updated successfully!');
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update promo code');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setPrefix('');
    setDiscountType('percentage');
    setDiscountValue('');
    setExpiryDate('');
    setMinOrderValue('');
    setMaxDiscountAmount('');
    setBulkCount('10');
    setNotifyUsers(true);
    setNotificationMessage('');
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  // Input field component with validation
  const InputField = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    min, 
    max, 
    errorKey,
    helpText,
    ...props 
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          validationErrors[errorKey] ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        min={min}
        max={max}
        {...props}
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      {validationErrors[errorKey] && (
        <p className="text-sm text-red-600 mt-1">{validationErrors[errorKey]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
          <p className="mt-2 text-gray-600">Create, manage, and track your promotional discount codes</p>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { key: 'list', label: 'All Promo Codes', icon: '📋' },
              { key: 'create', label: 'Create New', icon: '➕' },
              { key: 'bulk', label: 'Bulk Generate', icon: '' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setView(tab.key);
                  resetForm();
                }}
                className={`${
                  view === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Create Single Promo Code Form */}
        {view === 'create' && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600">
              <h2 className="text-xl font-semibold text-white">Create New Promo Code</h2>
              <p className="text-blue-100 text-sm mt-1">Fill in the details to create a new promotional discount code</p>
            </div>
            
            <form onSubmit={createPromoCode} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InputField
                    label="Promo Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Leave blank for auto-generation"
                    errorKey="code"
                    helpText="Optional: Enter a custom code (min 3 characters) or leave blank for auto-generation"
                  />

                  <InputField
                    label="Prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., SUMMER, WINTER"
                    errorKey="prefix"
                    helpText="Optional: 2-10 characters prefix for auto-generated codes"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                    </select>
                  </div>

                  <InputField
                    label={`Discount Value (${discountType === 'percentage' ? '%' : 'Rs.'})`}
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                    required
                    min="0.01"
                    max={discountType === 'percentage' ? '100' : '10000'}
                    step={discountType === 'percentage' ? '0.01' : '1'}
                    errorKey="discountValue"
                    helpText={discountType === 'percentage' ? 'Maximum 100%' : 'Maximum Rs. 10,000'}
                  />
                </div>

                <div className="space-y-4">
                  <InputField
                    label="Expiry Date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    min={getTodayDate()}
                    errorKey="expiryDate"
                    helpText="Must be a future date (max 2 years from now)"
                  />

                  <InputField
                    label="Minimum Order Value (Rs.)"
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100000"
                    errorKey="minOrderValue"
                    helpText="Minimum cart value required to use this code"
                  />

                  <InputField
                    label="Maximum Discount Amount (Rs.)"
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="No limit"
                    min="1"
                    max="50000"
                    errorKey="maxDiscountAmount"
                    helpText="Optional: Cap the discount amount (useful for percentage discounts)"
                  />
                </div>
              </div>

              {/* Notification Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4"> Notification Settings</h3>
                
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyUsers}
                      onChange={(e) => setNotifyUsers(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Send notification to all users</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Users will receive a push notification about this new promo code
                  </p>
                </div>
                
                {notifyUsers && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Notification Message
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.notificationMessage ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 🎉 Special discount alert! Get 20% off on your next order with code SAVE20"
                      rows="3"
                      maxLength="500"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Leave blank for auto-generated message
                      </p>
                      <span className="text-xs text-gray-400">
                        {notificationMessage.length}/500
                      </span>
                    </div>
                    {validationErrors.notificationMessage && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.notificationMessage}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    ' Create Promo Code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                   Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Generate Form */}
        {view === 'bulk' && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600">
              <h2 className="text-xl font-semibold text-white">Generate Bulk Promo Codes</h2>
              <p className="text-gray-100 text-sm mt-1">Create multiple promo codes at once with identical settings</p>
            </div>
            
            <form onSubmit={generateBulkCodes} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InputField
                    label="Number of Codes"
                    type="number"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(e.target.value)}
                    placeholder="10"
                    required
                    min="1"
                    max="100"
                    errorKey="bulkCount"
                    helpText="Maximum 100 codes per batch"
                  />

                  <InputField
                    label="Prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., BULK, BATCH"
                    errorKey="prefix"
                    helpText="Optional: 2-10 characters prefix for all generated codes"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                    </select>
                  </div>

                  <InputField
                    label={`Discount Value (${discountType === 'percentage' ? '%' : 'Rs.'})`}
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'e.g., 15' : 'e.g., 200'}
                    required
                    min="0.01"
                    max={discountType === 'percentage' ? '100' : '10000'}
                    step={discountType === 'percentage' ? '0.01' : '1'}
                    errorKey="discountValue"
                    helpText={discountType === 'percentage' ? 'Maximum 100%' : 'Maximum Rs. 10,000'}
                  />
                </div>

                <div className="space-y-4">
                  <InputField
                    label="Expiry Date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    min={getTodayDate()}
                    errorKey="expiryDate"
                    helpText="Must be a future date (max 2 years from now)"
                  />

                  <InputField
                    label="Minimum Order Value (Rs.)"
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100000"
                    errorKey="minOrderValue"
                    helpText="Minimum cart value required to use these codes"
                  />

                  <InputField
                    label="Maximum Discount Amount (Rs.)"
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="No limit"
                    min="1"
                    max="50000"
                    errorKey="maxDiscountAmount"
                    helpText="Optional: Cap the discount amount for all codes"
                  />
                </div>
              </div>

              {/* Notification Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4"> Notification Settings</h3>
                
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyUsers}
                      onChange={(e) => setNotifyUsers(e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Send notification to all users about this batch</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Only one notification will be sent featuring the first code from the batch
                  </p>
                </div>
                
                {notifyUsers && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Notification Message
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                        validationErrors.notificationMessage ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 🎊 New batch of discount codes is here! Limited time offer - grab yours now!"
                      rows="3"
                      maxLength="500"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Leave blank for auto-generated message
                      </p>
                      <span className="text-xs text-gray-400">
                        {notificationMessage.length}/500
                      </span>
                    </div>
                    {validationErrors.notificationMessage && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.notificationMessage}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    ' Generate Bulk Codes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                   Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Promo Code Detail/Edit View */}
        {view === 'detail' && selectedPromoCode && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600">
              <h2 className="text-xl font-semibold text-white">Promo Code Details</h2>
              <p className="text-indigo-100 text-sm mt-1">View and edit promo code information</p>
            </div>
            
            <div className="p-6">
              {/* Code Header */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPromoCode.code}</h3>
                    <p className="text-gray-600 mt-1">
                      {selectedPromoCode.discountValue}
                      {selectedPromoCode.discountType === 'percentage' ? '% OFF' : ' Rs. OFF'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPromoCode.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPromoCode.isActive ? ' Active' : '❌ Inactive'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPromoCode.isUsed 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPromoCode.isUsed ? ' Used' : '🔓 Available'}
                    </span>
                    {isExpired(selectedPromoCode.expiryDate) && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                         Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2"> Discount Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedPromoCode.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}</span></p>
                      <p><span className="text-gray-600">Value:</span> <span className="font-medium">{selectedPromoCode.discountValue}{selectedPromoCode.discountType === 'percentage' ? '%' : ' Rs.'}</span></p>
                      <p><span className="text-gray-600">Min Order:</span> <span className="font-medium">Rs. {selectedPromoCode.minOrderValue || 0}</span></p>
                      <p><span className="text-gray-600">Max Discount:</span> <span className="font-medium">{selectedPromoCode.maxDiscountAmount ? `Rs. ${selectedPromoCode.maxDiscountAmount}` : 'No limit'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Created:</span> <span className="font-medium">{formatDate(selectedPromoCode.createdAt)}</span></p>
                      <p><span className="text-gray-600">Expires:</span> <span className={`font-medium ${isExpired(selectedPromoCode.expiryDate) ? 'text-red-600' : 'text-gray-900'}`}>{formatDate(selectedPromoCode.expiryDate)}</span></p>
                      <p><span className="text-gray-600">Created By:</span> <span className="font-medium">{selectedPromoCode.createdBy?.name || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Details */}
              {selectedPromoCode.isUsed && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2"> Usage Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <p><span className="text-yellow-700">Used By:</span> <span className="font-medium">{selectedPromoCode.usedBy?.name || 'N/A'}</span></p>
                    <p><span className="text-yellow-700">Email:</span> <span className="font-medium">{selectedPromoCode.usedBy?.email || 'N/A'}</span></p>
                    <p><span className="text-yellow-700">Used On:</span> <span className="font-medium">{selectedPromoCode.usedAt ? formatDate(selectedPromoCode.usedAt) : 'N/A'}</span></p>
                  </div>
                </div>
              )}

              {/* Broadcast Section */}
              {!selectedPromoCode.isUsed && selectedPromoCode.isActive && !isExpired(selectedPromoCode.expiryDate) && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2"> Broadcast Notification</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Send a notification about this promo code to all users.
                  </p>
                  <button
                    onClick={() => broadcastExistingCode(selectedPromoCode)}
                    className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : '📱 Broadcast to All Users'}
                  </button>
                </div>
              )}

              {/* Edit Form */}
              {!selectedPromoCode.isUsed && (
                <form onSubmit={updatePromoCode} className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4"> Edit Promo Code</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedPromoCode.isActive.toString()}
                        onChange={(e) => setSelectedPromoCode({
                          ...selectedPromoCode,
                          isActive: e.target.value === 'true'
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={selectedPromoCode.expiryDate?.split('T')[0] || ''}
                        onChange={(e) => setSelectedPromoCode({
                          ...selectedPromoCode,
                          expiryDate: e.target.value
                        })}
                        min={getTodayDate()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (Rs.)</label>
                      <input
                        type="number"
                        value={selectedPromoCode.minOrderValue}
                        onChange={(e) => setSelectedPromoCode({
                          ...selectedPromoCode,
                          minOrderValue: e.target.value
                        })}
                        min="0"
                        max="100000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount Amount (Rs.)</label>
                      <input
                        type="number"
                        value={selectedPromoCode.maxDiscountAmount || ''}
                        onChange={(e) => setSelectedPromoCode({
                          ...selectedPromoCode,
                          maxDiscountAmount: e.target.value || null
                        })}
                        min="1"
                        max="50000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : ' Update Promo Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromoCode(selectedPromoCode._id)}
                      className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={loading}
                    >
                       Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      ← Back to List
                    </button>
                  </div>
                </form>
              )}

              {/* Read-only mode for used codes */}
              {selectedPromoCode.isUsed && (
                <div className="border-t pt-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      ← Back to List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Promo Codes List View */}
        {view === 'list' && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">All Promo Codes</h2>
                  <p className="text-gray-300 text-sm mt-1">Manage and track all your promotional codes</p>
                </div>
                <div className="text-white text-sm">
                  Total: {promoCodes.length} codes
                </div>
              </div>
            </div>
            
            {loading && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Loading promo codes...</span>
                </div>
              </div>
            )}
            
            {!loading && promoCodes.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No promo codes found</h3>
                <p className="text-gray-600 mb-6">Create your first promotional discount code to get started.</p>
                <button
                  onClick={() => setView('create')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  ➕ Create First Promo Code
                </button>
              </div>
            )}
            
            {!loading && promoCodes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoCodes.map((promoCode) => (
                      <tr key={promoCode._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-lg text-gray-900">{promoCode.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {promoCode.discountValue}
                            {promoCode.discountType === 'percentage' ? '% OFF' : ' Rs. OFF'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              !promoCode.isActive 
                                ? 'bg-red-100 text-red-800' 
                                : promoCode.isUsed 
                                  ? 'bg-gray-100 text-gray-800'
                                  : isExpired(promoCode.expiryDate)
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                              {!promoCode.isActive 
                                ? '❌ Inactive' 
                                : promoCode.isUsed 
                                  ? ' Used'
                                  : isExpired(promoCode.expiryDate)
                                    ? ' Expired'
                                    : ' Active'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isExpired(promoCode.expiryDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {formatDate(promoCode.expiryDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs. {promoCode.minOrderValue || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => getPromoCodeDetails(promoCode._id)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                              title="View details"
                            >
                               View
                            </button>
                            
                            {/* Broadcast button for active, unused, non-expired codes */}
                            {!promoCode.isUsed && promoCode.isActive && !isExpired(promoCode.expiryDate) && (
                              <button
                                onClick={() => broadcastExistingCode(promoCode)}
                                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                title="Notify all users about this promo code"
                              >
                                 Broadcast
                              </button>
                            )}
                            
                            {/* Delete button for unused codes */}
                            {!promoCode.isUsed && (
                              <button
                                onClick={() => deletePromoCode(promoCode._id)}
                                className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                title="Delete promo code"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          if (index > 0 && array[index - 1] !== page - 1) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === page
                                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Stats */}
        {view === 'list' && promoCodes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                 
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Codes</dt>
                      <dd className="text-lg font-medium text-gray-900">{promoCodes.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Codes</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {promoCodes.filter(code => code.isActive && !code.isUsed && !isExpired(code.expiryDate)).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Used Codes</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {promoCodes.filter(code => code.isUsed).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Expired Codes</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {promoCodes.filter(code => !code.isUsed && isExpired(code.expiryDate)).length}
                      </dd>
                    </dl>
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

export default Promo;