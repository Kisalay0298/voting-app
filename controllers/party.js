const partyModel = require('../model/party')


const addNewParty=async (req, res)=>{
    try {
        const {name, symbol, leader, manifesto }=req.body

        if(!name || !symbol || !leader || !manifesto){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const party = new partyModel({
            name, symbol, leader, manifesto
        })
        await party.save()
        
        res.status(201).json({ message: "Party added successfully" })
        
    } catch (error) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}