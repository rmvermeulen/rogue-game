import { AxiosInstance } from 'axios';
import { Context, createContext } from 'react';

export const ApiContext = createContext(null as (AxiosInstance | null));
