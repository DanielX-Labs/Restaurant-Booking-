import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload=multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(allowedTypes.has(file.mimetype) ? null : new Error("Only image files are allowed"), allowedTypes.has(file.mimetype));
  },
});
export default upload;
