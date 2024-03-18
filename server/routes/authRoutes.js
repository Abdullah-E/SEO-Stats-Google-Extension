
import {fastify} from './init.js'
import { User } from '../Models/user.js'

fastify.post('/login', async function (req, res) {
    try{
        // const { googleId, imageURL, email, name, givenName, familyName } = req.body
        const user_logged_in = req.body
        console.log("req.body", user_logged_in)
        console.log("googleId", user_logged_in.googleId)

        //check if user exists
        const found_user= await User.findOne({ googleId: user_logged_in.googleId})
        console.log("found user", found_user)
        if(!found_user){
            const new_user = await User.create(user_logged_in)
            return res.send({ message: 'User created successfully', user: new_user })
        }
        else{
            return res.send({ message: 'User found', user: found_user })
        }
        //TODO: hide this
        /*
        const jwt_secret = "3247954029"
        // user found, create a token
        jwt.sign({
            email: user.email,
            id: user._id,
            name: user.name
        }, 
        jwt_secret,
        {}, 
        (err,token)=>{
            if(err) {
                console.log(err);
                return res.send({ error: 'Error signing the token' });
            }
            res.cookie('token',token).json({ message: 'Logged in successfully', user });
        })
        */
    }catch(error){
        console.log(error)
    }

})

fastify.get('/profile', async function (req, res) {
    const googleId = req.query.googleId
    if(!googleId){
        return res.send({ error:'no googleID in query' })
    }
    return res.send( await User.findOne({ googleId }) )
})


// router.get('/profile',getProfile)
