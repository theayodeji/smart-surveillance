import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';

const EventDetail = ({ event, onClose }) => {
    useEffect(() => {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!event) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Event Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-2/3 relative bg-black flex items-center justify-center">
                        <img
                            src={event.imageUrl}
                            alt="Event"
                            className="max-h-[70vh] w-auto object-contain"
                        />
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = event.imageUrl;
                                const filename = `event-${event._id || 'image'}.jpg`;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                            title="Download Image"
                            aria-label="Download Image"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                    
                    {/* Details Section */}
                    <div className="md:w-1/3 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Event ID</h3>
                                <p className="mt-1 text-sm text-gray-900 break-all">{event._id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(event.timestamp).toLocaleString()}
                                </p>
                            </div>
                            {/* Add more event details here as needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
