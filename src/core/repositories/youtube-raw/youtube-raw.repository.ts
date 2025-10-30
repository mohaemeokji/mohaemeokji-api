import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YoutubeRaw } from '../../entities/video/youtube-raw.entity';
import { IYoutubeRawRepository } from './youtube-raw.repository.interface';

/**
 * YoutubeRaw Repository Implementation
 * 
 * Infrastructure(TypeORM)를 사용하여 유튜브 원본 데이터를 관리합니다.
 */
@Injectable()
export class YoutubeRawRepository implements IYoutubeRawRepository {
  constructor(
    @InjectRepository(YoutubeRaw)
    private readonly repository: Repository<YoutubeRaw>,
  ) {}

  async findByVideoId(videoId: string): Promise<YoutubeRaw | null> {
    return await this.repository.findOne({ where: { videoId } });
  }

  async findAll(): Promise<YoutubeRaw[]> {
    return await this.repository.find({
      order: { collectedAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<YoutubeRaw | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<YoutubeRaw>): Promise<YoutubeRaw> {
    const youtubeRaw = this.repository.create(data);
    return await this.repository.save(youtubeRaw);
  }

  async update(id: number, data: Partial<YoutubeRaw>): Promise<YoutubeRaw> {
    await this.repository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
    return await this.findById(id);
  }

  async save(data: YoutubeRaw): Promise<YoutubeRaw> {
    data.updatedAt = new Date();
    return await this.repository.save(data);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByStatus(status: string): Promise<YoutubeRaw[]> {
    return await this.repository.find({
      where: { status },
      order: { collectedAt: 'DESC' },
    });
  }

  async findByChannelId(channelId: string): Promise<YoutubeRaw[]> {
    return await this.repository.find({
      where: { channelId },
      order: { collectedAt: 'DESC' },
    });
  }

  async existsByVideoId(videoId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { videoId } });
    return count > 0;
  }
}

