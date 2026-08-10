import { v2 as cloudinary } from "cloudinary";

// ======================================================
// CLOUDINARY CONFIG
// ======================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

    timeout: 120000,
});

// ======================================================
// UPLOAD IMAGE
// ======================================================

export const uploadImage = (buffer) => {

    return new Promise((resolve, reject) => {

        const uploadStream =
            cloudinary.uploader.upload_stream(

                {
                    resource_type: "image",
                },

                (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }

            );

        uploadStream.end(buffer);

    });

};


// ======================================================
// UPLOAD PDF / FILE
// ======================================================

export const uploadFile = (buffer, originalName) => {

    return new Promise((resolve, reject) => {

        const safeName =
            originalName
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9-_]/g, "-");

        const publicId =
            `educompanion/${Date.now()}-${safeName}`;

        const uploadStream =
            cloudinary.uploader.upload_stream(

                {
                    resource_type: "raw",
                    public_id: publicId,
                },

                (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                }

            );

        uploadStream.end(buffer);

    });

};


// ======================================================
// DELETE IMAGE
// ======================================================

export const deleteImage = (publicId) => {

    return new Promise((resolve, reject) => {

        cloudinary.uploader.destroy(

            publicId,

            {
                resource_type: "image",
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }

        );

    });

};


// ======================================================
// DELETE FILE / PDF
// ======================================================

export const deleteFile = (publicId) => {

    return new Promise((resolve, reject) => {

        cloudinary.uploader.destroy(

            publicId,

            {
                resource_type: "raw",
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }

        );

    });

};


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default cloudinary;