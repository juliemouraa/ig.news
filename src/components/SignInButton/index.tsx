import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi"
import { signIn, useSession, SessionProvider, signOut } from 'next-auth/react'

import styles from "./styles.module.scss";

export function SignInButton() {
  const { data: session } = useSession(); // para mostrar se o usuario está logado, porque quando está e não está, os botões são diferentes

  console.log(session);
  // aqui diz se o usuário estiver logado, mostra ESSE BOTAO.
  return session ? (
    <button type="button" className={styles.signInButton} onClick={() => signOut()}>
      <FaGithub color="#04d361" /> {/**icone do botao do github */}
      {session.user.name} {/**aqui é para aparecer o nome do login do usuário que está logado atualmente.*/}
      <FiX color= "#737380" className={styles.closeIcon}/> {/**icone do botao de fechar */}
    </button>
  ) :/** se nao, mostra ESSE BOTAO.*/ ( 
    <button type="button" className={styles.signInButton} onClick={() => signIn('github')}>
      <FaGithub color="#eba417" />
      Sign In with Github
    </button>
  );
}
