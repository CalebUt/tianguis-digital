// middleware/upload.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // guarda el archivo en RAM, no en disco, antes de mandarlo a Drive
  limits: { fileSize: 5 * 1024 * 1024 }, // máx. 5MB
  fileFilter: (req, file, cb) => {
    const permitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!permitidos.includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }
    cb(null, true);
  },
});

module.exports = upload;