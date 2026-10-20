import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CategoriesDbDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.category_id,
  CategoryRelations
> {
  constructor(
    @inject('datasources.categoriesDb') dataSource: CategoriesDbDataSource,
  ) {
    super(Category, dataSource);
  }
}
