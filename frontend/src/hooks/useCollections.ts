import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '../lib/collectionsApi';

/**
 * 공개 컬렉션 목록 조회 훅
 */
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.getCollections,
    staleTime: 10000,
  });
}

/**
 * [어드민] 전체 컬렉션 목록 조회 훅 (비공개 포함)
 */
export function useAdminCollections() {
  return useQuery({
    queryKey: ['admin_collections'],
    queryFn: collectionsApi.getAdminCollections,
    staleTime: 5000,
  });
}

/**
 * 컬렉션 개별 세부 정보 및 수록물 일체 조회 훅
 */
export function useCollection(id: number) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.getCollectionById(id),
    enabled: !!id,
  });
}

/**
 * [어드민] 컬렉션 신규 생성 뮤테이션 훅
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsApi.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

/**
 * [어드민] 컬렉션 메타 정보 변경 뮤테이션 훅
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; description?: string; coverImageId?: number; isPublished?: boolean };
    }) => collectionsApi.updateCollection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin_collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.id] });
    },
  });
}

/**
 * [어드민] 컬렉션 영구 제거 뮤테이션 훅
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsApi.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

/**
 * [어드민] 컬렉션 아이템 신규 수록 훅
 */
export function useAddCollectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: {
      collectionId: number;
      data: { contentType: string; contentId: number };
    }) => collectionsApi.addItem(collectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['admin_collections'] });
    },
  });
}

/**
 * [어드민] 컬렉션 소속 아이템 축출 제거 훅
 */
export function useRemoveCollectionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: number; itemId: number }) =>
      collectionsApi.removeItem(collectionId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['admin_collections'] });
    },
  });
}

/**
 * [어드민] 컬렉션 내 아이템 진열 순서 일괄 갱신 훅
 */
export function useReorderCollectionItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      collectionId,
      items,
    }: {
      collectionId: number;
      items: { contentType: string; contentId: number; position: number }[];
    }) => collectionsApi.reorderItems(collectionId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
    },
  });
}
