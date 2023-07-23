import { Apex, InsertRank, summoner } from "@/db/schema";
import { createCanvas } from "canvas";
import { Chart, LineController, LineElement, LinearScale, PointElement, TimeScale, Title } from "chart.js";
import { getTodaysRanks } from "../generate24hRecap";
import { getMinifiedRank, getRankFromTotalLp, getTotalLpFromRank, makeTierData } from "../lol/lps";

import { db } from "@/db/db";
import { endOfYesterday, format, startOfYesterday } from "date-fns";
import { and, eq } from "drizzle-orm";
import ChartDataLabels from "chartjs-plugin-datalabels";
import autocolors from "chartjs-plugin-autocolors";
import "./chartjs-adapter";

Chart.register(TimeScale, LinearScale, LineController, PointElement, LineElement, ChartDataLabels, autocolors, Title);
export const generateRankGraph = async (channelId: string, apex: Apex) => {
    const summoners = await db.select().from(summoner).where(eq(summoner.channelId, channelId));

    const ranksBySummoner: Record<string, (InsertRank & { total: number })[]> = {};
    const tierData = makeTierData(apex);

    for (const summ of summoners) {
        const { dayRanks, startRank, endRank } = await getTodaysRanks(
            and(eq(summoner.channelId, channelId), eq(summoner.puuid, summ.puuid))
        );

        if (!startRank || !endRank) continue;
        const ranks = [
            { ...startRank, createdAt: startOfYesterday() },
            ...dayRanks.reverse(),
            { ...endRank, createdAt: endOfYesterday() },
        ];
        ranksBySummoner[summ.currentName] = ranks.map((r) => ({ ...r, total: getTotalLpFromRank(r, tierData) }));
    }

    const datasets = Object.entries(ranksBySummoner).map(([name, ranks]) => ({
        label: name,
        data: ranks.map((r) => ({ x: r.createdAt.toISOString(), y: r.total })),
        fill: false,
        datalabels: {
            display: (ctx: any) => (ctx.dataIndex === Math.floor(ctx.dataset.data.length / 2) ? "auto" : false),
            formatter: (_, ctx: any) => {
                return ctx.chart.data.datasets[ctx.datasetIndex].label;
            },
        },
    }));

    const canvas = createCanvas(466 * 2, 700);
    const ctx = canvas.getContext("2d") as any;

    new Chart(ctx, {
        type: "line",
        data: {
            datasets,
        },
        options: {
            scales: {
                x: {
                    type: "time",
                    time: { unit: "hour", displayFormats: { hour: "HH:mm" } },
                    ticks: {
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    ticks: {
                        callback: (value: number | string) => {
                            return getMinifiedRank(getRankFromTotalLp(value as number, tierData));
                        },
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
                title: {
                    display: true,
                    text: `Elo chart (${format(startOfYesterday(), "dd/MM/yyyy")})`,
                    font: {
                        size: 20,
                    },
                },
                datalabels: {
                    backgroundColor: (context) => context.dataset.backgroundColor as any,
                    borderRadius: 4,
                    color: "white",
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                    padding: 6,
                    align: "end",
                    anchor: "end",
                },
                autocolors: {
                    enabled: true,
                },
            },
        },
        plugins: [bgColorPlugin, ChartDataLabels, autocolors as any],
    });

    return canvas.toBuffer();
};

const bgColorPlugin = {
    id: "customCanvasBackgroundColor",
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = options.color || "#ffffff";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
};
