import React, { useEffect, useState, Suspense, useCallback } from "react";
import { X, Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import EventList from "../components/dashboard/EventList";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Code splitting for components
const EventDetail = React.lazy(() => import("../components/EventDetail"));

const Dashboard = ({ onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: {
      start: null,
      end: null
    },
    timeRange: {
      start: '00:00',
      end: '23:59'
    },
    datePreset: 'today', // 'today', 'yesterday', 'thisWeek', 'thisMonth', 'custom'
    showOnly: 'all' // 'all', 'withPeople', 'withVehicles'
  });
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Memoize event handlers
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    fetchLogs();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/events/logs");
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
      setFilteredLogs(data); // Initialize filtered logs with all logs
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
      
      // Refresh the logs from the server
      await fetchLogs();
      
      // Clear selection if the deleted event was selected
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedEvent(null);
      }
      
      // // If there was an active search, update filtered logs too
      // if (searchDateTime) {
      //   handleSearch();
      // }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/auth/login';
    }
  };

  // Apply filters to logs
  const applyFilters = useCallback(() => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      
      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const startOfDay = new Date(filters.dateRange.start);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(filters.dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (logDate < startOfDay || logDate > endOfDay) {
          return false;
        }
      }
      
      // Time range filter
      if (filters.timeRange) {
        const [startHour, startMinute] = filters.timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = filters.timeRange.end.split(':').map(Number);
        
        const logHour = logDate.getHours();
        const logMinute = logDate.getMinutes();
        
        const logTimeInMinutes = logHour * 60 + logMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        if (logTimeInMinutes < startTimeInMinutes || logTimeInMinutes > endTimeInMinutes) {
          return false;
        }
      }
      
      return true;
    });
  }, [logs, filters]);
  
  // Update filtered logs when filters or logs change
  useEffect(() => {
    setFilteredLogs(applyFilters());
  }, [logs, filters, applyFilters]);
  
  // Handle date preset selection
  const handleDatePreset = (preset) => {
    const today = new Date();
    const newFilters = { ...filters, datePreset: preset };
    
    switch(preset) {
      case 'today':
        newFilters.dateRange = {
          start: today,
          end: today
        };
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        newFilters.dateRange = {
          start: yesterday,
          end: yesterday
        };
        break;
      case 'thisWeek':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        newFilters.dateRange = {
          start: firstDayOfWeek,
          end: today
        };
        break;
      case 'thisMonth':
        newFilters.dateRange = {
          start: new Date(today.getFullYear(), today.getMonth(), 1),
          end: today
        };
        break;
      case 'custom':
        // No change to dateRange, user will set it manually
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
  };
  
  // Handle date range change for custom range
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setFilters(prev => ({
      ...prev,
      dateRange: { 
        start: start ? new Date(start.setHours(0, 0, 0, 0)) : null, 
        end: end ? new Date(end.setHours(23, 59, 59, 999)) : null 
      },
      datePreset: 'custom'
    }));
  };
  
  // Format date for display
  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Select date range';
    const format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(start)} - ${format(end)}`;
  };
  
  // Handle object type filter change
  const handleObjectTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      showOnly: type
    }));
  };
  
  // Handle time range change
  const handleTimeRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      timeRange: {
        ...prev.timeRange,
        [type]: value
      }
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      timeRange: { start: '00:00', end: '23:59' },
      datePreset: 'today',
      showOnly: 'all'
    });
  };

  const handleImageClick = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    if (isMobile) {
      setShowMobileModal(true);
    }
    try {
      const res = await fetch(`http://localhost:5000/api/events/logs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event details");
      const data = await res.json();
      setSelectedEvent(data);
    } catch (err) {
      setSelectedEvent({ error: err.message });
    }
    setDetailLoading(false);
  };

  const closeMobileModal = () => {
    setShowMobileModal(false);
  };

  return (
    <div className="relative h-screen overflow-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8 h-full flex flex-col">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">
              Event Logs
            </h1>
            <div className="flex items-center gap-4">
              <button
                className="text-sm bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded whitespace-nowrap"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Filter Toggle */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-800">Filters</h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showFilters ? (
                <>
                  <ChevronUp size={16} />
                  <span>Hide Filters</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Show Filters</span>
                </>
              )}
            </button>
          </div>
          
          {/* Filter Controls */}
          <div className={`bg-white p-4 mb-5 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 overflow-hidden ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 p-0 border-0 opacity-0'
          }`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</span>
                  <div className="relative flex-1">
                    <DatePicker
                      selected={filters.dateRange.start}
                      onChange={handleDateRangeChange}
                      startDate={filters.dateRange.start}
                      endDate={filters.dateRange.end}
                      selectsRange
                      className="w-full pl-3 pr-10 py-2 text-sm border rounded-md bg-white cursor-pointer text-left"
                      dateFormat="MMM d, yyyy"
                      placeholderText="Select date range"
                      isClearable
                      onClear={() => handleDatePreset('today')}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Quick Select:</span>
                  {['today', 'yesterday', 'thisWeek', 'thisMonth'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleDatePreset(preset)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        filters.datePreset === preset && !filters.datePreset === 'custom'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset === 'today' ? 'Today' : 
                       preset === 'yesterday' ? 'Yesterday' :
                       preset === 'thisWeek' ? 'This Week' : 'This Month'}
                    </button>
                  ))}
                </div>
                
                {filters.datePreset === 'custom' && (
                  <div className="text-sm text-gray-600">
                    {formatDateRange(filters.dateRange.start, filters.dateRange.end)}
                  </div>
                )}
              </div>
              
              {/* Time Range Filter */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Time Range</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="time"
                      value={filters.timeRange.start}
                      onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <div className="mt-5">—</div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="time"
                      value={filters.timeRange.end}
                      onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      min={filters.timeRange.start}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-start pt-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <X size={14} /> Clear Filters
                </button>
              </div>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* Main Content */}
          <div className={`${!isMobile && selectedId ? 'md:w-2/3' : 'w-full'} overflow-y-auto`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
                No events found.
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-8 rounded-lg text-center">
                No events match the current filters.
                <button 
                  onClick={clearFilters}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <div className="mb-4 text-sm text-gray-500">
                  Showing {filteredLogs.length} of {logs.length} events
                </div>
                <EventList 
                  events={filteredLogs}
                  selectedId={selectedId}
                  onEventClick={handleImageClick}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>
          
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-1/3 h-full flex flex-col">
              <Suspense fallback={
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading event details...</p>
                </div>
              }>
                {selectedId ? (
                  detailLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading event details...</p>
                    </div>
                  ) : selectedEvent && !selectedEvent.error ? (
                    <div className="flex-1">
                      <EventDetail event={selectedEvent} />
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                      {selectedEvent?.error || "Error loading event details."}
                    </div>
                  )
                ) : (
                  <div className="bg-blue-50 text-blue-700 p-6 rounded-lg text-center">
                    <p>Select an event to view details</p>
                  </div>
                )}
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      {isMobile && showMobileModal && selectedId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeMobileModal}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
              <button
                onClick={closeMobileModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              
              <Suspense fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading event details...</p>
                </div>
              }>
                {detailLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading event details...</p>
                  </div>
                ) : selectedEvent && !selectedEvent.error ? (
                  <EventDetail 
                    event={selectedEvent} 
                    isMobile={true}
                    onClose={closeMobileModal}
                  />
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-red-500 mb-4">
                      {selectedEvent?.error || "Error loading event details."}
                    </div>
                    <button
                      onClick={closeMobileModal}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Dashboard;
