import React, { useRef, useState, useEffect } from 'react';

interface Props {
  file: File | null;
  previewUrl: string;
  loading: boolean;
  status: string;
  onFileLoad: (
    file: File,
    previewUrl: string,
    base64: string,
    mediaType: string
  ) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

const InvoiceUpload: React.FC<Props> = ({
  file,
  previewUrl,
  loading,
  status,
  onFileLoad,
  onAnalyze,
  onClear
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUtils, setFileUtils] = useState<any>(null);

  // Load file utilities only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../../utils/fileUtils').then(module => {
        setFileUtils(module);
      });
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) await loadFile(droppedFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) await loadFile(selectedFile);
  };

  const loadFile = async (selectedFile: File) => {
    if (!fileUtils) {
      alert('文件處理工具尚未載入，請稍後再試');
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      alert(`不支援的格式：${selectedFile.type}，請上傳 JPG、PNG、WEBP 或 PDF`);
      return;
    }

    try {
      if (selectedFile.type === 'application/pdf') {
        const { previewUrl, base64, mediaType } = await fileUtils.convertPdfToImage(
          selectedFile
        );
        onFileLoad(selectedFile, previewUrl, base64, mediaType);
      } else {
        const dataUrl = await fileUtils.convertFileToBase64(selectedFile);
        const base64 = dataUrl.split(',')[1];
        onFileLoad(selectedFile, dataUrl, base64, selectedFile.type);
      }
    } catch (err) {
      alert('文件載入失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="dot"></div>
        上傳發票
      </div>

      {!file ? (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="icon">🧾</span>
          <h3>拖曳發票圖片至此</h3>
          <p>
            支援 JPG、PNG、WEBP、PDF 格式
            <br />
            建議解析度 300 DPI 以上
          </p>
          <button className="btn-upload">選擇檔案</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="preview-container show">
          <div className="preview-img-wrap">
            <img src={previewUrl} alt="預覽" id="previewImg" />
            <div className="scan-effect"></div>
            {loading && <div className="scan-line active"></div>}
            <div className="preview-overlay"></div>
          </div>
          <div className="preview-actions">
            <button
              className="btn-sm btn-analyze"
              onClick={onAnalyze}
              disabled={loading}
            >
              {loading ? '⏳ 辨識中...' : '⚡ 開始辨識'}
            </button>
            <button className="btn-sm btn-clear" onClick={onClear}>
              ✕ 清除
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-bar show"></div>}

      <div className="status-bar">
        <div className="status-dot"></div>
        <span>{status}</span>
      </div>
    </div>
  );
};

export default InvoiceUpload;
