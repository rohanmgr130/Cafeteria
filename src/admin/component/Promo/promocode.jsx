import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { broadcastPromocode } from '../../../services/notification.services'; // Adjust path as needed

function Promo() {
  // States for form inputs
  const [code, setCode] = useState('');
  const [prefix, setPrefix] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  
  // Predefined prefix options
  const prefixOptions = [
    { value: '', label: 'No Prefix (Auto-generate only)' },
    { value: 'WELCOME', label: 'WELCOME - New customer' },
    { value: 'SUMMER', label: 'SUMMER - Summer sale' },
    { value: 'WINTER', label: 'WINTER - Winter sale' },
    { value: 'FESTIVE', label: 'FESTIVE - Festival offer' },
    { value: 'WEEKEND', label: 'WEEKEND - Weekend deal' },
    { value: 'STUDENT', label: 'STUDENT - Student discount' },

  ];
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [view, setView] = useState('list'); // list, create, bulk, detail

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [realTimeValidation, setRealTimeValidation] = useState({});

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

  // Real-time validation helpers
  const validateCodeStrength = (codeValue) => {
    if (!codeValue) return { isValid: true, message: '' };
    
    const issues = [];
    if (codeValue.length < 3) issues.push('minimum 3 characters');
    if (codeValue.length > 20) issues.push('maximum 20 characters');
    if (!/^[A-Z0-9]+$/.test(codeValue)) issues.push('only letters and numbers allowed');
    if (/^\d+$/.test(codeValue)) issues.push('cannot be only numbers');
    
    return {
      isValid: issues.length === 0,
      message: issues.length > 0 ? `Code issues: ${issues.join(', ')}` : 'Valid code format'
    };
  };

  const validatePrefix = (prefixValue) => {
    if (!prefixValue) return { isValid: true, message: 'No prefix selected' };
    
    const selectedOption = prefixOptions.find(opt => opt.value === prefixValue);
    return {
      isValid: true,
      message: selectedOption ? `Selected: ${selectedOption.label}` : 'Valid prefix'
    };
  };

  const validateDiscountValue = (value, type) => {
    if (!value) return { isValid: false, message: 'Discount value is required' };
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Must be a positive number' };
    }
    
    if (type === 'percentage') {
      if (numValue > 100) return { isValid: false, message: 'Cannot exceed 100%' };
      if (numValue < 1) return { isValid: false, message: 'Minimum 1% discount' };
      return { isValid: true, message: `${numValue}% discount` };
    } else {
      if (numValue > 10000) return { isValid: false, message: 'Cannot exceed Rs. 10,000' };
      if (numValue < 10) return { isValid: false, message: 'Minimum Rs. 10 discount' };
      return { isValid: true, message: `Rs. ${numValue} discount` };
    }
  };

  const validateExpiryDate = (dateValue) => {
    if (!dateValue) return { isValid: false, message: 'Expiry date is required' };
    
    const today = new Date();
    const expiry = new Date(dateValue);
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 2);
    
    if (expiry <= today) return { isValid: false, message: 'Must be a future date' };
    if (expiry > maxDate) return { isValid: false, message: 'Cannot be more than 2 years ahead' };
    
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return { isValid: true, message: `Expires in ${daysUntilExpiry} days` };
  };

  // Enhanced validation function with toast notifications
  const validateForm = (isCreateForm = true, showToasts = true) => {
    const errors = {};
    let hasErrors = false;

    // Code validation (only for single create, not bulk)
    if (isCreateForm && view === 'create' && code) {
      const codeValidation = validateCodeStrength(code);
      if (!codeValidation.isValid) {
        errors.code = codeValidation.message;
        if (showToasts) toast.error(`Invalid promo code: ${codeValidation.message}`);
        hasErrors = true;
      }
    }

    // Prefix validation
    if (prefix) {
      const validPrefixes = prefixOptions.map(opt => opt.value).filter(val => val !== '');
      if (!validPrefixes.includes(prefix)) {
        errors.prefix = 'Please select a valid prefix from the dropdown';
        if (showToasts) toast.error('Invalid prefix selection');
        hasErrors = true;
      }
    }

    // Discount value validation
    const discountValidation = validateDiscountValue(discountValue, discountType);
    if (!discountValidation.isValid) {
      errors.discountValue = discountValidation.message;
      if (showToasts) toast.error(`Discount error: ${discountValidation.message}`);
      hasErrors = true;
    }

    // Expiry date validation
    const expiryValidation = validateExpiryDate(expiryDate);
    if (!expiryValidation.isValid) {
      errors.expiryDate = expiryValidation.message;
      if (showToasts) toast.error(`Expiry date error: ${expiryValidation.message}`);
      hasErrors = true;
    }

    // Min order value validation
    if (minOrderValue) {
      const minOrder = Number(minOrderValue);
      if (isNaN(minOrder) || minOrder < 0) {
        errors.minOrderValue = 'Must be a positive number or zero';
        if (showToasts) toast.error('Invalid minimum order value');
        hasErrors = true;
      } else if (minOrder > 100000) {
        errors.minOrderValue = 'Cannot exceed Rs. 1,00,000';
        if (showToasts) toast.error('Minimum order value is too high');
        hasErrors = true;
      }
    }

    // Max discount amount validation
    if (maxDiscountAmount) {
      const maxDiscount = Number(maxDiscountAmount);
      if (isNaN(maxDiscount) || maxDiscount <= 0) {
        errors.maxDiscountAmount = 'Must be a positive number';
        if (showToasts) toast.error('Invalid maximum discount amount');
        hasErrors = true;
      } else if (maxDiscount > 50000) {
        errors.maxDiscountAmount = 'Cannot exceed Rs. 50,000';
        if (showToasts) toast.error('Maximum discount amount is too high');
        hasErrors = true;
      }
    }

    // Bulk count validation
    if (view === 'bulk') {
      const bulk = Number(bulkCount);
      if (!bulkCount || isNaN(bulk) || bulk < 1 || bulk > 100) {
        errors.bulkCount = 'Must be between 1 and 100';
        if (showToasts) toast.error('Invalid bulk count (1-100 allowed)');
        hasErrors = true;
      }
    }

    // Notification message validation
    if (notifyUsers && notificationMessage && notificationMessage.trim().length > 500) {
      errors.notificationMessage = 'Cannot exceed 500 characters';
      if (showToasts) toast.error('Notification message is too long');
      hasErrors = true;
    }

    // Cross-field validation
    if (discountType === 'fixed' && maxDiscountAmount && Number(discountValue) > Number(maxDiscountAmount)) {
      errors.discountValue = 'Fixed discount cannot exceed maximum discount amount';
      if (showToasts) toast.error('Fixed discount amount is higher than maximum discount cap');
      hasErrors = true;
    }

    // Logical validation
    if (minOrderValue && discountType === 'fixed' && Number(discountValue) >= Number(minOrderValue)) {
      if (showToasts) toast.warning('⚠️ Fixed discount is close to minimum order value - customers might abuse this');
    }

    return { errors, hasErrors };
  };

  // Real-time validation on input change
  const handleInputChange = (field, value, additionalValidation = null) => {
    // Update the field value
    switch (field) {
      case 'code': setCode(value.toUpperCase()); break;
      case 'prefix': setPrefix(value); break;
      case 'discountValue': setDiscountValue(value); break;
      case 'expiryDate': setExpiryDate(value); break;
      case 'minOrderValue': setMinOrderValue(value); break;
      case 'maxDiscountAmount': setMaxDiscountAmount(value); break;
      case 'bulkCount': setBulkCount(value); break;
      case 'notificationMessage': setNotificationMessage(value); break;
      default: break;
    }

    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Perform real-time validation
    let validation = { isValid: true, message: '' };
    
    switch (field) {
      case 'code':
        validation = validateCodeStrength(value);
        break;
      case 'discountValue':
        validation = validateDiscountValue(value, discountType);
        break;
      case 'expiryDate':
        validation = validateExpiryDate(value);
        break;
      case 'prefix':
        validation = validatePrefix(value);
        break;
      default:
        break;
    }

    setRealTimeValidation(prev => ({
      ...prev,
      [field]: validation
    }));

    // Additional custom validation
    if (additionalValidation) {
      additionalValidation(value);
    }
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
        toast.success(`Loaded ${res.data.promoCodes.length} promo codes`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch promo codes';
      toast.error(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, config]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const createPromoCode = async (e) => {
    e.preventDefault();
    
    // Show validation loading toast
    const validationToast = toast.loading('Validating promo code details...');
    
    const { errors, hasErrors } = validateForm(true, true);
    setValidationErrors(errors);

    toast.dismiss(validationToast);

    if (hasErrors) {
      toast.error('Please fix all validation errors before proceeding', {
        duration: 4000,
        icon: '❌'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Show creation progress toast
      const creationToast = toast.loading('Creating promo code...');

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

      toast.dismiss(creationToast);

      if (res.data.success) {
        toast.success(`Promo code "${res.data.promoCode.code}" created successfully!`, {
          duration: 4000
        });
        
        // If notification is enabled, broadcast the promocode to all users
        if (notifyUsers && res.data.promoCode) {
          try {
            const notificationToast = toast.loading('Sending notifications to users...');
            
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
            toast.dismiss(notificationToast);
            toast.success('Notifications sent to all users successfully!', {
              duration: 3000
            });
          } catch (notifError) {
            console.error('Failed to send promocode notifications:', notifError);
            toast.error('Promo code created but failed to notify users', {
              duration: 4000
            });
          }
        }
        
        resetForm();
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create promo code';
      
      if (err.response?.status === 409) {
        toast.error('Promo code already exists. Please use a different code.', {
          duration: 5000
        });
      } else if (err.response?.status === 400) {
        toast.error(`Invalid data: ${errorMessage}`, {
          duration: 5000
        });
      } else {
        toast.error(`Creation failed: ${errorMessage}`, {
          duration: 5000
        });
      }
      
      console.error('Create promo code error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBulkCodes = async (e) => {
    e.preventDefault();
    
    const validationToast = toast.loading('Validating bulk generation parameters...');
    
    const { errors, hasErrors } = validateForm(false, true);
    setValidationErrors(errors);

    toast.dismiss(validationToast);

    if (hasErrors) {
      toast.error('Please fix validation errors before generating bulk codes', {
        duration: 4000,
        icon: '❌'
      });
      return;
    }

    try {
      setLoading(true);
      
      const generationToast = toast.loading(`Generating ${bulkCount} promo codes...`);

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

      toast.dismiss(generationToast);

      if (res.data.success) {
        toast.success(`Successfully generated ${bulkCount} promo codes!`, {
          duration: 4000
        });
        
        // If notification is enabled and there are codes generated, broadcast the first one
        if (notifyUsers && res.data.promoCodes && res.data.promoCodes.length > 0) {
          try {
            const notificationToast = toast.loading('Notifying users about new promo batch...');
            
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
            toast.dismiss(notificationToast);
            toast.success('Batch notification sent to all users!', {
              duration: 3000
            });
          } catch (notifError) {
            console.error('Failed to send promocode notifications:', notifError);
            toast.error('Bulk codes generated but failed to notify users', {
              duration: 4000
            });
          }
        }
        
        resetForm();
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate bulk promo codes';
      
      if (err.response?.status === 429) {
        toast.error('Too many requests. Please wait before generating more codes.', {
          duration: 6000
        });
      } else {
        toast.error(`Bulk generation failed: ${errorMessage}`, {
          duration: 5000
        });
      }
      
      console.error('Bulk generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const broadcastExistingCode = async (promoCode) => {
    try {
      setLoading(true);
      
      const broadcastToast = toast.loading(`Broadcasting "${promoCode.code}" to all users...`);
      
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
      toast.dismiss(broadcastToast);
      toast.success(`"${promoCode.code}" broadcasted to all users successfully!`, {
        duration: 4000
      });
    } catch (err) {
      toast.error(`Failed to broadcast "${promoCode.code}". Please try again.`, {
        duration: 5000
      });
      console.error('Error broadcasting promocode:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePromoCode = async (id) => {
    const promoToDelete = promoCodes.find(p => p._id === id);
    const confirmMessage = `Are you sure you want to delete "${promoToDelete?.code}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      
      const deleteToast = toast.loading('Deleting promo code...');

      const res = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());

      toast.dismiss(deleteToast);

      if (res.data.success) {
        toast.success(`🗑️ Promo code "${promoToDelete?.code}" deleted successfully!`, {
          duration: 3000
        });
        fetchPromoCodes();
        if (view === 'detail') {
          setView('list');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete promo code';
      toast.error(`❌ Delete failed: ${errorMessage}`, {
        duration: 5000
      });
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPromoCodeDetails = async (id) => {
    try {
      setLoading(true);
      
      const fetchToast = toast.loading('Loading promo code details...');
      
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${id}`, config());
      
      toast.dismiss(fetchToast);
      
      if (res.data.success) {
        setSelectedPromoCode(res.data.promoCode);
        setView('detail');
        toast.success('📋 Promo code details loaded');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch promo code details';
      toast.error(`❌ ${errorMessage}`, {
        duration: 4000
      });
      console.error('Fetch details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePromoCode = async (e) => {
    e.preventDefault();
    
    // Quick validation for update
    const updateErrors = {};
    if (selectedPromoCode.expiryDate && selectedPromoCode.expiryDate.split('T')[0] < getTodayDate()) {
      updateErrors.expiryDate = 'Expiry date cannot be in the past';
      toast.error('❌ Cannot set expiry date in the past');
      return;
    }

    try {
      setLoading(true);
      
      const updateToast = toast.loading('Updating promo code...');
      
      const data = {
        isActive: selectedPromoCode.isActive,
        expiryDate: selectedPromoCode.expiryDate,
        minOrderValue: Number(selectedPromoCode.minOrderValue),
        maxDiscountAmount: selectedPromoCode.maxDiscountAmount ? Number(selectedPromoCode.maxDiscountAmount) : null,
      };

      const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/adminpromo/${selectedPromoCode._id}`, data, config());

      toast.dismiss(updateToast);

      if (res.data.success) {
        toast.success(`✅ "${selectedPromoCode.code}" updated successfully!`, {
          duration: 3000
        });
        fetchPromoCodes();
        setView('list');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update promo code';
      toast.error(`❌ Update failed: ${errorMessage}`, {
        duration: 5000
      });
      console.error('Update error:', err);
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
    setRealTimeValidation({});
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

  // Enhanced Input field component with real-time validation
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
    fieldName,
    ...props 
  }) => {
    const hasError = validationErrors[errorKey];
    const realTimeInfo = realTimeValidation[fieldName];
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e);
            if (fieldName) {
              handleInputChange(fieldName, e.target.value);
            }
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors ${
            hasError 
              ? 'border-red-500 bg-red-50 focus:ring-red-400' 
              : realTimeInfo?.isValid === false
              ? 'border-yellow-500 bg-yellow-50 focus:ring-yellow-400'
              : realTimeInfo?.isValid === true
              ? 'border-green-500 bg-green-50 focus:ring-green-400'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder={placeholder}
          min={min}
          max={max}
          {...props}
        />
        
        {/* Real-time validation feedback */}
        {realTimeInfo?.message && (
          <p className={`text-xs mt-1 ${
            realTimeInfo.isValid ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {realTimeInfo.isValid ? '✓' : '⚠️'} {realTimeInfo.message}
          </p>
        )}
        
        {/* Help text */}
        {helpText && !realTimeInfo?.message && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
        
        {/* Error message */}
        {hasError && (
          <p className="text-sm text-red-600 mt-1 font-medium">❌ {hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Toast Configuration */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
            },
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
          <p className="mt-2 text-gray-600">Create, manage, and track your promotional discount codes</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { key: 'list', label: 'All Promo Codes', icon: '📋' },
              { key: 'create', label: 'Create New', icon: '➕' },
              { key: 'bulk', label: 'Bulk Generate', icon: '📦' }
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
                    fieldName="code"
                    helpText="Optional: Enter a custom code (min 3 characters) or leave blank for auto-generation"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefix
                    </label>
                    <select
                      value={prefix}
                      onChange={(e) => {
                        setPrefix(e.target.value);
                        handleInputChange('prefix', e.target.value);
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors ${
                        validationErrors.prefix 
                          ? 'border-red-500 bg-red-50 focus:ring-red-400' 
                          : realTimeValidation.prefix?.isValid === false
                          ? 'border-yellow-500 bg-yellow-50 focus:ring-yellow-400'
                          : realTimeValidation.prefix?.isValid === true
                          ? 'border-green-500 bg-green-50 focus:ring-green-400'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      {prefixOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Real-time validation feedback */}
                    {realTimeValidation.prefix?.message && (
                      <p className={`text-xs mt-1 ${
                        realTimeValidation.prefix.isValid ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {realTimeValidation.prefix.message}
                      </p>
                    )}
                    
                    {/* Help text */}
                    {!realTimeValidation.prefix?.message && (
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Choose a prefix for auto-generated codes (e.g., SAVE123ABC)
                      </p>
                    )}
                    
                    {/* Error message */}
                    {validationErrors.prefix && (
                      <p className="text-sm text-red-600 mt-1 font-medium">{validationErrors.prefix}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        handleInputChange('discountValue', discountValue);
                      }}
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
                    fieldName="discountValue"
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
                    fieldName="expiryDate"
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
                    fieldName="minOrderValue"
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
                    fieldName="maxDiscountAmount"
                    helpText="Optional: Cap the discount amount (useful for percentage discounts)"
                  />
                </div>
              </div>

              {/* Notification Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                
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
                      onChange={(e) => {
                        setNotificationMessage(e.target.value);
                        handleInputChange('notificationMessage', e.target.value);
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                      <span className={`text-xs ${notificationMessage.length > 450 ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
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
                      Creating...
                    </>
                  ) : (
                    'Create Promo Code'
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
                    fieldName="bulkCount"
                    helpText="Maximum 100 codes per batch"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefix
                    </label>
                    <select
                      value={prefix}
                      onChange={(e) => {
                        setPrefix(e.target.value);
                        handleInputChange('prefix', e.target.value);
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-gray-500 transition-colors ${
                        validationErrors.prefix 
                          ? 'border-red-500 bg-red-50 focus:ring-red-400' 
                          : realTimeValidation.prefix?.isValid === false
                          ? 'border-yellow-500 bg-yellow-50 focus:ring-yellow-400'
                          : realTimeValidation.prefix?.isValid === true
                          ? 'border-green-500 bg-green-50 focus:ring-green-400'
                          : 'border-gray-300 focus:ring-gray-500'
                      }`}
                    >
                      {prefixOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Real-time validation feedback */}
                    {realTimeValidation.prefix?.message && (
                      <p className={`text-xs mt-1 ${
                        realTimeValidation.prefix.isValid ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {realTimeValidation.prefix.message}
                      </p>
                    )}
                    
                    {/* Help text */}
                    {!realTimeValidation.prefix?.message && (
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Choose a prefix for all generated codes in this batch
                      </p>
                    )}
                    
                    {/* Error message */}
                    {validationErrors.prefix && (
                      <p className="text-sm text-red-600 mt-1 font-medium">{validationErrors.prefix}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => {
                        setDiscountType(e.target.value);
                        handleInputChange('discountValue', discountValue);
                      }}
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
                    fieldName="discountValue"
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
                    fieldName="expiryDate"
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
                    fieldName="minOrderValue"
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
                    fieldName="maxDiscountAmount"
                    helpText="Optional: Cap the discount amount for all codes"
                  />
                </div>
              </div>

              {/* Notification Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📱 Notification Settings</h3>
                
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
                      onChange={(e) => {
                        setNotificationMessage(e.target.value);
                        handleInputChange('notificationMessage', e.target.value);
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${
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
                      <span className={`text-xs ${notificationMessage.length > 450 ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
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
                    'Generate Bulk Codes'
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
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
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
                      {selectedPromoCode.isActive ? ' Active' : ' Inactive'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPromoCode.isUsed 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPromoCode.isUsed ? 'Used' : ' Available'}
                    </span>
                    {isExpired(selectedPromoCode.expiryDate) && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        ⏰ Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">💰 Discount Details</h4>
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
                    <h4 className="font-medium text-gray-900 mb-2">⏰ Timeline</h4>
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
                  <h4 className="font-medium text-yellow-800 mb-2">📊 Usage Details</h4>
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
                    {loading ? 'Sending...' : 'Broadcast to All Users'}
                  </button>
                </div>
              )}

              {/* Edit Form */}
              {!selectedPromoCode.isUsed && (
                <form onSubmit={updatePromoCode} className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">✏️ Edit Promo Code</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedPromoCode.isActive?.toString()}
                        onChange={(e) => {
                          const newStatus = e.target.value === 'true';
                          setSelectedPromoCode({
                            ...selectedPromoCode,
                            isActive: newStatus
                          });
                          toast.success(`Status changed to ${newStatus ? 'Active' : 'Inactive'}`, { duration: 2000 });
                        }}
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
                      {loading ? 'Updating...' : '✅ Update Promo Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromoCode(selectedPromoCode._id)}
                      className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('list');
                        toast.success('Returned to promo codes list', { duration: 2000 });
                      }}
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
                      onClick={() => {
                        setView('list');
                        toast.success('Returned to promo codes list', { duration: 2000 });
                      }}
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
                  onClick={() => {
                    setView('create');
                    toast.success('Ready to create your first promo code!', { duration: 2000 });
                  }}
                  className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                   Create First Promo Code
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
                                    : 'Active'
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
                                className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
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
                    onClick={() => {
                      setCurrentPage(Math.max(1, currentPage - 1));
                      toast.success(`Page ${Math.max(1, currentPage - 1)}`, { duration: 1500 });
                    }}
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
                    onClick={() => {
                      setCurrentPage(Math.min(totalPages, currentPage + 1));
                      toast.success(`Page ${Math.min(totalPages, currentPage + 1)}`, { duration: 1500 });
                    }}
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
                        onClick={() => {
                          setCurrentPage(Math.max(1, currentPage - 1));
                          toast.success(`Page ${Math.max(1, currentPage - 1)}`, { duration: 1500 });
                        }}
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
                                  onClick={() => {
                                    setCurrentPage(page);
                                    toast.success(`Page ${page}`, { duration: 1500 });
                                  }}
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
                              onClick={() => {
                                setCurrentPage(page);
                                toast.success(`Page ${page}`, { duration: 1500 });
                              }}
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
                        onClick={() => {
                          setCurrentPage(Math.min(totalPages, currentPage + 1));
                          toast.success(`Page ${Math.min(totalPages, currentPage + 1)}`, { duration: 1500 });
                        }}
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
                    <div className="text-2xl"></div>
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