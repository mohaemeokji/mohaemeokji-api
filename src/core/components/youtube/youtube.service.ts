import { Injectable } from '@nestjs/common';
import { Innertube } from 'youtubei.js';
import { YoutubeRaw } from '../../entities/video/youtube-raw.entity';
import { YoutubeRawRepository } from '../../repositories/youtube-raw/youtube-raw.repository';

@Injectable()
export class YoutubeService {
  private youtube: Innertube;

  constructor(private readonly youtubeRawRepository: YoutubeRawRepository) {}

  async onModuleInit() {
    this.youtube = await Innertube.create();
  }

  private extractVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return url;
  }

  private isShorts(url: string): boolean {
    return url.includes('/shorts/');
  }

  async getVideoInfo(videoIdOrUrl: string) {
    const videoId = this.extractVideoId(videoIdOrUrl);
    const isShorts = this.isShorts(videoIdOrUrl);
    
    const info = isShorts 
      ? await this.youtube.getShortsVideoInfo(videoId)
      : await this.youtube.getInfo(videoId);
    
    const basicInfo = info.basic_info as any;

    return {
      id: basicInfo.id,
      title: basicInfo.title,
      description: basicInfo.short_description,
      duration: basicInfo.duration,
      viewCount: basicInfo.view_count,
      likeCount: basicInfo.like_count,
      uploadDate: basicInfo.start_timestamp || basicInfo.upload_date || 'N/A',
      channel: {
        id: basicInfo.channel_id,
        name: basicInfo.channel?.name || basicInfo.author,
        url: basicInfo.channel?.url || '',
      },
      thumbnails: basicInfo.thumbnail,
      tags: basicInfo.tags || [],
      category: basicInfo.category,
      isLiveContent: basicInfo.is_live_content || false,
      isShorts: isShorts,
    };
  }

  async getComments(videoIdOrUrl: string, maxComments: number = 100) {
    const videoId = this.extractVideoId(videoIdOrUrl);

    try {
      const commentsSection = await this.youtube.getComments(videoId, 'TOP_COMMENTS');
      
      if (!commentsSection) {
        return { videoId, totalComments: 0, comments: [], message: '댓글이 비활성화되어 있습니다.' };
      }

      const commentsAny = commentsSection as any;
      const commentsArray = commentsAny.contents || commentsAny.comments || [];
      const result: any[] = [];

      for (const comment of commentsArray.slice(0, maxComments)) {
        const commentData = comment as any;
        const actualComment = commentData.comment || commentData;
        
        result.push({
          id: actualComment.comment_id || actualComment.id || '',
          author: {
            name: actualComment.author?.name || '',
            channelId: actualComment.author?.id || '',
            thumbnail: actualComment.author?.thumbnails?.[0]?.url || actualComment.author?.best_thumbnail?.url || '',
          },
          content: actualComment.content?.text || actualComment.text || '',
          publishedTime: actualComment.published?.text || actualComment.published_time || '',
          likeCount: actualComment.like_count || 0,
          replyCount: actualComment.reply_count || 0,
          isPinned: actualComment.is_pinned || false,
          isHeartedByCreator: actualComment.is_hearted || actualComment.is_creator_liked || false,
        });
      }

      return { videoId, totalComments: result.length, comments: result, message: result.length === 0 ? '댓글이 없습니다.' : undefined };
    } catch (error: any) {
      return { videoId, totalComments: 0, comments: [], message: '댓글을 가져올 수 없습니다.' };
    }
  }

  async getTranscript(videoIdOrUrl: string, language: string = 'ko') {
    const videoId = this.extractVideoId(videoIdOrUrl);
    const isShorts = this.isShorts(videoIdOrUrl);

    try {
      const info = isShorts 
        ? await this.youtube.getShortsVideoInfo(videoId)
        : await this.youtube.getInfo(videoId);
      
      const transcriptInfo = await info.getTranscript();
      const transcriptAny = transcriptInfo as any;
      
      const transcript = transcriptAny.transcript || transcriptAny;
      const content = transcript.content || transcript;
      
      let segments: any[] = [];
      
      if (content.body?.initial_segments) {
        segments = content.body.initial_segments;
      } else if (content.body?.transcript_body_renderer?.cue_groups) {
        segments = content.body.transcript_body_renderer.cue_groups.flatMap((group: any) => group.cues || []);
      } else if (content.cue_groups) {
        segments = content.cue_groups.flatMap((group: any) => group.cues || []);
      } else if (transcript.body?.initial_segments) {
        segments = transcript.body.initial_segments;
      }
      
      if (!segments || segments.length === 0) {
        return { videoId, language: null, segments: [], fullText: null };
      }
      
      const convertedSegments = segments.map((item: any) => {
        const cue = item.transcriptCueRenderer || item;
        return {
          text: cue.cue?.simpleText || cue.snippet?.text || cue.text || '',
          startMs: cue.startOffsetMs || cue.start_ms || String(cue.startMs || 0),
          endMs: cue.endOffsetMs || cue.end_ms || String(cue.endMs || 0),
          duration: cue.durationMs || cue.duration || String(cue.dur || 0),
        };
      });
      
      const fullText = convertedSegments.map(s => s.text).filter(Boolean).join(' ').trim();
      
      return { videoId, language, segments: convertedSegments, fullText };
    } catch (error: any) {
      return { videoId, language: null, segments: [], fullText: null };
    }
  }

  async searchVideos(query: string, limit: number = 10) {
    const search = await this.youtube.search(query, { type: 'video' });
    const videos = search.videos.slice(0, limit);

    return videos.map((video: any) => ({
      id: video.id,
      title: video.title?.text || '',
      description: video.description || '',
      thumbnails: video.thumbnails,
      duration: video.duration?.text || '',
      viewCount: video.view_count?.text || '',
      channel: {
        id: video.author?.id || '',
        name: video.author?.name || '',
        url: video.author?.url || '',
      },
    }));
  }

  async getChannelInfo(channelIdOrUrl: string) {
    const channel = await this.youtube.getChannel(channelIdOrUrl);
    const metadata = channel.metadata as any;
    const header = channel.header as any;

    return {
      id: metadata.external_id,
      name: metadata.title,
      description: metadata.description,
      subscriberCount: header.subscriber_count?.text || '알 수 없음',
      videoCount: header.videos_count?.text || '알 수 없음',
      url: metadata.vanity_channel_url || `https://www.youtube.com/channel/${metadata.external_id}`,
      thumbnails: metadata.avatar?.thumbnails || [],
      avatar: metadata.avatar,
      keywords: metadata.keywords || [],
    };
  }

  async getChannelVideos(channelIdOrUrl: string, limit: number = 10) {
    const channel = await this.youtube.getChannel(channelIdOrUrl);
    const channelAny = channel as any;
    const videosTab = channelAny.videos_tab;
    
    if (!videosTab) return [];

    const videos = videosTab.videos || [];
    return videos.slice(0, limit).map((video: any) => ({
      id: video.id,
      title: video.title?.text || '',
      thumbnails: video.thumbnails,
      duration: video.duration?.text || '',
      viewCount: video.view_count?.text || '',
      publishedTime: video.published?.text || '',
    }));
  }

  private isDataComplete(data: YoutubeRaw): boolean {
    const hasBasicInfo = data.title && data.viewCount !== null;
    const hasChannelInfo = data.channelId && data.channelName;
    const hasComments = data.totalComments !== null && data.totalComments !== undefined && data.totalComments > 0;
    const hasTranscript = data.transcriptSegments !== null && data.transcriptSegments !== undefined && data.transcriptSegments.length > 0;
    
    return hasBasicInfo && hasChannelInfo && hasComments && hasTranscript;
  }

  private async fillMissingData(existingData: YoutubeRaw, maxComments: number = 100, language: string = 'ko'): Promise<YoutubeRaw> {
    const videoId = existingData.videoId;
    let updated = false;

    if (!existingData.title || existingData.viewCount === null) {
      try {
        const videoInfo = await this.getVideoInfo(videoId);
        Object.assign(existingData, {
          title: videoInfo.title,
          description: videoInfo.description,
          duration: videoInfo.duration,
          viewCount: videoInfo.viewCount,
          likeCount: videoInfo.likeCount,
          uploadDate: videoInfo.uploadDate,
          category: videoInfo.category,
          tags: videoInfo.tags,
          thumbnails: videoInfo.thumbnails,
          isLiveContent: videoInfo.isLiveContent,
          channelId: videoInfo.channel.id,
          channelName: videoInfo.channel.name,
          channelUrl: videoInfo.channel.url,
        });
        updated = true;
      } catch (error) {}
    }

    if (!existingData.channelDescription && existingData.channelId) {
      try {
        const channelInfo = await this.getChannelInfo(existingData.channelId);
        Object.assign(existingData, {
          channelDescription: channelInfo.description,
          channelSubscriberCount: channelInfo.subscriberCount,
          channelVideoCount: channelInfo.videoCount,
          channelThumbnails: channelInfo.thumbnails,
          channelAvatar: channelInfo.avatar,
          channelKeywords: channelInfo.keywords,
        });
        updated = true;
      } catch (error) {}
    }

    if (existingData.totalComments === null || existingData.totalComments === undefined) {
      try {
        const commentsData = await this.getComments(videoId, maxComments);
        existingData.totalComments = commentsData.totalComments;
        existingData.comments = commentsData.comments;
        updated = true;
      } catch (error) {
        existingData.totalComments = 0;
        existingData.comments = [];
        updated = true;
      }
    }

    if (!existingData.transcriptSegments || existingData.transcriptSegments.length === 0) {
      try {
        const transcriptData = await this.getTranscript(videoId, language);
        existingData.transcriptLanguage = transcriptData.language;
        existingData.transcriptSegments = transcriptData.segments;
        existingData.transcriptFullText = transcriptData.fullText;
        updated = true;
      } catch (error) {
        existingData.transcriptSegments = [];
        existingData.transcriptFullText = null;
        updated = true;
      }
    }

    if (updated) {
      existingData.updatedAt = new Date();
    }

    return existingData;
  }

  private async collectFromYoutube(videoIdOrUrl: string, maxComments: number = 100, language: string = 'ko'): Promise<YoutubeRaw> {
    const videoId = this.extractVideoId(videoIdOrUrl);
    const youtubeRaw = new YoutubeRaw();
    youtubeRaw.videoId = videoId;
    youtubeRaw.videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    youtubeRaw.collectedAt = new Date();
    youtubeRaw.updatedAt = new Date();
    youtubeRaw.status = 'active';

    try {
      const videoInfo = await this.getVideoInfo(videoId);
      Object.assign(youtubeRaw, {
        title: videoInfo.title,
        description: videoInfo.description,
        duration: videoInfo.duration,
        viewCount: videoInfo.viewCount,
        likeCount: videoInfo.likeCount,
        uploadDate: videoInfo.uploadDate,
        category: videoInfo.category,
        tags: videoInfo.tags,
        thumbnails: videoInfo.thumbnails,
        isLiveContent: videoInfo.isLiveContent,
        isShorts: videoInfo.isShorts,
        channelId: videoInfo.channel.id,
        channelName: videoInfo.channel.name,
        channelUrl: videoInfo.channel.url,
      });

      try {
        const channelInfo = await this.getChannelInfo(videoInfo.channel.id);
        Object.assign(youtubeRaw, {
          channelDescription: channelInfo.description,
          channelSubscriberCount: channelInfo.subscriberCount,
          channelVideoCount: channelInfo.videoCount,
          channelThumbnails: channelInfo.thumbnails,
          channelAvatar: channelInfo.avatar,
          channelKeywords: channelInfo.keywords,
        });
      } catch (error) {}

      try {
        const commentsData = await this.getComments(videoId, maxComments);
        youtubeRaw.totalComments = commentsData.totalComments;
        youtubeRaw.comments = commentsData.comments;
      } catch (error) {
        youtubeRaw.totalComments = 0;
        youtubeRaw.comments = [];
      }

      try {
        const transcriptData = await this.getTranscript(videoId, language);
        youtubeRaw.transcriptLanguage = transcriptData.language;
        youtubeRaw.transcriptSegments = transcriptData.segments;
        youtubeRaw.transcriptFullText = transcriptData.fullText;
      } catch (error) {
        youtubeRaw.transcriptSegments = [];
        youtubeRaw.transcriptFullText = null;
      }

      return youtubeRaw;
    } catch (error: any) {
      youtubeRaw.status = 'error';
      youtubeRaw.errorMessage = error.message;
      throw error;
    }
  }

  async getComprehensiveVideoData(videoIdOrUrl: string, maxComments: number = 100, language: string = 'ko'): Promise<YoutubeRaw> {
    const videoId = this.extractVideoId(videoIdOrUrl);
    const existingData = await this.youtubeRawRepository.findByVideoId(videoId);

    if (existingData) {
      if (this.isDataComplete(existingData)) {
        return existingData;
      }
      const updatedData = await this.fillMissingData(existingData, maxComments, language);
      return await this.youtubeRawRepository.save(updatedData);
    }

    const newData = await this.collectFromYoutube(videoIdOrUrl, maxComments, language);
    return await this.youtubeRawRepository.save(newData);
  }

  async getBulkComprehensiveVideoData(videoIdsOrUrls: string[], maxComments: number = 100, language: string = 'ko'): Promise<YoutubeRaw[]> {
    return Promise.all(videoIdsOrUrls.map(videoIdOrUrl => this.getComprehensiveVideoData(videoIdOrUrl, maxComments, language)));
  }
}