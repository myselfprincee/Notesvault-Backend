import { Router } from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchUser from '../middleware/fetchUser.js';
import dotenv from 'dotenv';


dotenv.config({ path: './.env' });

const router = Router();


//ROUTE::1 Create a user using POST ---> NO LOGIN REQUIRED
router.post('/register', [
    // body('name', "Enter a valid Name").isLength({ min: 3 }),
    // body('email', "Enter a valid Email Address").isEmail(),
    // body('password', "Password must be atleast 5 characters including UPPERCASE, lowercase, special characters and Numbers").isLength({ min: 5 })

], async (req, res) => {
    
    let success = false;
    
    //if there are errors give invalid Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    //to check whether the user with same email exists already
    try {
        let user = await User.findOne({ username: req.body.username  });
        if (user) {
            return res.status(400).json({
                error: "A user with this email already exists"
            })
        }
        const salt = await bcrypt.genSaltSync(10);
        const plaintextPassword = await bcrypt.hashSync(req.body.password, salt)
        user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: plaintextPassword,
        })
        
        //a variable for signature
        const sign = process.env.SIGNATURE;
        
        // Giving the details A JsonWebToken to maximize the security
        const authtoken = jwt.sign({ id: user.id, email: user.email, name: user.username }, sign);
        success = true
        res.json({ success, authtoken })
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE::2   Authenticating a user using POST ---> NO SIGN UP REQUIRED {THIS IS LOGIN} 
router.post('/login', async (req, res) => {
    
    let success = false;
    
    //if there are errors give invalid Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
        
        let user = await User.findOne({ username: username });
        console.log(user)
        if (!username) {
            return res.status(400).json({ error: "Invalid! User doesn't exist. Please Try with correct credentials" })
            
        }
        const passwordcompare = await bcrypt.compare(password, user.password)
        if (!passwordcompare) {
            success = false;
            return res.status(400).json({ success, error: "Invalid!, Please Try with correct credentials" })
        }
        
        const sign = process.env.SIGNATURE;
        const authtoken = jwt.sign({ user: { id: user.id, name: user.name, username: username } }, sign);
        success = true
        res.json({ success, authtoken })

        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE::3 Get a user details using POST ---> LOGIN REQUIRED
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        let userId = req.user.id;
        console.log("userid:",userId);
        const user = await User.findById(userId).select("-password -_id");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

export default router;