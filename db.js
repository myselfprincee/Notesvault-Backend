import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './.env' });

mongoose.set('strictQuery', true);

const dbname = mongoose.createConnection(process.env.mongoURI);
dbname.on('connected', () => {
    // console.log(`Connected to database: ${dbname.name}`);
  });

// console.log(process.env.mongoURI)

const connectToMongo = () => {
    mongoose.connect(process.env.mongoURI, 
    ).then(() => {
        console.log("connection successful");
    }).catch((err) => console.log(err));
};

export default connectToMongo;
