# 001_減脂追蹤紀錄 系統設計與開發計畫

## [2026-07-09] 計畫更新：正式啟動 002 雲端版 (Supabase)

延續 V7 計畫中「001 單機版 / 002 雲端版」雙軌策略，使用者確認正式啟動 002。詳細討論見 `walkthroughs/20260709_spec.md`。

### 已確認決策
- **資料庫/帳號後端**：Supabase（Postgres + Auth）
- **登入方式**：Magic Link（email 驗證連結，無密碼）
- **註冊方式**：開放自由註冊
- **001 去留**：保留不變，作為離線備用方案；002 以 001 為基底另建新資料夾
- **網頁部署**：GitHub Pages（沿用 001 的 `02_deploy_github.bat` 模式），Supabase 僅作為 API 後端

### 002 專案實作計畫 (Draft v1)

#### 1. 專案分支
- 複製 `001_FatLossTracker` 全部內容到新資料夾 `002_FatLossTracker_Cloud`（不含 `node_modules`，複製後重新 `npm install`）。
- 002 建立自己的 `DEVELOPMENT_LOG.md`、`task.md`、`walkthroughs/`，`IMPLEMENTATION_PLAN.md` 以本次 draft 為起點另存一份。

#### 2. Supabase 資料表設計
沿用現有 `storage.js` 的紀錄欄位（見 `main.js` 的 `handleFormSubmit`），新增 `records` 資料表：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | uuid, PK, default `gen_random_uuid()` | |
| `user_id` | uuid, FK → `auth.users.id` | 每筆紀錄歸屬的使用者 |
| `date` | date | 紀錄日期 |
| `weight` | numeric | 體重 (kg) |
| `body_fat` | numeric | 體脂率 (%) |
| `visceral_fat` | numeric | 內臟脂肪 |
| `chest` / `arm` / `waist` / `hip` / `thigh` | numeric, nullable | 週日三圍量測，僅週日填寫 |
| `created_at` | timestamptz, default `now()` | |

- Unique constraint：`(user_id, date)`，對應現有「同日期覆蓋更新」的邏輯 (`saveRecord` 的 upsert 行為)。
- **RLS (Row Level Security)**：啟用，policy 限定 `user_id = auth.uid()`，確保每個使用者只能讀寫自己的資料，即使多人共用同一個 anon key 也不會看到彼此的紀錄。

#### 3. Auth 流程 (Magic Link)
- 新增登入畫面（未登入時擋在主畫面前）：輸入 email → 呼叫 `supabase.auth.signInWithOtp({ email })` → 使用者收信點連結 → 導回頁面並建立 session。
- 開放自由註冊：Magic Link 本身即完成「首次登入=註冊」，不需額外註冊表單。
- 加上「登出」按鈕與目前登入 email 顯示（沿用頂部 Bar 位置）。
- 需在 Supabase 後台設定 Redirect URL 為 GitHub Pages 的正式網址，否則驗證連結會導回錯誤網址。

#### 4. `storage.js` 改寫範圍
- 由同步的 `localStorage` 操作改為非同步呼叫 Supabase JS SDK：
  - `getRecords()` → `supabase.from('records').select('*').order('date', { ascending: false })`
  - `saveRecord()` → `upsert`，衝突鍵為 `(user_id, date)`
  - `deleteRecord()` → `delete().eq('date', date)`
  - `exportData()` / `importData()` 邏輯不變，但資料來源改抓 Supabase
- `main.js` / `dashboard.js` 中呼叫這些函式的地方要改成 `async/await`，並處理載入中狀態與錯誤提示（例如未登入、網路失敗）。

#### 5. 環境設定與安全性
- 新增 `.env`（`.gitignore` 排除）存放 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`。
- anon/publishable key 屬於「設計上可公開」的金鑰，實際資料保護靠 RLS，不靠隱藏金鑰。
- **已取得 Supabase 連線資訊**（2026-07-09）：
  - Project URL: `https://phmfyldytnuckhghycim.supabase.co`
  - Publishable key: `sb_publishable_9miFBa_i3miOhVRQmTJa0A_dA57UnyZ`
  - （Secret key 不使用，僅限伺服器端場景，本專案純前端不需要）

#### 6. 部署
- 沿用 `02_deploy_github.bat` 模式，新建一個 GitHub repo，流程與 001 相同，差異僅在建置時需帶入 `.env` 的 Supabase 金鑰。
- **已確認 repo**：`https://github.com/coolchife/fatloss-20260706.git`（002 雲端版專用）。
- Supabase 專案本身免費建立，不需額外部署。

#### 7. 風險與待確認事項
- Magic Link 需要使用者確實能收到/點擊 email 連結，若日後改變主意想用密碼登入，Supabase Auth 也支援混合切換。
- 目前僅設計「各自看自己資料」；若未來想要「多人資料互相比較」的功能，需另外設計共享/唯讀權限，本次計畫不包含。

### Next Step
待使用者審閱以上 Draft v1，回覆 `go`/`同意` 後進入 `/build`：建立 002 資料夾、安裝 Supabase SDK、建立資料表與 RLS policy、實作登入畫面與改寫 `storage.js`。

---

## [2026-07-07 15:12] 計畫更新：GitHub Pages 上線方案

使用者詢問如果使用 **GitHub Pages** 的部署方案。GitHub Pages 也是免費且非常穩定的靜態網頁代管方案，但它需要您的電腦有安裝 Git 並且要手動在 GitHub 上開好專案。

### User Review Required
> [!IMPORTANT]
> 請確認以下的「GitHub Pages 部署藍圖」。
> 
> **具體實作步驟：**
> 1. **事前準備 (需您配合)**：
>    - 確認電腦已安裝 `Git`。
>    - 前往 GitHub 建立一個**全新且空白**的 Repository (例如命名為 `fatloss-tracker`)。
>    - 複製該專案的網址（格式如：`https://github.com/您的帳號/fatloss-tracker.git`）。
> 2. **專案環境調整 (由我執行)**：
>    - 幫您安裝 `gh-pages` 自動部署套件。
>    - 新增 `vite.config.js`，設定好 GitHub Pages 需要的 base URL (會根據您的專案名稱設定)。
> 3. **建立部署腳本 (由我執行)**：
>    - 建立 `02_deploy_github.bat`。這支腳本會自動幫您將程式碼推送到 GitHub，並自動把打包好的成品推送到 `gh-pages` 分支以上線。
> 4. **執行部署 (由您操作)**：
>    - 執行 `02_deploy_github.bat`，輸入您剛剛建立的 GitHub Repo 網址，腳本就會自動完成剩下的事情。
> 
> **Vercel vs GitHub Pages 比較：**
> - **Vercel**：不需要 Git 基礎，連 Repo 都不用自己建，腳本跑了就直接上線。
> - **GitHub Pages**：比較正統的開發者流程，原始碼與網頁會同時備份在 GitHub 上，但前置設定（如 Git 帳號綁定）較多。
> 
> 如果您確定要使用 **GitHub Pages**，請回覆 `go` 並把您**在 GitHub 建立的 Repository 網址 (或者專案名稱)** 貼給我，我就會為您客製化腳本並修改專案設定！

---

使用者指示將原本預計的 Bento Grid (風格一) 放棄，改為使用 `demo2_glass.html` (風格二：玻璃擬態) 作為 001 專案的最終成品介面。

### User Review Required
> [!IMPORTANT]
> 請確認以下的「Glassmorphism 整合藍圖」。
> 
> **本次修改核心：**
> 將 `demo2_glass.html` 的純靜態視覺，與我們已經寫好的底層功能 (`storage.js`, `main.js`, `dashboard.js`) 進行無縫接軌。
> 
> **具體施工步驟：**
> 1. **重構 `index.html`**：
>    - 使用 `demo2_glass.html` 的動態漸層背景 (`.gradient-bg`) 與玻璃特效 (`.glass`)。
>    - 將原有的「體脂」、「內臟脂肪」、「週日三圍」輸入框加入到左側的玻璃面板中，並套用玻璃樣式。
>    - 將「歷史明細表格」加入左欄（或表單下方），同樣套用玻璃樣式並加上自訂捲軸。
>    - 保留頂部的「匯入/匯出 JSON」按鈕。
> 2. **替換 DOM ID**：
>    - 將右側展示區的數字替換為 `main.js` 與 `dashboard.js` 綁定的 ID。
> 3. **微調 JavaScript (`dashboard.js`)**：
>    - 確保雙週進步徽章 (Badge) 在變換顏色時，依然保留玻璃質感。
> 
> 若您確認這個方向，請回覆 `go` 或 `同意`，我們將立即啟動開發！

---
## [2026-07-06 15:50] 計畫更新：雙軌開發策略 (001 單機版 / 002 雲端版)

使用者做出了非常聰明且具備未來擴展性的決定：同時保留兩種架構，以「專案分支」的方式進行開發。
- `001_FatLossTracker`：維持輕量級的純前端 LocalStorage 架構，但介面全面升級為便當盒風格。
- `002_FatLossTracker_Cloud`：以 001 為基礎建立新專案，徹底換裝為 Supabase 雲端資料庫與會員登入系統。

### User Review Required
> [!IMPORTANT]
> 請確認以下的「三階段開發藍圖」。
> 
> **第一階段：全面改版 001 專案 (UI 升級)**
> 1. 將 `001_FatLossTracker` 的 `index.html` 與 `style.css` 徹底改寫，套用 Tailwind CSS 並實作您選擇的 **風格一 (Bento Box 便當盒網格)**。
> 2. 將 `main.js` 與新的介面綁定，確保「週日展開三圍」、「雙週進度徽章」等功能在便當盒介面中正常運作。
> 3. 確認單機版完美運作。
> 
> **第二階段：專案分支 (Project Forking)**
> 1. 在 `f:\01.GeminiCoding_20260706\` 建立新的資料夾 `002_FatLossTracker_Cloud`。
> 2. 將完成的 001 專案完整複製過去作為基底。
> 
> **第三階段：002 專案雲端化 (需您配合)**
> 1. 在 002 專案中加入 `@supabase/supabase-js` 套件。
> 2. 實作「登入 / 註冊」的前端介面。
> 3. 將 `storage.js` 的 LocalStorage 邏輯全部拔除，改為呼叫 Supabase API 進行資料讀寫與帳號綁定。
> 4. **【需配合事項】**：進入此階段時，我會需要您前往 [Supabase 官網](https://supabase.com) 註冊免費帳號，建立一個 Project，並將 `Project URL` 與 `anon public key` 複製給我。
> 
> 如果您同意這個開發藍圖，我們就直接從 **第一階段：改版 001 的 UI** 開始動工！

### Proposed Changes (v7)
- **架構擴張**：將原本單一的開發路線切分為 001 (Offline) 與 002 (Cloud) 雙軌制。
- **UI 升級**：確認採用 **Bento Grid** (風格一)。為了達成這個風格，我們需要在專案中導入 Tailwind CSS 框架，這會替換掉大部分原本手寫的 Vanilla CSS。
- **依賴套件更新**：未來將在 002 專案中加入 `@supabase/supabase-js`。

---

*(以下保留舊版計畫紀錄供追溯)*
## [2026-07-06 15:21] 歷史計畫：前端 UI 風格升級選項
*(略：探討三種 UI 風格)*

## [2026-07-06 15:18] 歷史計畫：儲存空間與多使用者帳號架構評估
*(略：探討 LocalStorage 與 Supabase 的架構差異)*

## [2026-07-06 14:53] 歷史計畫：導入 RWD 響應式設計 (兼容手機版)
*(略)*
