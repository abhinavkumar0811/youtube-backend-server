import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create and validate the directry
const uploadDir = join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdir(uploadDir, { recursive: true }, (error) => {
    if (error) {
      console.log("upload file not created Error:", error);
    }
  });
}

// uploadin using server local storage
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});

// export our multer
export const upload = multer({ storage: uploadStorage });
