"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Menu from "@/components/Menu";
import Dropdown from "@/components/Dropdown";
import Input from "@/components/Input";
import Checkbox from "@/components/Checkbox";
import Modal from "@/components/Modal";
import Tabs from "@/components/Tabs";
import { SettingsIcon, TrashIcon, PencilIcon, SunIcon, MoonIcon, SunMoonIcon, LayersIcon, GridIcon, ListIcon, BookmarkIcon } from "lucide-react";

export default function ComponentPage() {
  const [fruit, setFruit] = useState("apple");
  const [theme, setTheme] = useState("system");
  const [layer, setLayer] = useState("layer1");
  const [inputVal, setInputVal] = useState("");
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);
  const [tab, setTab] = useState("collection");
  const [viewTab, setViewTab] = useState("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="p-8 flex flex-col gap-12">

      {/* Buttons */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Button</h2>
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
            alt="demo background"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 flex gap-3 items-center justify-center flex-wrap p-6">
            <Button highContrast={false}>Primary</Button>
            <Button variant="secondary" highContrast={false}>Secondary</Button>
            <Button variant="transparent" highContrast={false}>Transparent</Button>
            <Button icon={SettingsIcon} highContrast={false} />
            <Button icon={PencilIcon} highContrast={false}>Edit</Button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Tabs</h2>
        <div className="flex flex-col gap-2">
          <Tabs
            value={tab}
            onValueChange={setTab}
            tabs={[
              { value: "collection", label: "Collection" },
              { value: "wishlist", label: "Wishlist" },
              { value: "trades", label: "Trades" },
            ]}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
            {tab === "collection" && "Viewing your card collection."}
            {tab === "wishlist" && "Cards you want to acquire."}
            {tab === "trades" && "Active trade offers and history."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Tabs
            value={viewTab}
            onValueChange={setViewTab}
            tabs={[
              { value: "grid", label: "Grid", icon: GridIcon },
              { value: "list", label: "List", icon: ListIcon },
              { value: "saved", label: "Saved", icon: BookmarkIcon },
            ]}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
            {viewTab === "grid" && "Cards displayed in a grid layout."}
            {viewTab === "list" && "Cards displayed in a list layout."}
            {viewTab === "saved" && "Your bookmarked cards."}
          </p>
        </div>
      </section>

      {/* Modal */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Modal</h2>
        <div>
          <div className="flex gap-3">
            <Button onClick={() => setModalOpen(true)} highContrast>Open Modal</Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>Delete Item</Button>
          </div>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Modal Title</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">This is a modal. Click outside or press Escape to close.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="transparent" highContrast onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button highContrast onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
          <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Delete Item</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="transparent" highContrast onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setDeleteModalOpen(false)}>Delete</Button>
            </div>
          </Modal>
        </div>
      </section>

      {/* Dropdowns */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Dropdown</h2>
        <div className="flex gap-4 items-start flex-wrap">
          <Dropdown
            value={fruit}
            onValueChange={setFruit}
            items={[
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
              { value: "blueberry", label: "Blueberry" },
              { value: "dragonfruit", label: "Dragon Fruit (long label)" },
            ]}
          />

          <Dropdown
            value={theme}
            onValueChange={setTheme}
            items={[
              { value: "light", label: "Light", icon: SunIcon },
              { value: "dark", label: "Dark", icon: MoonIcon },
              { value: "system", label: "System", icon: SunMoonIcon },
            ]}
          />

          <Dropdown
            value={layer}
            onValueChange={setLayer}
            items={[
              { value: "layer1", label: "Layer 1", icon: LayersIcon },
              { value: "layer2", label: "Layer 2", icon: LayersIcon },
              { value: "layer3", label: "Layer 3", icon: LayersIcon },
            ]}
          />
        </div>
      </section>

      {/* Inputs */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Input</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <Input placeholder="Default..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
          <Input label="With Label" placeholder="Enter value..." />
          <Input label="Disabled" placeholder="Can't touch this" disabled />
          <Input label="Password" type="password" placeholder="••••••••" />
        </div>
      </section>

      {/* Checkboxes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Checkbox</h2>
        <div className="flex gap-6 items-center flex-wrap">
          <Checkbox checked={checked1} onCheckedChange={setChecked1} label="Unchecked" />
          <Checkbox checked={checked2} onCheckedChange={setChecked2} label="Checked" />
          <Checkbox checked={checked3} onCheckedChange={setChecked3} label="With a longer label" />
          <Checkbox checked={true} onCheckedChange={() => {}} label="Disabled checked" disabled />
          <Checkbox checked={false} onCheckedChange={() => {}} label="Disabled unchecked" disabled />
        </div>
      </section>

      {/* Menus */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Menu</h2>
        <div className="flex gap-4 items-center flex-wrap">

          {/* Icon trigger */}
          <Menu
            icon={SettingsIcon}
            sections={[
              {
                label: "Actions",
                items: [
                  { label: "Edit", icon: PencilIcon, onClick: () => {} },
                  { label: "Delete", icon: TrashIcon, onClick: () => {} },
                ],
              },
            ]}
          />

          {/* Text trigger */}
          <Menu
            trigger="Options"
            variant="secondary"
            sections={[
              {
                items: [
                  { label: "Edit", icon: PencilIcon, onClick: () => {} },
                  { label: "Delete", icon: TrashIcon, onClick: () => {} },
                ],
              },
            ]}
          />

          {/* Sectioned menu */}
          <Menu
            icon={SunIcon}
            trigger="Theme"
            variant="button"
            sections={[
              {
                label: "Theme",
                items: [
                  { label: "Light", icon: SunIcon, active: true, onClick: () => {} },
                  { label: "Dark", icon: MoonIcon, onClick: () => {} },
                  { label: "System", icon: SunMoonIcon, onClick: () => {} },
                ],
              },
            ]}
          />

          {/* Custom children trigger */}
          <Menu
            sections={[
              {
                label: "Actions",
                items: [
                  { label: "Edit", icon: PencilIcon, onClick: () => {} },
                  { label: "Delete", icon: TrashIcon, onClick: () => {} },
                ],
              },
            ]}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 text-sm text-zinc-700 dark:text-zinc-300">
              Custom Trigger
            </div>
          </Menu>

        </div>
      </section>

    </div>
  );
}
