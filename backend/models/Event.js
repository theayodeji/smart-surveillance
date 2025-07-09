import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Event', EventSchema);
