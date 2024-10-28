import { Router } from "express";
import uploadFileController from "../controllers/uploadFileController.js";
import multer from "multer";

const uploadFileRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

uploadFileRouter.post('/upload-file',upload.single("file"),uploadFileController.uploadFile)

export default uploadFileRouter;