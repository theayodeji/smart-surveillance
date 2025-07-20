import React from 'react';
import { Trash2 } from 'lucide-react';

const EventList = ({ events, selectedId, onEventClick, onDelete }) => {
  if (events.length === 0) {
    return (
      <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
        No events found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((log) => (
        <div
          key={log._id}
          className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-md ${
            selectedId === log._id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onEventClick(log._id)}
        >
          <img
            src={log.imageUrl}
            alt="Event"
            className="w-full h-48 object-cover bg-gray-200"
          />
          <div className="p-3 flex-1">
            <div className="text-gray-600 text-sm text-center">
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(log._id);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 transition-colors"
            title="Delete Event"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventList;
