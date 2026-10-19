"use client";

import React, { useState, useEffect } from "react";
import { ApiConfig } from "@/lib/types";
import { X, CheckCircle2, AlertCircle, RefreshCw, Key, Layers, Cloud } from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/constants";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [workerUrl, setWorkerUrl] = useState(config.workerUrl || "");
  const [accountId, setAccountId] = useState(config.accountId || "");
  const [apiToken, setApiToken] = useState(config.apiToken || "");
  const [agnesApiKey, setAgnesApiKey] = useState(config.agnesApiKey || "");
  const [selectedModel, setSelectedModel] = useState(
    config.selectedModel || "agnes-image-2.5-flash"
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    previewImage?: string;
  } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAgnesModel = selectedModel.toLowerCase().startsWith("agnes");

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "a majestic golden retriever sitting on grass under warm sunset, oil painting",
          accountId: accountId.trim(),
          apiToken: apiToken.trim(),
          agnesApiKey: agnesApiKey.trim(),
          workerUrl: workerUrl.trim(),
          model: selectedModel,
          isTest: true,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.image) {
        setTestResult({
          success: true,
          message: `Berhasil terhubung. Model "${data.model || selectedModel}" aktif dan sukses menghasilkan gambar uji coba.`,
          previewImage: data.image,
        });
      } else {
        setTestResult({
          success: false,
          message:
            data.message ||
            data.error ||
            `Koneksi gagal dengan kode respon HTTP ${res.status}.`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal (${err.message || "Network error"}). Pastikan server di localhost:9000 sedang aktif.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      workerUrl: workerUrl.trim(),
      accountId: accountId.trim(),
      apiToken: apiToken.trim(),
      agnesApiKey: agnesApiKey.trim(),
      selectedModel,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalApiTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70"
    >
      <div className="panel-frame max-w-2xl w-full max-h-[92vh] flex flex-col bg-white border-2 border-[#141413] overflow-hidden">
        {/* Header Meja Kendali Modal */}
        <div className="border-b-2 border-[#141413] bg-[#141413] text-[#F4F1EA] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="step-pill bg-[#2B2B29] text-[#F4F1EA] border border-[#5A5852]">
              Konfigurasi Mesin
            </span>
            <h2 id="modalApiTitle" className="text-base sm:text-lg font-bold tracking-tight text-[#F4F1EA]">
              Pengaturan Generator Gambar
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded bg-[#252523] hover:bg-[#383835] text-[#F4F1EA] border border-[#5A5852] min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            aria-label="Tutup pengaturan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 bg-white">
          {/* Pilihan Model */}
          <div>
            <label htmlFor="modalSelectModel" className="block text-xs font-mono-tabular font-bold uppercase text-[#141413] mb-1.5">
              Model Render Gambar Aktif
            </label>
            <select
              id="modalSelectModel"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-field font-mono-tabular text-sm"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
            <p className="text-xs text-[#484641] mt-1.5 leading-relaxed">
              Model yang dipilih akan digunakan secara konsisten oleh seluruh tim pada sesi tebak rekonstruksi prompt.
            </p>
          </div>

          {/* Form Kredensial Agnes AI / Cloudflare Workers */}
          {isAgnesModel ? (
            <div className="panel-muted p-4 space-y-3 border border-[#C8C3B8]">
              <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
                <span className="font-mono-tabular text-xs font-bold uppercase text-[#141413]">
                  Kredensial Agnes AI Hub
                </span>
                <span className="text-[11px] font-mono-tabular text-[#165B33] bg-[#D8F3DC] px-2 py-0.5 rounded border border-[#52B788]">
                  Model Aktif
                </span>
              </div>

              <div>
                <label htmlFor="inputAgnesApiKey" className="block text-xs font-mono-tabular text-[#484641] mb-1">
                  Kunci API Agnes (Opsional jika sudah di .env.local)
                </label>
                <input
                  id="inputAgnesApiKey"
                  type="password"
                  value={agnesApiKey}
                  onChange={(e) => setAgnesApiKey(e.target.value)}
                  placeholder="Ketik Kunci API Agnes AI jika ada..."
                  className="input-field font-mono-tabular text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="panel-muted p-4 space-y-3 border border-[#C8C3B8]">
              <div className="flex items-center justify-between border-b border-[#C8C3B8] pb-2">
                <span className="font-mono-tabular text-xs font-bold uppercase text-[#141413]">
                  Kredensial Cloudflare Workers AI
                </span>
              </div>

              <div>
                <label htmlFor="inputWorkerUrl" className="block text-xs font-mono-tabular text-[#484641] mb-1">
                  URL Cloudflare Worker Proxy
                </label>
                <input
                  id="inputWorkerUrl"
                  type="text"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  placeholder="https://workers-ai-image.username.workers.dev"
                  className="input-field font-mono-tabular text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inputAccountId" className="block text-xs font-mono-tabular text-[#484641] mb-1">
                    ID Akun Cloudflare
                  </label>
                  <input
                    id="inputAccountId"
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="32 karakter heksadesimal"
                    className="input-field font-mono-tabular text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="inputApiToken" className="block text-xs font-mono-tabular text-[#484641] mb-1">
                    Token API Cloudflare Workers
                  </label>
                  <input
                    id="inputApiToken"
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Token API Cloudflare"
                    className="input-field font-mono-tabular text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hasil Pengujian Koneksi */}
          {testResult && (
            <div
              className={`p-4 rounded-[6px] text-xs font-mono-tabular border space-y-2 ${
                testResult.success
                  ? "bg-[#D8F3DC] text-[#081C15] border-[#52B788]"
                  : "bg-[#FBE8E6] text-[#B83214] border-[#B83214]"
              }`}
              role="alert"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#165B33]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#B83214]" />
                )}
                <span>{testResult.success ? "Uji Coba Berhasil" : "Uji Coba Gagal"}</span>
              </div>
              <p className="leading-relaxed">{testResult.message}</p>

              {testResult.previewImage && (
                <div className="pt-2">
                  <span className="block text-[11px] text-[#484641] mb-1">
                    Hasil Render Gambar Uji Coba:
                  </span>
                  <div className="p-1 rounded bg-white border border-[#C8C3B8] inline-block">
                    <img
                      src={testResult.previewImage}
                      alt="Pratinjau Uji Coba Generator"
                      className="w-32 h-32 object-cover rounded-[3px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#C8C3B8] bg-[#F4F1EA] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestConnection}
            className="btn-secondary text-xs font-mono-tabular"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{testing ? "Menguji Koneksi..." : "Uji Coba Render Gambar"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs font-mono-tabular"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary text-xs font-mono-tabular"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
