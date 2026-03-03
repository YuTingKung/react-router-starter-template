export async function action({ request, context }: { request: Request; context: any }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json() as any;
    const { base64, mediaType } = body;

    if (!base64 || !mediaType) {
      return new Response(
        JSON.stringify({ error: '缺少必要參數' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 从 Cloudflare 环境变量中获取 API Key
    const API_KEY = context?.cloudflare?.env?.GOOGLE_AI_STUDIO_API_KEY || '';
    
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: '未設置 GOOGLE_AI_STUDIO_API_KEY 環境變數。請在 .env 文件或 Cloudflare Workers 中添加你的 API Key。' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
            {
                parts: [
                    {
                        text: `請仔細辨識這張發票，並以下列 JSON 格式回傳結果（只回傳 JSON, 不要有其他文字):
                        {
                            "invoiceNo": "發票號碼",
                            "invoiceDate": "發票日期",
                            "seller": "賣方名稱",
                            "sellerTaxId": "賣方統編",
                            "buyer": "買方名稱",
                            "buyerTaxId": "買方統編",
                            "subtotal": "未稅金額",
                            "tax": "稅額",
                            "total": "含稅總額",
                            "currency": "幣別",
                            "items": [
                                { "name": "品名", "qty": "數量", "unit": "單位", "unitPrice": "單價", "amount": "金額" }
                            ],
                            "notes": "備註",
                            "confidence": "high 或 mid(辨識信心度)"
                        }
                        若某欄位無法辨識則填入 null。`
                    }, 
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64
                        }
                    }
                ]
            }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `API 請求失敗：${response.status} ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Invoice analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '未知錯誤' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
