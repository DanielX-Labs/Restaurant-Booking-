import { unlink } from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (path) => {
  try {
    return await cloudinary.uploader.upload(path, { resource_type: "image" });
  } finally {
    await unlink(path).catch(() => undefined);
  }
};

export const deleteImage = async (publicId) => {
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => undefined);
};
