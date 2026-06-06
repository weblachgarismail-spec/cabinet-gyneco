import { getTranslations } from "next-intl/server";
import Link from "next/link";

type BlogPost = { slug: string; title: string; excerpt: string; img: string; date: string };

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = t.raw("posts") as BlogPost[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="anim-fade-in-up mb-12 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("title")}
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post, i) => (
          <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className={`anim-fade-in-up anim-delay-${(i % 4) + 1} group block overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`} style={{ backgroundColor: "#fff" }}>
            <div className="h-48 overflow-hidden" style={{ backgroundColor: "var(--color-primary-light)" }}>
              <img src={post.img} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <p className="mb-2 opacity-60">{post.date}</p>
              <h2 className="mb-2 text-xl font-semibold leading-tight" style={{ color: "var(--color-primary)" }}>
                {post.title}
              </h2>
              <p className="mb-3 leading-relaxed opacity-85">{post.excerpt}</p>
              <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                {t("read_more")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
