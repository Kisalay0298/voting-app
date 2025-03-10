const { v2: cloudinary } = require('cloudinary');

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.cloudinary_Name,
        api_key: process.env.cloudinary_API_Key,
        api_secret: process.env.cloudinary_API_Secret,
    });
};

module.exports = { cloudinary, connectCloudinary };
