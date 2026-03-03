# 發票辨識系統配置說明

## 設置 Anthropic API Key

此應用使用 Anthropic Claude API 進行發票辨識。你需要自己的 API Key 才能使用此功能。

### 步驟：

1. **獲取 API Key**
   - 訪問 [Anthropic Console](https://console.anthropic.com/settings/keys)
   - 註冊並登入你的帳號
   - 創建一個新的 API Key
   - 複製你的 API Key

2. **配置環境變數（開發環境）**
   
   **方法 1：使用 .env 文件（推薦用於本地開發）**
   - 打開項目根目錄的 `.env` 文件
   - 找到 `ANTHROPIC_API_KEY=your-api-key-here`
   - 將 `your-api-key-here` 替換為你的實際 API Key
   - 保存文件

   **方法 2：使用 wrangler.json（用於 Cloudflare Workers）**
   - 打開項目根目錄的 `wrangler.json` 文件
   - 找到 `"ANTHROPIC_API_KEY": "your-api-key-here"`
   - 將 `your-api-key-here` 替換為你的實際 API Key
   - 保存文件

3. **重啟開發服務器**
   ```bash
   npm run dev
   ```

### 範例配置

```env
# .env 文件
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 注意事項

⚠️ **重要**：
- 永遠不要將包含真實 API Key 的 `.env` 文件提交到版本控制系統
- API Key 是敏感信息，請妥善保管
- `.env` 文件已經在 `.gitignore` 中被忽略

### API 使用費用

- Anthropic API 是付費服務
- 請訪問 [Anthropic Pricing](https://www.anthropic.com/pricing) 了解費用詳情
- 在 [Console](https://console.anthropic.com/settings/plans) 中查看你的用量和餘額

### 替代方案

如果不想使用 Anthropic API，你可以：
1. 使用其他 OCR 服務（如 Google Cloud Vision、Azure Computer Vision）
2. 使用本地 OCR 庫（如 Tesseract.js）
3. 修改 `app/routes/api.invoice-analyze.tsx` 以使用你偏好的服務

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build
```

## 功能

- ✅ 支持 JPG、PNG、WEBP、PDF 格式
- ✅ 拖放上傳
- ✅ AI 智能辨識
- ✅ 詳細的發票資訊提取
- ✅ 支持多種貨幣
- ✅ 品項明細識別
