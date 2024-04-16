
import {fastify} from './init.js'
import { User } from '../Models/user.js'
import {Code} from '../Models/code.js'
import {google} from 'googleapis'
import fs from 'fs'

const oauth_creds = JSON.parse(fs.readFileSync('oauth_creds.json', 'utf8'))

const { client_id, client_secret, redirect_uris } = oauth_creds.web
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1])
const scopes = ["https://www.googleapis.com/auth/userinfo.profile"]

fastify.get('/oauth-redirect', async function (req, res) {
    console.log("google login", redirect_uris[1])
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        include_granted_scopes: true,
    })
    console.log("authUrl", authUrl)
    res.send({ url: authUrl })
    
})


fastify.get('/google-callback', async  (req, res)=> {
    console.log("google callback", req.query)
    const code = req.query.code
    const find_code = await Code.findOne({ code })
    console.log("find_code", find_code)
    if (find_code != null) {
        console.log("code already used")
        return res.send({ error: 'Code already used' })
    }
    Code.create({ code })
    

    try{
        const { tokens } = await oauth2Client.getToken(code)
        const access_token = tokens.access_token
        const headers = new Headers({
            'Authorization': `Bearer ${access_token}`
        })
        const user_data = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: headers
        })
        if (!user_data.ok) {
            throw new Error('Failed to fetch user data from google')
        }
        const user_data_json = await user_data.json()
        const found_user = await User.findOne({ id: user_data_json.id })
        if(found_user == null){
            const new_user = await User.create(user_data_json)
            return res.send({ message: 'New user created successfully', profile: new_user })
        }
        console.log("user_data_json", user_data_json)
        res.send({message: "User logged in succesfully",profile:found_user})

    }
    catch(error){
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