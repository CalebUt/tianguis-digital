// config/googleDrive.js
// Integración con Google Drive usando OAuth2 (cuenta institucional propia).
// Las imágenes se sirven a través del propio backend (ver imagenesController.verImagen)
// en vez de exponer enlaces directos de Drive, porque Google no siempre respeta
// el acceso público al insertarse directo en una etiqueta <img>.
require("dotenv").config();
const { google } = require("googleapis");
const stream = require("stream");

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

async function subirImagen(fileBuffer, fileName, mimeType) {
  const drive = getDriveClient();

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const respuesta = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: FOLDER_ID ? [FOLDER_ID] : undefined,
    },
    media: { mimeType, body: bufferStream },
    fields: "id",
  });

  return { driveFileId: respuesta.data.id };
}

async function eliminarImagen(fileId) {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

// Descarga el contenido del archivo como stream, para que el backend
// se lo "reenvíe" al navegador sin necesitar que el archivo sea público.
async function obtenerImagenStream(fileId) {
  const drive = getDriveClient();
  const respuesta = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  return respuesta.data;
}

module.exports = { subirImagen, eliminarImagen, obtenerImagenStream };