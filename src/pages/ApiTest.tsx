import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch('http://localhost:8000/');
        const data = await response.json();
        setStatus(`API Response: ${JSON.stringify(data)}`);
      } catch (error) {
        setStatus(`API Error: ${error}`);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4">
      <h1>API Test</h1>
      <p>{status}</p>
    </div>
  );
};

export default ApiTest;