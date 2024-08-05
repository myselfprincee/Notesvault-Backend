import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    username: {
        type: Schema.Types.String,
        ref: 'User'
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: 'Note'
    },
    comment: {
        type: String,
        required: true
    },
    replies: {
        type: Number,
        default: 0,
        required: true
    }

}, { timestamps: true, strict: false });

export default model('Comment', CommentSchema);
