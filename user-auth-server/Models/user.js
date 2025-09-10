const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add profile fields
  careerPaths: { type: [String], default: [] },
  devSpecializations: { type: [String], default: [] },
  engSpecializations: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  employmentType: { type: String },
  age: { type: Number },
  contactNumber: { type: String },
  experience: { type: Array, default: [] },
  certifications: { type: Array, default: [] },
  languages: { type: [String], default: [] },
  hobbies: { type: [String], default: [] },
  profileSetupComplete: { type: Boolean, default: false },
   recommendedCourses: { 
    type: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      provider: { type: String, required: true },
      url: { type: String, required: true },
      matchReason: { type: String },
      completed: { type: Boolean, default: false }
    }], 
    default: [] 
  },
  subscription: {
    plan: { type: String, enum: ['free', 'beginner', 'developer'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    paymentMethod: String,
    nextBillingDate: Date
    },
    paymentMethods: [{
    type: { type: String, enum: ['visa', 'mastercard', 'paypal', 'netbanking'] },
    lastFour: String,
    expiryDate: Date,
    isDefault: { type: Boolean, default: false }
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema); 
