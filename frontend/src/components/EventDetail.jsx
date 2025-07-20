import React from 'react';

const EventDetail = ({ event, onClose, isMobile = false }) => {
    if (!event) return null;
    
    return (
        <div className="h-full">
            {isMobile && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold p-3">Event Details</h2>

                </div>
            )}
            <div className="bg-white md:rounded-lg overflow-hidden shadow-sm">
                <div className="sticky top-0 z-10 bg-white">
                    <img
                        src={event.imageUrl}
                        alt="Event"
                        className="w-full max-h-96 object-cover bg-gray-100"
                    />
                </div>
                <div className="p-4 h-[calc(100%-240px)] overflow-y-auto">
                    <div className="space-y-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Event ID</h3>
                            <p className="text-sm text-gray-900 break-all">{event._id}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                            <p className="text-sm text-gray-900">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
