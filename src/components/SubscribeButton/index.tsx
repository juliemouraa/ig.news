import { useSession, signIn } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const { data: session } = useSession();  // importando esse useSession que vem do next-auth

    async function handleSubscribe() {
        // se não houver uma sessão ativa
        if(!session){
            signIn('github')
            return;
        }
        try {
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

             // usamos await nesses dois casos para aguardar que  seja finalizado.
             const stripe = await getStripeJs()  // funcao getstripejs direto do stripe

             await stripe.redirectToCheckout( { sessionId } ) // aqui redireciona para  a tela de pagamento, passando a sessionid como parametro
         } catch(err) { // se der errado, vai imprimir na tela a msg de erro
             alert(err.message);
         }
    }
    return(
        <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
            Subscribe now
        </button>
    );
}