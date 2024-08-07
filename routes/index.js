import dotenv from 'dotenv';
import axios from 'axios';
import bodyParser from 'body-parser';
import router from './auth.js';
import Note from '../models/Note.js';
import fetchUser from '../middleware/fetchUser.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import myCache from "../middleware/cache.js";
import Comment from '../models/Comment.js';
import Reply from '../models/Reply.js';
import Folder from '../models/Folder.js';
import { redis } from '../middleware/connectRedis.js'

dotenv.config({ path: './.env' });

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/get-speech-token', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = {
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
            res.send({ token: tokenResponse.data, region: speechRegion });
        } catch (err) {
            res.status(401).send('There was an error authorizing your speech key.');
        }
    }
});

router.get('/get-public-note', async (req, res, next) => {
    try {
        const noteId = req.headers['id'];
        const username = req.headers['user'];

        console.log(noteId, username)

        const isValid = mongoose.Types.ObjectId.isValid(noteId)

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid note ID, make sure the url is correct.' });
        }

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: `Incorrect URL.` });
        }
        const userNote = await Note.findById(noteId);

        if (!userNote) {
            return res.status(404).json({ error: `Note with ID ${noteId} not found.` });
        }
        if (user._id.equals(userNote.user) && userNote.Discoverability === 'private') {
            return res.status(401).json({ error: 'Note is private. Set it to public or contact the owner in order to view it.' });
        }
        if (!userNote.user.equals(user._id)) {
            return res.status(400).json({ error: `The URL is incorrect. The Owner of this note is not ${user.username}` });
        }

        if (user._id.equals(userNote.user) && userNote.Discoverability === 'public') {

            if (await redis.exists(`note-${noteId}`)) {
                console.log("cache hit for note", noteId);
                const cachedResponse = await redis.get(`note-${noteId}`);

                try {
                    const parsedResponse = JSON.parse(cachedResponse);
                    return res.json(parsedResponse);
                } catch (error) {
                    console.error('Error parsing cached response:', error);
                    return res.status(500).json({ error: 'Error parsing cached response' });
                }
            }
            const response = { title: userNote.title, description: userNote.description, tags: userNote.tag };
            await redis.set(`note-${noteId}`, JSON.stringify(response));
            return res.json(response);
        }
    } catch (error) {
        console.error('Error fetching user note:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/toggle-discoverability', fetchUser, async (req, res) => {
    try {
        const noteId = req.headers['id'];
        const userNote = await Note.findById(noteId);

        const isValid = mongoose.Types.ObjectId.isValid(noteId)

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid note ID, make sure the url is correct.' });
        }

        if (!userNote) {
            return res.status(404).json({ error: `Note with ID ${noteId} not found.` });
        }
        userNote.Discoverability = userNote.Discoverability === 'public' ? 'private' : 'public';
        console.log(`Discoverability set to: ${userNote.Discoverability}`);
        await userNote.save();

        if (userNote.Discoverability === 'public') {
            // console.log(noteId)
            await Note.findByIdAndUpdate(
                noteId,
                {
                    $set: {
                        likes: 0,
                        likedBy: []
                    }
                },
                { new: true, useFindAndModify: false }
            );

            // console.log("this is the updated shit: ", updatedNote)

            return res.send({ messege: "Discoverability of this note is set to " + userNote.Discoverability + " and the like field is also been added now you can see the number of likes users has been given to you." });

        } else {
            if (userNote.likes !== undefined && userNote.likedBy !== undefined) {
                Note.updateOne({
                    _id: userNote._id
                }, {
                    $unset: {
                        likes: "",
                        likedBy: ""
                    }
                }).exec();
            }

            await userNote.save();

            return res.send({ messege: "Discoverability of this note is set to " + userNote.Discoverability + " and the like field is also been removed." });

        }

    } catch (error) {
        res.json({ error: "Internal Server Error", error })
    }

});

router.post("/like-the-note", fetchUser, async (req, res) => {

    try {
        const noteId = req.headers["note-id"];
        const note = await Note.findById(noteId)

        const user = req.user;
        const FoundUser = await User.findById(user.id);


        if (!note) {
            return res.send({ message: "Really sorry!! The note doesn't exist. Please Refresh the page to check it." })
        }


        if (note.likedBy?.includes(FoundUser.username)) {
            return res.send({ message: "You have already liked the note." })
        }

        await Note.findByIdAndUpdate(
            noteId,
            {
                $inc: { likes: 1 },
                $push: { likedBy: FoundUser.username }
            },
            { new: true, useFindAndModify: false }
        );

        return res.send({ message: "You have liked the note." })
    } catch (error) {
        return res.json({ error: "Internal Server Error", details: error })
    }


})

router.get("/hi", (req, res) => {
    res.send("good morning")
})

router.post("/comment", fetchUser, async (req, res) => {
    try {
        const user = req.user;
        const noteId = req.headers["note-id"];
        const comment = req.headers['comment'];

        const note = await Note.findById(noteId);
        const username = await User.findById(user.id)

        console.log("username:", username)
        console.log(user)

        if (!note) {
            return res.send({ message: "Really sorry!! The note doesn't exist. Please Refresh the page to check it." })
        }

        console.log(user.id, noteId, comment)

        // if (Comment.find({ user: user.id, note: noteId, comment: comment })) {
        //     return res.send({ message: "You have already commented this note." })
        // }

        const userComment = new Comment({
            user: user.id,
            username: username.username,
            note: noteId,
            comment: comment
        });

        const savedComment = await userComment.save();

        console.log(savedComment)

        // await Note.findByIdAndUpdate(
        //     noteId,
        //     {
        //         $push: { comments: savedComment._id }
        //     },
        //     { new: true, useFindAndModify: false }
        // );

        return res.send({ message: "Comment has been added successfully" })
    } catch (error) {
        console.error(error)
    }

})

router.post("/reply", fetchUser, async (req, res) => {
    try {
        const user = req.user;
        const comment_id = req.headers["comment-id"];
        const reply = req.headers['reply'];
        const username = await User.findById(user.id)

        if (!user) {
            return res.send({ message: "don't cap. create a genuine account mate :)" })
        }

        if (!username) {
            return res.send({ message: "User not found." })
        }

        if (!comment_id) {
            return res.send({ message: "Comment not found, maybe the user deleted the comment." })
        }



        console.log(user.id, comment_id, reply, username)

        const userReply = new Reply({
            comment: comment_id,
            username: username.username,
            reply: reply
        })

        await Comment.findByIdAndUpdate(
            comment_id,
            {
                $inc: { replies: 1 }
            },
            { new: true, useFindAndModify: false }
        );
        await userReply.save();

        return res.send({ message: "Reply has been added successfully", userReply })
    } catch (error) {
        console.error(error)
    }

});

router.get("/get-all-replies", async (req, res) => {
    const commentId = req.headers["comment-id"];

    const replies = await Reply.find({ comment: commentId });

    if (!replies) {
        return res.send({ message: "The comment doesn't exist." })
    }

    return res.send(replies)
});

router.post("/create-folder", fetchUser, async (req, res) => {

    // const { folderName, folderDescription } = req.body;
    const folderName = req.headers["folder-name"];
    const folderDescription = req.headers["folder-description"];
    const user = req.user;

    const folderExists = await Folder.findOne({ name: folderName, user: user.id });

    if (folderExists) {
        return res.send({ message: "Folder with this name already exists." })
    }

    console.log(folderName, folderDescription)

    const folder = new Folder({
        name: folderName,
        description: folderDescription,
        user: user.id
    });


    const savedFolder = await folder.save();

    return res.send({ message: "Folder has been created successfully", savedFolder })
});

// router.patch

router.delete("/delete-folder", fetchUser, async (req, res) => {
    try {
        const user = req.user;
        const folderId = req.headers["folder-id"];

        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.send({ message: "The folder doesn't exist." })
        }

        if (!folder.user.equals(user.id)) {
            return res.send({ message: "You are not authorized to delete this folder." })
        }

        await folder.delete();

        return res.send({ message: "Folder has been deleted successfully" })
    } catch (error) {
        console.error(error)
    }
});

router.get("/get-all-folders", fetchUser, async (req, res) => {
    try {
        const user = req.user;

        const folders = await Folder.find({ user: user.id });

        return res.send({ folders })
    } catch (error) {
        console.error(error)
    }
});

router.get("/get-all-likes", async (req, res) => {
    const noteId = req.headers["note-id"];

    const note = await Note.findById(noteId);

    if (!note) {
        return res.send({ message: "The note doesn't exist." })
    }

    const likes = note.likes;
    if (!likes) {
        return res.send({ message: `No likes on this note. Maybe it is a private note. ( humble Request : Please use my app only for seeing the likes don't use any other client to overload the api's. (i am a noob dev and my app will not be able to handle it :(     )))` })
    }

    return res.send({ totalLikes: likes })
});

router.get("/get-all-liked-users", async (req, res) => {
    const noteId = req.headers["note-id"];

    const note = await Note.findById(noteId);

    if (!note) {
        return res.send({ message: "The note doesn't exist." })
    }

    const likedBy = note.likedBy;
    if (!likedBy) {
        return res.send({ message: `No users have liked this note. Maybe it is a private note. ( humble Request : Please use my app only for seeing the likes don't use any other client to overload the api's. (i am a noob dev and my app will not be able to handle it :(     )))` })
    }

    return res.send({ likedBy: likedBy })
})

router.get("/get-all-comments", async (req, res) => {
    const noteId = req.headers["note-id"];
    const comments = await Comment.find({ note: noteId });

    // if (!comments) {
    //     return res.send({ message: "The note doesn't exist." })
    // }

    if (!comments) {
        return res.send({ message: `No comments on this note.` })
    }

    return res.json({ comments })
});

router.get("/total-number-of-comments", async (req, res) => {
    const noteId = req.headers["note-id"];

    const count = await Comment.countDocuments({ note: mongoose.Types.ObjectId(noteId) });

    if (!count) {
        return res.json({ message: "No documents found with the id", noteId })
    }

    res.json({ totalComments: count })
})


export default router;
