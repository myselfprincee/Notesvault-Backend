import { Schema, model } from 'mongoose';
// import { string } from 'zod';

// const connectToMongo = require('../db')

const NotesSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: "General"
  },
  Date: {
    type: Date,
    default: Date.now
  },
  Discoverability: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  }

}, { strict: false, timestamps: true});

// NotesSchema.pre('save', function (next) {
//   const note = this;

//   if (note.isModified('Discoverability') && note.Discoverability === 'public' && note.likes === undefined && note.likedBy === undefined) {
//     note.likes = 0;
//     note.likedBy = [];
//   }
//   next();
// });


// NotesSchema.post('save', function (doc, next) {
//   if (doc.Discoverability === 'private' && doc.likes !== undefined && doc.likedBy !== undefined) {
//     doc.updateOne({
//       $unset: {
//         likes: "",
//         likedBy: ""
//       }
//     }, next);
//   } else {
//     next();
//   }
// });

export default model('Note', NotesSchema);
