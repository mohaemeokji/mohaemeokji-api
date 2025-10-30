import { Module } from '@nestjs/common';
import { RecipeExplorerController } from './recipe-explorer.controller';
import { RecipeExplorerService } from './recipe-explorer.service';
import { RepositoriesModule } from '../../core/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [RecipeExplorerController],
  providers: [RecipeExplorerService],
  exports: [RecipeExplorerService],
})
export class RecipeExplorerModule {}

