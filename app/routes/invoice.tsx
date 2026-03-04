import { useState, useEffect } from 'react';
import { analyzeInvoice } from '../services/invoiceService';
import type { InvoiceResult } from '../services/invoiceService';
import InvoiceUpload from '../components/invoice/InvoiceUpload';
import InvoiceResultComponent from '../components/invoice/InvoiceResult';
import InvoiceTips from '../components/invoice/InvoiceTips';
import '../styles/invoice.css';

export default function InvoiceRecognition() {
  const [isClient, setIsClient] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('image/jpeg');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash-exp');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState('等待上傳發票圖片');

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileLoad = async (
    file: File,
    previewUrl: string,
    base64: string,
    mediaType: string
  ) => {
    setFile(file);
    setPreviewUrl(previewUrl);
    setBase64Data(base64);
    setMediaType(mediaType);
    setResult(null);
    setError('');
    setStatus(`已載入：${file.name}`);
  };

  const handleAnalyze = async () => {
    if (!base64Data) return;

    setLoading(true);
    setError('');
    setStatus('正在進行 AI 辨識分析...');

    try {
      const data = await analyzeInvoice(base64Data, mediaType, selectedModel);
      setResult(data);
      setStatus('辨識完成 ✓');
    } catch (err) {
      const message = err instanceof Error ? err.message : '辨識失敗';
      setError(message);
      setStatus('辨識失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl('');
    setBase64Data('');
    setMediaType('image/jpeg');
    setResult(null);
    setError('');
    setLoading(false);
    setStatus('等待上傳發票圖片');
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="invoice-container">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#7070a0' }}>
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <header className="invoice-header">
        <div className="logo-mark">⌗</div>
        <div className="header-text">
          <h1>發票辨識系統</h1>
          <p>INVOICE · RECOGNITION · AI</p>
        </div>
        <div className="badge">● AI POWERED</div>
      </header>

      <div className="main-grid">
        <InvoiceUpload
          file={file}
          previewUrl={previewUrl}
          loading={loading}
          status={status}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onFileLoad={handleFileLoad}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
        />

        <InvoiceResultComponent result={result} error={error} />
      </div>

      <InvoiceTips />
    </div>
  );
}
