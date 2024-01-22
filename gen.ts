#!/usr/bin/env bun

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = process.argv[1].split('/').slice(0, -1).join('/');
const blog = `${root}/blog`;
const template = `${root}/site.html.template`;
const title = 'Cat Writes a Blog';

const render = (dest: string, title: string, content: string, pos: { root: string, blog: string }) =>
  writeFileSync(
    dest,
    readFileSync(template, 'utf8')
      .replaceAll('{{ROOT}}', pos.root)
      .replace('{{BLOG}}', pos.blog)
      .replaceAll('{{TITLE}}', title)
      .replace('{{CONTENT}}', content)
  );

// Home page
render(
  `${root}/index.html`,
  title,
  '<p>Meow mew <a href="blog">blog</a> meow.</p>\n' +
  '<p>にゃん</p>',
  { root: '.', blog: 'blog'}
);

const postFiles = readdirSync(blog)
  .filter(s => s.match(/\.md\.part$/))
  .sort((a, b) => a < b);

const posts = [];

// Post listing page
render(
  `${blog}/index.html`,
  title,
  postFiles.map(f => {
    const date = f.split('-').slice(0, 3).join('-');
    const title = f.split('.')[0].split('-').slice(3).join(' ');
    const dest = f.replace('.md.part', '.html');
    posts.push({source: f, dest, title});

    return `<p><a href='${dest}'>${date} ${title}</a></p>`;
  }).join('\n'),
  { root: '..', blog: '.'}
);

// The posts
posts.forEach(({source, dest, title}) => render(
  `${blog}/${dest}`,
  title,
  spawnSync('pandoc', [`${blog}/${source}`, '--from', 'commonmark', '--to', 'html5']).stdout,
  { root: '..', blog: '.'}
));
