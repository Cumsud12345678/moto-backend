const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("./r2Client");

async function uploadToR2(fileBuffer, fileName, mimeType) {
  const key = `uploads/${fileName}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

async function deleteFromR2(fileUrl) {
  // fileUrl-dən "uploads/xxxx.jpg" hissəsini çıxarırıq
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");

  await r2Client.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}

module.exports = { uploadToR2, deleteFromR2 };