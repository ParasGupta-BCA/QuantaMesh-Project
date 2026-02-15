import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Review } from "@/types/admin";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

interface AdminReviewStatsProps {
    reviews: Review[];
}

export function AdminReviewStats({ reviews }: AdminReviewStatsProps) {
    const { data, averageRating, totalReviews } = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;

        reviews.forEach((review) => {
            const rating = Math.round(review.rating);
            if (rating >= 1 && rating <= 5) {
                counts[rating as keyof typeof counts]++;
                sum += rating;
            }
        });

        const chartData = [
            { name: "5 Stars", value: counts[5], color: "#22c55e" },
            { name: "4 Stars", value: counts[4], color: "#84cc16" },
            { name: "3 Stars", value: counts[3], color: "#eab308" },
            { name: "2 Stars", value: counts[2], color: "#f97316" },
            { name: "1 Star", value: counts[1], color: "#ef4444" },
        ];

        const avg = reviews.length > 0 ? sum / reviews.length : 0;

        return { data: chartData, averageRating: avg, totalReviews: reviews.length };
    }, [reviews]);

    return (
        <Card className="col-span-1 h-full min-h-[400px]">
            <CardHeader>
                <CardTitle>Review Analytics</CardTitle>
                <CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= Math.round(averageRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-1">
                            ({totalReviews} reviews)
                        </span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {totalReviews > 0 ? (
                    <ResponsiveContainer width="100%" height="220">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={60}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            {payload[0].payload.name}
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].value} count
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No reviews data available
                    </div>
                )}

                {totalReviews > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="flex flex-col items-center justify-center p-2 bg-green-500/10 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground mb-1">Scale of Positive</span>
                            <span className="text-xl font-bold text-green-500">
                                {Math.round(((data.find(d => d.name === "5 Stars")?.value || 0) + (data.find(d => d.name === "4 Stars")?.value || 0)) / totalReviews * 100)}%
                            </span>
                            <span className="text-xs text-muted-foreground">4 & 5 Stars</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-red-500/10 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground mb-1">Scale of Negative</span>
                            <span className="text-xl font-bold text-red-500">
                                {Math.round(((data.find(d => d.name === "1 Star")?.value || 0) + (data.find(d => d.name === "2 Stars")?.value || 0)) / totalReviews * 100)}%
                            </span>
                            <span className="text-xs text-muted-foreground">1 & 2 Stars</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
