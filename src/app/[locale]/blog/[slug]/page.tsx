import { notFound } from 'next/navigation';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog';
import { Metadata } from 'next';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.locale, params.slug);
  
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.locale, params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-16 prose prose-lg dark:prose-invert">
      <h1>{post.title}</h1>
      <div className="flex gap-2 text-sm text-muted-foreground mb-8">
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
        <span>•</span>
        <span>{post.author}</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="flex gap-2 mt-8">
        {post.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}