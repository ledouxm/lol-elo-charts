import { isDev } from "@/envVars";
import puppeteer, { Page, ScreenshotClip } from "puppeteer";

const ref = {
    browser: null,
    page: null as any as Page,
};

const productionOptions = {
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

export const getBrowser = async () => {
    if (ref.browser) return ref.browser;

    ref.browser = await puppeteer.launch({
        headless: "new",
        ...(isDev ? {} : productionOptions),
    });
    return ref.browser;
};

export const getPage = async () => {
    if (ref.page) return ref.page;

    ref.page = await (await getBrowser()).newPage();
    return ref.page;
};

export const getScreenshotBuffer = async ({
    html,
    clip,
    css,
}: {
    html: string;
    clip: ScreenshotClip;
    css?: string;
}) => {
    const page = await (await getBrowser()).newPage();

    await page.setViewport(clip);
    await page.setContent(html);

    if (css) {
        await injectCss(page, css);
    }

    const result = await page.screenshot({ clip, path: "screenshot.png" });
    await page.close();

    return result;
};

const injectCss = async (page: Page, css: string) => {
    await page.evaluate(async (css) => {
        const style = document.createElement("style");
        style.type = "text/css";
        style.appendChild(document.createTextNode(`${css}`));
        const promise = new Promise((resolve, reject) => {
            style.onload = resolve;
            style.onerror = reject;
        });
        document.head.appendChild(style);
        await promise;
    }, css);
};
