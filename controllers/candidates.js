const candidateModel = require('../model/candidate')


const addNewPCandidate=async (req, res)=>{
    try {
        const {voterId, partyId, candidate, party }=req.body

        if(!voterId || !partyId || !candidate || !manifesto){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const newCandidate = new candidateModel({
            voterId, partyId, candidate, party
        })
        await newCandidate.save()
        
        res.status(201).json({ message: "Party added successfully" })
        
    } catch (error) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}






module.exports={
    addNewPCandidate,
}