import { Module } from '@nestjs/common';
import { RecipeSearchController } from './recipe-search.controller';
import { RecipeSearchService } from './recipe-search.service';
import { RepositoriesModule } from '../../core/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [RecipeSearchController],
  providers: [RecipeSearchService],
  exports: [RecipeSearchService],
})
export class RecipeSearchModule {}

