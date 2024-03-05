import puppeteer, { Page, ScreenshotClip } from "puppeteer";

const ref = {
    browser: null,
    page: null,
};

export const getBrowser = async () => {
    if (ref.browser) return ref.browser;

    ref.browser = await puppeteer.launch({
        headless: "new",
        // executablePath: "/usr/bin/google-chrome",
        // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    return ref.browser;
};

export const getPage = async () => {
    if (ref.page) return ref.page;

    ref.page = await (await getBrowser()).newPage();
    ref.page.setViewport({ width: 700, height: 600 });
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
    const page = await getPage();

    await page.setContent(html);
    console.log("aaaa", !!css);
    if (css) {
        await injectCss(page, css);
    }

    return page.screenshot({ clip, path: "screenshot.png" });
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
