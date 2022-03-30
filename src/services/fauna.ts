import { Client } from 'faunadb'

export const fauna = new Client({
    secret: process.env.FAUNADB_KEY, // chave está lá no .env.local
})