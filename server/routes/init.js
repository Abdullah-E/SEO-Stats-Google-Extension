import Fastify from 'fastify'
import cors from '@fastify/cors'

export const fastify = Fastify({
    logger: true
})
await fastify.register(cors, {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"]
})
