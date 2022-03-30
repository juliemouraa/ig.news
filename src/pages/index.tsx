import Head from 'next/head'
import styles from './home.module.scss'
import { SubscribeButton } from '../components/SubscribeButton'
import { GetStaticProps } from 'next';
import { stripe } from '../services/stripe';

interface HomeProps{
  product : {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
       
       <main className={styles.contentContainer}>
         <section className={styles.hero}>
          <span>
          👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>

          <p>
            Get access to all the publications <br/>
            <span>for {product.amount} per month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
         </section>

         <img src="/images/avatar.svg" alt="Girl coding"/>
       </main>
    </>
   )
}


export const getStaticProps: GetStaticProps = async () => {
  // aqui diz que eu só quero buscar um(retrieve) valor lá no stripe
  // essa key price_1KTSpTEvgcWRi2q2gzSI2UAs é pega la direto no stripe
  const price = await stripe.prices.retrieve('price_1KTSpTEvgcWRi2q2gzSI2UAs')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US' , {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100) //salvando em centavos para o numero estar sempre em numero inteiro
  }
  
  return {
    props: {
      product,
    },
    // isso serve para: daqui a quanto tempo eu quero que a minha página 'atualize'
    revalidate: 60 * 60 * 24 // 24 horas
  }
}