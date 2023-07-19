import axios from 'axios'

export const strapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})