import React, { useEffect, useState, useCallback } from 'react';

interface Log {
  id: number;
  message: string;
  created_at: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago at ${timeStr}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }) + ` at ${timeStr}`;
  }
};

const RunAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/logs/all')
      .then(res => res.json())
      .then(data => {
        console.log('Logs:', data);
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const addHelloWorld = useCallback(() => {
    const message = 'hello world';
    
    console.log('Adding log:', message);
    
    // Optimistically add the new log to the UI
    const tempId = Date.now();
    const tempLog: Log = {
      id: tempId,
      message: message,
      created_at: new Date().toISOString()
    };
    
    // Add to the beginning of the list and keep only 7
    setLogs(prevLogs => [tempLog, ...prevLogs].slice(0, 7));
    
    fetch('http://localhost:8000/api/v1/logs/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    })
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Inserted successfully:', data);
        // Update with real data from server
        setLogs(prevLogs => {
          const filtered = prevLogs.filter(log => log.id !== tempId);
          return [data, ...filtered].slice(0, 7);
        });
      })
      .catch(err => {
        console.error('Error adding log:', err);
        // Remove the optimistic log on error
        setLogs(prevLogs => prevLogs.filter(log => log.id !== tempId));
        alert('Failed to add log. Check console for details.');
      });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Run Analysis</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activities</h2>
          <button
            onClick={addHelloWorld}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Hello World
          </button>
        </div>
        
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 dark:text-white font-medium">{log.message}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">ID: {log.id}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatRelativeTime(log.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No logs found</p>
        )}
      </div>
    </div>
  );
};

export default RunAnalysis;
