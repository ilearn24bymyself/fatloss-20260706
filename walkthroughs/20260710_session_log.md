# 002_FatLossTracker_Cloud 開發紀錄

## [2026-07-10] 架構檢討與決策修正

### 背景釐清
使用者原本說「至少兩人使用」，AI 誤解為需要開放自由註冊，才選了 Magic Link。實際背景是：原本 001 是單裝置 LocalStorage，使用者想要能夠跨裝置使用，才需要雲端後端。「多人」是上線後的附帶可能性，不是核心需求。Magic Link 本身選擇合理，但 SMTP 的限制沒有在 /spec 時說清楚，導致後來的 Resend 錯誤建議浪費大量時間。

### 本次 AI 行為檢討
1. /spec 時沒有把「多人同時登入 + Supabase 2/hr SMTP 上限」連起來評估
2. 推薦 Resend 時沒有說明 onboarding@resend.dev 只能寄給 Resend 帳號本身的 email
3. 給 GitHub 指令時提供方向而非完整步驟，造成使用者一直需要截圖回報
4. 給 Supabase 路徑時根據訓練資料推測，與實際介面不符

### 環境說明
使用者環境為 **Google Antigravity**（非標準 Claude Code VSCode Extension）。Antigravity 有自己的 MCP 管理 UI，MCP 設定檔位於 `C:\Users\admin\.gemini\antigravity\mcp_config.json`。正確的 Chrome DevTools MCP 套件名稱為 `chrome-devtools-mcp`（Google Chrome DevTools 團隊維護），非 `@anthropic/chrome-devtools-mcp`（不存在）。

---

## [2026-07-10] 部署切換與初次上線

前一次 session 已完成程式碼撰寫，但因 coolchife GitHub 帳號被標記，Pages 無法上線。本次切換至 ilearn24bymyself 帳號，新建 repo `fatloss-20260706`，重新 build + deploy，網站成功上線：https://ilearn24bymyself.github.io/fatloss-20260706/

Supabase 手動步驟完成：
- 執行 supabase_schema.sql（records 資料表 + RLS policy）
- 設定 Auth Redirect URL 為 GitHub Pages 網址

---

## [2026-07-10] 儲存確認 Modal + 週日結算 Modal

使用者回報：輸入完資料後沒有任何視覺回饋，感覺不到自己完成了什麼。

新增：
- **平日儲存**：顯示儲存確認卡（日期、筆數、體重/體脂/內臟脂肪）
- **週日**：顯示週日結算 Modal
  - 第一次週日輸入：顯示起點建立訊息
  - 後續週日：顯示「本週進度（vs 上週）」＋「累積進度（vs 起點）」（第三週日起才顯示累積）

dashboard.js 週進度比較邏輯從「14 天 ±3 天」改為「sundays[0] vs sundays[1]」（最新週日 vs 上一週日）。

---

## [2026-07-10～11] Auth 架構調整

### Magic Link → Email + 密碼
原因：Magic Link 每次登入都需要寄信，Supabase 免費版 2/hr 上限對多人同時登入是問題。改為 email+密碼後，日常登入完全不依賴 SMTP，SMTP 只在密碼重設時使用（極低頻）。

### Password Recovery 流程
點重設信的連結後，原本直接跳入 app（舊的 onAuthStateChange 沒有偵測 PASSWORD_RECOVERY event）。修正：偵測到 PASSWORD_RECOVERY 時顯示「設定新密碼」頁面，輸入並確認新密碼後呼叫 updateUser，完成後進入 app。

### Supabase 帳號設定
- 新增使用者：chife27@gmail.com、chief27sucks@gmail.com（直接 Create new user，不寄信）
- 關閉公開註冊：Sign In / Providers → Allow new users to sign up → OFF

### 變更檔案
- `src/auth.js`：sendMagicLink → signIn(email, password)，新增 updatePassword，onAuthStateChange 改傳 event
- `index.html`：登入表單加密碼欄位，新增 passwordResetGate overlay
- `src/main.js`：更新 import，handleLoginSubmit 改讀密碼欄位，新增 showPasswordResetGate / handlePasswordResetSubmit，onAuthStateChange 偵測 PASSWORD_RECOVERY event

---

## [2026-07-11] 目前狀態

**已完成：**
- 網站上線：https://ilearn24bymyself.github.io/fatloss-20260706/
- Auth：email+密碼，兩個使用者帳號已建立，公開註冊已關閉
- 資料：Supabase Postgres + RLS（每人只看自己的資料）
- UI：Glassmorphism，平日儲存 Modal，週日結算 Modal（週進度＋累積進度）
- 密碼重設流程完整

**待完成：**
- 端對端測試（切換至 VSCode 後執行）
- MCP chrome-devtools 設定（切換至 VSCode 後執行，.mcp.json 已建好）
