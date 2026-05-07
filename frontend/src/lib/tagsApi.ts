import api from './api';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  createdAt: string;
  contentCount?: number;
}

export interface TaggedContents {
  tag: Tag;
  contents: {
    posts: any[];
    showcases: any[];
  };
}

export const tagsApi = {
  /**
   * 전체 태그 목록 조회 (콘텐츠 카운트 포함)
   */
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  },

  /**
   * 특정 태그별 콘텐츠 목록 수집
   */
  getTagBySlug: async (slug: string): Promise<TaggedContents> => {
    const response = await api.get<TaggedContents>(`/tags/${slug}`);
    return response.data;
  },

  /**
   * [어드민] 신규 태그 생성
   */
  createTag: async (data: { name: string; slug: string; color?: string }): Promise<Tag> => {
    const response = await api.post<Tag>('/admin/tags', data);
    return response.data;
  },

  /**
   * [어드민] 태그 수정
   */
  updateTag: async (id: number, data: { name?: string; slug?: string; color?: string }): Promise<Tag> => {
    const response = await api.put<Tag>(`/admin/tags/${id}`, data);
    return response.data;
  },

  /**
   * [어드민] 태그 영구 제거
   */
  deleteTag: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/tags/${id}`);
    return response.data;
  },

  /**
   * [어드민] 콘텐츠에 태그 연결 부착
   */
  attachTagToContent: async (data: { contentType: string; contentId: number; tagId: number }): Promise<any> => {
    const response = await api.post('/admin/content-tags', data);
    return response.data;
  },

  /**
   * [어드민] 콘텐츠에서 태그 연결 해제
   */
  detachTagFromContent: async (data: { contentType: string; contentId: number; tagId: number }): Promise<any> => {
    const response = await api.delete('/admin/content-tags', { data });
    return response.data;
  },
};
export default tagsApi;
