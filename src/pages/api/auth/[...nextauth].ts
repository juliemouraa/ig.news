import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { query as q } from 'faunadb'
import { Client } from 'faunadb'

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY,
  domain: 'db.us.fauna.com'
})

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
            scope: 'read:user',
        }
      }
    }),
  ],
  callbacks: { // callback criado para pegar as informações do usuario que faz login
    async signIn({ user, account, profile }) { // esse callback está escrito na documentação.
      const { email } = user

      try{
        await fauna.query(
          // caso não exista um usuario que não exista
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            //se nao existir, vai criar o usuario
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            // esse é o else. que caso o usuario exista, vai PEGAR(get) os dados do usuario
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true;
      } catch {
        return false;
      }
    },
  }
})