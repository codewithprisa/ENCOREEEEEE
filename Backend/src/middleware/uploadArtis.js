import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.join(process.cwd(), "src/uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "poster";

    if (file.fieldname === "artis") {
      folder = "artis";
    }

    if (file.fieldname === "profile") {
      folder = "profile";
    }

    const uploadDir = path.join(uploadRoot, folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;