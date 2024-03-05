import { createContext, useContext, useEffect, useState } from "react";
import { subMinutes } from "date-fns";
import axios from "axios";
import { Box, Flex, Select, Spinner } from "@chakra-ui/react";
import { Chart as ChartJS, LineElement, LinearScale, TimeScale, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";
import autocolors from "chartjs-plugin-autocolors";
import "./chartjs-adapter";

export const MonitorPage = () => {
    const [filters, setFilters] = useState<MonitorFilters>({ start: subMinutes(new Date(), 30), nbMinutes: 30 });
    const [data, setData] = useState<MonitorData>(null as any);
    const [isLoading, setIsLoading] = useState(false);

    console.log(data);

    useEffect(() => {
        setIsLoading(true);
        getRequests(filters).then((data) => {
            setData(data);
            setIsLoading(false);
        });
    }, [filters]);

    return (
        <MonitorContext.Provider value={{ filters, setFilters, data }}>
            <MonitorFilters />
            {isLoading ? <Spinner /> : data ? <Monitor /> : null}
        </MonitorContext.Provider>
    );
};

const getRequests = async (filters: MonitorFilters) => {
    const resp = await axios.get(`${import.meta.env.VITE_API_URL}/requests`, { params: filters });
    return resp.data;
};

const MonitorFilters = () => {
    const { filters, setFilters } = useContext(MonitorContext);

    const setStartDate = (nbMinutes: number) => {
        setFilters({ ...filters, start: subMinutes(new Date(), nbMinutes), nbMinutes });
    };

    return (
        <Flex>
            <Box>
                <Select onChange={(e) => setStartDate(Number(e.target.value))} value={filters.nbMinutes}>
                    {minuteButtons.map((button) => (
                        <option key={button.value} value={button.value}>
                            {button.label}
                        </option>
                    ))}
                </Select>
            </Box>
        </Flex>
    );
};

const minuteButtons = [
    { label: "1 minute", value: 1 },
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "6 hours", value: 360 },
    { label: "12 hours", value: 720 },
    { label: "24 hours", value: 1440 },
];

type MonitorFilters = {
    start: Date;
    end?: Date;
    nbMinutes: number;
};

type MonitorData = {
    minutes: MonitorItem[];
    seconds: MonitorItem[];
};

type MonitorItem = {
    count: string;
    date: string;
};

ChartJS.register(LineElement, LinearScale, TimeScale, PointElement);

const Monitor = () => {
    const { data } = useContext(MonitorContext);

    const minutesDataset = {
        label: "minutes",
        data: data.minutes.map((item) => ({
            x: new Date(item.date).toISOString(),
            y: Number(item.count),
        })),
        borderColor: "#0a9396",
    };
    const secondsDataset = {
        label: "seconds",
        data: data.seconds.map((item) => ({
            x: new Date(item.date).toISOString(),
            y: Number(item.count),
        })),
        borderColor: "#005f73",
    };

    const dates = [...minutesDataset.data, ...secondsDataset.data].map((item) => new Date(item.x));
    const minDate = new Date(Math.min(...(dates as any))).toISOString();
    const maxDate = new Date(Math.max(...(dates as any))).toISOString();

    const secondsRateLimitDataset = {
        label: "seconds rate limit",
        data: [
            { x: minDate, y: 20 },
            { x: maxDate, y: 20 },
        ],
        borderColor: "#ae2012",
    };

    const minutesRateLimitDataset = {
        label: "minutes rate limit",
        data: [
            { x: minDate, y: 50 },
            { x: maxDate, y: 50 },
        ],
        borderColor: "#9b2226",
    };

    return (
        <Line
            data={{ datasets: [minutesDataset, secondsDataset, secondsRateLimitDataset, minutesRateLimitDataset] }}
            plugins={[autocolors as any]}
            options={{
                scales: {
                    x: {
                        type: "time",
                        time: { unit: "hour", displayFormats: { hour: "HH:mm" } },
                        ticks: {
                            maxTicksLimit: 6,
                        },
                    },
                    y: {},
                },
                plugins: {
                    autocolors: {
                        enabled: false,
                    },
                },
            }}
        />
    );
};

const MonitorContext = createContext<{
    filters: MonitorFilters;
    setFilters: (filter: MonitorFilters) => void;
    data: MonitorData;
}>({
    filters: { start: subMinutes(new Date(), 30), nbMinutes: 30 },
    setFilters: null as any,
    data: null as any,
});
