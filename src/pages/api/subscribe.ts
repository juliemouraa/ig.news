import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb'
import { getSession } from 'next-auth/react'
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

// criamos essa tipagem, pois ao colocar o ref, o mesmo apresentou um erro de tipos
type User = {
    ref: {
        id: string;
    }
}

//request e response.
export default async(req: NextApiRequest, res: NextApiResponse) => {
    // só vamos aceitar se o metodo da requisição for post, porque sempre que está criando algo no backend é POST.
    if(req.method == 'POST') {
        const session = await getSession({ req })

        // para evitar que o user seja duplicado no stripe
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'), // pois quero procurar um user pelo email
                    q.Casefold(session.user.email) // que o email vai ser igual a session.user.email
                )
            )
        )

        const stripeCustomer = await stripe.customers.create({
            email: session.user.email, // pegando o email do user
        })

        // para evitar que o user seja duplicado no stripe
        await fauna.query(
            q.Update( //quer atualizar um usuario
                q.Ref(q.Collection('users'), user.ref.id), // essa ref é como se fosse um id do usuario, ela se encontra la no faunadb
                {
                    data: { // data é o dado que eu quero atualizar
                        stripe_costumer_id: stripeCustomer.id,
                    }
                }
            )
        )

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id, // estamos criando o cliente lá no stripe
            payment_method_types: ['card'], // metodos de pagamentos aceitos, via cartão de credito nesse caso.
            billing_address_collection: 'required', // obriga ao usuario ao colocar o endereço
            line_items: [
                { price: 'price_1KTSpTEvgcWRi2q2gzSI2UAs', quantity: 1 } // o unico produto vendido
            ],
            mode: 'subscription', // porque é um pagamento recorrente, pois é um plano de assinatura, então todo mês terá que pagar
            allow_promotion_codes: true, // isso permite que promoções de desconto cheguem ao usuario
            success_url: process.env.STRIPE_SUCCESS_URL, // para onde o usuario precisa ser redirecionado caso dê sucesso na compra
            cancel_url: process.env.STRIPE_CANCEL_URL // para onde o usuario precisa ser redirecionado caso cancele a requisição, redirecionamos de volta pra home
        })
        // caso dê certo, vai passar um resultado 200(sucesso)
        return res.status(200).json({ sessionId: stripeCheckoutSession.id })

    // se NÃO for uma requisição do método post
    } else {
        res.setHeader('Allow', 'POST'); // esse response(resposta) tá explicando pro front que essa requisição só aceita POST(allow post)
        res.status(405).end('Method not allowed') // ai vai dar o erro 405 (metodo nao permitido)
    }
}