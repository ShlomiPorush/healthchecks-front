// Server-side API proxy for Healthchecks API
// This keeps the API key secure and doesn't require client access to the HC API

export default async function handler(req, res) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_APIKEY;

    if (!apiUrl || !apiKey) {
        console.error("API configuration missing:", { apiUrl: !!apiUrl, apiKey: !!apiKey });
        return res.status(500).json({
            error: "Server configuration error. Please set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_APIKEY."
        });
    }

    try {
        const response = await fetch(`${apiUrl}/v1/checks/`, {
            headers: {
                "Accept": "application/json",
                "X-Api-Key": apiKey,
            },
        });

        if (!response.ok) {
            console.error("Healthchecks API error:", response.status, response.statusText);
            return res.status(response.status).json({
                error: `Healthchecks API error: ${response.statusText}`
            });
        }

        const data = await response.json();

        // Cache for 10 seconds to reduce API calls
        res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");
        res.status(200).json(data);
    } catch (error) {
        console.error("Failed to fetch from Healthchecks API:", error);
        res.status(500).json({ error: "Failed to fetch data from Healthchecks API" });
    }
}
