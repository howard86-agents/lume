/**
 * Lume locale bundles.
 *
 * Each of the five supported languages exposes the full set of UI strings
 * required by the visitor flow (cover, language picker, onboarding, camera
 * permission, scanner, gallery, detail, completion, card, settings, and the
 * shared toasts). Strings are addressed by a single typed key so consuming
 * components can call `t("scan_continue")` without the call sites becoming a
 * string-typo surface.
 *
 * Translations are authored to read as native mobile-app copy in each
 * locale. The English bundle is the canonical key set: every other bundle
 * is required (at the type level) to provide a string for every key, so
 * adding a new key forces a translation pass before typecheck succeeds.
 *
 * Specimen names live alongside the specimen records in `./specimens.ts`
 * (one entry per specimen, indexed by language); locale-bundle keys here
 * cover only the static UI chrome.
 */

/**
 * The set of supported locale codes. Order matches the language picker
 * visual order on `/language`.
 */
export const LUME_LOCALES = ["en", "zh-tw", "zh-cn", "ja", "ko"] as const;

/** A single ISO-style locale code supported by Lume. */
export type LumeLocale = (typeof LUME_LOCALES)[number];

/**
 * Native + display labels for the language picker. Kept here so the picker
 * does not have to special-case its own copy.
 */
export const LUME_LOCALE_LABELS: Readonly<
  Record<LumeLocale, { native: string; latin: string }>
> = {
  en: { native: "English", latin: "EN" },
  "zh-tw": { native: "繁體中文", latin: "ZH-TW" },
  "zh-cn": { native: "简体中文", latin: "ZH-CN" },
  ja: { native: "日本語", latin: "JA" },
  ko: { native: "한국어", latin: "KO" },
};

/**
 * Canonical English bundle. The shape of this object is the source-of-truth
 * for `LumeLocaleBundle`; every other locale must satisfy the same keys.
 */
const EN = {
  // Cover — `/`
  cover_eyebrow_specimens: "23 light-forms",
  cover_eyebrow_floors: "Four floors",
  cover_title: "Lume.",
  cover_intro:
    "A walking field guide of light. Scan the codes you find and bring home all twenty-three.",
  cover_enter: "Enter",

  // Language picker — `/language`
  language_title: "Choose your language",
  language_subtitle: "You can change this any time from the menu.",
  language_continue: "Continue",
  language_skip: "Skip",
  language_step: "Step 1 of 3",

  // Onboarding — `/onboarding`
  onboarding_step_indicator: "Step {current} of {total}",
  onboarding_skip: "Skip",
  onboarding_next: "Next",
  onboarding_begin: "Begin",
  onboarding_one_title: "Find the codes",
  onboarding_one_body: "Each floor hides QR markers near the light-forms.",
  onboarding_two_title: "Collect the twenty-three",
  onboarding_two_body: "Scan a marker to add the specimen to your index.",
  onboarding_three_title: "Take home the field guide",
  onboarding_three_body:
    "Reach 23 of 23 to unlock your personalised achievement card.",

  // Camera permission — `/permission` and `/scan`
  permission_title: "Allow camera",
  permission_body:
    "Lume uses the camera only to read QR markers. No images leave your device.",
  permission_allow: "Allow camera",
  permission_not_now: "Not now",
  permission_denied_title: "Camera blocked",
  permission_denied_body:
    "Re-enable camera access for this site, then try again. You can also enter codes by hand.",
  permission_retry: "Try again",
  permission_no_camera_title: "No camera available",
  permission_no_camera_body:
    "We could not find a camera on this device. Use manual entry to keep collecting.",
  permission_insecure_title: "Camera needs HTTPS",
  permission_insecure_body:
    "Open Lume on a secure (https) link to enable scanning. You can use manual entry on any link.",

  // Scanner — `/scan`
  scan_scanning: "SCANNING",
  scan_helper: "Centre the marker inside the frame.",
  scan_manual_open: "Enter code",
  scan_manual_title: "Enter code",
  scan_manual_placeholder: "e.g. lu-08-mint",
  scan_manual_submit: "Collect",
  scan_manual_cancel: "Cancel",
  scan_continue: "Continue scanning",
  scan_view_specimen: "View specimen",
  scan_back_to_index: "Back to index",

  // Scan-result feedback
  scan_result_added: "Added to your index",
  scan_result_dupe: "Already in your index",
  scan_result_dupe_named: "{name} (no. {n}) — already in your index",
  scan_result_invalid: "Code not recognised",

  // Index gallery — `/index`
  index_title: "Your field guide",
  index_progress: "{found} / {total}",
  index_floor_label: "Floor {floor}",
  index_floor_count: "{found} / {total} found",
  index_locked_label: "Locked",
  index_dock_scan: "Scan",
  index_dock_card: "View card",

  // Specimen detail — `/specimen/[n]`
  specimen_plate_label: "Plate",
  specimen_floor_label: "Floor",
  specimen_number_label: "No.",
  specimen_collected_at: "Collected {date}",
  specimen_back: "Back to index",
  specimen_locked: "Not yet collected",

  // Completion reveal — `/complete`
  complete_eyebrow: "23 of 23",
  complete_title: "You found all twenty-three",
  complete_body:
    "Every light-form is in your index. Take home a card to remember the walk.",
  complete_view_card: "View your card",

  // Achievement card — `/card`
  card_title: "Your field guide",
  card_visitor_default: "Visitor",
  card_nickname_label: "Name on card",
  card_nickname_placeholder: "Visitor",
  card_save: "Save card",
  card_share: "Share",
  card_saving: "Preparing card…",
  card_saved_eyebrow: "Saved",
  card_saved_title: "Your card is ready",
  card_saved_body:
    "We have saved an image of your field guide. Show it at the exit if asked.",
  card_saved_back: "Back to index",

  // Settings — `/settings`
  settings_title: "Settings",
  settings_language: "Language",
  settings_reset: "Reset progress",
  settings_reset_confirm_title: "Reset progress?",
  settings_reset_confirm_body:
    "This clears every collected specimen on this device. It cannot be undone.",
  settings_reset_confirm_yes: "Reset",
  settings_reset_confirm_cancel: "Cancel",
  settings_progress_note:
    "Your progress is kept on this device only — no account needed.",
  settings_close: "Close",

  // Shared chrome
  app_name: "Lume",
  app_tagline: "23 light-forms across four floors",
} as const;

/** The full key set every locale bundle must satisfy. */
export type LocaleKey = keyof typeof EN;

/** A complete localised string bundle for one language. */
export type LumeLocaleBundle = Readonly<Record<LocaleKey, string>>;

const ZH_TW: LumeLocaleBundle = {
  cover_eyebrow_specimens: "23 種光體",
  cover_eyebrow_floors: "四個樓層",
  cover_title: "Lume.",
  cover_intro:
    "一場用腳步走出的光的田野指南。掃描你找到的代碼,把全部 23 種光體帶回家。",
  cover_enter: "進入",

  language_title: "選擇你的語言",
  language_subtitle: "你隨時可以在選單中更換語言。",
  language_continue: "繼續",
  language_skip: "略過",
  language_step: "步驟 1 / 3",

  onboarding_step_indicator: "步驟 {current} / {total}",
  onboarding_skip: "略過",
  onboarding_next: "下一步",
  onboarding_begin: "開始",
  onboarding_one_title: "尋找代碼",
  onboarding_one_body: "每個樓層的光體旁都藏著 QR 標記。",
  onboarding_two_title: "收集 23 種光體",
  onboarding_two_body: "掃描標記即可將該光體收入你的圖鑑。",
  onboarding_three_title: "把田野指南帶回家",
  onboarding_three_body: "集滿 23 / 23 即可解鎖你的專屬成就卡。",

  permission_title: "允許使用相機",
  permission_body: "Lume 僅使用相機讀取 QR 標記。所有影像不會離開你的裝置。",
  permission_allow: "允許相機",
  permission_not_now: "暫時不要",
  permission_denied_title: "相機已被封鎖",
  permission_denied_body:
    "請重新啟用此網站的相機權限後再試。你也可以改用手動輸入代碼。",
  permission_retry: "重試",
  permission_no_camera_title: "找不到相機",
  permission_no_camera_body: "此裝置沒有可用的相機。請使用手動輸入繼續收集。",
  permission_insecure_title: "相機需要 HTTPS",
  permission_insecure_body:
    "請以安全連線 (https) 開啟 Lume 才能掃描。任何連線下都可使用手動輸入。",

  scan_scanning: "掃描中",
  scan_helper: "將標記對準畫面中央的圓框。",
  scan_manual_open: "輸入代碼",
  scan_manual_title: "輸入代碼",
  scan_manual_placeholder: "例如 lu-08-mint",
  scan_manual_submit: "收集",
  scan_manual_cancel: "取消",
  scan_continue: "繼續掃描",
  scan_view_specimen: "查看光體",
  scan_back_to_index: "返回圖鑑",

  scan_result_added: "已加入圖鑑",
  scan_result_dupe: "已收藏過了",
  scan_result_dupe_named: "{name}（第 {n} 號）已在你的圖鑑中",
  scan_result_invalid: "無法辨識的代碼",

  index_title: "你的圖鑑",
  index_progress: "{found} / {total}",
  index_floor_label: "{floor} 樓",
  index_floor_count: "{found} / {total} 已收集",
  index_locked_label: "未收集",
  index_dock_scan: "掃描",
  index_dock_card: "查看成就卡",

  specimen_plate_label: "圖版",
  specimen_floor_label: "樓層",
  specimen_number_label: "編號",
  specimen_collected_at: "收集於 {date}",
  specimen_back: "返回圖鑑",
  specimen_locked: "尚未收集",

  complete_eyebrow: "23 / 23",
  complete_title: "你找齊了所有 23 種光體",
  complete_body: "每一種光體都在你的圖鑑中。帶一張卡片回家紀念這場散步吧。",
  complete_view_card: "查看你的成就卡",

  card_title: "你的田野指南",
  card_visitor_default: "訪客",
  card_nickname_label: "成就卡上的名字",
  card_nickname_placeholder: "訪客",
  card_save: "儲存成就卡",
  card_share: "分享",
  card_saving: "正在準備成就卡…",
  card_saved_eyebrow: "已儲存",
  card_saved_title: "你的成就卡已備妥",
  card_saved_body:
    "我們已將你的田野指南存成圖片。離場時若有人詢問,請出示這張卡片。",
  card_saved_back: "返回圖鑑",

  settings_title: "設定",
  settings_language: "語言",
  settings_reset: "重設進度",
  settings_reset_confirm_title: "確定重設進度?",
  settings_reset_confirm_body: "這將清除此裝置上所有已收集的光體,且無法復原。",
  settings_reset_confirm_yes: "重設",
  settings_reset_confirm_cancel: "取消",
  settings_progress_note: "進度只保存在這台裝置上,不需要帳號。",
  settings_close: "關閉",

  app_name: "Lume",
  app_tagline: "23 種光體,跨越四個樓層",
};

const ZH_CN: LumeLocaleBundle = {
  cover_eyebrow_specimens: "23 种光体",
  cover_eyebrow_floors: "四个楼层",
  cover_title: "Lume.",
  cover_intro:
    "一场用脚步走出的光的田野指南。扫描你找到的代码,把全部 23 种光体带回家。",
  cover_enter: "进入",

  language_title: "选择你的语言",
  language_subtitle: "你可以随时在菜单中更换语言。",
  language_continue: "继续",
  language_skip: "跳过",
  language_step: "步骤 1 / 3",

  onboarding_step_indicator: "步骤 {current} / {total}",
  onboarding_skip: "跳过",
  onboarding_next: "下一步",
  onboarding_begin: "开始",
  onboarding_one_title: "寻找代码",
  onboarding_one_body: "每个楼层的光体旁都藏着 QR 标记。",
  onboarding_two_title: "收集 23 种光体",
  onboarding_two_body: "扫描标记即可将该光体收入你的图鉴。",
  onboarding_three_title: "把田野指南带回家",
  onboarding_three_body: "集齐 23 / 23 即可解锁你的专属成就卡。",

  permission_title: "允许使用相机",
  permission_body: "Lume 仅使用相机读取 QR 标记。所有图像都不会离开你的设备。",
  permission_allow: "允许相机",
  permission_not_now: "暂时不用",
  permission_denied_title: "相机已被屏蔽",
  permission_denied_body:
    "请重新启用此网站的相机权限后再试。你也可以改用手动输入代码。",
  permission_retry: "重试",
  permission_no_camera_title: "找不到相机",
  permission_no_camera_body: "此设备没有可用的相机。请使用手动输入继续收集。",
  permission_insecure_title: "相机需要 HTTPS",
  permission_insecure_body:
    "请以安全连接 (https) 打开 Lume 才能扫描。任何连接下都可使用手动输入。",

  scan_scanning: "扫描中",
  scan_helper: "将标记对准画面中央的圆框。",
  scan_manual_open: "输入代码",
  scan_manual_title: "输入代码",
  scan_manual_placeholder: "例如 lu-08-mint",
  scan_manual_submit: "收集",
  scan_manual_cancel: "取消",
  scan_continue: "继续扫描",
  scan_view_specimen: "查看光体",
  scan_back_to_index: "返回图鉴",

  scan_result_added: "已加入图鉴",
  scan_result_dupe: "已经收藏过了",
  scan_result_dupe_named: "{name}（第 {n} 号）已在你的图鉴中",
  scan_result_invalid: "无法识别的代码",

  index_title: "你的图鉴",
  index_progress: "{found} / {total}",
  index_floor_label: "{floor} 楼",
  index_floor_count: "{found} / {total} 已收集",
  index_locked_label: "未收集",
  index_dock_scan: "扫描",
  index_dock_card: "查看成就卡",

  specimen_plate_label: "图版",
  specimen_floor_label: "楼层",
  specimen_number_label: "编号",
  specimen_collected_at: "收集于 {date}",
  specimen_back: "返回图鉴",
  specimen_locked: "尚未收集",

  complete_eyebrow: "23 / 23",
  complete_title: "你找齐了所有 23 种光体",
  complete_body: "每一种光体都在你的图鉴中。带一张卡片回家纪念这次漫步吧。",
  complete_view_card: "查看你的成就卡",

  card_title: "你的田野指南",
  card_visitor_default: "访客",
  card_nickname_label: "成就卡上的名字",
  card_nickname_placeholder: "访客",
  card_save: "保存成就卡",
  card_share: "分享",
  card_saving: "正在准备成就卡…",
  card_saved_eyebrow: "已保存",
  card_saved_title: "你的成就卡已就绪",
  card_saved_body:
    "我们已将你的田野指南保存为图片。离场时若有人询问,请出示这张卡片。",
  card_saved_back: "返回图鉴",

  settings_title: "设置",
  settings_language: "语言",
  settings_reset: "重置进度",
  settings_reset_confirm_title: "确定重置进度?",
  settings_reset_confirm_body: "这将清除此设备上所有已收集的光体,且无法恢复。",
  settings_reset_confirm_yes: "重置",
  settings_reset_confirm_cancel: "取消",
  settings_progress_note: "进度只保存在这台设备上,不需要账号。",
  settings_close: "关闭",

  app_name: "Lume",
  app_tagline: "23 种光体,跨越四个楼层",
};

const JA: LumeLocaleBundle = {
  cover_eyebrow_specimens: "23 の光体",
  cover_eyebrow_floors: "4 つのフロア",
  cover_title: "Lume.",
  cover_intro:
    "歩いて巡る、光のフィールドガイド。見つけたコードをスキャンして、23 体すべてを連れて帰りましょう。",
  cover_enter: "はじめる",

  language_title: "言語を選んでください",
  language_subtitle: "あとからメニューでいつでも変更できます。",
  language_continue: "続ける",
  language_skip: "スキップ",
  language_step: "ステップ 1 / 3",

  onboarding_step_indicator: "ステップ {current} / {total}",
  onboarding_skip: "スキップ",
  onboarding_next: "次へ",
  onboarding_begin: "はじめる",
  onboarding_one_title: "コードを見つけよう",
  onboarding_one_body: "各フロアの光体のそばに QR マーカーが隠れています。",
  onboarding_two_title: "23 体を集めよう",
  onboarding_two_body: "マーカーを読み取ると、その光体が図鑑に加わります。",
  onboarding_three_title: "フィールドガイドを持ち帰る",
  onboarding_three_body:
    "23 / 23 を達成すると、あなただけのアチーブメントカードが手に入ります。",

  permission_title: "カメラの使用を許可",
  permission_body:
    "Lume はカメラを QR マーカーの読み取りのみに使用します。映像が端末の外に出ることはありません。",
  permission_allow: "カメラを許可",
  permission_not_now: "今はしない",
  permission_denied_title: "カメラがブロックされています",
  permission_denied_body:
    "このサイトのカメラ権限を再度有効にしてからお試しください。手動入力でも続けられます。",
  permission_retry: "もう一度",
  permission_no_camera_title: "カメラが見つかりません",
  permission_no_camera_body:
    "この端末にはカメラがありません。手動入力で収集を続けてください。",
  permission_insecure_title: "カメラには HTTPS が必要です",
  permission_insecure_body:
    "セキュアな (https) リンクで Lume を開くとスキャンできます。手動入力はどのリンクでも利用できます。",

  scan_scanning: "スキャン中",
  scan_helper: "マーカーを中央の円の中に合わせてください。",
  scan_manual_open: "コードを入力",
  scan_manual_title: "コードを入力",
  scan_manual_placeholder: "例: lu-08-mint",
  scan_manual_submit: "収集",
  scan_manual_cancel: "キャンセル",
  scan_continue: "スキャンを続ける",
  scan_view_specimen: "光体を見る",
  scan_back_to_index: "図鑑へ戻る",

  scan_result_added: "図鑑に追加しました",
  scan_result_dupe: "すでに図鑑にあります",
  scan_result_dupe_named: "{name}（No. {n}）はすでに図鑑にあります",
  scan_result_invalid: "認識できないコードです",

  index_title: "あなたの図鑑",
  index_progress: "{found} / {total}",
  index_floor_label: "{floor} 階",
  index_floor_count: "{found} / {total} 体",
  index_locked_label: "未収集",
  index_dock_scan: "スキャン",
  index_dock_card: "カードを見る",

  specimen_plate_label: "プレート",
  specimen_floor_label: "フロア",
  specimen_number_label: "番号",
  specimen_collected_at: "{date} に収集",
  specimen_back: "図鑑へ戻る",
  specimen_locked: "まだ収集していません",

  complete_eyebrow: "23 / 23",
  complete_title: "23 体すべてを見つけました",
  complete_body:
    "すべての光体があなたの図鑑に揃いました。今日の散策の記念にカードをどうぞ。",
  complete_view_card: "カードを見る",

  card_title: "あなたのフィールドガイド",
  card_visitor_default: "ビジター",
  card_nickname_label: "カードに載せる名前",
  card_nickname_placeholder: "ビジター",
  card_save: "カードを保存",
  card_share: "共有",
  card_saving: "カードを準備中…",
  card_saved_eyebrow: "保存しました",
  card_saved_title: "カードができました",
  card_saved_body:
    "あなたのフィールドガイドを画像として保存しました。出口で求められたら見せてください。",
  card_saved_back: "図鑑へ戻る",

  settings_title: "設定",
  settings_language: "言語",
  settings_reset: "進捗をリセット",
  settings_reset_confirm_title: "進捗をリセットしますか?",
  settings_reset_confirm_body:
    "この端末で集めたすべての光体が消えます。元には戻せません。",
  settings_reset_confirm_yes: "リセット",
  settings_reset_confirm_cancel: "キャンセル",
  settings_progress_note:
    "進捗はこの端末にだけ保存されます。アカウントは不要です。",
  settings_close: "閉じる",

  app_name: "Lume",
  app_tagline: "4 つのフロアに広がる 23 の光体",
};

const KO: LumeLocaleBundle = {
  cover_eyebrow_specimens: "23종의 빛",
  cover_eyebrow_floors: "네 개의 층",
  cover_title: "Lume.",
  cover_intro:
    "걸으며 만나는 빛의 도감. 발견한 코드를 스캔해 23종의 빛을 모두 데려가세요.",
  cover_enter: "시작",

  language_title: "언어를 선택하세요",
  language_subtitle: "메뉴에서 언제든 다시 바꿀 수 있어요.",
  language_continue: "계속",
  language_skip: "건너뛰기",
  language_step: "단계 1 / 3",

  onboarding_step_indicator: "단계 {current} / {total}",
  onboarding_skip: "건너뛰기",
  onboarding_next: "다음",
  onboarding_begin: "시작하기",
  onboarding_one_title: "코드를 찾으세요",
  onboarding_one_body: "각 층의 빛 옆에 QR 마커가 숨어 있습니다.",
  onboarding_two_title: "23종을 모으세요",
  onboarding_two_body: "마커를 스캔하면 도감에 그 빛이 추가됩니다.",
  onboarding_three_title: "도감을 가져가세요",
  onboarding_three_body:
    "23 / 23을 모두 채우면 당신만의 어치브먼트 카드가 잠금 해제됩니다.",

  permission_title: "카메라 권한 허용",
  permission_body:
    "Lume는 QR 마커를 읽는 데에만 카메라를 사용합니다. 영상은 기기를 떠나지 않습니다.",
  permission_allow: "카메라 허용",
  permission_not_now: "나중에",
  permission_denied_title: "카메라가 차단되었습니다",
  permission_denied_body:
    "이 사이트의 카메라 권한을 다시 활성화한 후 시도해 주세요. 수동 입력으로도 진행할 수 있어요.",
  permission_retry: "다시 시도",
  permission_no_camera_title: "카메라를 찾을 수 없습니다",
  permission_no_camera_body:
    "이 기기에는 사용할 수 있는 카메라가 없습니다. 수동 입력으로 계속 모아 보세요.",
  permission_insecure_title: "카메라에는 HTTPS가 필요합니다",
  permission_insecure_body:
    "보안 (https) 링크로 Lume를 열어야 스캔할 수 있어요. 수동 입력은 어떤 링크에서도 가능합니다.",

  scan_scanning: "스캔 중",
  scan_helper: "마커를 가운데 원 안에 맞춰 주세요.",
  scan_manual_open: "코드 입력",
  scan_manual_title: "코드 입력",
  scan_manual_placeholder: "예: lu-08-mint",
  scan_manual_submit: "수집",
  scan_manual_cancel: "취소",
  scan_continue: "계속 스캔",
  scan_view_specimen: "빛 보기",
  scan_back_to_index: "도감으로",

  scan_result_added: "도감에 추가됨",
  scan_result_dupe: "이미 도감에 있어요",
  scan_result_dupe_named: "{name} (No. {n}) 이미 도감에 있습니다",
  scan_result_invalid: "인식할 수 없는 코드예요",

  index_title: "내 도감",
  index_progress: "{found} / {total}",
  index_floor_label: "{floor}층",
  index_floor_count: "{found} / {total} 수집",
  index_locked_label: "미수집",
  index_dock_scan: "스캔",
  index_dock_card: "카드 보기",

  specimen_plate_label: "플레이트",
  specimen_floor_label: "층",
  specimen_number_label: "번호",
  specimen_collected_at: "{date} 수집",
  specimen_back: "도감으로",
  specimen_locked: "아직 수집하지 않음",

  complete_eyebrow: "23 / 23",
  complete_title: "23종을 모두 찾았어요",
  complete_body:
    "모든 빛이 도감에 들어왔습니다. 오늘의 산책을 기억할 카드를 가져가세요.",
  complete_view_card: "카드 보기",

  card_title: "내 도감",
  card_visitor_default: "방문자",
  card_nickname_label: "카드에 들어갈 이름",
  card_nickname_placeholder: "방문자",
  card_save: "카드 저장",
  card_share: "공유",
  card_saving: "카드를 준비 중…",
  card_saved_eyebrow: "저장됨",
  card_saved_title: "카드가 준비됐어요",
  card_saved_body:
    "도감을 이미지로 저장했어요. 퇴장 시 요청을 받으면 이 카드를 보여 주세요.",
  card_saved_back: "도감으로",

  settings_title: "설정",
  settings_language: "언어",
  settings_reset: "진행 초기화",
  settings_reset_confirm_title: "진행을 초기화할까요?",
  settings_reset_confirm_body:
    "이 기기의 수집 기록이 모두 사라지며, 되돌릴 수 없어요.",
  settings_reset_confirm_yes: "초기화",
  settings_reset_confirm_cancel: "취소",
  settings_progress_note:
    "진행 기록은 이 기기에만 저장돼요. 계정은 필요 없습니다.",
  settings_close: "닫기",

  app_name: "Lume",
  app_tagline: "네 개 층에 펼쳐진 23종의 빛",
};

/**
 * Frozen lookup of every locale bundle. Consumers should use `getLocale`
 * for narrowing rather than reaching into the record directly.
 */
export const LUME_LOCALE_BUNDLES: Readonly<
  Record<LumeLocale, LumeLocaleBundle>
> = {
  en: EN,
  "zh-tw": ZH_TW,
  "zh-cn": ZH_CN,
  ja: JA,
  ko: KO,
};

/** Resolve a locale bundle for the given locale code. */
export function getLumeLocale(locale: LumeLocale): LumeLocaleBundle {
  return LUME_LOCALE_BUNDLES[locale];
}

/** Default locale used when no preference is persisted yet. */
export const LUME_DEFAULT_LOCALE: LumeLocale = "en";

/**
 * Map a single BCP-47-ish browser locale tag to one of the supported Lume
 * locales. Returns `undefined` when the tag does not match any rule, so
 * callers can keep walking an ordered list of preferences.
 *
 * Rules (case-insensitive, accepts `_` as a separator):
 *   - `zh-Hant*` / `zh-TW` / `zh-HK`           -> `zh-tw`
 *   - `zh-Hans*` / `zh-CN` / `zh-SG`           -> `zh-cn`
 *   - `ja*`                                    -> `ja`
 *   - `ko*`                                    -> `ko`
 *   - `en*`                                    -> `en`
 *   - anything else (including bare `zh`)      -> `undefined`
 */
function matchBrowserLocale(tag: string): LumeLocale | undefined {
  if (typeof tag !== "string") {
    return;
  }
  const normalized = tag.trim().toLowerCase().replace(/_/g, "-");
  if (!normalized) {
    return;
  }
  if (normalized.startsWith("zh")) {
    if (
      normalized === "zh-tw" ||
      normalized === "zh-hk" ||
      normalized.startsWith("zh-hant")
    ) {
      return "zh-tw";
    }
    if (
      normalized === "zh-cn" ||
      normalized === "zh-sg" ||
      normalized.startsWith("zh-hans")
    ) {
      return "zh-cn";
    }
    // Bare `zh` or an unrecognized region — let the caller fall back.
    return;
  }
  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return "ja";
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) {
    return "ko";
  }
  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }
  return;
}

/**
 * Resolve the closest supported Lume locale from a browser language hint.
 *
 * Accepts a single tag (e.g. `navigator.language`) or an ordered list
 * (e.g. `navigator.languages`). Walks the list and returns the first tag
 * that maps to a supported locale. Falls back to `LUME_DEFAULT_LOCALE`
 * (English) when nothing matches, the input is missing, or the input is
 * empty.
 *
 * Pure and side-effect-free so it can be unit-tested without a DOM and
 * called safely from both client and server (a server caller would only
 * pass in a parsed `Accept-Language` header).
 */
export function resolveBrowserLocale(
  input: string | readonly string[] | undefined | null
): LumeLocale {
  const candidates: readonly string[] = toCandidateList(input);
  for (const tag of candidates) {
    const matched = matchBrowserLocale(tag);
    if (matched) {
      return matched;
    }
  }
  return LUME_DEFAULT_LOCALE;
}

function toCandidateList(
  input: string | readonly string[] | undefined | null
): readonly string[] {
  if (typeof input === "string") {
    return [input];
  }
  if (Array.isArray(input)) {
    return input;
  }
  return [];
}
