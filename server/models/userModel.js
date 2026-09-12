const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: "Email must be in valid format!"
        }
    },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: "Phone number must be 10 digits long!"
        } 
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    // Never send the password hash back in API responses
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
});

userSchema.pre('save', async function () {
    // Only hash when the password is new or changed, or it would be hashed twice
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);