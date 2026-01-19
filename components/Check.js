import { CheckIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/outline";
import { PauseIcon } from "@heroicons/react/outline";
import { ExclamationCircleIcon } from "@heroicons/react/outline";
import { PlayIcon } from "@heroicons/react/solid";
import { ClockIcon } from "@heroicons/react/solid";
import { RefreshIcon } from "@heroicons/react/solid";

import moment from "moment";
import { cronToHuman } from "../libs/cronToHuman";

const Check = ({ name, status, started, last_ping, tz, last_duration, schedule }) => {
    // Determine display status: if started is true, show "running" state
    const displayStatus = started ? "running" : status;

    const statusConfig = {
        up: {
            bg: "bg-green-600",
            border: "border-green-700",
            icon: <CheckIcon className="h-5 w-5 text-white" />,
            title: "Up",
        },
        down: {
            bg: "bg-red-600",
            border: "border-red-700",
            icon: <XIcon className="h-5 w-5 text-white" />,
            title: "Down",
        },
        paused: {
            bg: "bg-gray-600",
            border: "border-gray-700",
            icon: <PauseIcon className="h-5 w-5 text-white" />,
            title: "Paused",
        },
        grace: {
            bg: "bg-yellow-600",
            border: "border-yellow-800",
            icon: <ExclamationCircleIcon className="h-5 w-5 text-white" />,
            title: "Grace",
        },
        running: {
            bg: "bg-blue-600",
            border: "border-blue-700",
            icon: <RefreshIcon className="h-5 w-5 text-white animate-spin" />,
            title: "Running",
        },
        new: {
            bg: "bg-purple-600",
            border: "border-purple-700",
            icon: <PlayIcon className="h-5 w-5 text-white" />,
            title: "New",
        },
    };

    const config = statusConfig[displayStatus] || statusConfig.up;

    return (
        <div
            className={`text-white bg-gray-800 rounded-lg p-4 flex items-center justify-between relative`}
        >
            <div
                className={`rounded-full flex justify-center items-center p-1 mr-4 relative z-10 ${config.bg}`}
                title={config.title}
            >
                {config.icon}
            </div>
            <div className="flex-1 relative z-10">
                <h3 className="font-semibold mb-1 leading-tight">{name}</h3>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>
                        {moment(last_ping).diff(moment(), "days") > -100
                            ? moment(last_ping).fromNow()
                            : moment(last_ping).format("DD MMMM YYYY")}
                    </span>
                    {last_duration && (
                        <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 text-gray-500 mr-1" />
                            {last_duration} sec
                        </span>
                    )}
                    {schedule && (
                        <span className="text-gray-600 text-xs" title={schedule}>
                            {cronToHuman(schedule)}
                        </span>
                    )}
                </div>
            </div>

            {displayStatus !== "up" && (
                <div className={`absolute inset-0 border-2 ${config.border} rounded-lg z-0`}></div>
            )}
        </div>
    );
};

export default Check;

