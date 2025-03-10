const candidateModel = require('../model/candidate')
const partyModel = require('../model/party')


const addParty = async (req, res)=>{
    try {

        const {name, aadharId, phone, email, address, qualification, experience, skills, salary, job} = req.body
        
    } catch (error) {
        console.error('Error:', err);
        return res.redirect('/profile?error=ServerError');
    }
}




const addCandidate = async (req, res) => {
    try {

        const token = req.cookie?.aToken
        if(!token){
            return res.redirect('/login')
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const {name, aadharId, phone, email, address, qualification, experience, skills, salary, job} = req.body
        const candidate = new candidateModel({
            voterId: user._id,
            candidateName: user.name, 
            aadharId, phone, email, address, qualification, experience, skills, salary, job
        })
        const savedCandidate = await candidate.save()
        res.redirect('/voter/profile')
        
    } catch (error) {

        console.error('Error:', err);
        return res.redirect('/profile?error=ServerError');
        
    }
}