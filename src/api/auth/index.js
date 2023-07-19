import { strapi } from '../strapi'

class AuthApi {
  async signIn(email, password) {
    const { data } = await strapi.post('/auth/local', {
      identifier: email,
      password,
    })

    return data
  }

  async me() {
    const { data } = await strapi.get('/users/me', {
      params: {
        populate: ['avatar']
      }
    })

    return data
  }
}

export const authApi = new AuthApi()