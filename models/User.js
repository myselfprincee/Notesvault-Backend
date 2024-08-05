import {Schema, model} from 'mongoose';

// const connectToMongo = require('../db')

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
    // unique: true
  },
  password: {
    type: String,
    required: true
  },
  // confirmPassword : {
  //   type: String,
  //   required: true
  // },

  date:{
    type: Date,
    default: Date.now
  }


});

// UserSchema.pre('save', function (next) {
//   const user = this;

//   if (user.password !== user.confirmPassword) {
//     console.error('Password and Confirm Password do not match');
// })
// }
//   next();
// });

const User =  model('User', UserSchema);
User.createIndexes();

export default User;