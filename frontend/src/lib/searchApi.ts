import api from './api';

export interface SearchResultItem {
  type: 'post' | 'image' | 'video' | 'portfolio';
  id: number;
  title: string;
  excerpt: string;
  score: number;
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
}

export const searchApi = {
  /**
   * CJK 전문 검색 API 호출
   */
  search: async (
    q: string,
    types: ('post' | 'image' | 'video' | 'portfolio')[],
    page = 1,
    limit = 20
  ): Promise<SearchResponse> => {
    const params = {
      q,
      types: types.join(','),
      page,
      limit,
    };
    const response = await api.get<SearchResponse>('/search', { params });
    return response.data;
  },
};
export default searchApi;
