const partyModel = require('../model/party')


const addNewParty=async (req, res)=>{
    try {
        const {name, symbol, leader, manifesto }=req.body

        if(!name || !symbol || !leader || !manifesto){
            return res.redirect('/voter/create-party?message=Please fill all the fields!&type=error');
        }

        const party = new partyModel({
            name, symbol, leader, manifesto
        })
        await party.save()
        return res.redirect('/voter/home?message=Party added successfully&type=success');
        
    } catch (error) {
        console.error('Error:', err);
        return res.redirect('/signup?message=Internal Server Error!&type=error');
    }
}