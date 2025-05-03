import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/FooterPart";
import MyOrder from "../components/Order/MyOrder";

const Checkout = () => {
  const router = useNavigate();
  const orderId = "6808badf626b41196225c5fd";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (method) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:4000/khalti/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.khaltiPaymentUrl) {
        window.location.href = data.khaltiPaymentUrl;
      } else {
        setError(data.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      setError("Payment processing error. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-9 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <span className="text-sm mt-1 font-medium">Cart</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-blue-600"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <span className="text-sm mt-1 font-medium">Checkout</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
                <span className="text-sm mt-1 font-medium text-gray-600">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary Section */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Cash on </h2>
              </div>
              <div className="p-6">
                <MyOrder />
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800"> Khalti Payment</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Payment Method</h3>
                    
                    {/* Payment Method Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handlePayment('khalti')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between bg-white border-2 border-[#5C2D91] hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#5C2D91] rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">K</span>
                          </div>
                          <span className="font-medium">Khalti</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <div className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 text-gray-500 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="font-medium">Credit Card</span>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming soon</span>
                      </div>
                      
                      <div className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 text-gray-500 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="font-medium">Bank Transfer</span>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming soon</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Payment Button */}
                  <button
                    onClick={() => handlePayment('khalti')}
                    disabled={isLoading}
                    className="w-full bg-[#07082b] hover:bg-[#2bad49] text-white text-lg font-semibold px-6 py-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    {isLoading ? "Processing..." : "Complete Payment"}
                  </button>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}
                  
                  {/* Security Note */}
                  <div className="mt-6 flex items-center justify-center text-gray-500 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure payment processed by Khalti
                  </div>
                </div>
              </div>
              
              {/* Help Section */}
              <div className="mt-4 bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Need Help?
                  </h3>
                  <p className="text-sm text-gray-600">
                    If you have questions about your order or payment, contact our support team at{' '}
                    <a href="mailto:support@example.com" className="text-blue-600 hover:underline">Rohanmgr130@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
