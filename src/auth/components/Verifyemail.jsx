// import React, { useEffect, useState } from 'react';
// import { Mail } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // ✅ Import

// const VerifyEmail = () => {
//   const [status, setStatus] = useState('idle');
//   const [token, setToken] = useState('');
//   const navigate = useNavigate(); // ✅ Hook

//   const verifyEmail = async (token) => {
//     try {
//       setStatus('verifying');
//       const response = await axios.post(`http://localhost:4000/api/auth/verify/email/${token}`);
//       if (response.data.success) {
//         setStatus('success');
//       } else {
//         setStatus('error');
//       }
//     } catch (error) {
//       console.error('Verification error:', error);
//       setStatus('error');
//     }
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const t = params.get('t');
//     if (t) {
//       setToken(t);
//       verifyEmail(t);
//     }
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
//         <div className="flex justify-center mb-6">
//           <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
//             <Mail className="h-10 w-10 text-blue-600" />
//           </div>
//         </div>

//         {status === 'success' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-green-600 mb-2">Email Verified</h1>
//             <p className="text-center text-gray-600 mb-4">Thank you! Your email has been successfully verified.</p>
//             <div className="mt-4 text-center">
//           <button
//             onClick={() => navigate('/Login')}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Go Back to Login
//           </button>
//         </div>  
//           </>
//         ) : status === 'error' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-red-600 mb-2">Verification Failed</h1>
//             <p className="text-center text-gray-600 mb-4">The verification link is invalid or has expired.</p>
//           </>
//         ) : status === 'verifying' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Verifying...</h1>
//             <p className="text-center text-gray-600 mb-4">Please wait while we verify your email.</p>
//           </>
//         ) : (
//           <>
//             <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h1>
//             <p className="text-gray-600 text-center mb-6">
//               We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
//             </p>
//           </>
//         )}

//         {/* ✅ Go back to Login button */}
        

//         <div className="mt-6 pt-6 border-t border-gray-200 text-center">
//           <p className="text-sm text-gray-500">
//             Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;


// import React, { useEffect, useState } from 'react';
// import { Mail } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const VerifyEmail = () => {
//   const [status, setStatus] = useState('idle');
//   const [token, setToken] = useState('');
//   const navigate = useNavigate();

//   const verifyEmail = async (token) => {
//     try {
//       setStatus('verifying');
//       // Using POST as specified in your routes
//       console.log('Sending verification request with token:', token);
//       const response = await axios.post(`http://localhost:4000/api/auth/verify/email/${token}`);
      
//       console.log('Verification response:', response.data);
//       if (response.data.success) {
//         setStatus('success');
//       } else {
//         setStatus('error');
//       }
//     } catch (error) {
//       console.error('Verification error:', error);
//       setStatus('error');
//     }
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const t = params.get('t');
//     console.log('Token from URL:', t);
//     if (t) {
//       setToken(t);
//       verifyEmail(t);
//     }
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
//         <div className="flex justify-center mb-6">
//           <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
//             <Mail className="h-10 w-10 text-blue-600" />
//           </div>
//         </div>

//         {status === 'success' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-green-600 mb-2">Email Verified</h1>
//             <p className="text-center text-gray-600 mb-4">Thank you! Your email has been successfully verified.</p>
//             <div className="mt-4 text-center">
//               <button
//                 onClick={() => navigate('/login')}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Go Back to Login
//               </button>
//             </div>  
//           </>
//         ) : status === 'error' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-red-600 mb-2">Verification Failed</h1>
//             <p className="text-center text-gray-600 mb-4">The verification link is invalid or has expired.</p>
//             <div className="mt-4 text-center">
//               <button
//                 onClick={() => navigate('/login')}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Return to Login
//               </button>
//             </div>
//           </>
//         ) : status === 'verifying' ? (
//           <>
//             <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Verifying...</h1>
//             <p className="text-center text-gray-600 mb-4">Please wait while we verify your email.</p>
//           </>
//         ) : (
//           <>
//             <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h1>
//             <p className="text-gray-600 text-center mb-6">
//               We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
//             </p>
//           </>
//         )}

//         <div className="mt-6 pt-6 border-t border-gray-200 text-center">
//           <p className="text-sm text-gray-500">
//             Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;



import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [status, setStatus] = useState('idle');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying');
      console.log('Sending verification request with token:', token);
      
      const response = await axios.post(`http://localhost:4000/api/auth/verify/email/${token}`);
      
      console.log('Verification response:', response.data);
      if (response.data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Verification error:', error.response?.data || error.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('t');
    console.log('Token from URL:', t);
    if (t) {
      setToken(t);
      verifyEmail(t);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-center text-green-600 mb-2">Email Verified</h1>
            <p className="text-center text-gray-600 mb-4">Thank you! Your email has been successfully verified.</p>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go Back to Login
              </button>
            </div>  
          </>
        ) : status === 'error' ? (
          <>
            <h1 className="text-2xl font-bold text-center text-red-600 mb-2">Verification Failed</h1>
            <p className="text-center text-gray-600 mb-4">The verification link is invalid or has expired.</p>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return to Login
              </button>
            </div>
          </>
        ) : status === 'verifying' ? (
          <>
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Verifying...</h1>
            <p className="text-center text-gray-600 mb-4">Please wait while we verify your email.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h1>
            <p className="text-gray-600 text-center mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;