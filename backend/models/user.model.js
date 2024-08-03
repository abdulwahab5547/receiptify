import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
    image: { type: String, required: true }, // Store the image URL or path
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: true, 
        },
        companySlogan: {
            type: String,
        },
        companyLogoUrl: {
            type: String,
        },
        receipts: [receiptSchema],
		receiptUrls: [String],
    }, 
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Define the standalone functions
const findOne = async (criteria) => {
    return await User.findOne(criteria);
};

const findById = async (id) => {
    return await User.findById(id);
};

const findByIdAndUpdate = async (id, update) => {
    return await User.findByIdAndUpdate(id, update, { new: true });
};

// Export the functions and the model
export default User;
export { findOne, findById, findByIdAndUpdate };

// MongoDB will automatically make it users - i.e. lowercase + plural