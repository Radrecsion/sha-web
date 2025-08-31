import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import BaseModal from "./BaseModal";

export default function HelpModal({ isOpen, onClose }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/src/assets/help.md") // pastikan path sesuai
        .then((res) => res.text())
        .then((text) => setContent(text))
        .catch((err) => {
          console.error("Gagal load help.md:", err);
          setContent("# Error\nGagal memuat panduan.");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseModal title="Help & Documentation" onClose={onClose} width="w-[600px]">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </BaseModal>
  );
}
