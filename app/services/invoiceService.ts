export interface InvoiceItem {
  name: string | null;
  qty: string | null;
  unit: string | null;
  unitPrice: string | null;
  amount: string | null;
}

export interface InvoiceResult {
  invoiceNo: string | null;
  invoiceDate: string | null;
  seller: string | null;
  sellerTaxId: string | null;
  buyer: string | null;
  buyerTaxId: string | null;
  subtotal: string | null;
  tax: string | null;
  total: string | null;
  currency: string | null;
  items: InvoiceItem[];
  notes: string | null;
  confidence: 'high' | 'mid';
}

export async function analyzeInvoice(
  base64: string,
  mediaType: string
): Promise<InvoiceResult> {
  // 调用服务器端 API 而不是直接调用 Anthropic API
  const response = await fetch('/api/invoice-analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64, mediaType })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as any;
    throw new Error(errorData.error || `API 請求失敗：${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  if (!data.candidates || !data.candidates[0]?.content || !Array.isArray(data.candidates[0].content.parts)) {
    throw new Error('API 回傳格式異常：' + JSON.stringify(data).slice(0, 200));
  }
  
  const raw = data.candidates[0].content.parts
    .filter((i: any) => i /*&& i.type === 'text'*/)
    .map((i: any) => i.text || '')
    .join('');

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('無法從回傳中解析 JSON, 原始內容:' + raw.slice(0, 200));
  }

  const result = JSON.parse(jsonMatch[0]);
  
  if (!result || typeof result !== 'object') {
    throw new Error('JSON 結構不正確');
  }

  if (!Array.isArray(result.items)) {
    result.items = [];
  }

  return result as InvoiceResult;
}
