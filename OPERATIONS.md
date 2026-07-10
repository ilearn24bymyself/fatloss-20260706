# 002_FatLossTracker_Cloud 操作手冊

整合版參考文件，把整個系統（本機開發、GitHub 部署、Supabase 雲端服務）目前實際的設定細節跟操作步驟集中在這裡，方便換電腦或換 AI session 時快速接續，不用從 `DEVELOPMENT_LOG.md` 裡一則一則翻。

---

## 一、本機開發

```bash
npm install       # 第一次或換電腦後執行
npm run dev        # 啟動本機開發伺服器（Vite，自動抓空的 port，通常 5173）
npm run build       # 打包，輸出到 dist/
```

**`.env`**（此檔案已 `.gitignore` 排除，不會進版控，換電腦需手動建立）：
```
VITE_SUPABASE_URL=https://phmfyldytnuckhghycim.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9miFBa_i3miOhVRQmTJa0A_dA57UnyZ
```
這組 key 是設計上可公開的 anon/publishable key，不是密碼，真正的資料保護靠 Supabase 的 RLS（Row Level Security）政策，不靠隱藏這組 key。

**本機視覺測試**：workspace 根目錄已設定 `.mcp.json`（`playwright` + `chrome-devtools` 兩個瀏覽器自動化 MCP server），可以在 `npm run dev` 起來後直接用瀏覽器工具操作測試，不用每次都手動點。測試時若需要大量假資料模擬（例如看圖表變化），可暫時在 `src/storage.js` 的 `getRecords()` 加一個讀 `localStorage` 的假資料分支，測完務必用 `git checkout -- src/storage.js` 復原，不要留在 commit 裡，也不要寫真的假資料進 Supabase。

---

## 二、部署到 GitHub Pages

| 項目 | 值 |
|---|---|
| GitHub 帳號 | `ilearn24bymyself`（原本用 `coolchife` 帳號被 GitHub 標記限制，Pages 建置永遠卡住，2026-07-10 切換帳號解決） |
| Repo | `https://github.com/ilearn24bymyself/fatloss-20260706` |
| 正式網址 | `https://ilearn24bymyself.github.io/fatloss-20260706/` |

**部署方式（兩種擇一）**：
- 雙擊 `02_deploy_github.bat`：自動跑 `git add/commit/push` + `npm run build` + `npm run deploy`
- 手動：
  ```bash
  git add <變更的檔案>
  git commit -m "說明"
  git push origin main
  npm run build
  npm run deploy      # 把 dist/ 推上 gh-pages 分支，實際觸發網站更新
  ```

**注意事項**：
- `git push` 只更新原始碼（`main` 分支），**網站不會變**；一定要再跑 `npm run deploy` 才會真的更新正式網站（`gh-pages` 分支）。
- 部署完成後 CDN 最多快取 10 分鐘（`Cache-Control: max-age=600`），如果重新整理還看到舊版，先按 **Ctrl+F5** 強制重整，或等幾分鐘再試，不是部署失敗。
- **GitHub PAT**：存在目前這台電腦的 Git 憑證管理員裡，換新電腦後第一次 `git push` 會要求重新登入一次。若忘記或過期，去 `github.com/settings/tokens` 重新產生一支即可（**PAT 本身絕對不要寫進任何會進版控的檔案**，這份文件也不例外）。

---

## 三、Supabase 雲端服務

| 項目 | 值 |
|---|---|
| Project URL | `https://phmfyldytnuckhghycim.supabase.co`（同 `.env`） |
| 資料表 Schema | `supabase_schema.sql`（`records` 資料表 + RLS policy，只需在 Supabase SQL Editor 執行一次，換電腦不用重跑，這是雲端狀態） |

**Auth 設定（目前狀態）**：
- 登入方式：**Email + 密碼**（`signInWithPassword`，不是 Magic Link，因為 Magic Link 需要額外設定 SMTP 才能寄信給任意信箱）
- Authentication → Settings → **"Allow new users to sign up" 已關閉**（非公開註冊）
- 新增使用者：Supabase 後台 → Authentication → Users → **Add user**（手動建立帳號，不是使用者自己註冊）
- Site URL / Redirect URL：需設定為正式網址 `https://ilearn24bymyself.github.io/fatloss-20260706/`，否則「忘記密碼」寄出的重設信連結會導向錯誤網址
- 目前已建立帳號：`chife27@gmail.com`（密碼不記錄在任何文件中，請自行保管）

**換電腦後 Supabase 端需要做的事**：無。資料庫、Auth 設定都在雲端，跟本機環境無關，不需要重新設定。

---

## 四、換電腦接續開發完整清單

1. 複製整個 `002_FatLossTracker_Cloud` 資料夾（或 `git clone` 該 repo）到新電腦
2. `npm install`
3. 手動重建 `.env`（內容見本文件「一、本機開發」）
4. 若要 `git push`，第一次會需要用 PAT 重新登入
5. 若要用瀏覽器 MCP 工具測試，第一次載入 workspace 時需同意信任 `.mcp.json` 裡的 `playwright`/`chrome-devtools`（詳見 `[WORKSPACE_ROOT]/CLAUDE.md` 的「MCP Tooling」章節）
6. Supabase 端不需要做任何事

---

## 五、相關文件索引

- 逐次變更歷史（時間序）：`DEVELOPMENT_LOG.md`
- 架構決策與設計討論：`IMPLEMENTATION_PLAN.md`
- 目前任務清單：`task.md`
- 完整設計對話記錄：`walkthroughs/`
