"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string | any;
  className?: string;
  initialPreviewUrl?: string | null;
}

export function AvatarUpload({
  value,
  onChange,
  error,
  className,
  initialPreviewUrl,
}: AvatarUploadProps) {
  const t = useTranslations("auth.register");
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Generate preview URL when value changes
  React.useEffect(() => {
    if (!value) {
      setPreviewUrl(initialPreviewUrl || null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    // Clean up
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value, initialPreviewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onChange(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onButtonClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative group cursor-pointer flex items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          // Size
          "h-28 w-28",
          // Default styling (when no avatar)
          "border border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
          // Dragging state styling
          isDragActive && "border-solid border-primary bg-primary/10 scale-105 ring-4 ring-primary/20",
          // Error styling
          error && "border-destructive bg-destructive/5 hover:border-destructive hover:bg-destructive/10"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={t("avatar")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <>
            {/* Preview image */}
            <img
              src={previewUrl}
              alt="Avatar Preview"
              className="h-full w-full rounded-full object-cover"
            />
            {/* Hover camera overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </div>
            {/* Delete button badge */}
            <button
              onClick={handleRemove}
              className="absolute -top-1 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-input text-foreground hover:bg-primary hover:text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
              title="Remove"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {/* Camera / Upload Placeholder Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={cn(
                "w-8 h-8 text-muted-foreground/60 group-hover:text-primary/70 transition-colors duration-200",
                error && "text-destructive/60 group-hover:text-destructive/70"
              )}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
          </div>
        )}
      </div>
      <p className={cn(
        "text-xs text-muted-foreground text-center max-w-[200px]",
        error && "text-destructive"
      )}>
        {error ? (typeof error === 'string' ? error : error[0] || error.message) : t("avatarHint")}
      </p>
    </div>
  );
}
