import { fastify } from './init.js'
import { User } from '../Models/user.js'

fastify.get('/google_search', async function (req, res) {
    try {
        const { keyword, g_id} = req.query
        console.log("whole query", req.query)
        console.log("keyword", keyword)
        console.log("g_id", g_id)

        // res.send({ message: 'Success' })

        const findUser = await User.findOne({ id: g_id })
        if (findUser == null) {
            return res.send({ error: 'User not found' })
        }
        console.log("findUser", findUser)
        findUser.credits -= 1
        await findUser.save()

        return res.send({ message: 'Success', user: findUser })

        
    } catch (error) {
        console.log(error)
        res.status(500).send('Error')
    }
})