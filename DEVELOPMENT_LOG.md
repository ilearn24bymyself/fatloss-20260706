### [2026-07-06 14:55] 啟動開發與專案初始化 (START)
- **What**: Initialize the Vite vanilla project structure and `task.md`.
- **Why**: The user approved the V4 implementation plan. Starting the `/build` phase.
- **Target Files**: `task.md`, `package.json`, `index.html`

### [2026-07-06 14:58] 啟動開發與專案初始化 (END)
- **What**: Created core files and installed NPM packages.
- **Why**: Project is now ready for logic implementation.
- **Target Files**: `package.json`, `index.html`, `src/style.css`, `src/main.js`

### [2026-07-06 14:58] 實作資料層 (START)
- **What**: Implement LocalStorage CRUD wrapper.
- **Why**: To enable offline data persistence without a backend.
- **Target Files**: `src/storage.js`

### [2026-07-06 14:58] 實作資料層 (END)
- **What**: Exported functions `getRecords`, `saveRecord`, `deleteRecord`, `exportData`, `importData`.
- **Why**: Allows UI layer to interact with data seamlessly.
- **Target Files**: `src/storage.js`

### [2026-07-06 14:59] 實作 UI 骨架與樣式 (START)
- **What**: Build HTML structure with CSS Grid and styling.
- **Why**: Following V4 plan for dual-pane Desktop and stacked RWD Mobile layout.
- **Target Files**: `index.html`, `src/style.css`

### [2026-07-06 15:02] 實作 UI 骨架與樣式 (END)
- **What**: Wrote semantic HTML with classes, implemented CSS variables and responsive breakpoints.
- **Why**: UI is ready for JavaScript wiring.
- **Target Files**: `index.html`, `src/style.css`

### [2026-07-06 15:02] 實作核心互動邏輯 (START)
- **What**: Implement Chart.js rendering, form submission, and history table.
- **Why**: Make the application interactive and connect it to LocalStorage.
- **Target Files**: `src/main.js`

### [2026-07-06 15:05] 實作核心互動邏輯 (END)
- **What**: Implemented sorting, form processing (with Sunday checks), and dual-axis chart.
- **Why**: Forms and charts are now fully functional.
- **Target Files**: `src/main.js`

### [2026-07-06 15:05] 實作雙週激勵圖表邏輯 (START)
- **What**: Build the 14-day delta calculation and visual badge rendering.
- **Why**: Fulfill the user's request for visually compelling progress indicators on Sundays.
- **Target Files**: `src/dashboard.js`, `src/main.js`

### [2026-07-06 15:07] 實作雙週激勵圖表邏輯 (END)
- **What**: Implemented `renderDashboard` to calculate deltas and display green/red badges.
- **Why**: Fulfills the final requirement of the V4 plan.
- **Target Files**: `src/dashboard.js`, `src/main.js`

### [2026-07-07 14:55] 實作 Glassmorphism 介面轉換 (START)
- **What**: Initialize task.md and prepare to port demo2_glass.html into the main app.
- **Why**: User approved the plan to use Glassmorphism for the 001 project.
- **Target Files**: `task.md`, `index.html`, `src/style.css`, `src/dashboard.js`

### [2026-07-07 14:55] 實作 Glassmorphism 介面轉換 (END)
- **What**: Replaced index.html with Glassmorphism layout, updated style.css, and tweaked Chart.js text colors in main.js.
- **Why**: Completed the integration of demo2_glass.html into the functional app.
- **Target Files**: `index.html`, `src/style.css`, `src/main.js`

### [2026-07-07 15:15] 實作 GitHub Pages 部署環境 (START)
- **What**: Prepare Vite config, package.json scripts, and a bat file for GitHub Pages deployment.
- **Why**: User chose GitHub Pages and named the repo fatloss-20260707.
- **Target Files**: `vite.config.js`, `package.json`, `02_deploy_github.bat`

### [2026-07-07 15:15] 實作 GitHub Pages 部署環境 (END)
- **What**: Installed gh-pages, configured base URL in Vite, and created 02_deploy_github.bat.
- **Why**: App is ready to be pushed to GitHub and automatically deployed.
- **Target Files**: `vite.config.js`, `package.json`, `02_deploy_github.bat`

---
*(以下為 002_FatLossTracker_Cloud 分支的獨立開發紀錄，2026-07-09 由 001 複製建立)*

### [2026-07-09] 建立 002 雲端分支 (START)
- **What**: Fork 001 into `002_FatLossTracker_Cloud`; add Supabase as backend (Auth + Postgres).
- **Why**: User approved Draft v1 plan — multi-user online access via Supabase, Magic Link auth, open registration.
- **Target Files**: whole project (fork), `IMPLEMENTATION_PLAN.md`

### [2026-07-09] 專案設定調整 (START/END)
- **What**: Renamed package.json to `002-fat-loss-tracker-cloud`, added `@supabase/supabase-js` dependency, updated `vite.config.js` base path to `/fatloss-20260706/`, updated `02_deploy_github.bat` to target `github.com/coolchife/fatloss-20260706.git`.
- **Why**: Align config with the new dedicated deployment repo.
- **Target Files**: `package.json`, `vite.config.js`, `02_deploy_github.bat`

### [2026-07-09] 建立 Supabase 連線與 Auth 模組 (START/END)
- **What**: Added `.env` (gitignored) with `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, `src/supabaseClient.js`, and `src/auth.js` (Magic Link sign-in via `signInWithOtp`, `signOut`, session helpers).
- **Why**: Implement passwordless login per user's decision.
- **Target Files**: `.env`, `src/supabaseClient.js`, `src/auth.js`

### [2026-07-09] 改寫資料層為 Supabase (START/END)
- **What**: Rewrote `storage.js` from synchronous LocalStorage calls to async Supabase queries (`select`/`upsert`/`delete` on `records` table, keyed by `user_id`+`date`). Wrote `supabase_schema.sql` (table + RLS policies, user only sees own rows).
- **Why**: Move data persistence to a shared cloud database while keeping the same function signatures where possible (now async).
- **Target Files**: `src/storage.js`, `supabase_schema.sql`

### [2026-07-09] 串接登入畫面與非同步流程 (START/END)
- **What**: Added login gate markup (`#authGate`) to `index.html`, hid main app (`#appRoot`) until authenticated; rewired `main.js` to check session on load, listen for auth state changes, and await all storage calls (form submit, delete, export/import, refresh).
- **Why**: Gate the app behind auth and keep UI in sync with async data calls.
- **Target Files**: `index.html`, `src/main.js`

### [2026-07-09] 建置驗證與部署 (END)
- **What**: `npm install` (added supabase-js), `npm run build` succeeded, smoke-tested dev server (login gate markup renders). Deployed: `git push` to `github.com/coolchife/fatloss-20260706` (blocked once by GitHub flagging OAuth authorization on the account — resolved by switching to a Personal Access Token), then `npm run deploy` (gh-pages) published successfully.
- **Why**: Ship the cloud version live.
- **Target Files**: (deployment, no source changes)
- **Pending manual steps (require user's Supabase dashboard access)**: run `supabase_schema.sql` in SQL Editor; set Auth Redirect URL to the GitHub Pages URL.

### [2026-07-09] [BLOCKED] GitHub Pages 無法上線
- **What attempted**: `git push` 成功（改用 PAT 解決 OAuth 授權被擋的問題）；`npm run deploy` 成功將 `dist/` 推到 `gh-pages` 分支（已用 API 確認分支與 `index.html` 都存在）；Pages 設定確認 source 已指向 `gh-pages` 分支。手動呼叫 `POST /pages/builds` 觸發建置，回應 `status: queued`。
- **Where it failed**: 之後查詢 `/pages/builds/latest` 持續回 404 Not Found（非「still building」，是「找不到」），實際網站 `https://coolchife.github.io/fatloss-20260706/` 也持續回 404，跟前面 `coolchife` 帳號被 GitHub 標記「flagged, cannot authorize third-party application」的訊息時間點吻合，研判是同一個帳號限制，連帶讓 Pages 網站無法真正發佈（GitHub 對被標記帳號的常見限制之一）。
- **What's needed**: 使用者決定是否要（a）聯絡 GitHub Support 解除 `coolchife` 帳號限制後再重試、（b）改用另一個未被標記、且先前已驗證能成功部署 Pages 的帳號 `ilearn24bymyself`（001 專案已用該帳號成功上線過）另建 repo 部署 002、或（c）改用 Vercel 等其他平台。使用者選擇先擱置、回家換電腦繼續，尚未做決定。

---

### [2026-07-11] 移除每日確認 Modal + 新增常駐週進度面板 (START/END)
- **What**: Removed `saveModal` (weekday save confirmation) entirely from `index.html` and `main.js`. Simplified `showSundayModal` to a short one-line confirmation (no more embedded comparison tables). Added new persistent `#weeklyProgressPanel` (total delta baseline→latest Sunday, plus full-history per-week delta list) rendered via new `renderWeeklyProgress()` in `dashboard.js`, called every `refreshUI()` — so it's visible any time the page is opened, not just right after a Sunday save.
- **Why**: User found the daily confirmation modal redundant, and found the Sunday modal's comparison data disappeared once closed — wanted progress persistently visible for better at-a-glance visualization. Confirmed via /spec discussion: keep Sunday modal (simplified) rather than remove, and show full week history (not just recent N weeks).
- **Target Files**: `index.html`, `src/main.js`, `src/dashboard.js`
- **Verification**: `npm run build` succeeded. Follow-up: Playwright MCP was installed and used to drive the dev server end-to-end (user logged in manually, browser was headed). Confirmed: weekday save is silent (no modal), Sunday save shows the simplified one-line confirmation, the persistent `#weeklyProgressPanel` updates live with correct total (baseline→latest Sunday) and full per-week history, Chart.js renders correctly (an initial blank screenshot was just an animation-timing race, not a bug), logout returns to the login gate. Two test records (2026-07-10, 2026-07-12) were written to the live Supabase DB during this test — pending user decision on cleanup.

### [2026-07-11] 修正週進度總計缺少胸圍/上手臂 (START/END)
- **What**: `renderWeeklyProgress()`'s total section only compared 3 of the 5 body-measurement fields (waist/hip/thigh) inherited from the old Sunday modal's `buildMetrics()`, which never included chest/arm either. Added `胸圍`/`上手臂` delta badges alongside the existing waist/hip/thigh in the `🏁 總計` block.
- **Why**: User noticed the total block wasn't showing all 5 tracked body dimensions while reviewing a 100-record local visual test (front-end-only mock data via a temporary `localStorage` hook in `storage.js`, reverted afterward — no writes to Supabase).
- **Target Files**: `src/dashboard.js`
- **Verification**: `npm run build` passed; re-tested visually with the same temporary mock-data hook (this time including chest/arm) via Playwright MCP — total block now shows all 8 metrics. Hook reverted from `storage.js` before commit.

### [2026-07-11] 週進度總計改兩行版面 + 箭頭改為正負號 (START/END)
- **What**: `renderWeeklyProgress()`'s total block now renders as two rows (core metrics: weight/bodyFat/visceralFat; body measurements: chest/arm/waist/hip/thigh below a divider) instead of one wrapping flex row. Replaced the ⬇/⬆/➖ arrow glyphs across `deltaBadge()` (total + weekly list) and `updateBadge()` (bento card corner badges) with `-`/`+`/`` signs; swapped the color mapping so decreases render red (`rose`) and increases render green (`emerald`) — an accounting-style convention (red = deficit) rather than the previous fat-loss-goodness color scheme.
- **Why**: User found the down-arrow-means-good color scheme counter-intuitive and asked for a red "-" / green "+" numeric convention instead; also asked for the total block to visually separate the 3 core metrics from the 5 body-measurement dimensions instead of wrapping together.
- **Target Files**: `src/dashboard.js`
- **Verification**: `npm run build` passed; visually confirmed via Playwright MCP against the dev server with real account data — bento badges, weekly total, and weekly list all show the new sign/color convention correctly.

### [2026-07-11] Session 結束快照
- **What**: All code changes complete and deployed. Supabase configured (2 users, public signup disabled). Walkthrough written. One task remaining: end-to-end test (deferred to VSCode session).
- **Why**: User switching from Antigravity to VSCode. Saving state before handoff.
- **Target Files**: `walkthroughs/20260710_session_log.md`, `task.md`
- **Live URL**: https://ilearn24bymyself.github.io/fatloss-20260706/
- **Next session**: Run `/on` to reload context, then do end-to-end test in incognito window.

### [2026-07-10] 部署切換至 ilearn24bymyself 帳號 (START/END)
- **What**: Diagnosed `coolchife` GitHub account restriction — Pages never published (deployments endpoint returned 404). Enabled 2FA on `coolchife` but restriction persisted. Resolved by creating new repo `ilearn24bymyself/fatloss-20260706`, updating git remote, `02_deploy_github.bat`, and re-deploying via `npm run build && npm run deploy`.
- **Why**: `coolchife` account was flagged by GitHub; Pages build system silently blocked. `ilearn24bymyself` was confirmed working from 001 project.
- **Target Files**: `02_deploy_github.bat`, git remote config
- **Live URL**: https://ilearn24bymyself.github.io/fatloss-20260706/

### [2026-07-10] Supabase Schema & Auth 設定完成
- **What**: Executed `supabase_schema.sql` in Supabase SQL Editor (created `public.records` table + RLS policies). Set Supabase Auth Site URL and Redirect URL to `https://ilearn24bymyself.github.io/fatloss-20260706/`.
- **Why**: Required manual steps to enable cloud data storage and correct Magic Link redirect.
- **Target Files**: Supabase dashboard only (no source changes)

### [2026-07-10] 儲存確認卡 + 週日結算 Modal (START/END)
- **What**: Added save confirmation modal (weekdays) and Sunday summary modal. Dashboard delta logic changed from "14 days ±3" to "previous Sunday vs current Sunday". Modal shows baseline message on first Sunday, week-over-week comparison on subsequent Sundays.
- **Why**: User reported no visual feedback after saving — felt like nothing was accomplished. All metrics going down = green (pure fat loss goal).
- **Target Files**: `index.html`, `src/dashboard.js`, `src/main.js`

### [2026-07-11] Password Recovery 流程實作 (START/END)
- **What**: Added PASSWORD_RECOVERY event handler. `onAuthStateChange` now passes event type to callback. New `updatePassword()` export in auth.js. Added `#passwordResetGate` overlay in index.html (two password fields + confirm). In main.js: detects PASSWORD_RECOVERY event → shows reset overlay instead of main app; validates password match before calling `updatePassword`.
- **Why**: Clicking recovery email link previously auto-logged user into app without allowing them to set a password. Now correctly intercepts recovery session and gates behind password-set form.
- **Target Files**: `src/auth.js`, `index.html`, `src/main.js`
- **Deploy**: Published to https://ilearn24bymyself.github.io/fatloss-20260706/

### [2026-07-10] Auth 改為 Email + 密碼 + Sunday Modal 加起點比較 (START/END)
- **What**: Replaced Magic Link auth with email+password. Removed `sendMagicLink`/`signInWithOtp`, added `signIn(email, password)` using `signInWithPassword`. Updated login form to include password field. Sunday modal now shows two comparison sections: week-over-week (vs previous Sunday) and cumulative progress (vs first Sunday baseline), with baseline section visible only from the 3rd Sunday onward.
- **Why**: Magic Link requires SMTP for every login — incompatible with reliable multi-user access. Email+password eliminates SMTP dependency for daily use. Baseline comparison added because user needs to track total progress from starting point, not just weekly delta.
- **Target Files**: `src/auth.js`, `index.html`, `src/main.js`
- **Deploy**: `npm run build && npm run deploy` — Published to https://ilearn24bymyself.github.io/fatloss-20260706/
- **Supabase manual step required**: Disable "Allow new users to sign up" in Authentication → Settings. Create user accounts manually via Authentication → Users → Add user.

### [2026-07-10] [BLOCKED] Magic Link Email 無法寄送至任意信箱
- **What attempted**: Configured Resend SMTP in Supabase (smtp.resend.com:465, username: resend, sender: onboarding@resend.dev). Expected to lift Supabase built-in 2/hr rate limit.
- **Where it failed**: Resend 403 — "Testing domain restriction: The resend.dev domain is for testing and can only send to your own email address." `onboarding@resend.dev` can ONLY send to the Resend account's registered email, not arbitrary addresses.
- **Root cause of AI error**: Should have stated this limitation upfront before recommending Resend + `onboarding@resend.dev`. The user was led through multiple steps only to hit a dead end.
- **What's needed**: To send Magic Link to ANY email, must use one of: (a) Gmail SMTP with App Password — no domain required, sends to any address; (b) Brevo free SMTP — 300 emails/day, no domain required; (c) Verify a custom domain in Resend. Recommendation: Gmail SMTP (user already has chife27@gmail.com, zero cost, works immediately).

### [2026-07-09] Session Handoff（換電腦繼續前的狀態快照）
- **目前進度**：002 專案程式碼已完整寫好且通過本機 build 驗證，已成功 `git push` 到 `https://github.com/coolchife/fatloss-20260706.git`（main 分支）。`npm run deploy` 也把 `dist/` 推上了 `gh-pages` 分支，但網站本身因帳號限制無法真正上線（見上一則 BLOCKED）。
- **在新電腦上要接續，需要做的事**：
  1. `git clone https://github.com/coolchife/fatloss-20260706.git` 到新電腦的 `002_FatLossTracker_Cloud` 對應路徑，或直接把整個資料夾複製過去（`.env` 沒有進 git，要另外處理，見下方）。
  2. 新電腦上執行 `npm install`（`node_modules` 沒有進 git）。
  3. **重新建立 `.env`**（此檔案刻意不進 git，需手動在新電腦建立，內容如下，皆為可公開的 anon/publishable key，非密碼）：
     ```
     VITE_SUPABASE_URL=https://phmfyldytnuckhghycim.supabase.co
     VITE_SUPABASE_ANON_KEY=sb_publishable_9miFBa_i3miOhVRQmTJa0A_dA57UnyZ
     ```
  4. **GitHub PAT**：先前產生的 `coolchife` 帳號 PAT 只存在原電腦的憑證管理員裡，新電腦要重新 `git push` 的話需要重新用該 PAT 登入一次（PAT 本身沒變，還沒過期的話直接拿來用；若已忘記，去 `github.com/settings/tokens` 可以重新產生一支新的）。
  5. **未完成的決策**：GitHub Pages 上不了線的問題還沒決定怎麼處理（換帳號 / 找 GitHub Support / 換 Vercel），回來後要先做這個決定才能繼續部署。
  6. **未完成的 Supabase 手動步驟**（不受換電腦影響，去 Supabase 網站操作即可）：
     - 到 SQL Editor 執行 `supabase_schema.sql` 建立 `records` 資料表與 RLS policy
     - 到 Authentication → URL Configuration 設定 Redirect URL（等 Pages 網址確定後再填）
