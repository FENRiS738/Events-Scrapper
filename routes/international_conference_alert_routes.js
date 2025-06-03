import { Router } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { root, get_events, get_event_by_id } from "../controllers/international_conference_alert_controllers.js";

puppeteer.use(StealthPlugin());

const router = Router();

router.get('/', root)
router.get('/events', get_events)
router.get('/events/:event_id', get_event_by_id)

export default router;
