"use client";

import Button from "@/components/Button";

export default function ComponentPage() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Button</h2>

        {/* Demo surface with image behind buttons */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
            alt="demo background"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 flex gap-3 items-center justify-center flex-wrap p-6">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button>Rounded Primary</Button>
            <Button variant="secondary">Rounded Secondary</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
