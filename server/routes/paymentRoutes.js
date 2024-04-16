import {fastify} from './init.js'

import {User} from '../Models/user.js'

const paddle_key = 'bd583272806e7992e93f1b266e1585e6eee614256fcfbf973a'
const paddle_base_url = 'https://sandbox-api.paddle.com'
fastify.get('/check_paddle', async function (req, res) {
    try{
        const header = new Headers({
            'Authorization': `Bearer ${paddle_key}`
        })
        const response = await fetch(paddle_base_url+'/event-types', { headers: header })
        const data = await response.json()
        console.log("success", data)
        res.send(data)
    }
    catch(error){
        console.log(error)
        res.status(500).send('Error')
    }
})

fastify.get('/subscription_list', async function (req, res) {
    try{
        const header = new Headers({
            'Authorization': `Bearer ${paddle_key}`
        })
        const response = await fetch(paddle_base_url+'/subscriptions', { headers: header })
        const data = await response.json()
        console.log("success", data)
        res.send(data)
    }
    catch(error){
        console.log(error)
        res.status(500).send('Error')
    }
    
})

fastify.get('/payment_success', async function (req, res) {
    const {credits, g_id} = req.query
    const user = await User.findOne({id: g_id})
    if (!user) {
        res.status(404).send('User not found')
        return
    }

    user.credits +=parseInt(credits)
    await user.save()
    res.send('Credits added successfully')
    
})