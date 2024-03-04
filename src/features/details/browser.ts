import puppeteer, { ScreenshotClip } from "puppeteer";

const ref = {
    browser: null,
    page: null,
};

export const getBrowser = async () => {
    if (ref.browser) return ref.browser;

    ref.browser = await puppeteer.launch({ headless: "new", executablePath: "/usr/bin/google-chrome" });
    return ref.browser;
};

export const getPage = async () => {
    if (ref.page) return ref.page;

    ref.page = await (await getBrowser()).newPage();
    return ref.page;
};

export const getScreenshotBuffer = async (html: string, clip: ScreenshotClip) => {
    const page = await getPage();
    await page.setContent(html);

    return page.screenshot({ clip });
};
