import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import CashPayment from "./CashPayment";
import OnlinePayment from "./OnlinePayment";

const MyOrder = () => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const userId = localStorage.getItem("id");
    const navigate = useNavigate();
    
    const [cartTotal, setCartTotal] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [cartDetails, setCartDetails] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    // Show toast notification
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        // Auto hide after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    // Total cart amount get 
    const getTotalCartAmount = async (id) => {
        if (!userId) {
            setError("Please login to view your cart");
            showToast("Please login to view your cart", "error");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/get-cart/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch cart");
            }
    
            const data = await response.json();
            setCartDetails(data);
            setCartTotal(data.orderTotal);
            // Use finalTotal calculated by backend
            setFinalTotal(data.finalTotal);
            setLoading(false);
        } catch (error) {
            console.log("Error while fetching cart: ", error);
            setError("Failed to load cart data");
            showToast("Failed to load cart data", "error");
            setLoading(false);
        }
    };

    // Cash order payment
    const handlePlaceOrder = async() => {
        try {
            setCheckoutLoading(true);
            
            // Check if cart exists
            if (!cartDetails._id) {
                showToast("No active cart found", "error");
                setCheckoutLoading(false);
                return;
            }
            
            const response = await fetch("http://localhost:4000/api/order/create-order", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cartId: cartDetails._id,
                    orderMethod: "cash-on",
                    additionalInfo: {
                        orderNote: "Cash on  order"
                    }
                    // No need to manually add promoCode and discount since the cart model 
                    // automatically adds these and the order creation process copies cart data
                })
            });
   
            const data = await response.json();
            if(data.success) {
                showToast(data.message || "Order placed successfully!", "success");
                // Wait for toast to be visible before navigating
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                showToast(data.message || "Failed to place order", "error");
            }
        } catch (error) {
            console.log("Error while placing order: ", error);
            showToast("Something went wrong", "error");
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Online khalti payment
    const handleCheckout = async(imageFile) => {
        try {
            setCheckoutLoading(true);
            
            // Check if cart exists
            if (!cartDetails._id) {
                showToast("No active cart found", "error");
                setCheckoutLoading(false);
                return;
            }
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('cartId', cartDetails._id);
            formData.append('orderMethod', 'khalti');
            
            // Add the screenshot if available
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            // Add additional information
            formData.append('additionalInfo', JSON.stringify({
                paymentType: "khalti",
                orderNote: "Online payment order"
                // No need to manually add promoCode and discount since the cart model
                // automatically handles this and the order creation process copies cart data
            }));
            
            const response = await fetch("http://localhost:4000/api/order/create-order", {
                method: 'POST',
                body: formData
            });
        
            const data = await response.json();
            if(data.success) {
                showToast(data.message || "Order placed successfully!", "success");
                // Wait for toast to be visible before navigating
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                showToast(data.message || "Failed to place order", "error");
            }
        } catch (error) {
            console.log("Error while placing order: ", error);
            showToast("Something went wrong", "error");
        } finally {
            setCheckoutLoading(false);
        }
    };

    // const handleKhalti = ()

    // Refresh cart details if promo code changes
    const refreshCartDetails = () => {
        if(userId) {
            getTotalCartAmount(userId);
        }
    };

    useEffect(() => {
        if(userId) {
            getTotalCartAmount(userId);
        } else {
            showToast("Please login to view your cart", "error");
        }
    }, [userId]);
  
    return (
        <div className="max-w-md mx-auto py-8 relative">
            {/* Toast notification */}
            {toast && (
                <div 
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-md shadow-md flex items-center justify-between w-11/12 max-w-md ${
                        toast.type === "error" ? "bg-red-100 text-red-700" : 
                        toast.type === "success" ? "bg-green-100 text-green-700" : 
                        "bg-blue-100 text-blue-700"
                    }`}
                >
                    <div className="flex items-center">
                        {toast.type === "error" ? (
                            <AlertCircle className="mr-2 h-5 w-5" />
                        ) : toast.type === "success" ? (
                            <CheckCircle className="mr-2 h-5 w-5" />
                        ) : (
                            <Info className="mr-2 h-5 w-5" />
                        )}
                        <span>{toast.message}</span>
                    </div>
                    <button 
                        onClick={() => setToast(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1> */}
            
            <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Payment Method</h2>
                <div className="flex gap-4">
                    <div 
                        className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${
                            paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('cash')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                    paymentMethod === 'cash' ? 'bg-green-500' : 'border border-gray-300'
                                }`}></div>
                                <span>Cash on Pay</span>
                            </div>
                            <span className="text-gray-500 text-2xl">💵</span>
                        </div>
                    </div>
                    
                    {/* <div 
                        className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${
                            paymentMethod === 'khalti' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('khalti')}
                    > */}
                        {/* <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                    paymentMethod === 'online' ? 'bg-blue-500' : 'border border-gray-300'
                                }`}></div>
                                <span>Khalti</span>
                            </div>
                            <span className="text-gray-500 text-2xl">💳</span>
                        </div> */}
                        {/* <button>proceed to payment</button> */}
                    {/* </div> */}
                </div>
            </div>
            
            {paymentMethod === 'cash' ? (
                <CashPayment 
                    cartTotal={cartTotal} 
                    onPlaceOrder={handlePlaceOrder} 
                    loading={loading}
                    checkoutLoading={checkoutLoading}
                    cartDetails={cartDetails}
                    refreshCartDetails={refreshCartDetails}
                />
            ) :
             (
                <OnlinePayment 
                    cartTotal={cartTotal} 
                    onCheckout={handleCheckout} 
                    loading={loading}
                    checkoutLoading={checkoutLoading}
                    cartDetails={cartDetails}
                    refreshCartDetails={refreshCartDetails}
                />
            )
            }
        </div>
    );
};
  
export default MyOrder;
