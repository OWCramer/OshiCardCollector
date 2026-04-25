import { Card, useGetCardPricingQuery } from "@/generated/graphql";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { classes } from "@/lib/classes";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { getSwatchesSync } from "colorthief";
import { useTheme } from "@/lib/theme-context";
import { useBreakpoint } from "@/lib/useBreakpoint";

function PriceCard({
  title,
  price,
  className,
}: {
  title: string;
  price?: number | null;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "@container flex flex-col gap-1 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm w-full h-20",
        className
      )}
    >
      <h3>{title}</h3>
      <p className="text-2xl @max-[142px]:text-xl @max-[120px]:text-base font-semibold">
        {price?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }) ?? "N/A"}
      </p>
    </div>
  );
}

function getVarianceColor(variance: string) {
  if (variance.startsWith("N") || variance === "$0.00") return "font-semibold";
  return variance.startsWith("-") ? "text-red-400 font-semibold" : "text-green-400 font-semibold";
}

type ChartData = {
  date: string;
  highPrice?: number | null;
  midPrice?: number | null;
  lowPrice?: number | null;
  marketPrice?: number | null;
}[];

export function PricingCharts({ card }: { card: Card }) {
  const cardId = card.id;
  const { data, loading, error } = useGetCardPricingQuery({ variables: { id: cardId } });
  const [primaryImageColor, setPrimaryImageColor] = useState<string | undefined>();
  const [textImageColor, setTextImageColor] = useState<string | undefined>();
  const [currentView, setCurrentView] = useState<"day" | "month">("day");
  const { isDarkMode } = useTheme();
  const isMedium = useBreakpoint("md");

  const newestPricing = useMemo(() => {
    if (!data?.card?.pricingData?.dailyPrices) return null;

    return data.card.pricingData.dailyPrices.reduce((newest, current) => {
      if (!newest) return current;
      return new Date(current.date) > new Date(newest.date) ? current : newest;
    }, data.card.pricingData.dailyPrices[0]);
  }, [data]);

  const chartData: ChartData = useMemo(() => {
    if (currentView === "day") {
      if (!data?.card?.pricingData?.dailyPrices?.some((item) => item.marketPrice !== null))
        return [];
      return (
        [...(data?.card?.pricingData?.dailyPrices as ChartData)].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ) ?? []
      );
    }

    return (
      [...(data?.card?.pricingData?.monthlyPrices as ChartData)].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ) ?? []
    );
  }, [data, currentView]);

  const marketPriceStats = useMemo(() => {
    const marketPrices = chartData
      .map((item) => item.marketPrice)
      .filter((price): price is number => price !== null && price !== undefined);

    const formatUsd = (value: number) =>
      value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });

    if (marketPrices.length === 0) {
      return {
        allTimeHigh: "N/A",
        allTimeLow: "N/A",
        averageVariance: "N/A",
      };
    }

    const allTimeHigh = Math.max(...marketPrices);
    const allTimeLow = Math.min(...marketPrices);

    const variances = marketPrices.slice(1).map((price, index) => price - marketPrices[index]);
    const averageVariance =
      variances.length > 0
        ? variances.reduce((total, variance) => total + variance, 0) / variances.length
        : null;

    return {
      allTimeHigh: formatUsd(allTimeHigh),
      allTimeLow: formatUsd(allTimeLow),
      averageVariance: averageVariance === null ? "N/A" : formatUsd(averageVariance),
    };
  }, [chartData]);

  useEffect(() => {
    if (card.imageUrl) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = `/_next/image?url=${card.imageUrl}&w=384&q=75`;

      image.addEventListener("load", () => {
        const swatches = getSwatchesSync(image);

        let color;
        let textColor;
        if (isDarkMode) {
          color =
            swatches?.Vibrant?.color?.hex() ??
            swatches?.LightVibrant?.color?.hex() ??
            swatches?.LightMuted?.color?.hex();
          textColor = swatches?.LightMuted?.color?.hex() ?? swatches?.LightVibrant?.color?.hex();
        } else {
          color =
            swatches?.Vibrant?.color?.hex() ??
            swatches?.DarkVibrant?.color?.hex() ??
            swatches?.Muted?.color?.hex();
          textColor = swatches?.DarkMuted?.color?.hex() ?? swatches?.DarkVibrant?.color?.hex();
        }

        setPrimaryImageColor(color);
        setTextImageColor(textColor);
      });
    }
  }, [card.imageUrl, isDarkMode]);

  if (loading || error || !data || !newestPricing) return null;

  return (
    <div className="flex flex-col gap-4">
      <Divider />
      <div className="flex flex-row justify-between items-center">
        <h2 className="font-semibold opacity-80">
          Current pricing data as of {new Date(newestPricing.date)?.toLocaleDateString()}
        </h2>
        <Button
          highContrast={!isDarkMode}
          className="text-sm"
          href={`https://www.tcgplayer.com/product/${data.card?.tcgId}`}
          external
          variant="transparent"
        >
          See in TCGPlayer
        </Button>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:grid grid-cols-3 gap-2.5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 sm:flex flex-col gap-2.5">
            <PriceCard title="Market price" price={newestPricing.marketPrice} />
            <div className="flex flex-col gap-2 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm w-full h-31">
              <h3>Market price stats</h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <p className="opacity-80">Average variance</p>
                  <p className={getVarianceColor(marketPriceStats.averageVariance)}>
                    {marketPriceStats.averageVariance}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="opacity-80">{currentView === "day" ? "30 day" : "12 month"} high</p>
                  <p className="font-semibold">{marketPriceStats.allTimeHigh}</p>
                </div>
                <div className="flex justify-between">
                  <p className="opacity-80">{currentView === "day" ? "30 day" : "12 month"} low</p>
                  <p className="font-semibold">{marketPriceStats.allTimeLow}</p>
                </div>
              </div>
            </div>
            <div className="grid-cols-2 gap-2.5 hidden sm:grid">
              <Button
                highContrast={!isDarkMode}
                variant={currentView === "day" ? "primary" : "secondary"}
                className="w-full"
                onClick={() => setCurrentView("day")}
              >
                {isMedium ? "Daily view" : "Daily"}
              </Button>
              <Button
                highContrast={!isDarkMode}
                variant={currentView === "day" ? "secondary" : "primary"}
                className="w-full text-nowrap"
                onClick={() => setCurrentView("month")}
              >
                {isMedium ? "Monthly view" : "Monthly"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm w-full col-span-2 h-50 sm:h-65">
            {chartData.length > 0 ? (
              <LineChart
                style={{
                  width: "100%",
                  height: "100%",
                }}
                responsive
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="date"
                  padding={{ left: 10, right: 10 }}
                  tickFormatter={(value) => value.slice(0, 10)}
                />
                <YAxis
                  dataKey="marketPrice"
                  width="auto"
                  stroke={isDarkMode ? "#ffffff50" : "#00000080"}
                  domain={[0, (dataMax) => Number.parseFloat((dataMax * 1.25).toFixed(2))]}
                  tickFormatter={(value) => value.toFixed(2)}
                  padding={{ bottom: 20 }}
                />
                <Tooltip
                  cursor={false}
                  labelFormatter={(value) => value.slice(0, 10)}
                  itemStyle={{
                    color: textImageColor,
                  }}
                  contentStyle={{
                    backgroundColor: "transparent",
                    backdropFilter: "blur(10px)",
                    borderColor: isDarkMode ? "#ffffff50" : "#00000080",
                    borderRadius: "0.75rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="marketPrice"
                  name="Market price"
                  stroke={primaryImageColor ?? "#3182bd"}
                  strokeWidth={8}
                  dot={{
                    r: 4,
                    strokeWidth: 0,
                    fill: primaryImageColor ?? "#3182bd",
                  }}
                  activeDot={{ stroke: "#ffffff" }}
                />
              </LineChart>
            ) : (
              <div className="flex w-full justify-center h-full items-center opacity-50 text-xl">
                No data available :(
              </div>
            )}
          </div>
          <div className="grid-cols-2 gap-2.5 grid sm:hidden">
            <Button
              highContrast={!isDarkMode}
              variant={currentView === "day" ? "primary" : "secondary"}
              className="w-full"
              onClick={() => setCurrentView("day")}
            >
              Daily view
            </Button>
            <Button
              highContrast={!isDarkMode}
              variant={currentView === "day" ? "secondary" : "primary"}
              className="w-full"
              onClick={() => setCurrentView("month")}
            >
              Monthly view
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <h2 className="font-semibold opacity-80">Current TCGPlayer listing prices</h2>
          <div className="flex flex-col sm:grid grid-cols-3 gap-2.5">
            <PriceCard title="Low price" price={newestPricing.lowPrice} />
            <PriceCard title="Mid price" price={newestPricing.midPrice} />
            <PriceCard title="High price" price={newestPricing.highPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}
