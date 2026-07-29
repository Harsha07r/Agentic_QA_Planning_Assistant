import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This directory already contains the markdown files
const knowledgeDir = __dirname;

class KnowledgeBaseService {
  constructor() {
    this.documents = [];
    this.loaded = false;
  }

  async loadKnowledge() {
    if (this.loaded) return this.documents;

    const files = await fs.readdir(knowledgeDir);
    const docs = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(knowledgeDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        docs.push({
          id: file,
          title: this._titleFromFilename(file),
          content,
        });
      }
    }

    this.documents = docs;
    this.loaded = true;
    return docs;
  }

  async searchKnowledge(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    if (!this.loaded) {
      await this.loadKnowledge();
    }

    const normalizedQuery = query.toLowerCase();
    const results = [];

    for (const doc of this.documents) {
      const sections = doc.content
        .split(/^##\s+/m)
        .map((section) => section.trim())
        .filter(Boolean);

      for (const section of sections) {
        const lowerSection = section.toLowerCase();
        const score = this._scoreSection(lowerSection, normalizedQuery);

        if (score > 0) {
          const [heading, ...body] = section.split('\n');
          results.push({
            id: `${doc.id}#${heading?.trim().replace(/\s+/g, '-').toLowerCase()}`,
            title: heading?.trim() || doc.title,
            document: doc.title,
            score,
            snippet: body.join(' ').trim().slice(0, 240),
          });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  _titleFromFilename(filename) {
    return filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  _scoreSection(section, query) {
    const tokens = query.split(/\s+/).filter(Boolean);
    let score = 0;

    for (const token of tokens) {
      if (section.includes(token)) score += 2;
      const occurrences = section.split(token).length - 1;
      if (occurrences > 1) score += occurrences;
    }

    return score;
  }
}

const knowledgeBaseService = new KnowledgeBaseService();
export default knowledgeBaseService;
