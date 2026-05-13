import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { UploadCloud, Trash2, FileText, AlertCircle, Link2, RotateCw } from 'lucide-react';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import { getOptimizedImageUrl } from '../../lib/media';
import type { AdminMediaItem } from '../../types/admin';

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch media library items
  const { data: rawMediaItems, isLoading } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => adminApi.getAdminMedia(),
  });

  // 백엔드 API 반환 포맷({ data, total })과 프론트엔드의 배열 예측 스펙 간의 불일치를 잡아주는 안전성 보정 코드
  const mediaItems = Array.isArray(rawMediaItems) ? rawMediaItems : (rawMediaItems as any)?.data || [];

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAdminMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });

  // Regenerate media derivatives mutation
  const regenerateMutation = useMutation({
    mutationFn: (id: number) => adminApi.regenerateAdminMediaDerivatives(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });

  // Upload file handler
  const handleUploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);
      await adminApi.uploadAdminMedia(file);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || '파일 업로드 과정에서 알 수 없는 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  // Human readable file size formatter
  const formatBytes = (bytes: number | string) => {
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num) || num === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* Title block */}
      <div className="border-b border-surface-container pb-5">
        <h1 className="text-3xl font-display font-black text-on-surface">미디어 라이브러리</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          게시물에 첨부하거나 본문에 삽입할 모든 자산을 업로드하고 중앙에서 제어합니다.
        </p>
      </div>

      {/* Drag & Drop Upload Zone Card */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden select-none flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-inner'
            : 'border-surface-container bg-white hover:border-primary/50 hover:bg-surface-container/5'
        }`}
      >
        <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
          isDragging ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary'
        }`}>
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-on-surface">
            {isDragging ? '여기에 드롭하여 즉시 업로드' : '클릭하거나 파일을 드래그하여 업로드'}
          </h4>
          <p className="text-[10px] text-on-surface-variant font-medium">
            최대 50MB 이내의 이미지, 비디오, 오디오 및 문서 파일을 지원합니다.
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-[10px] font-bold text-primary">파일 압축 및 클라우드 업로드 중...</span>
          </div>
        )}
      </div>

      {/* Upload success/error notifications */}
      {uploadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>업로드 실패: {uploadError}</span>
        </div>
      )}

      {/* Media Grid Cards Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest border-b border-surface-container pb-2 select-none">
          업로드된 파일 목록 ({mediaItems?.length || 0})
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square bg-white rounded-3xl border border-surface-container animate-pulse" />
            ))}
          </div>
        ) : !mediaItems || mediaItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-surface-container bg-white/30 space-y-3">
            <div className="text-4xl">📁</div>
            <p className="text-sm font-bold text-on-surface-variant">라이브러리에 등록된 자산이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mediaItems.map((item: AdminMediaItem) => {
              const isImage = item.fileCategory === 'image' || item.mimeType.startsWith('image/');
              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-3xl border border-surface-container overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  {/* Aspect ratio box for media representation */}
                  <div className="relative aspect-square w-full bg-surface-container-low/50 overflow-hidden shrink-0 border-b border-surface-container">
                    {isImage ? (
                      <img
                        src={getOptimizedImageUrl(item, 'thumb_medium')}
                        alt={item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-on-surface-variant/70">
                        <FileText className="w-10 h-10 text-on-surface-variant/40 mb-2" />
                        <span className="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-md">
                          {item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                    )}

                    {/* Post linkage tag overlay */}
                    {item.postId && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[9px] font-bold text-primary border border-primary/20 flex items-center gap-1 shadow-sm select-none">
                        <Link2 className="w-3 h-3" />
                        <span>게시물 #{item.postId}</span>
                      </div>
                    )}

                    {/* Image Derivatives Optimization status badge overlay */}
                    {isImage && (
                      <div className={`absolute top-3 right-3 backdrop-blur-md px-2 py-1 rounded-xl text-[9px] font-black border flex items-center gap-1 shadow-sm select-none ${
                        item.derivatives && item.derivatives.length > 0
                          ? 'bg-emerald-500/90 text-white border-emerald-500/20'
                          : 'bg-amber-500/90 text-white border-amber-500/20'
                      }`}>
                        <span>{item.derivatives && item.derivatives.length > 0 ? '⚡ WebP 완료' : '⚠️ 미최적화'}</span>
                      </div>
                    )}

                    {/* Hover action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const fullUrl = item.fileUrl.startsWith('http://') || item.fileUrl.startsWith('https://')
                            ? item.fileUrl
                            : `${window.location.origin}${item.fileUrl}`;
                          navigator.clipboard.writeText(fullUrl);
                          alert(`미디어 주소(URL)가 복사되었습니다:\n${fullUrl}`);
                        }}
                        className="p-3 bg-white text-on-surface hover:bg-surface-container rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                        title="URL 주소 복사"
                      >
                        <Link2 className="w-4 h-4 text-on-surface-variant" />
                      </button>

                      {isImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateMutation.mutate(item.id);
                          }}
                          disabled={regenerateMutation.isPending}
                          className="p-3 bg-primary text-white rounded-2xl hover:bg-primary-container hover:text-primary hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                          title="썸네일 재생성 및 최적화 실행"
                        >
                          <RotateCw className={`w-4 h-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(item.id);
                        }}
                        className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-lg"
                        title="자산 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="p-3.5 flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 select-none">
                        ID: {item.id}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface truncate flex-1" title={item.fileName}>
                        {item.fileName}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-auto text-[10px] text-on-surface-variant font-medium">
                      <span>{formatBytes(item.fileSize)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <AdminConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="미디어 자산 영구 삭제"
        description="이 미디어 자산을 라이브러리에서 정말 삭제하시겠습니까? 삭제 시 게시물 본문에서 사용 중인 이미지나 링크가 손상되거나 빈 박스로 표시될 수 있으므로 각별히 주의하십시오."
        confirmLabel="미디어 삭제"
        cancelLabel="취소"
        isDestructive={true}
      />
    </div>
  );
}
