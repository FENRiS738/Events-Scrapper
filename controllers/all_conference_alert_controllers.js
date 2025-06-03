import { get_default_month } from "../helpers/general_helpers.js";
import { get_listing_source_html, extract_events, get_event_source_html, extract_event_details } from "../helpers/all_conference_alert_helpers.js";

const root = (req, res) => {
    res.json({
        success: true,
        message: "Accepted"
    })
};

const get_events = async (req, res) => {
    const month = req.query.month || get_default_month();
    const page = req.query.page || 1;

    const base_url = `https://www.allconferencealert.com/usa/${month}`;
    const { html_content, clicked } = await get_listing_source_html(base_url, page);

    if (!clicked && page !== 1 && page !== '1') {
        return res.json({ success: false, message: "Page not found!", events: [] });
    }

    const events = await extract_events(html_content);
    res.json({ success: true, message: "Events extracted successfully!", events: events });
}

const get_event_by_id = async (req, res) => {
    
    
    if (!req.params.event_id) {
        return res.json({ success: false, message: "Accepted", event_details: "Event not found!" })
    }

    const event_id = req.params.event_id;
    const base_url = `https://www.allconferencealert.com/event/${event_id}`
    const html_content = await get_event_source_html(base_url);
    const event = await extract_event_details(html_content)
    res.json(
        {
            success: true,
            message: "Event extracted successfully!",
            event: event
        }
    )
}

export { root, get_events, get_event_by_id }