import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { YoutubeService } from './youtube.service';
import { YoutubeVideoInfoResponseDto } from './dto/youtube-video-info-response.dto';
import { YoutubeTranscriptResponseDto } from './dto/youtube-transcript-response.dto';
import { YoutubeCommentsResponseDto } from './dto/youtube-comments-response.dto';
import { YoutubeFullDataResponseDto } from './dto/youtube-full-data-response.dto';
import { AuthGuard } from '../iam/decorators/auth-guard.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';

@ApiTags('Youtube [Production에서는 아마 미사용 | 실제 유튜브 데이터 및 DB 연동된 상태]')
@Controller('youtube')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('info/:videoIdOrUrl')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유튜브 비디오 기본 정보 조회',
    description: '비디오 ID 또는 URL을 입력하여 기본 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'videoIdOrUrl',
    description: '유튜브 비디오 ID 또는 전체 URL',
    example: 'dQw4w9WgXcQ',
  })
  @ApiOkResponse({
    description: '비디오 기본 정보 조회 성공',
    type: YoutubeVideoInfoResponseDto,
  })
  @ApiNotFoundResponse({
    description: '비디오를 찾을 수 없습니다',
  })
  async getVideoInfo(
    @Param('videoIdOrUrl') videoIdOrUrl: string,
  ): Promise<YoutubeVideoInfoResponseDto> {
    return await this.youtubeService.getVideoInfo(videoIdOrUrl);
  }

  @Get('transcript/:videoIdOrUrl')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유튜브 비디오 자막 조회',
    description: '비디오 ID 또는 URL을 입력하여 자막을 조회합니다.',
  })
  @ApiParam({
    name: 'videoIdOrUrl',
    description: '유튜브 비디오 ID 또는 전체 URL',
    example: 'dQw4w9WgXcQ',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: '자막 언어 코드',
    example: 'ko',
  })
  @ApiOkResponse({
    description: '자막 조회 성공',
    type: YoutubeTranscriptResponseDto,
  })
  @ApiNotFoundResponse({
    description: '자막을 찾을 수 없습니다',
  })
  async getTranscript(
    @Param('videoIdOrUrl') videoIdOrUrl: string,
    @Query('language') language?: string,
  ): Promise<YoutubeTranscriptResponseDto> {
    return await this.youtubeService.getTranscript(
      videoIdOrUrl,
      language || 'ko',
    );
  }

  @Get('comments/:videoIdOrUrl')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유튜브 비디오 댓글 조회',
    description: '비디오 ID 또는 URL을 입력하여 댓글을 조회합니다.',
  })
  @ApiParam({
    name: 'videoIdOrUrl',
    description: '유튜브 비디오 ID 또는 전체 URL',
    example: 'dQw4w9WgXcQ',
  })
  @ApiQuery({
    name: 'maxComments',
    required: false,
    description: '최대 댓글 개수',
    example: 100,
  })
  @ApiOkResponse({
    description: '댓글 조회 성공',
    type: YoutubeCommentsResponseDto,
  })
  @ApiNotFoundResponse({
    description: '댓글을 찾을 수 없습니다',
  })
  async getComments(
    @Param('videoIdOrUrl') videoIdOrUrl: string,
    @Query('maxComments') maxComments?: number,
  ): Promise<YoutubeCommentsResponseDto> {
    return await this.youtubeService.getComments(
      videoIdOrUrl,
      maxComments ? Number(maxComments) : 100,
    );
  }

  @Get('data/:videoIdOrUrl')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유튜브 비디오 전체 데이터 조회',
    description:
      '비디오 ID 또는 URL을 입력하여 기본정보, 채널정보, 댓글, 자막을 포함한 전체 데이터를 조회합니다. DB 캐싱이 적용되어 있어 빠른 응답이 가능합니다.',
  })
  @ApiParam({
    name: 'videoIdOrUrl',
    description: '유튜브 비디오 ID 또는 전체 URL',
    example: 'dQw4w9WgXcQ',
  })
  @ApiQuery({
    name: 'maxComments',
    required: false,
    description: '최대 댓글 개수',
    example: 100,
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: '자막 언어 코드',
    example: 'ko',
  })
  @ApiOkResponse({
    description: '전체 데이터 조회 성공',
    type: YoutubeFullDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: '비디오 데이터를 찾을 수 없습니다',
  })
  async getComprehensiveData(
    @Param('videoIdOrUrl') videoIdOrUrl: string,
    @Query('maxComments') maxComments?: number,
    @Query('language') language?: string,
  ): Promise<YoutubeFullDataResponseDto> {
    return await this.youtubeService.getComprehensiveData(
      videoIdOrUrl,
      maxComments ? Number(maxComments) : 100,
      language || 'ko',
    );
  }
}

