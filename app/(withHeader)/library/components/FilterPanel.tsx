import { Dropdown } from "@/components/Dropdown";
import { SPECIAL_ITEMS } from "./types";
import type { SpecialFilter } from "./types";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  colorOptions: FilterOption[];
  typeOptions: FilterOption[];
  bloomOptions: FilterOption[];
  rarityOptions: FilterOption[];
  tagOptions: FilterOption[];
  colorFilter: string[];
  setColorFilter: (v: string[]) => void;
  typeFilter: string[];
  setTypeFilter: (v: string[]) => void;
  bloomFilter: string[];
  setBloomFilter: (v: string[]) => void;
  rarityFilter: string[];
  setRarityFilter: (v: string[]) => void;
  tagsFilter: string[];
  setTagsFilter: (v: string[]) => void;
  specialFilter: SpecialFilter;
  setSpecialFilter: (v: SpecialFilter) => void;
}

export function FilterPanel({
  colorOptions, typeOptions, bloomOptions, rarityOptions, tagOptions,
  colorFilter, setColorFilter,
  typeFilter, setTypeFilter,
  bloomFilter, setBloomFilter,
  rarityFilter, setRarityFilter,
  tagsFilter, setTagsFilter,
  specialFilter, setSpecialFilter,
}: FilterPanelProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {colorOptions.length > 1  && <Dropdown multi label="Color"   value={colorFilter}  onValueChange={setColorFilter}  items={colorOptions}  className="w-28" />}
      {typeOptions.length > 1   && <Dropdown multi label="Type"    value={typeFilter}   onValueChange={setTypeFilter}   items={typeOptions}   className="w-28" />}
      {bloomOptions.length > 1  && <Dropdown multi label="Bloom"   value={bloomFilter}  onValueChange={setBloomFilter}  items={bloomOptions}  className="w-28" />}
      {rarityOptions.length > 1 && <Dropdown multi label="Rarity"  value={rarityFilter} onValueChange={setRarityFilter} items={rarityOptions} className="w-28" />}
      {tagOptions.length > 0 && <Dropdown multi label="Tags" value={tagsFilter} onValueChange={setTagsFilter} items={tagOptions} className="w-28" />}
      <Dropdown label="Special" value={specialFilter} onValueChange={(v) => setSpecialFilter(v as SpecialFilter)} items={SPECIAL_ITEMS} className="w-32" />
    </div>
  );
}
