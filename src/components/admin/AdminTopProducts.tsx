import { useMemo } from "react";
import { Order } from "@/types/admin";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminTopProductsProps {
    orders: Order[];
}

export function AdminTopProducts({ orders }: AdminTopProductsProps) {
    const topProducts = useMemo(() => {
        const productStats: Record<
            string,
            { name: string; revenue: number; count: number }
        > = {};

        orders.forEach((order) => {
            const name = order.app_name || "Unknown Product";
            if (!productStats[name]) {
                productStats[name] = { name, revenue: 0, count: 0 };
            }
            productStats[name].revenue += Number(order.total_price || 0);
            productStats[name].count += 1;
        });

        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders]);

    return (
        <Card className="col-span-1 h-full min-h-[400px]">
            <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Sales</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topProducts.length > 0 ? (
                            topProducts.map((product) => (
                                <TableRow key={product.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">{product.count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        ${product.revenue.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                    No sales data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
