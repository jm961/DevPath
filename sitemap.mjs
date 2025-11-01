import path from 'node:path';
import fs from 'node:fs/promises';

async function getRoadmapIds() {
  return fs.readdir(path.join(process.cwd(), 'src/data/roadmaps'));
}

async function getBestPracticesIds() {
  return fs.readdir(path.join(process.cwd(), 'src/data/best-practices'));
}

export function shouldIndexPage(pageUrl) {
  return ![
    'https://devpath.sh/404',
    'https://devpath.sh/terms',
    'https://devpath.sh/privacy',
    'https://devpath.sh/pdfs',
    'https://devpath.sh/g',
  ].includes(pageUrl);
}

export async function serializeSitemap(item) {
  const highPriorityPages = [
    'https://devpath.sh',
    'https://devpath.sh/about',
    'https://devpath.sh/roadmaps',
    'https://devpath.sh/best-practices',
    'https://devpath.sh/guides',
    'https://devpath.sh/videos',
    ...(await getRoadmapIds()).flatMap((id) => [
      `https://devpath.sh/${id}`,
      `https://devpath.sh/${id}/topics`,
    ]),
    ...(await getBestPracticesIds()).map(
      (id) => `https://devpath.sh/best-practices/${id}`
    ),
  ];

  // Roadmaps and other high priority pages
  for (let pageUrl of highPriorityPages) {
    if (item.url === pageUrl) {
      return {
        ...item,
        // @ts-ignore
        changefreq: 'monthly',
        priority: 1,
      };
    }
  }

  // Guide and video pages
  if (
    item.url.startsWith('https://devpath.sh/guides') ||
    item.url.startsWith('https://devpath.sh/videos')
  ) {
    return {
      ...item,
      // @ts-ignore
      changefreq: 'monthly',
      priority: 0.9,
    };
  }

  return undefined;
}
