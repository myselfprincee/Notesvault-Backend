import jwt from 'jsonwebtoken';

const fetchUser = (req, res, next) => {
    const token = req.header('Authorization'); // Ensure correct header name
    console.log("Token in middleware:", token);
    if (!token) {
        return res.status(401).send({ error: 'Please Authenticate using a valid token' });
    }
    try {
        const data = jwt.verify(token.replace('Bearer ', ''), process.env.SIGNATURE); // Handle 'Bearer ' prefix
        console.log("Decoded data:", data);
        req.user = data.user; 
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).send({ error: 'Please Authenticate using a valid token' });
    }
}




export default fetchUser;