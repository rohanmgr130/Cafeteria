// // import { useState } from "react";
// // import { AlertCircle, CheckCircle, Info } from "lucide-react";

// // const OnlinePayment = ({ cartTotal, onCheckout, loading, checkoutLoading, paymentImage, setPaymentImage }) => {
// //   // Store the actual file, not just the URL
// //   const [imageFile, setImageFile] = useState(null);
// //   // Toast state
// //   const [toast, setToast] = useState(null);
  
// //   const handleImageUpload = (e) => {
// //     if (e.target.files && e.target.files[0]) {
// //       const file = e.target.files[0];
// //       // Check file size (5MB limit)
// //       if (file.size > 5 * 1024 * 1024) {
// //         showToast("Image size must be less than 5MB", "error");
// //         return;
// //       }
// //       // Store the actual file for sending to server
// //       setImageFile(file);
// //       // Store URL for preview
// //       setPaymentImage(URL.createObjectURL(file));
// //       showToast("Image uploaded successfully", "success");
// //     }
// //   };

// //   // Pass the actual file to the checkout handler
// //   const handleSubmit = () => {
// //     if (!imageFile) {
// //       showToast("Please upload a payment screenshot", "error");
// //       return;
// //     }
    
// //     if (!cartTotal || cartTotal <= 0) {
// //       showToast("Your cart is empty", "error");
// //       return;
// //     }
    
// //     showToast("Processing your payment...", "info");
// //     onCheckout(imageFile);
// //   };

// //   // Show toast notification
// //   const showToast = (message, type = "info") => {
// //     setToast({ message, type });
// //     // Auto hide after 3 seconds
// //     setTimeout(() => {
// //       setToast(null);
// //     }, 3000);
// //   };

// //   return (
// //     <div className="p-6 bg-white rounded-lg shadow-md relative">
// //       {/* Toast notification */}
// //       {toast && (
// //         <div 
// //           className={`absolute top-2 right-2 left-2 p-3 rounded-md shadow-md flex items-center justify-between ${
// //             toast.type === "error" ? "bg-red-100 text-red-700" : 
// //             toast.type === "success" ? "bg-green-100 text-green-700" : 
// //             "bg-blue-100 text-blue-700"
// //           }`}
// //         >
// //           <div className="flex items-center">
// //             {toast.type === "error" ? (
// //               <AlertCircle className="mr-2 h-5 w-5" />
// //             ) : toast.type === "success" ? (
// //               <CheckCircle className="mr-2 h-5 w-5" />
// //             ) : (
// //               <Info className="mr-2 h-5 w-5" />
// //             )}
// //             <span>{toast.message}</span>
// //           </div>
// //           <button 
// //             onClick={() => setToast(null)}
// //             className="text-gray-500 hover:text-gray-700"
// //           >
// //             ×
// //           </button>
// //         </div>
// //       )}
      
// //       <h2 className="text-xl font-semibold mb-4">Khalti Payment</h2>
      
// //       <div className="mb-6">
// //         <div className="flex justify-between mb-2">
// //           <span>Amount to Pay:</span>
// //           {loading ? (
// //             <span className="font-medium">Loading...</span>
// //           ) : (
// //             <span className="font-medium">Rs. {cartTotal?.toFixed(2) || '0.00'}</span>
// //           )}
// //         </div>
// //       </div>
      
// //       <div className="border border-gray-200 rounded-lg p-4 mb-6">
// //         <h3 className="text-center mb-3 font-medium">Scan QR Code to Pay</h3>
// //         <div className="flex justify-center">
// //           <div className="bg-gray-200 w-48 h-48 flex items-center justify-center">
// //             <img 
// //               src="./qr.jpeg" 
// //               alt="Khalti QR Code" 
// //               className="max-w-full" 
// //             />
// //           </div>
// //         </div>
// //       </div>
      
// //       <div className="mb-6">
// //         <label className="block mb-2 text-sm font-medium">
// //           Upload Payment Screenshot
// //         </label>
// //         <div className="flex flex-col items-center">
// //           {paymentImage ? (
// //             <div className="mb-3">
// //               <img 
// //                 src={paymentImage} 
// //                 alt="Payment Screenshot" 
// //                 className="max-w-full h-40 object-contain rounded-md" 
// //               />
// //             </div>
// //           ) : (
// //             <div className="mb-3 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
// //               <p className="text-gray-500">No image uploaded</p>
// //             </div>
// //           )}
// //           <label className="cursor-pointer bg-blue-100 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-200 transition duration-200">
// //             <span>Choose Image</span>
// //             <input 
// //               type="file" 
// //               className="hidden" 
// //               accept="image/*" 
// //               onChange={handleImageUpload} 
// //             />
// //           </label>
// //         </div>
// //       </div>
      
// //       <button 
// //         onClick={handleSubmit}
// //         disabled={!paymentImage || checkoutLoading || !cartTotal || cartTotal <= 0}
// //         className={`w-full py-3 rounded-md font-medium transition duration-200 ${
// //           paymentImage && !checkoutLoading && cartTotal > 0
// //             ? 'bg-blue-600 text-white hover:bg-blue-700' 
// //             : 'bg-gray-200 text-gray-500 cursor-not-allowed'
// //         }`}
// //       >
// //         {checkoutLoading ? "Please wait..." : "Place Order"}
// //       </button>
// //     </div>
// //   );
// // };

// // export default OnlinePayment;


// import React, { useState, useEffect } from 'react';
// import { AlertCircle, CheckCircle, Info, Upload } from 'lucide-react';

// // Online payment component with promo code support
// const OnlinePayment = ({ cartTotal, onCheckout, loading, checkoutLoading, cartDetails, refreshCartDetails }) => {
//   // Toast state
//   const [toast, setToast] = useState(null);
//   const [promoCode, setPromoCode] = useState("");
//   const [promoStatus, setPromoStatus] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [finalTotal, setFinalTotal] = useState(cartTotal);
//   const [paymentImage, setPaymentImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const userId = localStorage.getItem('id');

//   // Update finalTotal whenever cartTotal or discount changes
//   useEffect(() => {
//     // If cartDetails exists and has discount information, use it
//     if (cartDetails) {
//       if (cartDetails.discount) {
//         setDiscount(cartDetails.discount);
//       }
//       // If finalTotal is already calculated by the backend, use it
//       if (cartDetails.finalTotal) {
//         setFinalTotal(cartDetails.finalTotal);
//       } else {
//         // Otherwise calculate it locally
//         setFinalTotal(cartTotal - discount);
//       }
//     } else {
//       setFinalTotal(cartTotal - discount);
//     }
//   }, [cartTotal, discount, cartDetails]);

//   // Handle file selection for payment screenshot
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPaymentImage(file);
      
//       // Create a preview URL
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle checkout with validation
//   const handleCheckout = () => {
//     if (!finalTotal || finalTotal <= 0) {
//       showToast("Your cart is empty", "error");
//       return;
//     }
    
//     if (!paymentImage) {
//       showToast("Please upload your payment screenshot", "error");
//       return;
//     }
    
//     showToast("Processing your payment...", "info");
//     onCheckout(paymentImage);
//   };

//   // Apply promo code function
//   const applyPromoCode = async () => {
//     if (!promoCode.trim()) {
//       setPromoStatus("Please enter a promo code");
//       showToast("Please enter a promo code", "error");
//       return;
//     }
    
//     try {
//       // Make API call to validate and apply the promo code
//       const response = await fetch('http://localhost:4000/api/apply-promo-code', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           userId,
//           promoCode
//         }),
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         setPromoStatus(errorData.message || "Failed to apply promo code");
//         showToast(errorData.message || "Failed to apply promo code", "error");
//         return;
//       }
      
//       const data = await response.json();
      
//       // Update discount and final total from backend response
//       setDiscount(data.cart.discount);
//       setFinalTotal(data.cart.finalTotal); // Use final total calculated by backend
      
//       setPromoStatus("Promo code applied successfully!");
//       showToast("Promo code applied successfully!", "success");
//       setTimeout(() => setPromoStatus(""), 3000);
//       setPromoCode("");
      
//       // Notify parent component to refresh cart details
//       if (refreshCartDetails) {
//         refreshCartDetails();
//       }
      
//     } catch (error) {
//       console.error("Error applying promo code:", error);
//       setPromoStatus("Error applying promo code. Please try again.");
//       showToast("Error applying promo code. Please try again.", "error");
//     }
//   };

//   // Show toast notification
//   const showToast = (message, type = "info") => {
//     setToast({ message, type });
//     // Auto hide after 3 seconds
//     setTimeout(() => {
//       setToast(null);
//     }, 3000);
//   };

//   // Generate Khalti payment QR info
//   const khaltiMerchantInfo = {
//     name: "College Canteen",
//     phone: "9800000000",
//     amount: finalTotal
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md relative">
//       {/* Toast notification */}
//       {toast && (
//         <div 
//           className={`absolute top-2 right-2 left-2 p-3 rounded-md shadow-md flex items-center justify-between ${
//             toast.type === "error" ? "bg-red-100 text-red-700" : 
//             toast.type === "success" ? "bg-green-100 text-green-700" : 
//             "bg-blue-100 text-blue-700"
//           }`}
//         >
//           <div className="flex items-center">
//             {toast.type === "error" ? (
//               <AlertCircle className="mr-2 h-5 w-5" />
//             ) : toast.type === "success" ? (
//               <CheckCircle className="mr-2 h-5 w-5" />
//             ) : (
//               <Info className="mr-2 h-5 w-5" />
//             )}
//             <span>{toast.message}</span>
//           </div>
//           <button 
//             onClick={() => setToast(null)}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ×
//           </button>
//         </div>
//       )}
      
//       <h2 className="text-xl font-semibold mb-4">Khalti Payment Details</h2>
      
//       {/* Promo code section */}
//       <div className="mb-5">
//         <label className="block text-gray-700 text-sm font-medium mb-2">Promo Code</label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Enter code"
//             className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
//             value={promoCode}
//             onChange={(e) => setPromoCode(e.target.value)}
//           />
//           <button 
//             className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm font-medium"
//             onClick={applyPromoCode}
//           >
//             Apply
//           </button>
//         </div>
//         {promoStatus && (
//           <p className={`text-sm mt-2 ${promoStatus.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
//             {promoStatus}
//           </p>
//         )}
//       </div>
      
//       <div className="mb-6">
//         <div className="flex justify-between mb-2">
//           <span>Cart Total:</span>
//           {loading ? (
//             <span className="font-medium">Loading...</span>
//           ) : (
//             <span className="font-medium">Rs. {cartTotal?.toFixed(2) || '0.00'}</span>
//           )}
//         </div>
//         <div className="flex justify-between mb-2 text-gray-600 text-sm">
//           <span>Transaction Fee:</span>
//           <span>Free</span>
//         </div>
        
//         {discount > 0 && (
//           <div className="flex justify-between mb-2 text-green-600">
//             <span>Discount:</span>
//             <span>- Rs. {discount.toFixed(2)}</span>
//           </div>
//         )}
        
//         <div className="border-t pt-2 mt-2 flex justify-between font-bold">
//           <span>Total Amount:</span>
//           {loading ? (
//             <span className="font-medium">Loading...</span>
//           ) : (
//             <span className="font-medium">Rs. {finalTotal?.toFixed(2) || '0.00'}</span>
//           )}
//         </div>
//       </div>
      
//       {/* Khalti Payment Information */}
//       <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
//         <div className="flex items-center mb-3">
//           <img 
//             src="/api/placeholder/32/32" 
//             alt="Khalti Logo" 
//             className="w-8 h-8 mr-2"
//           />
//           <h3 className="font-medium text-purple-800">Khalti Payment Instructions</h3>
//         </div>
        
//         <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2">
//           <li>Open your Khalti app on your phone</li>
//           <li>Select 'Scan to Pay' option</li>
//           <li>Scan the QR code below</li>
//           <li>Enter amount: Rs. {finalTotal?.toFixed(2) || '0.00'}</li>
//           <li>Complete the payment</li>
//           <li>Take a screenshot of payment confirmation</li>
//           <li>Upload the screenshot below</li>
//         </ol>
        
//         <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex justify-center">
//           {/* Placeholder QR code - in production this would be real */}
//           <div className="border-2 border-purple-600 p-3 rounded-lg bg-white">
//             <div className="text-center mb-2 font-medium text-sm text-purple-800">
//               Scan to pay
//             </div>
//             <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
//               <span className="text-xs text-gray-500">QR Code</span>
//             </div>
//             <div className="mt-2 text-center text-xs text-gray-600">
//               <p>{khaltiMerchantInfo.name}</p>
//               <p>{khaltiMerchantInfo.phone}</p>
//               <p className="font-medium">Rs. {khaltiMerchantInfo.amount?.toFixed(2) || '0.00'}</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Upload section */}
//       <div className="mb-6">
//         <label className="block text-gray-700 text-sm font-medium mb-2">
//           Upload Payment Screenshot
//         </label>
        
//         {imagePreview ? (
//           <div className="relative mb-3">
//             <img 
//               src={imagePreview} 
//               alt="Payment screenshot" 
//               className="w-full rounded-lg border border-gray-200"
//             />
//             <button 
//               className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
//               onClick={() => {
//                 setPaymentImage(null);
//                 setImagePreview(null);
//               }}
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div 
//             className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
//             onClick={() => document.getElementById('file-upload').click()}
//           >
//             <Upload className="w-10 h-10 text-gray-400 mb-2" />
//             <p className="text-gray-600 text-sm text-center">
//               Click to upload or drag and drop<br />
//               <span className="text-gray-500">PNG, JPG or JPEG (max. 5MB)</span>
//             </p>
//             <input 
//               id="file-upload" 
//               type="file" 
//               className="hidden" 
//               accept="image/png, image/jpeg, image/jpg"
//               onChange={handleFileChange}
//             />
//           </div>
//         )}
//       {/* </div> */}
      
//       <button 
//         onClick={handleCheckout}
//         disabled={checkoutLoading || !finalTotal || finalTotal <= 0 || !paymentImage}
//         className={`w-full py-3 rounded-md font-medium transition duration-200 ${
//           !checkoutLoading && finalTotal > 0 && paymentImage
//             ? 'bg-purple-600 text-white hover:bg-purple-700' 
//             : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//         }`}
//       >
//         {checkoutLoading ? "Please wait..." : "Complete Payment"}
//       </button>
//     </div>
//   );
// };

// export default OnlinePayment;