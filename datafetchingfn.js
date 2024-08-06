import axios from "axios";
import { toast } from "sonner";


function holdForSixSeconds() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(); // Resolve the promise after 6 seconds
      }, 1000); // 6000 milliseconds = 6 seconds
    });
  }

export const fetchUser = async (note_id, user_name) => {

    try {

        // await holdForSixSeconds();
        
        const config = {
            headers: {
                "id": note_id, // Set the custom header with the note ID
                "user_name": user_name,
            },
        };
        const res = await axios.get("/api/get-public-note", config);
        // console.log(res.data)
        
        return res.data;
        
    } catch (error) {
        // console.log(error.response.data.error);
        // console.log(error.message);

        if (error.response){
            return error.response.data;
        }
            return error.message;
    }
    }

export const toggleDiscoverability = async (note_id) => {
        try {
            const config = {
                headers: {
                    "id": note_id,
                    "auth-token" : localStorage.getItem('token')
                },
            };
            const res = await axios.post("/api/toggle-discoverability", config);
            console.log(res.data)
            return res.data;
            
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    export const fetchLikes = async (note_id) => {
        try {
            const config = {
                headers: {
                    "note-id": note_id,
                },
            };
            const res = await axios.get("/api/get-all-likes", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    export const fetchAllComments = async (note_id) => {
        try {
            const config = {
                headers: {
                    "note-id": note_id,
                },
            };
            const res = await axios.get("/api/get-all-comments", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    export const fetchCommentsCount = async (note_id) => {
        try {
            const config = {
                headers: {
                    "note-id": note_id,
                },
            };
            const res = await axios.get("/api/total-number-of-comments", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    export const fetchCommentReplies = async (note_id) => {
        try {
            const config = {
                headers: {
                    "note-id": note_id,
                },
            };
            const res = await axios.get("/api/total-number-of-comments", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    export const fetchLikedUsers = async (note_id) => {
        try {
            const config = {
                headers: {
                    "note-id": note_id,
                },
            };
            const res = await axios.get("/api/get-all-liked-users", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    export const fetchReplies = async (comment_id) => {
        try {
            const config = {
                headers: {
                    "comment-id": comment_id,
                },
            };
            const res = await axios.get("/api/get-all-replies", config);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }