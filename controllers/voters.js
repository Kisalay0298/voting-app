const voterModel = require('../model/voter')
const jwt = require('jsonwebtoken')
const partyModel = require('../model/party')
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
// vote

// can see candidates


// form new party
const applyForNewParty = async (req, res)=>{
    try {

        const token = cookie.vToken
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const voterId = decoded._id
        const voter = voterModel.findById({voterId})
        if(!voter){
            return res.status(404).json({message: "Voter not found"})
        }
        const { name, manifesto } = req.body
        const imageFile = req.file;

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
            const imageURL = imageUpload.secure_url
            user.image= imageURL
        }

        const party = new partyModel({
            name: name,
            manifesto: manifesto,
            symbol: imageFile
        })

        await party.save()
        res.json({message: "Party created successfully"})
        
    } catch (error) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

// can view results after election result



module.exports={
    applyForNewParty,
}