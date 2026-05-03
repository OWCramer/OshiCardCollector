"use client";

import { Input } from "@/components/Input";
import { Dropdown } from "@/components/Dropdown";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ArrowDownIcon, ArrowUpIcon, SlidersHorizontalIcon } from "lucide-react";
import { classes } from "@/lib/classes";
import { SORT_ITEMS, type SortField, type useCardLibraryFilters } from "./useCardLibraryFilters";

type Controls = ReturnType<typeof useCardLibraryFilters>;

const ICON_BTN =
  "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-inset transition-colors ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10";

export function CardLibraryControls({
  search,
  setSearch,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  colorFilter,
  setColorFilter,
  typeFilter,
  setTypeFilter,
  bloomFilter,
  setBloomFilter,
  rarityFilter,
  setRarityFilter,
  tagsFilter,
  setTagsFilter,
  supportTypeFilter,
  setSupportTypeFilter,
  filterOptions,
  hasActiveFilters,
  clearFilters,
  showFilters,
  setShowFilters,
}: Controls) {
  return (
    <>
      <div className="flex gap-2 shrink-0">
        <Input
          className="flex-1 min-w-0"
          placeholder="Search cards…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => setShowFilters(true)}
          className={classes(ICON_BTN, "relative")}
          title="Filters"
        >
          <SlidersHorizontalIcon size={14} />
          {hasActiveFilters && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
          )}
        </button>
      </div>

      <div className="flex gap-2 shrink-0">
        <Dropdown
          className="flex-1 min-w-0"
          value={sortField}
          onValueChange={(v) => setSortField(v as SortField)}
          items={SORT_ITEMS}
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className={ICON_BTN}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
        </button>
      </div>

      <Modal title="Filters" isOpen={showFilters} onClose={() => setShowFilters(false)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.colorOptions.length > 1 && (
              <Dropdown
                multi
                label="Color"
                value={colorFilter}
                onValueChange={setColorFilter}
                items={filterOptions.colorOptions}
                className="w-28"
              />
            )}
            {filterOptions.typeOptions.length > 1 && (
              <Dropdown
                multi
                label="Type"
                value={typeFilter}
                onValueChange={setTypeFilter}
                items={filterOptions.typeOptions}
                className="w-28"
              />
            )}
            {filterOptions.bloomOptions.length > 1 && (
              <Dropdown
                multi
                label="Bloom"
                value={bloomFilter}
                onValueChange={setBloomFilter}
                items={filterOptions.bloomOptions}
                className="w-28"
              />
            )}
            {filterOptions.rarityOptions.length > 1 && (
              <Dropdown
                multi
                label="Rarity"
                value={rarityFilter}
                onValueChange={setRarityFilter}
                items={filterOptions.rarityOptions}
                className="w-28"
              />
            )}
            {filterOptions.tagOptions.length > 0 && (
              <Dropdown
                multi
                label="Tags"
                value={tagsFilter}
                onValueChange={setTagsFilter}
                items={filterOptions.tagOptions}
                className="w-28"
              />
            )}
            {filterOptions.supportTypeOptions.length > 1 && (
              <Dropdown
                multi
                label="Support Type"
                value={supportTypeFilter}
                onValueChange={setSupportTypeFilter}
                items={filterOptions.supportTypeOptions}
                className="w-36"
              />
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="transparent"
              highContrast
              onClick={() => {
                clearFilters();
                setShowFilters(false);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
