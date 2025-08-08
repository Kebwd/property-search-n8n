const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const response = await fetch(url);
const text = await response.text();
// Middleware
app.use(express.static("public"));
app.use(express.json());

// Initial workflow trigger endpoint
app.post("/api/start-workflow", async (req, res) => {
    try {
        // Replace with your actual n8n webhook URL
        const n8nWebhookUrl =
            "https://rightpick.app.n8n.cloud/webhook/497742a8-de85-414d-aa5e-12b5c510e7c7";

        const response = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error triggering n8n workflow:", error);
        res.status(500).json({
            error: "Failed to start workflow",
            message: error.message,
        });
    }
});

// Resume workflow endpoint - handles both JSON and file uploads
app.post("/api/resume-workflow", async (req, res) => {
    try {
        const resumeUrl = req.query.resumeUrl;

        if (!resumeUrl) {
            return res
                .status(400)
                .json({ error: "resumeUrl query parameter is required" });
        }

        // For JSON requests, use parsed body
        if (req.headers["content-type"]?.includes("application/json")) {
            const response = await fetch(resumeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body),
            });

            if (!data) {
              return res.json({
                error: true,
                message: "Empty or invalid response from Octoparse",
                websites: [],
                matched: false,
                count: 0
              });
            }
            let data;
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.error("Failed to parse JSON (application/json):", e);
              return res.status(500).json({
                error: true,
                message: "Invalid JSON response from n8n",
                raw: text
              });
            }
            res.json(data);
        } else {
            // For file uploads and other content types, stream the raw request
            const response = await fetch(resumeUrl, {
                method: "POST",
                body: req,
                duplex: "half",
                headers: {
                    "Content-Type": req.headers["content-type"],
                    "Content-Length": req.headers["content-length"],
                },
            });

            let data;
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.error("Failed to parse JSON (streamed request):", e);
              return res.status(500).json({
                error: true,
                message: "Invalid JSON response from n8n",
                raw: text
              });
            }
            res.json(data);
        }
    } catch (error) {
        console.error("Error resuming n8n workflow:", error);
        res.status(500).json({
            error: "Failed to resume workflow",
            message: error.message,
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
