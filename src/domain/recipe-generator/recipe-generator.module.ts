import { Module } from '@nestjs/common';
import { RecipeGeneratorController } from './recipe-generator.controller';
import { RecipeGeneratorService } from './recipe-generator.service';
import { RepositoriesModule } from '../../core/repositories/repositories.module';
import { YoutubeModule } from '../../core/components/youtube/youtube.module';
import { GeminiModule } from '../../core/components/gemini/gemini.module';
import { UtilsModule } from '../../core/utils/utils.module';

@Module({
  imports: [RepositoriesModule, YoutubeModule, GeminiModule, UtilsModule],
  controllers: [RecipeGeneratorController],
  providers: [RecipeGeneratorService],
  exports: [RecipeGeneratorService],
})
export class RecipeGeneratorModule {}

