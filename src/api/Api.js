import { strapi } from './strapi';

export class Api {
  constructor(endpoint) {
    this.endpoint = endpoint
  }

  async list(params) {
    const { data: { data }} = await strapi.get(this.endpoint, {
      params
    })

    return data.map(item => ({
      ...item.attributes,
      id: item.id
    }))
  }

  async get(id, params) {
    const { data } = await strapi.get(`${this.endpoint}/${id}`, {
      params
    })

    return data
  }

  async create(entity) {
    const { data } = await strapi.post(this.endpoint, entity)

    return data
  }

  async update(id, entity) {
    const { data } = await strapi.put(`${this.endpoint}/${id}`, entity)

    return data
  }

  async delete(id) {
    await strapi.delete(`${this.endpoint}/${id}`)
  }
}