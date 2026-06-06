import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type BlogPost = { slug: string; title: string; excerpt: string; content: string; img: string; date: string };

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = t.raw("posts") as BlogPost[];
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href={`/${locale}/blog`} className="mb-6 inline-block opacity-70 hover:opacity-100">
        {t("back")}
      </Link>

      <article className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
        <div style={{ backgroundColor: "var(--color-primary-light)" }}>
          <img src={post.img} alt={post.title} loading="lazy" className="h-64 w-full object-cover" />
        </div>
        <div className="p-8">
          <p className="mb-3 opacity-60">{post.date}</p>
          <h1 className="mb-6 text-3xl font-bold leading-tight" style={{ color: "var(--color-primary-dark)" }}>
            {post.title}
          </h1>
          <div className="whitespace-pre-line text-lg leading-relaxed opacity-90">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  );
}
