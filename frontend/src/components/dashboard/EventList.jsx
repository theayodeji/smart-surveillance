import React from 'react';
import { Trash2, Check } from 'lucide-react';

const EventList = ({ 
  events, 
  selectedId, 
  onEventClick, 
  onDelete, 
  selectedEvents = [], 
  onSelect, 
  isBulkSelectMode = false 
}) => {
  if (events.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
        No events found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((log) => {
        const isSelected = selectedEvents.includes(log._id);
        return (
          <div
            key={log._id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-md relative ${
              selectedId === log._id ? 'ring-2 ring-blue-500' : ''
            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => !isBulkSelectMode && onEventClick(log._id)}
          >
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* Individual Delete Button - Always Visible */}
             {!isBulkSelectMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(log._id);
                }}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Delete Event"
              >
                <Trash2 size={16} />
              </button>
              )}
              {/* Bulk Selection Checkbox - Only in Bulk Select Mode */}
              {isBulkSelectMode && (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 border-gray-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(log._id);
                  }}
                >
                  {isSelected && <Check size={16} className="text-blue-500" />}
                </div>
              )}
            </div>
            
            <img
              src={log.imageUrl}
              alt="Event"
              className={`w-full h-48 object-cover bg-gray-200 ${isSelected ? 'opacity-70' : ''}`}
            />
            <div className="p-3 flex-1">
              <div className="text-gray-600 text-sm text-center">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;
