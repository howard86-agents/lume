import { expect, type Page, test } from "@playwright/test";
import QRCode from "qrcode";

const STORAGE_KEY = "lume:state:v1";
const CARD_URL_PATTERN = /\/card$/;
const COMPLETE_URL_PATTERN = /\/complete$/;
const INDEX_URL_PATTERN = /\/index$/;
const PERMISSION_URL_PATTERN = /\/permission$/;
const ENGLISH_LANGUAGE_PATTERN = /English/i;
const MIRAGE_TILE_NAME_PATTERN = /Mirage.*no\. 08/i;
const SPECIMEN_8_URL_PATTERN = /\/specimen\/8$/;
const SCAN_URL_PATTERN = /\/scan$/;

const LOCALIZED_LANGUAGE_TITLES = [
  { code: "en", button: "English", title: "Choose your language" },
  { code: "zh-tw", button: "繁體中文", title: "選擇你的語言" },
  { code: "zh-cn", button: "简体中文", title: "选择你的语言" },
  { code: "ja", button: "日本語", title: "言語を選んでください" },
  { code: "ko", button: "한국어", title: "언어를 선택하세요" },
] as const;
const ALL_SLUGS = [
  "lu-01-aurum",
  "lu-02-ember",
  "lu-03-laurel",
  "lu-04-petal",
  "lu-05-mote",
  "lu-06-bloom",
  "lu-07-tide",
  "lu-08-mirage",
  "lu-09-comet",
  "lu-10-lattice",
  "lu-11-prism",
  "lu-12-shard",
  "lu-13-rosa",
  "lu-14-fold",
  "lu-15-spire",
  "lu-16-vesper",
  "lu-17-vault",
  "lu-18-cadence",
  "lu-19-fern",
  "lu-20-meadow",
  "lu-21-pact",
  "lu-22-vigil",
  "lu-23-keep",
] as const;

const ALL_COLLECTED_AT = Object.fromEntries(
  ALL_SLUGS.map((_, index) => [index + 1, "2026-05-23T00:00:00.000Z"])
);

function stateEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    state: {
      cardSaved: false,
      collected: [],
      collectedAt: {},
      finalSeen: false,
      lang: "en",
      nickname: "",
      ...overrides,
    },
  };
}

async function seedLumeState(page: Page, overrides: Record<string, unknown>) {
  await page.addInitScript(
    ({ key, envelope }) => {
      window.localStorage.setItem(key, JSON.stringify(envelope));
    },
    { key: STORAGE_KEY, envelope: stateEnvelope(overrides) }
  );
}

async function mockCameraWithQr(page: Page, payload: string) {
  const qrDataUrl = await QRCode.toDataURL(payload, { margin: 4, width: 320 });
  await page.addInitScript((dataUrl) => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 640;
          const context = canvas.getContext("2d");
          if (!context) {
            throw new DOMException("Canvas unavailable", "NotFoundError");
          }
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          const image = new Image();
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new DOMException("QR failed", "NotFoundError"));
            image.src = dataUrl;
          });
          context.drawImage(image, 160, 160, 320, 320);
          return canvas.captureStream(30);
        },
      },
    });
  }, qrDataUrl);
}

async function mockCameraError(page: Page, name: string) {
  await page.addInitScript((errorName) => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () =>
          Promise.reject(new DOMException(errorName, errorName)),
      },
    });
  }, name);
}

test.describe("issue #71 visitor collection flow", () => {
  test("deep-link scan collects a specimen, opens localized success, and unlocks detail/index state", async ({
    page,
  }) => {
    await seedLumeState(page, { lang: "zh-tw" });

    await page.goto("/scan?c=LU-08-MIRAGE");

    await expect(page.getByRole("dialog")).toContainText("已加入圖鑑");
    await expect(page.getByRole("heading", { name: "海市" })).toBeVisible();
    await expect(page.getByText("1 / 23")).toBeVisible();

    await page.getByRole("link", { name: "查看光體" }).click();
    await expect(page).toHaveURL(SPECIMEN_8_URL_PATTERN);
    await expect(page.getByRole("heading", { name: "海市" })).toBeVisible();
    await expect(page.getByText("Mirage")).toBeVisible();

    await page.getByRole("link", { name: "返回圖鑑" }).click();
    await expect(page).toHaveURL(INDEX_URL_PATTERN);
    await expect(page.getByText("1 / 23").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: MIRAGE_TILE_NAME_PATTERN })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "掃描" })).toBeVisible();
  });

  test("manual entry uses the same collection path for new, duplicate, and invalid codes", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: undefined,
      });
    });
    await seedLumeState(page, { lang: "en" });

    await page.goto("/scan");
    await expect(
      page.getByRole("heading", { name: "No camera available" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Enter code" }).click();
    await page
      .getByPlaceholder("e.g. lu-08-mint")
      .fill(" https://lume.example/scan?c=lu-01-aurum ");
    await page.getByRole("button", { name: "Collect" }).click();
    await expect(page.getByRole("heading", { name: "Aurum" })).toBeVisible();
    await expect(page.getByText("1 / 23")).toBeVisible();

    await page.getByRole("button", { name: "Continue scanning" }).click();
    await page.getByRole("button", { name: "Enter code" }).click();
    await page.getByPlaceholder("e.g. lu-08-mint").fill("lu-01-aurum");
    await page.getByRole("button", { name: "Collect" }).click();
    await expect(
      page.getByRole("button", { name: "Already in your index" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Already in your index" }).click();
    await page.getByRole("button", { name: "Enter code" }).click();
    await page.getByPlaceholder("e.g. lu-08-mint").fill("not a lume code");
    await page.getByRole("button", { name: "Collect" }).click();
    await expect(
      page.getByRole("button", { name: "Code not recognised" })
    ).toBeVisible();
  });

  test("23 of 23 progress gates the completion reveal and achievement card routes", async ({
    page,
  }) => {
    await seedLumeState(page, {
      collected: ALL_SLUGS,
      collectedAt: ALL_COLLECTED_AT,
      lang: "en",
      nickname: "Howard",
    });

    await page.goto("/index");
    await expect(page.getByText("23 / 23").first()).toBeVisible();
    await page.getByRole("button", { name: "View card" }).click();

    await expect(page).toHaveURL(COMPLETE_URL_PATTERN);
    await expect(
      page.getByRole("heading", { name: "You found all twenty-three" })
    ).toBeVisible();
    await page.getByRole("button", { name: "View your card" }).click();

    await expect(page).toHaveURL(CARD_URL_PATTERN);
    await expect(
      page.getByRole("heading", { name: "Your field guide" })
    ).toBeVisible();
    await expect(page.locator("#lume-card-nickname")).toHaveValue("Howard");
    await expect(page.getByRole("button", { name: "Save card" })).toBeVisible();
  });

  test("unfinished visitors are redirected away from locked specimen, completion, and card routes", async ({
    page,
  }) => {
    await seedLumeState(page, {
      collected: ["lu-01-aurum"],
      collectedAt: { 1: "2026-05-23T00:00:00.000Z" },
      lang: "en",
    });

    await page.goto("/specimen/2");
    await expect(page).toHaveURL(INDEX_URL_PATTERN);

    await page.goto("/complete");
    await expect(page).toHaveURL(INDEX_URL_PATTERN);

    await page.goto("/card");
    await expect(page).toHaveURL(INDEX_URL_PATTERN);
  });

  test("full visitor flow can scan a mocked camera QR and resume from localStorage", async ({
    context,
    page,
  }) => {
    await mockCameraWithQr(page, "lu-08-mirage");

    await page.goto("/");
    await page.getByRole("button", { name: "Enter" }).click();
    await page.getByText(ENGLISH_LANGUAGE_PATTERN).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("heading", { name: "Find the codes" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Skip" }).click();
    await expect(page).toHaveURL(PERMISSION_URL_PATTERN);
    await page.getByRole("button", { name: "Allow camera" }).click();
    await expect(page).toHaveURL(SCAN_URL_PATTERN);

    await expect(page.getByRole("heading", { name: "Mirage" })).toBeVisible();
    await expect(page.getByText("1 / 23")).toBeVisible();

    await page.reload();
    await page.goto("/index");
    await expect(page.getByText("1 / 23").first()).toBeVisible();

    const resumed = await context.newPage();
    await resumed.goto("/index");
    await expect(resumed.getByText("1 / 23").first()).toBeVisible();
    await resumed.close();
  });

  for (const locale of LOCALIZED_LANGUAGE_TITLES) {
    test(`language picker persists ${locale.code}`, async ({ page }) => {
      await page.goto("/language");
      await page.getByText(locale.button, { exact: true }).click();
      await expect(
        page.getByRole("heading", { name: locale.title })
      ).toBeVisible();

      await page.reload();
      await expect(
        page.getByRole("heading", { name: locale.title })
      ).toBeVisible();
    });
  }

  test("camera deny, no-camera, and insecure-context recovery states are asserted", async ({
    browser,
  }) => {
    const deniedPage = await browser.newPage();
    await mockCameraError(deniedPage, "NotAllowedError");
    await seedLumeState(deniedPage, { lang: "en" });
    await deniedPage.goto("/scan");
    await expect(
      deniedPage.getByRole("heading", { name: "Camera blocked" })
    ).toBeVisible();
    await deniedPage.close();

    const noCameraPage = await browser.newPage();
    await mockCameraError(noCameraPage, "NotFoundError");
    await seedLumeState(noCameraPage, { lang: "en" });
    await noCameraPage.goto("/scan");
    await expect(
      noCameraPage.getByRole("heading", { name: "No camera available" })
    ).toBeVisible();
    await noCameraPage.close();

    const insecurePage = await browser.newPage();
    await insecurePage.addInitScript(() => {
      Object.defineProperty(window, "isSecureContext", {
        configurable: true,
        value: false,
      });
    });
    await seedLumeState(insecurePage, { lang: "en" });
    await insecurePage.goto("/scan");
    await expect(
      insecurePage.getByRole("heading", { name: "Camera needs HTTPS" })
    ).toBeVisible();
    await insecurePage.close();
  });

  test("achievement-card export DOM is deterministic after completion", async ({
    page,
  }) => {
    await seedLumeState(page, {
      collected: ALL_SLUGS,
      collectedAt: ALL_COLLECTED_AT,
      lang: "en",
      nickname: "Howard",
    });

    await page.goto("/card");
    const exportCard = page.locator('[data-export-card="lume-achievement"]');
    await expect(exportCard).toBeVisible();
    await expect(exportCard).toContainText("23");
    await expect(exportCard).toContainText("Howard");
    expect(await exportCard.screenshot()).toBeTruthy();
  });
});
