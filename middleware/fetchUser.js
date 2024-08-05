import jwt from 'jsonwebtoken';

const fetchUser = (req, res, next) => {
    //Get the User from the JWT token and add ID to Request Object
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send({error: 'Please Authenticate using a valid token'})
    }
    try {
        const data = jwt.verify(token, process.env.SIGNATURE);
        req.user = data.user; 
        next();
        
    } catch (error) {
        return res.status(401).send({error: 'Please Authenticate using a valid token'})
    }
     
}



export default fetchUser;