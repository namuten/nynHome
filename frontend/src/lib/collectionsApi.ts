import api from './api';

export interface Collection {
  id: number;
  title: string;
  description: string | null;
  coverImageId: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface CollectionItem {
  id: number;
  collectionId: number;
  contentType: string;
  contentId: number;
  position: number;
  details: any;
}

export interface CollectionDetailed extends Omit<Collection, 'itemCount'> {
  items: CollectionItem[];
}

export const collectionsApi = {
  /**
   * 공개 컬렉션 목록 조회
   */
  getCollections: async (): Promise<Collection[]> => {
    const response = await api.get<Collection[]>('/collections');
    return response.data;
  },

  /**
   * 컬렉션 개별 상세 조회 (수록 아이템 일체 수렴)
   */
  getCollectionById: async (id: number): Promise<CollectionDetailed> => {
    const response = await api.get<CollectionDetailed>(`/collections/${id}`);
    return response.data;
  },

  /**
   * [어드민] 전체 컬렉션 목록 조회 (비공개 포함)
   */
  getAdminCollections: async (): Promise<Collection[]> => {
    const response = await api.get<Collection[]>('/admin/collections');
    return response.data;
  },

  /**
   * [어드민] 컬렉션 메타데이터 생성
   */
  createCollection: async (data: {
    title: string;
    description?: string;
    coverImageId?: number;
    isPublished?: boolean;
  }): Promise<Collection> => {
    const response = await api.post<Collection>('/admin/collections', data);
    return response.data;
  },

  /**
   * [어드민] 컬렉션 메타데이터 개정
   */
  updateCollection: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      coverImageId?: number;
      isPublished?: boolean;
    }
  ): Promise<Collection> => {
    const response = await api.put<Collection>(`/admin/collections/${id}`, data);
    return response.data;
  },

  /**
   * [어드민] 컬렉션 영구 제거 (CASCADE 연쇄)
   */
  deleteCollection: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/collections/${id}`);
    return response.data;
  },

  /**
   * [어드민] 컬렉션에 새 아이템 추가 수록
   */
  addItem: async (
    collectionId: number,
    data: { contentType: string; contentId: number }
  ): Promise<CollectionItem> => {
    const response = await api.post<CollectionItem>(`/admin/collections/${collectionId}/items`, data);
    return response.data;
  },

  /**
   * [어드민] 컬렉션 소속 아이템 탈락 방출
   */
  removeItem: async (collectionId: number, itemId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/collections/${collectionId}/items/${itemId}`
    );
    return response.data;
  },

  /**
   * [어드민] 컬렉션 아이템 표시 순서 재배치 변경
   */
  reorderItems: async (
    collectionId: number,
    items: { contentType: string; contentId: number; position: number }[]
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>(
      `/admin/collections/${collectionId}/reorder`,
      { items }
    );
    return response.data;
  },
};
export default collectionsApi;
