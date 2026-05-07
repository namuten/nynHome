import { get, set } from 'idb-keyval';

export interface PendingComment {
  id: string;
  postId: number;
  content: string;
  createdAt: number;
}

const STORAGE_KEY = 'crochub-pending-comments';

export const pendingComments = {
  // 1. 오프라인 댓글 대기열 전체 조회
  async getAll(): Promise<PendingComment[]> {
    try {
      const list = await get<PendingComment[]>(STORAGE_KEY);
      return list || [];
    } catch (e) {
      console.error('⚠️ [IndexedDB] Failed to read pending comments:', e);
      return [];
    }
  },

  // 2. 오프라인 새 댓글 대기열에 안전 보관
  async add(comment: Omit<PendingComment, 'id' | 'createdAt'>): Promise<string> {
    const id = `pending_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const newComment: PendingComment = {
      ...comment,
      id,
      createdAt: Date.now(),
    };

    try {
      const list = await this.getAll();
      list.push(newComment);
      await set(STORAGE_KEY, list);
      console.log('✅ [IndexedDB] Offline comment draft saved successfully:', newComment);
      return id;
    } catch (e) {
      console.error('⚠️ [IndexedDB] Failed to save pending comment draft:', e);
      throw e;
    }
  },

  // 3. 발송 완료된 오프라인 댓글 대기열에서 제거
  async remove(id: string): Promise<void> {
    try {
      const list = await this.getAll();
      const updatedList = list.filter((item) => item.id !== id);
      await set(STORAGE_KEY, updatedList);
      console.log(`✅ [IndexedDB] Removed processed draft ${id} from queue`);
    } catch (e) {
      console.error(`⚠️ [IndexedDB] Failed to remove processed draft ${id}:`, e);
    }
  },

  // 4. 대기 중인 오프라인 댓글 총 갯수 획득
  async count(): Promise<number> {
    const list = await this.getAll();
    return list.length;
  }
};
