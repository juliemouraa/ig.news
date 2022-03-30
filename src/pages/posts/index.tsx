import styles from "./styles.module.scss";
import Head from "next/head";
import Prismic from "@prismicio/client";
import { GetStaticProps } from "next";
import { getPrismicClient } from "../../services/prismic";
import { RichText } from "prismic-dom";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts - Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <a key={post.slug} href="#">
              <time>{post.updatedAt}</time>
              <strong>
                {post.title}
              </strong>
              <p>
                {post.excerpt}
              </p>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}

// coloco o getStaticProps pq vai ser uma página estática.
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  // pois queremos buscar dados do prismic
  const response = await prismic.query<any>(
    [
      Prismic.predicates.at("document.type", "post"), // vou pegar os arquivos onde
    ],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100, // quantos posts vai retornar a listagem
    }
  );

  const posts = response.results.map(post => {
    return {
      slug: post.uid, // é a url do post
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find(content => content.type == "paragraph")
          ?.text ?? "", // para pegar apenas o paragrafo das publicações, dai se houver um texto vai achar um parágrafo. caso contrário, vai retonar a uma string vazia.
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit", // a data vai aparecer com dois digitos
          month: "long", // o mês vai aparecer inteiro e por extenso
          year: "numeric", // o ano vai aparecer como numerico
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
