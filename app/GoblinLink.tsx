"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";

export function GoblinLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline underline-offset-2 cursor-pointer decoration-dotted opacity-75 hover:opacity-100 transition-opacity"
      >
        goblin
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Goblin" className="sm:max-w-2xl">
        <div className="aspect-video w-full">
          <iframe
            src="https://www.youtube.com/embed/xa8FDRLqLJc?autoplay=1"
            title="The goblin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-xl"
          />
        </div>
      </Modal>
    </>
  );
}
