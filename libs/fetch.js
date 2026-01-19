// Fetcher for SWR - calls our internal API route (server-side proxy)
export default async function fetcher(url) {
    // Map the Healthchecks API path to our internal API route
    const internalUrl = url.replace("/v1/checks/", "/api/checks");

    const res = await fetch(internalUrl, {
        headers: {
            "Accept": "application/json",
        },
    });

    if (!res.ok) {
        const error = new Error("Failed to fetch data");
        error.status = res.status;
        throw error;
    }

    return res.json();
}

