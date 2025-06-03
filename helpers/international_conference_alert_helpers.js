import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import { cleanText } from "./general_helpers.js";

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
            await page.waitForSelector('ul.pagination li.page-item a.page-link', { timeout: 10000 });

            clicked = await page.evaluate((targetPage) => {
                const links = Array.from(document.querySelectorAll("ul.pagination li.page-item a.page-link"));
                for (const link of links) {
                    if (link.textContent.trim() === targetPage.toString()) {
                        link.click();
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

    $('tr.conf-list.elist').each((_, row) => {
        const $row = $(row);

        // Extract date (day and month)
        const day = $row.find('td').eq(0).find('p').clone().children().remove().end().text().trim();
        const month = $row.find('td').eq(0).find('span').text().trim();
        const date = `${day} ${month}`;

        // Event name and URL
        const name = $row.find('td').eq(1).find('p.event-name').text().trim();
        const url = $row.find('td').eq(1).find('a').attr('href');

        // Location
        const locationText = $row.find('td').eq(2).find('p.c-loc').text();
        const location = locationText.replace(/\s+/g, ' ').trim();

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
        name: $('h1').text().trim(),
        start_date: cleanText($('h1 + p.title > b').text().trim().split("|")[0]),
        location: cleanText($('h1 + p.title > b').text().trim().split("|")[1])
    };

    $('table.table.table-bordered > tbody > tr').each((_, el) => {
        const key = $(el).find('td').eq(0).text().trim();
        const value = $(el).find('td').eq(1).text().trim();

        if (/Contact Person/i.test(key)) {
            event.organizer_name = value;
        } else if (/Organized By/i.test(key)) {
            event.company = value;
        } else if (/Event Enquiries/i.test(key)) {
            event.email = value;
        } else if (/Visit Website/i.test(key)) {
            event.website = $(el).find('td a').attr('href') || value;
        }
    });

    return event;
};

export { get_listing_source_html, extract_events, get_event_source_html, extract_event_details }