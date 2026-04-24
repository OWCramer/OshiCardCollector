import { useGetCardPricingQuery } from "@/generated/graphql";
import { useMemo } from "react";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";

export function PricingCharts({ cardId }: { cardId: number }) {
  const { data, loading, error } = useGetCardPricingQuery({ variables: { id: cardId } });

  const newestPricing = useMemo(() => {
    if (!data?.card?.pricingData?.dailyPrices) return null;

    return data.card.pricingData.dailyPrices.reduce((newest, current) => {
      if (!newest) return current;
      return new Date(current.date) > new Date(newest.date) ? current : newest;
    }, data.card.pricingData.dailyPrices[0]);
  }, [data]);

  if (loading || error || !data || !newestPricing) return null;

  return (
    <div className="flex flex-col gap-4">
      <Divider />
      <div className="flex flex-row justify-between items-center">
        <h2 className="font-semibold opacity-80">
          Current pricing data as of {new Date(newestPricing.date)?.toLocaleDateString()}
        </h2>
        <Button
          className="text-sm"
          href={`https://www.tcgplayer.com/product/${data.card?.tcgId}`}
          external
          variant="secondary"
        >
          See in TCGPlayer
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
          <h3>Low price</h3>
          <p className="text-2xl font-semibold">
            {newestPricing.lowPrice?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
          <h3>Mid price</h3>
          <p className="text-2xl font-semibold">
            {newestPricing.midPrice?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
          <h3>High price</h3>
          <p className="text-2xl font-semibold">
            {newestPricing.highPrice?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
