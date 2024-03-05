const User = require('../Models/user')
const jwt= require('jsonwebtoken');

const test =(req,res)=>{
    res.json('test is working')
} 
//register endpoint
const registerUser = async(req,res)=>{
    try {
        const {name, email, googleId} = req.body;
        //check if name entered
        if(!name){
            return res.json({
                error:'name is required'
            })
        };
        const exist = await User.findOne({email});
        if (exist){
            return res.json({
                error:'email taken already'
            })
        }

        const user = await User.create({
            name,
            email,
            googleId
        })
        return res.json(user)
    } catch (error) {
        console.log(error)
    }
}
//Login Endpoint

const loginUser=async (req,res)=>{
    try{
        const { googleId } = req.body;
        //check if user exists
        const user= await User.findOne({ googleId });
        if(!user){
            return res.json({
                error:'no user found'
            })
        }
        // user found, create a token
        jwt.sign({
            email: user.email,
            id: user._id,
            name: user.name
        }, 
        process.env.JWT_SECRET,
        {}, 
        (err,token)=>{
            if(err) {
                console.log(err);
                return res.json({ error: 'Error signing the token' });
            }
            res.cookie('token',token).json({ message: 'Logged in successfully', user });
        })
    }catch(error){
        console.log(error)
    }
}

const getProfile=(req,res)=>{
    const {token} = req.cookie
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
            if(err) throw err;
            res.json(user)
        })
    }else{
        res.json(null)
    }
}



module.exports={
    test,
    registerUser,
    loginUser,
    getProfile
}