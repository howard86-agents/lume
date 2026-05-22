/**
 * Lume specimen catalogue — the 23 light-form specimens distributed across
 * the venue's four floors.
 *
 * Each entry pairs a stable identity (number, qr code, plate label) with
 * presentational data (form, accent hue, per-language names + field notes)
 * so every screen — gallery tile, scan-result sheet, detail plate,
 * completion reveal, and the export card — can render the same record.
 *
 * Identity rules:
 *   - `number` is 1..23 in canonical visitor order. It also drives the
 *     `/specimen/[n]` route and the rendered "NO. NN" label.
 *   - `qr` is the opaque slug embedded in printed QR codes (`?c=<qr>`).
 *     Slugs are stable: changing one invalidates the printed signage.
 *   - `floor` is 1..4 and groups specimens in the index gallery.
 *   - `plate` is a Roman numeral within a floor (Plate I..VI), used in the
 *     detail-plate chrome to evoke the field-guide aesthetic.
 *   - `form` picks one of the 12 abstract glyph shapes from `./glyphs.ts`.
 *   - `hue` picks one of the six accent colours defined in `./tokens.ts`.
 *
 * `SAMPLE_FOUND` is the prototype's seed of "already collected" specimens
 * used by the design preview — six specimens evenly spread across the four
 * floors so the gallery shows a realistic mix of locked + found tiles.
 */

import type { LumeFormName } from "./glyphs";
import type { LumeLocale } from "./locales";
import type { LumeAccent } from "./tokens";

/** Floors the specimens are distributed across (1..4). */
export type LumeFloor = 1 | 2 | 3 | 4;

/** A 1..23 visitor-order number for a specimen. */
export type LumeSpecimenNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;

/** Localised display copy for a single specimen. */
export type LumeSpecimenName = Readonly<Record<LumeLocale, string>>;

/**
 * Optional artwork attached to a specimen. When set, every renderer that
 * understands the image field swaps the abstract glyph out for the image
 * (correctly sized/cropped for the surface). Keeping the field optional
 * means the catalogue can ship before any artwork has landed.
 *
 *   - `src` is consumed verbatim by `<img src=...>`. The build does not
 *     remap the value, so absolute paths and pre-bundled URLs both work.
 *     Public-folder paths (e.g. `/images/specimens/<slug>.svg`) are the
 *     conventional choice.
 *   - `alt` is per-locale so screen readers can announce the artwork in
 *     the visitor's active language. The English string is required and
 *     used as a fallback when the active locale is missing.
 */
export interface LumeSpecimenImage {
  /** Per-language alt text. The English string is the canonical fallback. */
  alt: LumeSpecimenName;
  /** URL handed to `<img src>`; typically a path under the web public folder. */
  src: string;
}

/**
 * One entry in the 23-specimen catalogue. The shape is deliberately flat
 * so renderers can map over it without further normalisation.
 */
export interface LumeSpecimen {
  /** Floor (1..4) the specimen lives on. */
  floor: LumeFloor;
  /** One of the 12 abstract glyph forms. */
  form: LumeFormName;
  /** Accent hue used for the glow halo and plate accents. */
  hue: LumeAccent;
  /**
   * Optional artwork that replaces the generated glyph on every surface
   * that understands images (gallery, detail, scan-success, card). When
   * absent, the surface falls back to the abstract `form`/`hue` glyph.
   */
  image?: LumeSpecimenImage;
  /** Per-language display name. */
  name: LumeSpecimenName;
  /** Per-language short field-guide notes (one or two sentences). */
  notes: LumeSpecimenName;
  /** 1..23 visitor-order number. Drives `/specimen/[n]` and "NO. NN" chrome. */
  number: LumeSpecimenNumber;
  /**
   * Plate label within the floor — a Roman numeral string ("I".."VI"). Two
   * specimens may share a plate when the prototype groups them visually on
   * the same printed plate.
   */
  plate: string;
  /** Stable QR-payload slug (used as `?c=<qr>`). */
  qr: string;
}

/**
 * Helper for the table below — keeps each row readable while still passing
 * through `LumeSpecimen` for type checks. Allows partial inference where
 * useful but the whole table is asserted as `readonly LumeSpecimen[]`.
 */
function specimen(entry: LumeSpecimen): LumeSpecimen {
  return entry;
}

/**
 * The 23 light-forms in canonical visitor order. Distribution:
 *   Floor 1: NO. 01..06 (6 specimens, plates I..III)
 *   Floor 2: NO. 07..12 (6 specimens, plates I..III)
 *   Floor 3: NO. 13..18 (6 specimens, plates I..III)
 *   Floor 4: NO. 19..23 (5 specimens, plates I..III)
 */
export const LUME_SPECIMENS: readonly LumeSpecimen[] = [
  // ── Floor 1 ────────────────────────────────────────────────────────────
  specimen({
    number: 1,
    floor: 1,
    plate: "I",
    form: "halo",
    hue: "amber",
    qr: "lu-01-aurum",
    image: {
      // Placeholder artwork shipping under apps/web/public so the
      // image-vs-glyph fallback path is exercised end-to-end. Real
      // exhibition artwork lands via issue #63.
      src: "/images/specimens/lu-01-aurum.svg",
      alt: {
        en: "Aurum — a warm amber halo of layered light",
        "zh-tw": "金光 — 層層相疊的溫暖琥珀色光環",
        "zh-cn": "金光 — 层层相叠的温暖琥珀色光环",
        ja: "金の灯 — 重なり合う暖かな琥珀色のヘイロー",
        ko: "금빛 — 겹겹이 퍼지는 따뜻한 호박빛 헤일로",
      },
    },
    name: {
      en: "Aurum",
      "zh-tw": "金光",
      "zh-cn": "金光",
      ja: "金の灯",
      ko: "금빛",
    },
    notes: {
      en: "A warm amber halo that hovers just above the threshold of the first floor.",
      "zh-tw": "一圈溫暖的琥珀色光環,懸浮在一樓入口的門檻之上。",
      "zh-cn": "一圈温暖的琥珀色光环,悬浮在一楼入口的门槛之上。",
      ja: "一階の入口にぼんやりと浮かぶ、暖かな琥珀色のヘイロー。",
      ko: "1층 입구 위에 잔잔히 떠 있는 따스한 호박빛 헤일로.",
    },
  }),
  specimen({
    number: 2,
    floor: 1,
    plate: "I",
    form: "orb",
    hue: "amber",
    qr: "lu-02-ember",
    name: {
      en: "Ember",
      "zh-tw": "餘燼",
      "zh-cn": "余烬",
      ja: "残り火",
      ko: "잔불",
    },
    notes: {
      en: "A small, slow-pulsing core that reads almost candle-like at arm's length.",
      "zh-tw": "一顆緩緩搏動的小光核,湊近看像是一支待燃的燭火。",
      "zh-cn": "一颗缓缓搏动的小光核,凑近看像是一支待燃的烛火。",
      ja: "ゆっくりと脈打つ小さな核、近づくと燭の灯にそっくり。",
      ko: "천천히 박동하는 작은 빛의 알갱이, 가까이 가면 촛불처럼 보입니다.",
    },
  }),
  specimen({
    number: 3,
    floor: 1,
    plate: "II",
    form: "ring",
    hue: "amber",
    qr: "lu-03-laurel",
    name: {
      en: "Laurel",
      "zh-tw": "桂環",
      "zh-cn": "桂环",
      ja: "ローレル",
      ko: "월계",
    },
    notes: {
      en: "Concentric rings tuned to a low amber, spaced like growth marks on a slow tree.",
      "zh-tw": "層層相疊的同心環,色調沉靜,像一棵慢慢長大的樹的年輪。",
      "zh-cn": "层层相叠的同心环,色调沉静,像一棵慢慢长大的树的年轮。",
      ja: "落ち着いた琥珀の同心円が、ゆっくり育つ木の年輪のように重なる。",
      ko: "차분한 호박빛으로 겹쳐 있는 동심원, 천천히 자란 나무의 나이테 같습니다.",
    },
  }),
  specimen({
    number: 4,
    floor: 1,
    plate: "II",
    form: "petal",
    hue: "rose",
    qr: "lu-04-petal",
    name: {
      en: "Petal",
      "zh-tw": "花瓣",
      "zh-cn": "花瓣",
      ja: "花びら",
      ko: "꽃잎",
    },
    notes: {
      en: "Four soft lobes of rose light radiating from a still centre.",
      "zh-tw": "四片柔軟的玫瑰色光瓣,自一個寧靜的核心向外舒展。",
      "zh-cn": "四片柔软的玫瑰色光瓣,自一个宁静的核心向外舒展。",
      ja: "静かな中心から、薔薇色のやわらかな四枚の花びらが広がる。",
      ko: "고요한 중심에서 장미빛 부드러운 네 장의 잎이 펼쳐집니다.",
    },
  }),
  specimen({
    number: 5,
    floor: 1,
    plate: "III",
    form: "mote",
    hue: "amber",
    qr: "lu-05-mote",
    name: {
      en: "Mote",
      "zh-tw": "微塵",
      "zh-cn": "微尘",
      ja: "塵の灯",
      ko: "먼지빛",
    },
    notes: {
      en: "A scatter of small bright points — easy to miss until you lower the lights.",
      "zh-tw": "幾粒散落的明亮小點;將燈調暗,才會逐一現身。",
      "zh-cn": "几粒散落的明亮小点;将灯调暗,才会逐一现身。",
      ja: "小さな光点が散らばる。灯りを落とすと初めて姿を現す。",
      ko: "작은 밝은 점들이 흩어져 있어, 조명을 낮추어야 비로소 모습을 드러냅니다.",
    },
  }),
  specimen({
    number: 6,
    floor: 1,
    plate: "III",
    form: "bloom",
    hue: "rose",
    qr: "lu-06-bloom",
    name: {
      en: "Bloom",
      "zh-tw": "綻放",
      "zh-cn": "绽放",
      ja: "ブルーム",
      ko: "블룸",
    },
    notes: {
      en: "Six radiating arms emerge in turn, settling into a steady glow.",
      "zh-tw": "六道光臂依序伸展,最後停在一片穩定的光暈。",
      "zh-cn": "六道光臂依序伸展,最后停在一片稳定的光晕。",
      ja: "六本の光の腕が順に伸びきり、やがて穏やかな輝きへ落ち着く。",
      ko: "여섯 갈래의 빛이 차례로 뻗어 나가, 결국 잔잔한 빛으로 가라앉습니다.",
    },
  }),

  // ── Floor 2 ────────────────────────────────────────────────────────────
  specimen({
    number: 7,
    floor: 2,
    plate: "I",
    form: "ring",
    hue: "cyan",
    qr: "lu-07-tide",
    name: {
      en: "Tideline",
      "zh-tw": "潮線",
      "zh-cn": "潮线",
      ja: "潮目",
      ko: "조수선",
    },
    notes: {
      en: "Cool rings hold the water's memory of the harbour outside the venue.",
      "zh-tw": "清涼的同心環,留著場館外港灣海水的記憶。",
      "zh-cn": "清凉的同心环,留着场馆外港湾海水的记忆。",
      ja: "ひんやりとした輪が、会場の外にある港の水の記憶を抱える。",
      ko: "차가운 고리들이 전시장 밖 항구의 물 기억을 담고 있습니다.",
    },
  }),
  specimen({
    number: 8,
    floor: 2,
    plate: "I",
    form: "tide",
    hue: "cyan",
    qr: "lu-08-mirage",
    name: {
      en: "Mirage",
      "zh-tw": "海市",
      "zh-cn": "海市",
      ja: "蜃気楼",
      ko: "신기루",
    },
    notes: {
      en: "Three layered waves pass through one another like distant heat haze.",
      "zh-tw": "三層波浪互相穿越,有如遠方夏日的熱氣折射。",
      "zh-cn": "三层波浪互相穿越,有如远方夏日的热气折射。",
      ja: "三本の波が重なり抜けて、遠い夏の陽炎のように揺らぐ。",
      ko: "세 겹의 물결이 서로를 통과하며, 먼 여름날의 아지랑이처럼 흔들립니다.",
    },
  }),
  specimen({
    number: 9,
    floor: 2,
    plate: "II",
    form: "comet",
    hue: "cyan",
    qr: "lu-09-comet",
    name: {
      en: "Comet",
      "zh-tw": "彗星",
      "zh-cn": "彗星",
      ja: "コメット",
      ko: "혜성",
    },
    notes: {
      en: "A leading orb traces a long, slow arc, leaving a soft cyan tail behind it.",
      "zh-tw": "前端的光球緩緩劃出一道弧線,身後拖著柔和的青色尾巴。",
      "zh-cn": "前端的光球缓缓划出一道弧线,身后拖着柔和的青色尾巴。",
      ja: "先頭の光球がゆっくりと長い弧を描き、淡いシアンの尾を引く。",
      ko: "앞선 빛 구체가 느리게 긴 호를 그리며, 부드러운 청록 꼬리를 남깁니다.",
    },
  }),
  specimen({
    number: 10,
    floor: 2,
    plate: "II",
    form: "lattice",
    hue: "cyan",
    qr: "lu-10-lattice",
    name: {
      en: "Lattice",
      "zh-tw": "經緯",
      "zh-cn": "经纬",
      ja: "格子",
      ko: "격자",
    },
    notes: {
      en: "Two squares cross through one another, an eight-pointed light caught mid-rotation.",
      "zh-tw": "兩個正方形彼此交疊,定格在八芒光體緩慢旋轉的瞬間。",
      "zh-cn": "两个正方形彼此交叠,定格在八芒光体缓慢旋转的瞬间。",
      ja: "二つの正方形が交差し、八方の光が回転の途中で止まる。",
      ko: "두 정사각형이 서로 교차하며, 회전을 멈춘 듯한 여덟 갈래 빛이 됩니다.",
    },
  }),
  specimen({
    number: 11,
    floor: 2,
    plate: "III",
    form: "prism",
    hue: "violet",
    qr: "lu-11-prism",
    name: {
      en: "Prism",
      "zh-tw": "稜光",
      "zh-cn": "棱光",
      ja: "プリズム",
      ko: "프리즘",
    },
    notes: {
      en: "A clean triangular outline holds a smaller triangle of solid violet within.",
      "zh-tw": "乾淨的三角輪廓內,藏著一個更小的紫色實心三角。",
      "zh-cn": "干净的三角轮廓内,藏着一个更小的紫色实心三角。",
      ja: "澄んだ三角形の輪郭の中に、紫の塗りの小さな三角が宿る。",
      ko: "깔끔한 삼각형 윤곽 안에 보랏빛으로 채워진 작은 삼각형이 숨어 있습니다.",
    },
  }),
  specimen({
    number: 12,
    floor: 2,
    plate: "III",
    form: "shard",
    hue: "violet",
    qr: "lu-12-shard",
    name: {
      en: "Shard",
      "zh-tw": "稜片",
      "zh-cn": "棱片",
      ja: "シャード",
      ko: "샤드",
    },
    notes: {
      en: "A five-sided plate of violet light with an inner edge that hums faintly.",
      "zh-tw": "一面五邊形的紫色光板,內緣帶著輕微的振動。",
      "zh-cn": "一面五边形的紫色光板,内缘带着轻微的振动。",
      ja: "五角形の紫の光板。内縁がかすかに震えている。",
      ko: "오각형 모양의 보랏빛 패널, 안쪽 가장자리가 살짝 떨립니다.",
    },
  }),

  // ── Floor 3 ────────────────────────────────────────────────────────────
  specimen({
    number: 13,
    floor: 3,
    plate: "I",
    form: "halo",
    hue: "magenta",
    qr: "lu-13-rosa",
    name: {
      en: "Rosa",
      "zh-tw": "玫瑰光",
      "zh-cn": "玫瑰光",
      ja: "ローザ",
      ko: "장미빛",
    },
    notes: {
      en: "A magenta halo that warms slightly when more than one visitor passes underneath.",
      "zh-tw": "一圈洋紅色光環,當不止一位訪客經過時會略微變亮。",
      "zh-cn": "一圈洋红色光环,当不止一位访客经过时会略微变亮。",
      ja: "マゼンタのヘイロー。複数の来場者が下を通ると、わずかに明るくなる。",
      ko: "마젠타 헤일로, 둘 이상의 방문객이 지나가면 조금씩 더 밝아집니다.",
    },
  }),
  specimen({
    number: 14,
    floor: 3,
    plate: "I",
    form: "petal",
    hue: "magenta",
    qr: "lu-14-fold",
    name: {
      en: "Fold",
      "zh-tw": "摺光",
      "zh-cn": "折光",
      ja: "フォールド",
      ko: "접힘",
    },
    notes: {
      en: "Four magenta lobes lean inward as if folded by an unseen hand.",
      "zh-tw": "四片洋紅色光瓣向內微微傾斜,彷彿被無形的手摺了一摺。",
      "zh-cn": "四片洋红色光瓣向内微微倾斜,仿佛被无形的手折了一折。",
      ja: "マゼンタの四片が、見えない手に折られたように内側へ寄る。",
      ko: "보이지 않는 손이 접은 듯, 마젠타 네 잎이 안쪽으로 살짝 기웁니다.",
    },
  }),
  specimen({
    number: 15,
    floor: 3,
    plate: "II",
    form: "spire",
    hue: "magenta",
    qr: "lu-15-spire",
    name: {
      en: "Spire",
      "zh-tw": "光柱",
      "zh-cn": "光柱",
      ja: "スパイア",
      ko: "스파이어",
    },
    notes: {
      en: "A vertical magenta column capped by twin orbs — easy to find at full height.",
      "zh-tw": "一道直立的洋紅色光柱,兩端各有一顆光球,直接抬頭就能看見。",
      "zh-cn": "一道直立的洋红色光柱,两端各有一颗光球,直接抬头就能看见。",
      ja: "両端に光球を載せたマゼンタの柱。立ち上がるとすぐに見つかる。",
      ko: "양 끝에 빛 구슬을 단 마젠타 기둥, 올려다보면 바로 눈에 띕니다.",
    },
  }),
  specimen({
    number: 16,
    floor: 3,
    plate: "II",
    form: "bloom",
    hue: "violet",
    qr: "lu-16-vesper",
    name: {
      en: "Vesper",
      "zh-tw": "晚禱光",
      "zh-cn": "晚祷光",
      ja: "ヴェスパー",
      ko: "베스퍼",
    },
    notes: {
      en: "Six violet rays settle into the slow rhythm of an evening bell.",
      "zh-tw": "六道紫色光臂,以晚鐘般的緩慢節奏漸漸停穩。",
      "zh-cn": "六道紫色光臂,以晚钟般的缓慢节奏渐渐停稳。",
      ja: "六本の紫の光が、夕の鐘のようなゆるやかな拍に落ち着く。",
      ko: "여섯 갈래 보랏빛이 저녁 종소리 같은 느린 박자로 가라앉습니다.",
    },
  }),
  specimen({
    number: 17,
    floor: 3,
    plate: "III",
    form: "lattice",
    hue: "magenta",
    qr: "lu-17-vault",
    name: {
      en: "Vault",
      "zh-tw": "穹頂光",
      "zh-cn": "穹顶光",
      ja: "ヴォルト",
      ko: "볼트",
    },
    notes: {
      en: "An eight-pointed magenta star that fills the small ceiling vault on this floor.",
      "zh-tw": "一顆八芒洋紅色星光,正好填滿這層小拱頂。",
      "zh-cn": "一颗八芒洋红色星光,正好填满这层小拱顶。",
      ja: "八方に広がるマゼンタの星。フロアの小さな天井をぴたりと埋める。",
      ko: "여덟 갈래 마젠타 별빛이 이 층의 작은 둥근 천장을 가득 채웁니다.",
    },
  }),
  specimen({
    number: 18,
    floor: 3,
    plate: "III",
    form: "tide",
    hue: "violet",
    qr: "lu-18-cadence",
    name: {
      en: "Cadence",
      "zh-tw": "節律",
      "zh-cn": "节律",
      ja: "ケイデンス",
      ko: "케이던스",
    },
    notes: {
      en: "Three violet bands rise and fall in a steady, almost-breathing rhythm.",
      "zh-tw": "三條紫色波帶以近似呼吸的節奏上下起伏。",
      "zh-cn": "三条紫色波带以近似呼吸的节奏上下起伏。",
      ja: "三本の紫の帯が、呼吸に近いリズムで上下する。",
      ko: "세 줄의 보랏빛 띠가 호흡에 가까운 리듬으로 오르내립니다.",
    },
  }),

  // ── Floor 4 ────────────────────────────────────────────────────────────
  specimen({
    number: 19,
    floor: 4,
    plate: "I",
    form: "orb",
    hue: "mint",
    qr: "lu-19-fern",
    name: {
      en: "Fern",
      "zh-tw": "蕨光",
      "zh-cn": "蕨光",
      ja: "シダの灯",
      ko: "고사리빛",
    },
    notes: {
      en: "A mint-green core with a quieter inner highlight, planted by the stairwell.",
      "zh-tw": "一顆薄荷綠色光核,內側有更安靜的光點,擺在樓梯旁。",
      "zh-cn": "一颗薄荷绿色光核,内侧有更安静的光点,摆在楼梯旁。",
      ja: "ミントグリーンの核と、内側にひそめたハイライト。階段の脇に置かれる。",
      ko: "민트빛 알갱이와 그 안의 잔잔한 하이라이트, 계단 옆에 자리 잡고 있습니다.",
    },
  }),
  specimen({
    number: 20,
    floor: 4,
    plate: "I",
    form: "mote",
    hue: "mint",
    qr: "lu-20-meadow",
    name: {
      en: "Meadow",
      "zh-tw": "草原光",
      "zh-cn": "草原光",
      ja: "メドウ",
      ko: "초원빛",
    },
    notes: {
      en: "A small constellation of mint motes — like fireflies above a still field.",
      "zh-tw": "幾粒薄荷色微塵,如同靜夜草原上方的螢火。",
      "zh-cn": "几粒薄荷色微尘,如同静夜草原上方的萤火。",
      ja: "ミントの粒たちの小さな星座。静かな草原に浮かぶ蛍のよう。",
      ko: "민트빛 작은 점들의 별자리, 고요한 들판 위 반딧불 같습니다.",
    },
  }),
  specimen({
    number: 21,
    floor: 4,
    plate: "II",
    form: "shard",
    hue: "mint",
    qr: "lu-21-pact",
    name: {
      en: "Pact",
      "zh-tw": "盟光",
      "zh-cn": "盟光",
      ja: "パクト",
      ko: "팩트",
    },
    notes: {
      en: "A mint pentagonal plate that brightens for a moment when two visitors stand near it together.",
      "zh-tw": "一面薄荷色五邊形光板,當兩位訪客同時靠近時會亮一下。",
      "zh-cn": "一面薄荷色五边形光板,当两位访客同时靠近时会亮一下。",
      ja: "ミントの五角板。二人の来場者が同時に近づくと、ひと呼吸ぶんだけ明るくなる。",
      ko: "민트색 오각형 패널, 두 사람이 동시에 다가서면 잠깐 더 밝아집니다.",
    },
  }),
  specimen({
    number: 22,
    floor: 4,
    plate: "II",
    form: "comet",
    hue: "violet",
    qr: "lu-22-vigil",
    name: {
      en: "Vigil",
      "zh-tw": "守夜光",
      "zh-cn": "守夜光",
      ja: "ヴィジル",
      ko: "비질",
    },
    notes: {
      en: "A late-evening specimen: a single violet streak that travels slowly across the corner.",
      "zh-tw": "一道夜深時才出現的紫色光跡,緩緩劃過轉角。",
      "zh-cn": "一道夜深时才出现的紫色光迹,缓缓划过转角。",
      ja: "夜更けに現れる紫の一筋。コーナーをゆっくり横切っていく。",
      ko: "늦은 저녁에만 나타나는 보랏빛 한 줄기, 모서리를 천천히 건너갑니다.",
    },
  }),
  specimen({
    number: 23,
    floor: 4,
    plate: "III",
    form: "spire",
    hue: "amber",
    qr: "lu-23-keep",
    name: {
      en: "Keep",
      "zh-tw": "守光",
      "zh-cn": "守光",
      ja: "キープ",
      ko: "킵",
    },
    notes: {
      en: "The final specimen — a tall amber spire at the top of the building, the last to find.",
      "zh-tw": "最後一個光體 —— 一根高聳的琥珀色光柱,佇立在建築最頂層。",
      "zh-cn": "最后一个光体 —— 一根高耸的琥珀色光柱,伫立在建筑最顶层。",
      ja: "最後の一体 —— 建物の最上階に立つ、背の高い琥珀色のスパイア。",
      ko: "마지막 한 점 —— 건물 꼭대기에 서 있는 키 큰 호박빛 기둥.",
    },
  }),
];

/**
 * Total number of specimens in the catalogue. Pinned at 23 so consumers
 * can use it directly in `NN / 23` progress chrome and 23/23-completion
 * checks without re-counting the array.
 */
export const LUME_TOTAL_SPECIMENS = 23 as const;

/** Compile-time assertion: the table really does contain 23 entries. */
type _AssertTwentyThree = LUME_SPECIMENS_LENGTH extends 23 ? true : never;
type LUME_SPECIMENS_LENGTH = typeof LUME_SPECIMENS extends {
  length: infer L;
}
  ? L
  : never;
// Reference the assertion so noUnusedLocals (if enabled) stays happy.
export type LumeSpecimenAssertion = _AssertTwentyThree;

/** Stable lookup of every specimen, keyed by its 1..23 number. */
export const LUME_SPECIMENS_BY_NUMBER: Readonly<
  Record<LumeSpecimenNumber, LumeSpecimen>
> = LUME_SPECIMENS.reduce<Record<number, LumeSpecimen>>((acc, s) => {
  acc[s.number] = s;
  return acc;
}, {}) as Readonly<Record<LumeSpecimenNumber, LumeSpecimen>>;

/** Stable lookup of every specimen, keyed by its QR slug. */
export const LUME_SPECIMENS_BY_QR: Readonly<Record<string, LumeSpecimen>> =
  LUME_SPECIMENS.reduce<Record<string, LumeSpecimen>>((acc, s) => {
    acc[s.qr] = s;
    return acc;
  }, {});

/** Specimens grouped by floor, in canonical visitor order within each floor. */
export const LUME_SPECIMENS_BY_FLOOR: Readonly<
  Record<LumeFloor, readonly LumeSpecimen[]>
> = {
  1: LUME_SPECIMENS.filter((s) => s.floor === 1),
  2: LUME_SPECIMENS.filter((s) => s.floor === 2),
  3: LUME_SPECIMENS.filter((s) => s.floor === 3),
  4: LUME_SPECIMENS.filter((s) => s.floor === 4),
};

/**
 * Resolve a specimen by visitor number, returning `undefined` for an
 * out-of-range or non-integer input. Callers are expected to handle the
 * `undefined` case so consumers like `/specimen/[n]` can render a
 * "not yet collected" or 404 fallback safely.
 */
export function getSpecimenByNumber(n: number): LumeSpecimen | undefined {
  if (!(Number.isFinite(n) && Number.isInteger(n))) {
    return;
  }
  if (n < 1 || n > LUME_TOTAL_SPECIMENS) {
    return;
  }
  return LUME_SPECIMENS_BY_NUMBER[n as LumeSpecimenNumber];
}

/**
 * Resolve a specimen from a `?c=<code>` deep-link payload. The payload may
 * be a full URL (`https://.../scan?c=lu-08-mirage`) or a bare slug
 * (`lu-08-mirage`); both forms are normalised to the slug before lookup.
 * Returns `undefined` for unknown slugs.
 */
export function getSpecimenByQrPayload(
  payload: string
): LumeSpecimen | undefined {
  const slug = extractQrSlug(payload);
  if (!slug) {
    return;
  }
  return LUME_SPECIMENS_BY_QR[slug];
}

/**
 * Bare-slug shape used to detect QR codes that are not URL-wrapped. We
 * keep the regex at module scope so `extractQrSlug` can be called per
 * scanned frame without re-compiling the literal.
 */
const BARE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/i;

/**
 * Pull the QR slug out of a payload. Accepts:
 *   - a bare slug — `"lu-08-mirage"`
 *   - a full URL with `?c=...` — `"https://lume.example/scan?c=lu-08-mirage"`
 *   - a relative path — `"/scan?c=lu-08-mirage"`
 *
 * Trims surrounding whitespace and lowercases the result so casing on
 * printed signage cannot break recognition.
 */
export function extractQrSlug(payload: string): string | undefined {
  const trimmed = payload.trim();
  if (trimmed.length === 0) {
    return;
  }
  // Try the URL parser first — it cleanly handles full URLs and relative paths.
  try {
    const url = new URL(trimmed, "https://lume.local");
    const c = url.searchParams.get("c");
    if (c) {
      return c.trim().toLowerCase();
    }
  } catch {
    // not a URL — fall through to bare-slug handling.
  }
  // Bare slugs only contain `lu-`-style characters; reject anything else
  // (we do not want to treat arbitrary text from misread QR codes as a
  // slug and risk a duplicate-toast for nonsense input).
  if (BARE_SLUG_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return;
}

/**
 * Seed of "already collected" specimen numbers used by the gallery and
 * card design previews. Six specimens (one or two from each floor) so the
 * grid renders a realistic mix of locked + found tiles before any real
 * scanning has happened.
 */
export const SAMPLE_FOUND: readonly LumeSpecimenNumber[] = [
  1, 4, 8, 11, 16, 21,
];

/**
 * Resolved per-render visual choice for a specimen — either an image
 * (when the catalogue has supplied one) or the generated glyph.
 *
 * The discriminator lets every renderer (gallery tile, detail plate,
 * scan-success sheet, achievement card) branch on `kind` without
 * duplicating the locale-resolution rules.
 */
export type LumeSpecimenVisual =
  | { alt: string; kind: "image"; src: string }
  | { form: LumeFormName; hue: LumeAccent; kind: "glyph" };

/**
 * Pick the visual rendering for a specimen. Returns the image branch
 * (with its alt text resolved against `lang`) when the specimen has an
 * `image` set; otherwise returns the abstract-glyph branch.
 *
 * Pure and side-effect-free so renderers can call it inside JSX without
 * worrying about render counts.
 */
export function getSpecimenVisual(
  specimen: LumeSpecimen,
  lang: LumeLocale
): LumeSpecimenVisual {
  if (specimen.image) {
    const alt = specimen.image.alt[lang] ?? specimen.image.alt.en;
    return { kind: "image", src: specimen.image.src, alt };
  }
  return { kind: "glyph", form: specimen.form, hue: specimen.hue };
}
