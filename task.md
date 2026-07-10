# 002_FatLossTracker_Cloud 開發任務

- [x] 複製 001 為基底，建立 002_FatLossTracker_Cloud
- [x] 更新專案設定 (package.json / vite.config.js / 02_deploy_github.bat)
- [x] 建立 .env 與 supabaseClient.js
- [x] 改寫 storage.js 為 Supabase 非同步 API
- [x] 實作 auth.js (Magic Link 登入/登出)
- [x] 更新 index.html 登入畫面
- [x] 更新 main.js 串接 auth + async storage
- [x] 產生 supabase_schema.sql
- [x] npm install + 本機建置驗證
- [x] git push（ilearn24bymyself/fatloss-20260706）
- [x] gh-pages 部署上線（2026-07-10 切換至 ilearn24bymyself，網站已上線：https://ilearn24bymyself.github.io/fatloss-20260706/）
- [x] 至 Supabase SQL Editor 執行 supabase_schema.sql
- [x] 至 Supabase Auth 設定 Redirect URL 為 GitHub Pages 網址
- [x] 儲存確認 Modal（平日）+ 週日結算 Modal（首次建立起點 / 後續週進度）

## 待處理
- [x] 將 Auth 改為 email + 密碼登入（signInWithPassword，移除 Magic Link）
- [x] 週日結算 Modal 新增「距起點」比較
- [x] Password Recovery 流程（點重設信 → 設定新密碼頁面 → updateUser）
- [x] Supabase 後台建立兩個使用者帳號
- [x] 關閉 Supabase 公開註冊（Sign In / Providers → Allow new users to sign up OFF）
- [ ] 端對端測試（無痕視窗：登入、新增紀錄、週日 Modal、圖表、登出）← 切換至 VSCode 後執行

## [2026-07-11] 移除每日確認 Modal + 新增常駐週進度面板
- [x] index.html：移除 saveModal 區塊、簡化 sundayModal、新增「週進度」面板骨架
- [x] dashboard.js：新增 renderWeeklyProgress(records)
- [x] main.js：移除 showSaveModal、簡化 showSundayModal、refreshUI 呼叫 renderWeeklyProgress
- [x] npm run build 驗證通過
- [x] dev server 視覺確認 ← 改用 Playwright MCP 完成，平日安靜存檔／週日簡短提示／週進度面板／圖表／登出 皆通過
