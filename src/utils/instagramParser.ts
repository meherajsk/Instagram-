import { WatchItem, ContentType, EngagementType } from '../types';

/**
 * Intelligent parser for Instagram Data Export files (JSON/text)
 * Supports:
 * - videos_watched.json
 * - recently_viewed.json
 * - your_topics.json
 * - saved_posts.json
 * - impressions_history_posts_seen
 * - Generic array of posts or custom JSON
 */
export function parseInstagramExportJson(jsonContent: string, fileName: string = ''): WatchItem[] {
  try {
    const data = JSON.parse(jsonContent);
    const results: WatchItem[] = [];

    // Helper to extract timestamp
    const getTimestamp = (val: any) => {
      if (!val) return new Date().toISOString();
      if (typeof val === 'number') {
        // could be seconds or ms
        const ms = val < 10000000000 ? val * 1000 : val;
        return new Date(ms).toISOString();
      }
      if (typeof val === 'string') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }
      return new Date().toISOString();
    };

    // Helper to guess category from title, tags or string
    const guessCategory = (text: string): string => {
      const lower = (text || '').toLowerCase();
      if (lower.includes('ai') || lower.includes('code') || lower.includes('robot') || lower.includes('software') || lower.includes('tech') || lower.includes('computer')) return 'Tech & AI';
      if (lower.includes('workout') || lower.includes('gym') || lower.includes('fitness') || lower.includes('muscle') || lower.includes('health') || lower.includes('mobility')) return 'Fitness & Health';
      if (lower.includes('recipe') || lower.includes('cook') || lower.includes('food') || lower.includes('coffee') || lower.includes('sourdough') || lower.includes('eat')) return 'Cooking & Food';
      if (lower.includes('invest') || lower.includes('money') || lower.includes('saas') || lower.includes('finance') || lower.includes('business') || lower.includes('stock')) return 'Finance & Business';
      if (lower.includes('travel') || lower.includes('photo') || lower.includes('camera') || lower.includes('aesthetic') || lower.includes('tokyo') || lower.includes('film')) return 'Travel & Aesthetic';
      if (lower.includes('meme') || lower.includes('lol') || lower.includes('humor') || lower.includes('funny') || lower.includes('cat') || lower.includes('dog')) return 'Comedy & Memes';
      if (lower.includes('habit') || lower.includes('mindset') || lower.includes('book') || lower.includes('productivity') || lower.includes('routine')) return 'Self Improvement';
      if (lower.includes('game') || lower.includes('gaming') || lower.includes('celebrity') || lower.includes('movie') || lower.includes('music')) return 'Pop Culture & Gaming';
      if (lower.includes('fashion') || lower.includes('outfit') || lower.includes('style') || lower.includes('skincare') || lower.includes('makeup')) return 'Fashion & Beauty';
      if (lower.includes('science') || lower.includes('study') || lower.includes('physics') || lower.includes('history') || lower.includes('learn')) return 'Science & Education';
      return 'General Lifestyle';
    };

    // 1. Check for Instagram "topics_your_topics" format
    if (data.topics_your_topics && Array.isArray(data.topics_your_topics)) {
      data.topics_your_topics.forEach((topicObj: any, index: number) => {
        const topicName = topicObj.string_map_data?.Name?.value || topicObj.name || `Topic ${index + 1}`;
        results.push({
          id: `topic-${index}-${Date.now()}`,
          title: `Algorithmic Topic: ${topicName}`,
          creator: 'Instagram Recommendation Engine',
          handle: 'instagram',
          contentType: 'reel',
          category: guessCategory(topicName),
          durationSeconds: 30,
          watchedAt: getTimestamp(topicObj.string_map_data?.Timestamp?.value || Date.now() - index * 3600000),
          completionRate: 100,
          engagement: 'watched',
          tags: [topicName.toLowerCase().replace(/\s+/g, '-'), 'algorithm-interest'],
          notes: `Instagram classified you as actively engaging with "${topicName}".`,
        });
      });
      return results;
    }

    // 2. Check for "impressions_history_posts_seen" or "videos_watched" or "recently_viewed"
    const seenArray =
      data.impressions_history_posts_seen ||
      data.videos_watched ||
      data.recently_viewed ||
      data.saved_saved_media ||
      data.posts_viewed ||
      (Array.isArray(data) ? data : null);

    if (Array.isArray(seenArray)) {
      seenArray.forEach((item: any, idx: number) => {
        const strData = item.string_map_data || {};
        const author = strData.Author?.value || item.author || item.creator || item.username || 'creator';
        const title = strData.Title?.value || item.title || item.caption || `Watched Post by @${author}`;
        const timeVal = strData.Time?.timestamp || item.timestamp || item.watched_at || item.time;
        const href = strData['Post URL']?.href || strData.Link?.href || item.url || item.link;

        results.push({
          id: `export-${idx}-${Date.now()}`,
          title: title.length > 80 ? title.slice(0, 77) + '...' : title,
          creator: author,
          handle: author.replace(/^@/, ''),
          contentType: (item.contentType || (fileName.includes('video') ? 'video' : 'reel')) as ContentType,
          category: item.category || guessCategory(title + ' ' + (item.tags || []).join(' ')),
          durationSeconds: item.durationSeconds || Math.floor(Math.random() * 40 + 20),
          watchedAt: getTimestamp(timeVal),
          completionRate: item.completionRate || Math.floor(Math.random() * 20 + 80),
          engagement: (item.engagement || (fileName.includes('saved') ? 'saved' : 'watched')) as EngagementType,
          tags: Array.isArray(item.tags) ? item.tags : ['instagram-export'],
          notes: item.notes || (href ? `URL: ${href}` : undefined),
          url: href,
        });
      });
      return results;
    }

    // 3. Fallback: inspect top-level keys
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return parseInstagramExportJson(JSON.stringify(data[firstKey]), fileName);
    }

    throw new Error('Unrecognized Instagram export JSON structure');
  } catch (err: any) {
    console.error('Failed to parse Instagram export:', err);
    throw new Error(err.message || 'Invalid JSON file');
  }
}
