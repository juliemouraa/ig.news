import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps { // para receber todas as props que vem de link
    children: ReactElement; // precisa ser apenas um elemento, e é reactelement pois vou receber elemento do react que é o <a className={}/>
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
    const { asPath } = useRouter(); // para colocar o negocio amarelo na pagina q estiver selecionada

    // aqui diz se o link que estiver dentro do asPath for o link selecionado, ele vai receber o negocio amarelo, se nao, nao vai receber nada
    const className = asPath == rest.href
        ? activeClassName
        : '';

    return(
        // no cloneElement, eu to clonando o children e passando pra ele a props className que eu criei para fazer a verificacao
        <Link {...rest}> 
            {cloneElement(children, {className, })}
        </Link>
    )
}