const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
},
{
  collection: 'pharmart'
}
)

const User = mongoose.model('User', userSchema, 'users');
// const User = mongoose.model('users', userSchema);
module.exports = User;