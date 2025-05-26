import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Promocode = () => {
  const [pcode, setPcode] = useState('');
  const [tokenValue, setTokenValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [promos, setPromos] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/staff/get-all-promo`);
      if (res.data.success) {
        setPromos(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch promo codes", err);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/api/staff/create-promo`, {
        pcode,
        tokenValue,
        discountPercentage,
        expiresAt,
      });

      setMessage(res.data.message);
      setPcode('');
      setTokenValue('');
      setDiscountPercentage('');
      setExpiresAt('');
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Promo Codes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add Promo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePromo} className="space-y-4 mb-6">
          <div>
            <label className="block mb-1 font-medium">Promo Code</label>
            <input
              type="text"
              value={pcode}
              onChange={(e) => setPcode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Token Value</label>
            <input
              type="number"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Discount Percentage</label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Expiry Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>
      )}

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div>
        <h3 className="text-lg font-semibold mb-2">Available Promos:</h3>
        {promos.length === 0 ? (
          <p className="text-gray-600">No valid promo codes available.</p>
        ) : (
          <table className="w-full border mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Code</th>
                <th className="py-2 px-4 text-left">Discount (%)</th>
                <th className="py-2 px-4 text-left">Token Cost</th>
                <th className="py-2 px-4 text-left">Expires At</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo._id} className="border-t">
                  <td className="py-2 px-4">{promo.pcode}</td>
                  <td className="py-2 px-4">{promo.discountPercentage}%</td>
                  <td className="py-2 px-4">{promo.tokenValue}</td>
                  <td className="py-2 px-4">
                    {new Date(promo.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Promocode;
