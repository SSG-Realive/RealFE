<<<<<<< HEAD
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiError, ApiResponse } from '@/types/api';
=======
// src/lib/apiClient.ts (기존 파일을 이 내용으로 교체)
>>>>>>> FE/team2/ho

import { createApiClient } from './apiFactory';
import { useAuthStore } from '@/store/customer/authStore';
import { useSellerAuthStore } from '@/store/seller/useSellerAuthStore';

<<<<<<< HEAD
// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('→ Interceptor: token=', token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('→ Interceptor: Authorization 헤더 설정됨:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      localStorage.removeItem('accessToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
=======
// Customer용 API 클라이언트
export const customerApi = createApiClient(useAuthStore);

// Seller용 API 클라이언트
export const sellerApi = createApiClient(useSellerAuthStore);

// 기본적으로는 customerApi를 내보내거나,
// 혹은 사용하는 곳에서 명시적으로 customerApi, sellerApi를 import해서 사용합니다.
export default customerApi;
>>>>>>> FE/team2/ho
