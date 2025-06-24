import { useMemo } from "react";
import axios from 'axios';

export const useApi = (token, baseURL = 'http://localhost:3000/api') => {
    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL
        });

        instance.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Beare ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return instance;
    }, [token, baseURL]);

    return axiosInstance;
}