import { Schema, model } from "mongoose";

const ReplySchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    username: {
        type: Schema.Types.String,
        ref:'User'
    },
    reply: {
        type: String,
        required: true
    }
});

export default model('Reply', ReplySchema);