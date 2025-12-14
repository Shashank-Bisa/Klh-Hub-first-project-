const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'] 
    },
    date: { 
        type: Date, 
        required: [true, 'Date is required'] 
    },
    time: { 
        type: String, 
        required: [true, 'Time is required'] 
    },
    location: { 
        type: String, 
        required: [true, 'Location is required'] 
    },
    category: { 
        type: String, 
        required: [true, 'Category is required'] 
    },
    organizer: { 
        type: String, 
        required: [true, 'Organizer is required'] 
    },
    // Array of User IDs who have registered
    registrations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // The User ID who created the event
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true // Generally a good idea to enforce the creator
    }
}, 
{ 
    // ✅ FIX: Use timestamps to automatically manage createdAt and updatedAt
    timestamps: true 
});

// Export the model using the capitalized name 'Event'
module.exports = mongoose.model('Event', EventSchema);