import { Injectable } from '@nestjs/common';

@Injectable()
export class YoutubeIdExtractorService {
  private readonly patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  extractVideoId(url: string): string {
    for (const pattern of this.patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
    return url;
  }

  isYoutubeUrl(url: string): boolean {
    return this.patterns.some(pattern => pattern.test(url));
  }

  isShorts(url: string): boolean {
    return url.includes('/shorts/');
  }
}

