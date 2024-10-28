import * as dotenv from "dotenv";
dotenv.config()
import express from 'express';
import cors from 'cors';
import morgan from "morgan";
import { notFound } from "./middleware/notFound.js";
import uploadFileRouter from "./routes/uploadFileRouter.js";
const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));


const PORT = process.env.PORT || 8080;

app.use('/api/v1',uploadFileRouter);

app.use(notFound)

app.listen(PORT,(error) => {
  error
    ? console.log("Error Port",(error))
    : console.log(`Server is running on port ${process.env.PORT}`);
})