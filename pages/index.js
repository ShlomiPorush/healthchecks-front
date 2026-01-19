import Head from "next/head";
import { useState, useMemo } from "react";

import useSWR from "swr";
import fetcher from "../libs/fetch";

import Check from "../components/Check";

import { XIcon, SearchIcon, SortAscendingIcon, SortDescendingIcon, EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

export async function getServerSideProps() {
    return {
        props: {
            dashboardName: process.env.NEXT_PUBLIC_NAME || "Healthchecks Dashboard",
        },
    };
}

export default function Home({ dashboardName }) {
    const { data: checks, error: errorChecks } = useSWR(
        "/v1/checks/",
        fetcher,
        { refreshInterval: 30000, refreshWhenHidden: true }
    );

    // State for search, sort, and filter
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
    const [hideHealthy, setHideHealthy] = useState(false);
    const [statusFilter, setStatusFilter] = useState(null); // null = all, or "up", "down", "running", "paused", "grace"

    // Process checks with search, sort, and filter
    const processedChecks = useMemo(() => {
        if (!checks || !checks.checks) return null;

        let filtered = [...checks.checks];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(check =>
                check.name.toLowerCase().includes(query) ||
                check.tags.toLowerCase().includes(query)
            );
        }

        // Filter out healthy checks if hideHealthy is true
        if (hideHealthy) {
            filtered = filtered.filter(check => check.status !== "up" || check.started);
        }

        // Filter by status if selected
        if (statusFilter) {
            if (statusFilter === "running") {
                filtered = filtered.filter(check => check.started);
            } else if (statusFilter === "up") {
                filtered = filtered.filter(check => check.status === "up" && !check.started);
            } else {
                filtered = filtered.filter(check => check.status === statusFilter && !check.started);
            }
        }

        // Sort alphabetically
        filtered.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (sortOrder === "asc") {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        // Sort errors first (after alphabetical sort)
        filtered.sort((a) => (a.status === "down" ? -1 : 0));

        return filtered;
    }, [checks, searchQuery, sortOrder, hideHealthy, statusFilter]);

    // Group checks by tags
    const checksOrdered = useMemo(() => {
        if (!processedChecks) return {};

        const grouped = {};
        processedChecks.forEach((check) => {
            const tagsArray = check.tags.split(" ").sort().join("");

            if (!grouped[tagsArray]) {
                const status = {
                    up: 0,
                    down: 0,
                    paused: 0,
                    grace: 0,
                    running: 0,
                };

                grouped[tagsArray] = {
                    items: [check],
                    tags: check.tags,
                    status: status,
                };
            } else {
                grouped[tagsArray].items.push(check);
            }

            // Count running separately
            if (check.started) {
                grouped[tagsArray].status.running++;
            } else {
                grouped[tagsArray].status[check.status]++;
            }
        });

        return grouped;
    }, [processedChecks]);

    // Calculate stats based on search query only (ignoring status filters) to keep counts visible
    const statsChecks = useMemo(() => {
        if (!checks || !checks.checks) return [];
        let filtered = [...checks.checks];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(check =>
                check.name.toLowerCase().includes(query) ||
                check.tags.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [checks, searchQuery]);

    const checksUp = statsChecks.filter(c => c.status === "up" && !c.started).length;
    const checksError = statsChecks.filter(c => c.status === "down").length;
    const checksRunning = statsChecks.filter(c => c.started).length;
    const checksPaused = statsChecks.filter(c => c.status === "paused").length;
    const checksGrace = statsChecks.filter(c => c.status === "grace" && !c.started).length;

    return (
        <div>
            <Head>
                <title>{dashboardName}</title>
                <meta
                    name="description"
                    content="All your healthchecks at a glance"
                />
                <meta
                    property="og:title"
                    content={dashboardName}
                />
                <meta property="og:image" content="og_image.png" />
                <meta
                    property="og:description"
                    content="All your healthchecks at a glance"
                />
                <link
                    rel="icon"
                    href={`/${checksError ? "favicon-error.ico" : "favicon.ico"
                        }`}
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1 user-scalable=no"
                />
                <link rel="apple-touch-icon" href="apple-touch-icon.png" />
            </Head>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {errorChecks && (
                    <div className="text-center m-8">
                        <div className="bg-red-600 h-16 w-16 p-3 rounded-full flex items-center justify-center mx-auto mb-3">
                            <XIcon className="w-full text-white" />
                        </div>
                        <h1 className="text-red-500 font-bold text-xl">
                            There was an error fetching the API
                        </h1>
                    </div>
                )}

                {checks && (
                    <div className="my-5">
                        <div className="w-36 h-36 relative mx-auto my-1s">
                            <div
                                className={`rounded-full absolute inset-6 bg-gradient-to-b ${checksError
                                    ? "from-red-400 border-red-500"
                                    : "from-green-400 border-green-500"
                                    } border-2 opacity-20 z-0 animate-ping-slow`}
                            ></div>
                            <div
                                className={`rounded-full absolute inset-4 ${checksError ? "bg-red-400" : "bg-green-400"
                                    } bg-opacity-10 z-10 animate-pulse`}
                            ></div>
                            <div
                                className={`rounded-full absolute inset-6 inse bg-gradient-to-b ${checksError
                                    ? "from-red-500 to-red-600 border-red-500"
                                    : "from-green-500 to-green-600 border-green-500"
                                    } border-4  z-20`}
                            ></div>
                        </div>

                        {/* Stats Cards - always visible buttons */}
                        <div className="grid grid-cols-5 gap-2 mt-4 max-w-md mx-auto">
                            <button
                                onClick={() => setStatusFilter(statusFilter === "up" ? null : "up")}
                                className={`rounded-lg px-1 py-2 text-center transition-all ${statusFilter === "up" ? "ring-2 ring-green-400 bg-green-900/80" : "bg-green-900/30"} border border-green-700 hover:bg-green-800/50`}
                            >
                                <div className="text-xl font-bold text-green-400">{checksUp}</div>
                                <div className="text-xs text-green-500 truncate">Healthy</div>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === "down" ? null : "down")}
                                className={`rounded-lg px-1 py-2 text-center transition-all ${statusFilter === "down" ? "ring-2 ring-red-400 bg-red-900/80" : "bg-red-900/30"} border border-red-700 hover:bg-red-800/50`}
                            >
                                <div className="text-xl font-bold text-red-400">{checksError}</div>
                                <div className="text-xs text-red-500 truncate">Down</div>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === "running" ? null : "running")}
                                className={`rounded-lg px-1 py-2 text-center transition-all ${statusFilter === "running" ? "ring-2 ring-blue-400 bg-blue-900/80" : "bg-blue-900/30"} border border-blue-700 hover:bg-blue-800/50`}
                            >
                                <div className="text-xl font-bold text-blue-400">{checksRunning}</div>
                                <div className="text-xs text-blue-500 truncate">Running</div>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === "paused" ? null : "paused")}
                                className={`rounded-lg px-1 py-2 text-center transition-all ${statusFilter === "paused" ? "ring-2 ring-gray-400 bg-gray-800/80" : "bg-gray-800/30"} border border-gray-600 hover:bg-gray-700/50`}
                            >
                                <div className="text-xl font-bold text-gray-400">{checksPaused}</div>
                                <div className="text-xs text-gray-500 truncate">Paused</div>
                            </button>
                            <button
                                onClick={() => setStatusFilter(statusFilter === "grace" ? null : "grace")}
                                className={`rounded-lg px-1 py-2 text-center transition-all ${statusFilter === "grace" ? "ring-2 ring-yellow-400 bg-yellow-900/80" : "bg-yellow-900/30"} border border-yellow-700 hover:bg-yellow-800/50`}
                            >
                                <div className="text-xl font-bold text-yellow-400">{checksGrace}</div>
                                <div className="text-xs text-yellow-500 truncate">Grace</div>
                            </button>
                        </div>
                        {statusFilter && (
                            <div className="text-center mt-2">
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className="text-xs text-gray-500 hover:text-white"
                                >
                                    Clear filter ×
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Control Bar - Mobile Optimized (Single Row) */}
                {checks && (
                    <div className="mb-6 flex flex-row gap-2 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 text-white pl-9 pr-2 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Sort Button */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="flex items-center justify-center p-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors shrink-0"
                            title={sortOrder === "asc" ? "Sort A-Z" : "Sort Z-A"}
                        >
                            {sortOrder === "asc" ? (
                                <SortAscendingIcon className="h-5 w-5" />
                            ) : (
                                <SortDescendingIcon className="h-5 w-5" />
                            )}
                        </button>

                        {/* Hide Healthy Toggle */}
                        <button
                            onClick={() => setHideHealthy(!hideHealthy)}
                            className={`flex items-center justify-center p-2 rounded-lg border transition-colors shrink-0 ${hideHealthy
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                                }`}
                            title={hideHealthy ? "Show all checks" : "Hide healthy checks"}
                        >
                            {hideHealthy ? (
                                <EyeOffIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                )}

                {checks && (
                    <div className="space-y-12 grid grid-cols-1 mb-8">
                        {Object.keys(checksOrdered).length > 0 ? (
                            Object.entries(checksOrdered).map((checkTag, i) => (
                                <div key={i}>
                                    <div className="text-left">
                                        <div className="text-gray-400 inline-flex items-center flex-wrap mb-3 font-semibold">
                                            {checkTag[1].tags || "Untagged"}

                                            {checkTag[1].status.up !== 0 && (
                                                <span
                                                    className="bg-green-900 px-3 py-1 rounded-full ml-2 font-bold text-white"
                                                    title="Up"
                                                >
                                                    {checkTag[1].status.up}
                                                </span>
                                            )}
                                            {checkTag[1].status.running !== 0 && (
                                                <span
                                                    className="bg-blue-900 px-3 py-1 rounded-full ml-2 font-bold text-white"
                                                    title="Running"
                                                >
                                                    {checkTag[1].status.running}
                                                </span>
                                            )}
                                            {checkTag[1].status.down !== 0 && (
                                                <span
                                                    className="bg-red-900 px-3 py-1 rounded-full ml-2 font-bold text-white"
                                                    title="Down"
                                                >
                                                    {checkTag[1].status.down}
                                                </span>
                                            )}
                                            {checkTag[1].status.paused !==
                                                0 && (
                                                    <span
                                                        className="bg-gray-800 px-3 py-1 rounded-full ml-2 font-bold text-white"
                                                        title="Paused"
                                                    >
                                                        {checkTag[1].status.paused}
                                                    </span>
                                                )}
                                            {checkTag[1].status.grace !== 0 && (
                                                <span
                                                    className="bg-yellow-800 px-3 py-1 rounded-full ml-2 font-bold text-white"
                                                    title="Grace"
                                                >
                                                    {checkTag[1].status.grace}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {checkTag[1] &&
                                            checkTag[1].items instanceof
                                            Array &&
                                            checkTag[1].items.map(
                                                (check, i) => (
                                                    <Check
                                                        name={check.name}
                                                        status={check.status}
                                                        started={check.started}
                                                        last_ping={
                                                            check.last_ping
                                                        }
                                                        tz={check.tz}
                                                        key={i}
                                                        last_duration={
                                                            check.last_duration
                                                                ? check.last_duration
                                                                : null
                                                        }
                                                        schedule={check.schedule}
                                                    />
                                                )
                                            )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                {searchQuery || hideHealthy
                                    ? "No checks match your filters"
                                    : "No checks found"}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

