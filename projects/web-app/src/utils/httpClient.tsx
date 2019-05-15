/* istanbul ignore file */
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 1000,
});
