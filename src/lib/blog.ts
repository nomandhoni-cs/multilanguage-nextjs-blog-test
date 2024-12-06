import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export async function getAllBlogPosts(locale: string = 'en') {
  try {
    const localeDir = path.join(postsDirectory, locale);
    const fileNames = fs.readdirSync(localeDir);

    const posts = fileNames.map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(localeDir, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        ...(data as Omit<BlogPost, 'slug'>),
      } as BlogPost;
    });

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export async function getBlogPost(locale: string, slug: string) {
  try {
    const fullPath = path.join(postsDirectory, locale, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const processedContent = await remark()
      .use(html)
      .process(content);
      
    return {
      slug,
      content: processedContent.toString(),
      ...(data as Omit<BlogPost, 'slug'>),
    } as BlogPost & { content: string };
  } catch {
    return null;
  }
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
}