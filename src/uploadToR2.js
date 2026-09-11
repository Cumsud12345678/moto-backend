const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("./r2Client");

async function uploadToR2(fileBuffer, fileName, mimeType, attempt = 1) {
  const key = `uploads/${fileName}`;

  console.log(`[R2 UPLOAD] başlayır: ${fileName}, buffer ölçüsü: ${fileBuffer?.length} byte, cəhd: ${attempt}`);

  if (!fileBuffer || fileBuffer.length === 0) {
    console.error(`[R2 UPLOAD] XƏTA: ${fileName} — gələn buffer artıq boşdur (multer/şəbəkə problemi)`);
    throw new Error(`Fayl serverə tam çatmayıb: ${fileName}`);
  }

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ContentLength: fileBuffer.length,
  }));

  const head = await r2Client.send(new HeadObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));

  console.log(`[R2 UPLOAD] R2-də faktiki ölçü: ${fileName} → ${head.ContentLength} byte`);

  if (head.ContentLength === 0) {
    if (attempt < 3) {
      console.warn(`[R2 UPLOAD] ${fileName} 0 byte gəldi, yenidən cəhd (${attempt + 1}/3)`);
      return uploadToR2(fileBuffer, fileName, mimeType, attempt + 1);
    }
    throw new Error(`${fileName} 3 cəhddən sonra da 0 byte qaldı`);
  }

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

async function deleteFromR2(fileUrl) {
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");
  await r2Client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}

module.exports = { uploadToR2, deleteFromR2 };