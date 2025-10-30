/**
 * YouTube API 응답 인터페이스
 */

export interface IVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  uploadDate: string;
  channel: IChannelBasicInfo;
  thumbnails: IThumbnail[];
  tags: string[];
  category: string;
  isLiveContent: boolean;
}

export interface IChannelBasicInfo {
  id: string;
  name: string;
  url: string;
}

export interface IChannelInfo {
  id: string;
  name: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  thumbnails: IThumbnail[];
  avatar: IThumbnail[];
  keywords: string[];
}

export interface IThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface IComment {
  id: string;
  author: ICommentAuthor;
  content: string;
  publishedTime: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  isHeartedByCreator: boolean;
}

export interface ICommentAuthor {
  name: string;
  channelId: string;
  thumbnail: string;
}

export interface ICommentsResponse {
  videoId: string;
  totalComments: number;
  comments: IComment[];
  message?: string;
}

export interface ITranscriptSegment {
  text: string;
  startMs: string;
  endMs: string;
  duration: string;
}

export interface ITranscriptResponse {
  videoId: string;
  available: boolean;
  language?: string;
  segments?: ITranscriptSegment[];
  fullText?: string;
  message?: string;
}

export interface IVideoSearchResult {
  id: string;
  title: string;
  description: string;
  duration: string;
  viewCount: string;
  publishedTime: string;
  channel: {
    id: string;
    name: string;
    verified: boolean;
  };
  thumbnails: IThumbnail[];
}

export interface ISearchResponse {
  query: string;
  totalResults: number;
  videos: IVideoSearchResult[];
}

export interface IChannelVideosResponse {
  channelId: string;
  totalVideos: number;
  videos: IVideoSearchResult[];
}

