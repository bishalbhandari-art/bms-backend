import {service} from '@loopback/core';
import {get, post, del, param, patch, requestBody} from '@loopback/rest';

import {CategoriesApiService} from '../services/categories-api.service';

export class CategoriesController {
  constructor(
    @service(CategoriesApiService)
    private readonly categoriesApiService: CategoriesApiService,
  ) {}

  @get('/api/categories')
  async getCategories(): Promise<unknown> {
    return this.categoriesApiService.getCategories();
  }

  @get('/api/categories/{id}')
  async getCategoryById(@param.path.number('id') id: number): Promise<unknown> {
    return this.categoriesApiService.getCategoryById(id);
  }

  @post('/api/categories')
  async createCategory(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
                description: 'Category name',
              },
            },
          },
          example: {
            name: 'Mystery',
          },
        },
      },
    })
    category: Record<string, unknown>,
  ): Promise<unknown> {
    return this.categoriesApiService.createCategory(category);
  }

  @patch('/api/categories/{id}')
  async updateCategory(
    @param.path.number('id') id: number,
    @requestBody() updates: Record<string, unknown>,
  ): Promise<unknown> {
    return this.categoriesApiService.updateCategory(id, updates);
  }

  @del('/api/categories/{id}')
  async deleteCategory(@param.path.number('id') id: number): Promise<void> {
    await this.categoriesApiService.deleteCategory(id);
  }
}
