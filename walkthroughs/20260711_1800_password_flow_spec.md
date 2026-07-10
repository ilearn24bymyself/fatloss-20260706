### [2026-07-11 18:00] /spec：登入頁缺少忘記密碼入口 + 邀請信流程沒接好

使用者測試了一組新帳號，用 Supabase 後台的「Invite」邀請信功能寄信給對方，對方點信件連結後**直接被登入進 App，完全沒有出現設定密碼的畫面**。同時使用者也發現，目前登入畫面上根本沒有「忘記密碼」的按鈕或連結。

#### 診斷過程

先查證登入畫面：`index.html` 的 `#authGate` 區塊只有 Email、密碼輸入框跟登入按鈕，沒有任何觸發 `resetPasswordForEmail()` 的入口；全專案 grep `resetPasswordForEmail` 也完全沒有呼叫。結論：**「忘記密碼」的收信端（設定新密碼畫面）之前有做，但寄信端從來沒做**，使用者根本無法從畫面上觸發重設密碼信。

再查證邀請流程：直接讀 SDK 原始碼確認，不用猜——`node_modules\@supabase\auth-js\dist\module\GoTrueClient.js` 第 2018 行：
```js
await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
```
只有 `type=recovery` 的連結才會觸發 `PASSWORD_RECOVERY` 事件；`type=invite` 的邀請連結觸發的是跟一般登入相同的 `SIGNED_IN` 事件。而 `main.js` 目前只攔截 `PASSWORD_RECOVERY`，所以邀請連結點下去就直接被當成一般登入放行，完全沒機會設定密碼。

另確認本專案 Supabase client 用的是預設 `flowType: 'implicit'`（`supabaseClient.js` 沒有覆寫），也就是說連結格式是 `#access_token=...&type=invite`（URL hash），不是 PKCE 的 `?code=...`（query string）。這點決定了修復方式要用 hash 判斷。

#### 設計方案（待使用者確認）

**A. 登入畫面加「忘記密碼？」連結**
- 在 `#authGate` 的密碼輸入框下方加一個文字連結
- 點擊後：取登入表單目前已輸入的 Email（沒填就跳提示要求先輸入），呼叫 `supabase.auth.resetPasswordForEmail(email, { redirectTo: <目前網站網址> })`
- 顯示「重設密碼信已寄出，請檢查信箱」之類的成功訊息
- 收信後的「設定新密碼」畫面（`#passwordResetGate`）已經存在且能動，不用改

**B. 修正邀請信流程**
- 因為 SDK 本身不會把 invite 特殊化成獨立事件，要自己在 `SIGNED_IN` 事件觸發**之前**先讀到 URL hash 裡的 `type` 參數——但 Supabase client 本身在初始化時就會非同步讀取並清空這個 hash，時機會搶
- 做法：在 `index.html` 最上面加一段**行內、非 module 的 `<script>`**（在任何 Vite 打包的 module script 之前執行，這是瀏覽器解析 HTML 的既定順序，不是碰運氣），把 `window.location.hash` 裡的 `type` 存到一個全域變數，搶在 Supabase client 清空它之前先存下來
- `main.js` 的 `onAuthStateChange` 判斷：如果這次是 `SIGNED_IN` 事件、且剛剛存下來的 `type === 'invite'`，就當成跟 `PASSWORD_RECOVERY` 一樣處理——導向「設定新密碼」畫面，逼對方設完密碼才能進主畫面
- 判斷完之後把這個全域旗標清掉，確保不會影響同一頁面之後的正常登入

#### 影響檔案
- `index.html`：加忘記密碼連結、加行內 hash 捕捉 script
- `src/auth.js`：新增 `sendPasswordReset(email)` 匯出函式（包 `resetPasswordForEmail`）
- `src/main.js`：忘記密碼按鈕事件、`onAuthStateChange` 判斷邏輯加上 invite 分支

預估變更 <100 行，可在同一個 `task.md` checkbox 完成。

---

### [2026-07-11 18:40] /build 完成 + 測試發現的 bug

實作完成後用 Playwright MCP 對本機 dev server 實測：

- 忘記密碼：沒填 Email 會擋、有填會真的寄信，完整測過一輪，真的收到信（寄到 chife27@gmail.com）
- 邀請流程：測試時發現一個真的 bug——Supabase 在頁面載入時一定會先發 `INITIAL_SESSION` 事件（比邀請連結真正驗證完成、發出 `SIGNED_IN` 還早），原本的程式碼在「每一個」事件都清空判斷旗標，導致旗標在真正該用的時候已經被清空。修正為只在 `SIGNED_IN` 事件才消耗旗標，重新驗證 hash 捕捉機制正確存活到該用的時候。

**驗證邊界**：邀請信的「real-world 完整跑一次」沒辦法由 AI 端獨立驗證完——沒有信箱可以收信、也沒有真實密碼可以模擬登入。且 Supabase 後台的 Redirect URL 設定指向正式網站，不是 localhost，代表這個最後一哩路的測試**必須先部署上去才能做**。使用者確認先部署，上線後由使用者親自對正式網站重新發一次邀請信做最終驗證。
