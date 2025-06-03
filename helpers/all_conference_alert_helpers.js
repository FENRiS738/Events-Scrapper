import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";

puppeteer.use(StealthPlugin());

const get_listing_source_html = async (base_url, data_page) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-blink-features=AutomationControlled",
        ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.goto(base_url, { waitUntil: 'networkidle2' });

    let clicked = false;

    if (data_page !== 1 && data_page !== '1') {
        try {
            await page.waitForSelector('span.page-numbers, a.page-numbers', { timeout: 10000 });

            clicked = await page.evaluate((targetPage) => {
                const pagination_elements = Array.from(document.querySelectorAll('a.page-numbers, span.page-numbers'));
                for (const el of pagination_elements) {
                    const page_num = el.textContent.trim();
                    if (page_num === targetPage.toString() && el.tagName.toLowerCase() === 'a') {
                        el.click();
                        return true;
                    }
                }
                return false;
            }, data_page);

            if (clicked) {
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => { });
            }
        } catch (e) { }
    }

    const html_content = await page.content();
    await browser.close();
    return { html_content, clicked };
};


const extract_events = async (pageSourceHTML) => {
    const $ = cheerio.load(pageSourceHTML);
    const events = [];

    $('tr.data1').each((_, row) => {
        const date = $(row).find('td').eq(0).find('span').text().trim();
        const name = $(row).find('td').eq(1).find('a').text().trim();
        const url = $(row).find('td').eq(1).find('a').attr('href');
        const location = $(row).find('td').eq(2).find('a').text().trim();

        events.push({ date, name, location, url });
    });

    return events;
};

const get_event_source_html = async (base_url) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-blink-features=AutomationControlled",
        ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.goto(base_url, { waitUntil: 'networkidle2' });

    const html_content = await page.content();
    await browser.close();
    return html_content;
};

const extract_event_details = async (pageSourceHTML) => {
    const $ = cheerio.load(pageSourceHTML);
    const event = {
        name: $('h1 span[itemprop="name"]').text().trim(),
        location: $('span[itemprop="location"]').text().trim(),

    };
    $('ul.col-md-12.confer-detl > li').each((_, el) => {
        const heading = $(el).find('h3').text().trim();
        const text = $(el).text().replace(/\s+/g, ' ').trim();

        if (heading.includes('Organizer :')) {
            event.company = $(el).find('span[itemprop="organizer"]').text().trim();
        } else if (heading.includes('start date')) {
            event.start_date = $(el).find('span[itemprop="startDate"]').text().trim();
        } else if (heading.includes('end date')) {
            event.end_date = $(el).find('span[itemprop="endDate"]').text().trim();
        } else if (heading.includes('Organizing secretary')) {
            event.organizer_title = text.replace(heading, '').trim();
        } else if (heading.includes('Email-Id')) {
            event.email = text.replace(heading, '').trim();
        } else if (heading.includes('URL')) {
            event.website = $(el).find('a[itemprop="sameAs"]').attr('href');
        }
    });

    return event;
};

export { get_listing_source_html, extract_events, get_event_source_html, extract_event_details }