import { Router } from "express";
import { root, get_events, get_event_by_id } from "../controllers/all_conference_alert_controllers.js";

const router = Router();

router.get('/', root)
router.get('/events', get_events)
router.get('/events/:event_id', get_event_by_id)

export default router;
