import express from 'express';
import all_conference_alert_router from "./routes/all_conference_alert_routes.js"
import international_conference_alert_router from "./routes/international_conference_alert_routes.js"

const app = express();
app.use(express.json());

app.use("/all_conference_alert", all_conference_alert_router)
app.use("/international_conference_alert", international_conference_alert_router)

app.get('/', async (req, res) => {
    res.json({
        success: true,
        message: "Accepted"
    })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// const get_internationalconferencealert_source_html = async (finalUrl, data_page) => {
//     const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             "--no-sandbox",
//             "--disable-setuid-sandbox",
//             "--disable-dev-shm-usage",
//             "--disable-gpu",
//             "--disable-features=IsolateOrigins,site-per-process",
//             "--disable-blink-features=AutomationControlled",
//         ],
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );

//     await page.setExtraHTTPHeaders({
//         'Accept-Language': 'en-US,en;q=0.9',
//     });

//     await page.goto(finalUrl, { waitUntil: 'networkidle2' });

//     let clicked = false;

//     if (data_page !== 1 && data_page !== '1') {
//         try {
//             await page.waitForSelector('ul.pagination li.page-item a.page-link', { timeout: 10000 });

//             clicked = await page.evaluate((targetPage) => {
//                 const links = Array.from(document.querySelectorAll("ul.pagination li.page-item a.page-link"));
//                 for (const link of links) {
//                     if (link.textContent.trim() === targetPage.toString()) {
//                         link.click();
//                         return true;
//                     }
//                 }
//                 return false;
//             }, data_page);

//             if (clicked) {
//                 await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
//             }
//         } catch (e) {}
//     }

//     const htmlContent = await page.content();
//     await browser.close();

//     return { htmlContent, clicked };
// };

// const get_internationalconferencealert_events = async (htmlContent) => {
//     const $ = cheerio.load(htmlContent);
//     const events = [];

//     $('tr.conf-list.elist').each((_, row) => {
//         const $row = $(row);

//         // Extract date (day and month)
//         const day = $row.find('td').eq(0).find('p').clone().children().remove().end().text().trim();
//         const month = $row.find('td').eq(0).find('span').text().trim();
//         const date = `${day} ${month}`;

//         // Event name and URL
//         const name = $row.find('td').eq(1).find('p.event-name').text().trim();
//         const url = $row.find('td').eq(1).find('a').attr('href');

//         // Location
//         const locationText = $row.find('td').eq(2).find('p.c-loc').text();
//         const location = locationText.replace(/\s+/g, ' ').trim();

//         events.push({ date, name, location, url });
//     });

//     return events;
// };

// app.get("/events/internationalconferencealerts", async (req, res) => {
//     const today = new Date();
//     const futureMonthIndex = (today.getMonth() + 2) % 12;
//     const monthNames = [
//         "january", "february", "march", "april", "may", "june",
//         "july", "august", "september", "october", "november", "december"
//     ];
//     const futureMonthName = monthNames[futureMonthIndex];
//     const month = req.query.month || futureMonthName;
//     const page = req.query.page || 1;
//     const baseUrl = `https://internationalconferencealerts.com/searchfresult?country=USA&topic=&subtopic=&month=${month}`;

//     try {
//         const { htmlContent, clicked } = await get_internationalconferencealert_source_html(baseUrl, page);

//         if (!clicked && page !== 1 && page !== '1') {
//             return res.json({ success: false, message: "Automation completed", events: [] });
//         }

//         const events = await get_internationalconferencealert_events(htmlContent);

//         res.json({ success: true, message: "Automation completed", events: events });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// const get_internationalconferencealert_event_source_html = async (finalUrl) => {
//     const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             "--no-sandbox",
//             "--disable-setuid-sandbox",
//             "--disable-dev-shm-usage",
//             "--disable-gpu",
//             "--disable-features=IsolateOrigins,site-per-process",
//             "--disable-blink-features=AutomationControlled",
//         ],
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );
//     await page.setExtraHTTPHeaders({
//         'Accept-Language': 'en-US,en;q=0.9',
//     });

//     await page.goto(finalUrl, { waitUntil: 'networkidle2' });
//     // Wait for any pagination links to load
//     await page.waitForSelector('a.outside-click', { timeout: 10000 });

//     const htmlContent = await page.content();
//     await browser.close();

//     return htmlContent;
// }

// app.get("/events/internationalconferencealert/:eventId", async (req, res) => {
//     const eventId = req.params.eventId;
//     const baseUrl = `https://internationalconferencealerts.com/eventdetails.php?id=${eventId}`;

//     try {
//         const htmlContent = await get_internationalconferencealert_event_source_html(baseUrl);
//         const $ = cheerio.load(htmlContent);

//         const link = $("a.outside-click").filter(function () {
//             return $(this).text().trim() === "Click here";
//         }).attr("href");

//         res.json({ success: true, message: "Automation completed", event_url: link });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Server Configurations
