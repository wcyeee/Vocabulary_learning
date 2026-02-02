# 快速設定指南（個人單用戶版）

## 逐步設定（5 分鐘）

### 1. 安裝相依套件
```bash
npm install
```

### 2. 建立 Supabase 專案
1. 前往 https://supabase.com 並登入
2. 點擊「New Project」
3. 填寫專案詳細資訊：
   - Name: anki-clone（或您選擇的名稱）
   - Database Password:（選擇一個強密碼）
   - Region:（選擇離您最近的）
4. 等待專案完成設定（約 2 分鐘）

### 3. 取得您的 Supabase 憑證
1. 在您的專案儀表板中，點擊「Settings」（齒輪圖示）
2. 點擊左側欄的「API」
3. 複製這兩個值：
   - **Project URL**（在「Project URL」下方）
   - **anon/public key**（在「Project API keys」下方）

### 4. 設定環境變數
1. 建立.env檔

2. 開啟 `.env` 並替換佔位符值：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. 建立資料庫資料表
1. 在 Supabase 儀表板中，前往「SQL Editor」（側邊欄的資料庫圖示）
2. 點擊「New Query」
3. 複製 `database-schema.sql` 檔案的全部內容
4. 貼到 SQL 編輯器中
5. 點擊「Run」或按 `Ctrl+Enter`
6. 您應該會看到「Success. No rows returned」- 這是正確的！

### 6. 執行應用程式
```bash
npm run dev
```

應用程式將在 http://localhost:3000 開啟

### 7. 開始使用
1. 無需登入！直接開始建立單字本
2. 新增您的第一個單字本
3. 開始新增單字卡片


## 疑難排解

### "Missing Supabase environment variables"
- 確保您的 `.env` 檔案存在且包含兩個變數
- 建立 `.env` 後重新啟動開發伺服器

### SQL 腳本錯誤
- 確保您在 Supabase SQL Editor 中執行腳本
- 檢查您是否複製了整個 `database-schema.sql` 檔案
- 腳本是冪等的 - 可以安全地多次執行

### 資料無法顯示
- 檢查瀏覽器主控台是否有錯誤
- 驗證您的 Supabase 專案是否處於活動狀態
- 確保環境變數正確

## 開發技巧

### 在 Supabase 中檢視資料庫
1. 前往 Supabase 儀表板中的「Table Editor」
2. 您會看到 `notebooks` 和 `cards` 資料表
3. 點擊以在使用應用程式時檢視資料

### 重置資料庫
如果您想重新開始：
```sql
DELETE FROM cards;
DELETE FROM notebooks;
```
在 Supabase SQL Editor 中執行此操作。

### 檢查日誌
- 瀏覽器主控台：按 F12
- Supabase 日誌：檢查儀表板中的「Logs」部分

## 下一步

1. 建立您的第一個單字本
2. 新增一些單字卡片
3. 開始測驗
4. 在 `src/index.css` 中自訂樣式
5. 部署到 Vercel 或 Netlify

## 部署到正式環境

### Vercel（推薦）
```bash
npm run build
vercel
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

別忘了在部署平台的設定中新增您的環境變數！
