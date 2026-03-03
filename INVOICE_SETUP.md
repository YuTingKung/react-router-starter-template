# 發票辨識系統配置說明

## 設置 Google AI Studio API Key

此應用使用 Google AI Studio (Gemini) API 進行發票辨識。你需要自己的 API Key 才能使用此功能。

### 步驟：

1. **獲取 API Key**
   - 訪問 [Google AI Studio](https://aistudio.google.com/app/apikey)
   - 使用 Google 帳號登入
   - 點擊「Create API Key」創建新的 API Key
   - 複製你的 API Key

2. **配置本地開發環境**
   
   編輯項目根目錄的 `.env` 文件：
   ```env
   GOOGLE_AI_STUDIO_API_KEY=你的實際API-Key
   ```

3. **部署到 Cloudflare Workers**

   **重要**：不要將 API Key 寫在 `wrangler.json` 文件中！使用 Wrangler CLI 設置 secret：

   ```bash
   # 設置 secret（只需執行一次）
   npx wrangler secret put GOOGLE_AI_STUDIO_API_KEY
   # 執行後會提示你輸入 API Key 值
   ```

   或者使用命令行直接設置：
   ```bash
   echo "你的實際API-Key" | npx wrangler secret put GOOGLE_AI_STUDIO_API_KEY
   ```

4. **部署應用**
   ```bash
   npm run deploy
   ```

### 驗證和管理 Secrets

**查看已設置的 secrets：**
```bash
npx wrangler secret list
```

**刪除 secret（如需重新設置）：**
```bash
npx wrangler secret delete GOOGLE_AI_STUDIO_API_KEY
```
**更新 secret：**
```bash
npx wrangler secret put GOOGLE_AI_STUDIO_API_KEY
```
```bash
echo "YOUR_API_KEY" | npx wrangler secret put GOOGLE_AI_STUDIO_API_KEY
```

### 範例配置

**本地開發 - .env 文件：**
```env
GOOGLE_AI_STUDIO_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
```

**生產環境 - 使用 Wrangler Secret：**
```bash
# 不要在 wrangler.json 中設置敏感信息！
# 使用命令行設置 secret
npx wrangler secret put GOOGLE_AI_STUDIO_API_KEY
```

### Cloudflare Workers 環境變數說明

**Vars（明文變數）- 使用 `wrangler.json` 的 `vars` 字段：**
- ✅ 適用於：非敏感配置（如功能開關、URL）
- ❌ 不適用於：API Keys、密碼、Token 等敏感信息
- 會出現在部署日誌和 Dashboard 中

**Secrets（加密變數）- 使用 `wrangler secret` 命令：**
- ✅ 適用於：API Keys、密碼、Token 等敏感信息
- ✅ 加密存儲，不會出現在日誌中
- ✅ 只能通過 `context.cloudflare.env.變數名` 訪問
- 需要使用 CLI 命令設置

**為什麼需要使用 Secrets：**
1. 🔒 **安全性**：Secrets 會被加密存儲
2. 📝 **不會暴露**：不會出現在 Git、日誌、Dashboard 中
3. 🔑 **最佳實踐**：所有 API Keys 都應使用 Secrets

### 注意事項

⚠️ **重要安全提示**：
- ❌ **永遠不要**將 API Key 寫在 `wrangler.json` 的 `vars` 中
- ❌ **永遠不要**將包含真實 API Key 的 `.env` 文件提交到 Git
- ✅ **務必使用** `wrangler secret` 命令設置生產環境的 API Key
- ✅ `.env` 和 `wrangler.json` 已經在 `.gitignore` 中被忽略
- ✅ 使用 `.env.example` 作為配置模板

### API 使用費用

**Google AI Studio (Gemini)：**
- 🆓 有免費額度（每分鐘 15 次請求）
- 💰 超出免費額度後按使用量付費
- 📊 訪問 [Google AI Studio](https://aistudio.google.com/) 查看用量
- 📖 [定價說明](https://ai.google.dev/pricing)

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
