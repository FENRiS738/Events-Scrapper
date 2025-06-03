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
