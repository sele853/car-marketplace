import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req,file,cb) => cb(null, 'uploads/'),
    filename: (req,file,cb) => {
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req,file,cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if(extname && mimetype){
            cb(null,true)
        }else{
            cb(new Error('only JPEG,PNG and JPG images are allowed'));
        }
    },
    limits: {fileSize: 5 * 1024 * 1024}
});

export default upload;