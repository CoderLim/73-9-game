import { createFileRoute } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  baseLocale,
  getLocale,
  locales,
  localizeUrl,
} from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { BlogCard } from '@/components/blog-card';
import { mdxComponents } from '@/components/mdx-components';
import BlogIndexContent from '@/content/blog-index.en.mdx';
import { formatPostDate } from '@/content/posts';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? baseLocale;
    const isBaseLocale = locale === baseLocale;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/blog`, { locale: loc as any }).href;

    return {
      meta: [
        {
          title: `${m['blog.title']({}, { locale: locale as any })} | ${envConfigs.app_name}`,
        },
        {
          name: 'description',
          content: m['blog.description']({}, { locale: locale as any }),
        },
        ...(!isBaseLocale
          ? [{ name: 'robots', content: 'noindex,follow' }]
          : []),
      ],
      links: [
        { rel: 'canonical', href: urlFor(isBaseLocale ? locale : baseLocale) },
        ...(isBaseLocale
          ? locales.map((loc) => ({
              rel: 'alternate',
              hrefLang: loc,
              href: urlFor(loc),
            }))
          : []),
      ],
    };
  },
  component: BlogPage,
});

function BlogPage() {
  const { locale, posts } = Route.useLoaderData();
  const isBaseLocale = locale === baseLocale;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
              {m['blog.title']()}
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl">
              {m['blog.description']()}
            </p>
          </div>

          {isBaseLocale && (
            <article className="border-border bg-card/40 mx-auto mb-16 max-w-3xl rounded-2xl border px-6 py-8 sm:px-9">
              <div className="text-foreground/90 text-[15px] leading-7">
                <MDXProvider components={mdxComponents}>
                  <BlogIndexContent />
                </MDXProvider>
              </div>
            </article>
          )}

          <section aria-labelledby="latest-articles">
            {isBaseLocale && (
              <div className="mb-7">
                <p className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase">
                  Original guides and project notes
                </p>
                <h2
                  id="latest-articles"
                  className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  Latest articles
                </h2>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="text-muted-foreground text-center">
                {m['blog.no_posts']()}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    title={post.title}
                    description={post.description}
                    image={post.image}
                    date={formatPostDate(post.createdAt, locale)}
                    authorName={post.authorName}
                    authorImage={post.authorImage}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
