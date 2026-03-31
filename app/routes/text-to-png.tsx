/// <reference path="../types/virtual-public-ttf-fonts.d.ts" />

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/text-to-png";
import { getStoredFontData, listStoredFonts, saveTtfFont, type StoredFontMeta } from "../utils/fontStorage";
import { publicTtfFonts } from "virtual:public-ttf-fonts";

type LoadedFont = {
	id: string;
	family: string;
};

const DEFAULT_FAMILY = "ui-sans-serif, system-ui, sans-serif";
const PREVIEW_MAX_W = 900;
const PREVIEW_MAX_H = 420;

const PUBLIC_TTF_FONTS: Array<{ id: string; name: string; url: string }> = publicTtfFonts;
const DEFAULT_PUBLIC_FONT_ID = PUBLIC_TTF_FONTS[0]?.id ?? "";

const PRESET_STROKE = "#2f343a";
const COLOR_PRESETS: Array<{ name: string; fill: string; stroke: string }> = [
	// Morandi-ish muted text colors; stroke is unified for a cleaner system
	{ name: "霧藍", fill: "#6f86a6", stroke: PRESET_STROKE },
	{ name: "霧綠", fill: "#7f8f87", stroke: PRESET_STROKE },
	{ name: "玫瑰灰", fill: "#b08f8f", stroke: PRESET_STROKE },
	{ name: "奶茶灰", fill: "#c6b3a1", stroke: PRESET_STROKE },
	{ name: "薰衣草灰", fill: "#9c94a6", stroke: PRESET_STROKE },
];

export function meta({}: Route.MetaArgs) {
	return [{ title: "Text to PNG" }];
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(1)} KB`;
	const mb = kb / 1024;
	return `${mb.toFixed(1)} MB`;
}

async function ensureFontLoaded(fontId: string, familyName: string): Promise<void> {
	const data = await getStoredFontData(fontId);
	if (!data) throw new Error("找不到字體資料，請重新上傳");

	const blob = new Blob([data], { type: "font/ttf" });
	const blobUrl = URL.createObjectURL(blob);
	try {
		const fontFace = new FontFace(familyName, `url(${blobUrl})`);
		await fontFace.load();
		document.fonts.add(fontFace);
	} finally {
		URL.revokeObjectURL(blobUrl);
	}
}

async function ensurePublicFontLoaded(url: string, familyName: string): Promise<void> {
	const fontFace = new FontFace(familyName, `url(${url})`);
	await fontFace.load();
	document.fonts.add(fontFace);
}

export default function TextToPngRoute() {
	const [fonts, setFonts] = useState<StoredFontMeta[]>([]);
	const [selectedFontId, setSelectedFontId] = useState<string>(DEFAULT_PUBLIC_FONT_ID);
	const [selectedFontFamily, setSelectedFontFamily] = useState<string>(DEFAULT_FAMILY);
	const [text, setText] = useState<string>("在這裡輸入文字\n第二行");
	const [color, setColor] = useState<string>(COLOR_PRESETS[0]?.fill ?? "#000000");
	const [fontWeight, setFontWeight] = useState<number>(600);
	const [borderWidth, setBorderWidth] = useState<number>(0);
	const [borderColor, setBorderColor] = useState<string>(PRESET_STROKE);
	const [error, setError] = useState<string>("");
	const [pngUrl, setPngUrl] = useState<string>("");
	const [transparentCheck, setTransparentCheck] = useState<null | { isTransparent: boolean; cornerAlphas: number[] }>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [isLoadingFonts, setIsLoadingFonts] = useState<boolean>(true);

	const loadedFontsRef = useRef<Map<string, LoadedFont>>(new Map());
	const lastObjectUrlRef = useRef<string>("");
	const lastPngBlobRef = useRef<Blob | null>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			try {
				setIsLoadingFonts(true);
				const list = await listStoredFonts();
				if (cancelled) return;
				setFonts(list);
			} catch (e) {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : "字體載入失敗");
			} finally {
				if (!cancelled) setIsLoadingFonts(false);
			}
		}

		run();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return () => {
			if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
		};
	}, []);

	useEffect(() => {
		if (!selectedFontId) {
			setSelectedFontFamily(DEFAULT_FAMILY);
			return;
		}
		const loaded = loadedFontsRef.current.get(selectedFontId);
		setSelectedFontFamily(loaded?.family ?? DEFAULT_FAMILY);
	}, [selectedFontId]);

	async function refreshFontList() {
		const list = await listStoredFonts();
		setFonts(list);
	}

	async function loadFontIfNeeded(id: string): Promise<string> {
		const existing = loadedFontsRef.current.get(id);
		if (existing) return existing.family;

		const familyName = `UploadedFont_${id.replace(/[^a-zA-Z0-9_\-]/g, "_")}`;
		if (id.startsWith("public:")) {
			const url = PUBLIC_TTF_FONTS.find((f) => f.id === id)?.url;
			if (!url) throw new Error("找不到內建字體檔案");
			await ensurePublicFontLoaded(url, familyName);
		} else {
			await ensureFontLoaded(id, familyName);
		}
		loadedFontsRef.current.set(id, { id, family: familyName });
		return familyName;
	}

	async function handleUpload(file: File | null) {
		setError("");
		if (!file) return;

		try {
			const saved = await saveTtfFont(file);
			await refreshFontList();
			await handleSelectFont(saved.id);
		} catch (e) {
			setError(e instanceof Error ? e.message : "上傳失敗");
		}
	}

	async function handleSelectFont(id: string) {
		setError("");
		setSelectedFontId(id);
		setPngUrl("");

		if (!id) {
			setSelectedFontFamily(DEFAULT_FAMILY);
			return;
		}

		try {
			const family = await loadFontIfNeeded(id);
			setSelectedFontFamily(family);
		} catch (e) {
			setSelectedFontFamily(DEFAULT_FAMILY);
			setError(e instanceof Error ? e.message : "字體載入失敗");
		}
	}

	useEffect(() => {
		if (!DEFAULT_PUBLIC_FONT_ID) return;
		// Load the default bundled font on first mount so preview is correct immediately.
		void handleSelectFont(DEFAULT_PUBLIC_FONT_ID);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function drawPreview() {
		if (typeof window === "undefined") return;
		const canvas = previewCanvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		const lines = (text || "").split("\n").map((l) => l.replace(/\r/g, ""));
		const fontSize = 96;
		const lineHeight = Math.ceil(fontSize * 1.25);
		const padding = 24 + Math.max(0, borderWidth);

		ctx.font = `${fontWeight} ${fontSize}px ${selectedFontFamily}`;
		ctx.textBaseline = "top";
		ctx.lineJoin = "round";
		ctx.lineCap = "round";

		let maxWidth = 1;
		for (const line of lines) {
			const m = ctx.measureText(line || " ");
			maxWidth = Math.max(maxWidth, m.width);
		}

		const baseW = Math.ceil(maxWidth + padding * 2);
		const baseH = Math.ceil(lines.length * lineHeight + padding * 2);
		const scale = Math.min(1, PREVIEW_MAX_W / Math.max(1, baseW), PREVIEW_MAX_H / Math.max(1, baseH));

		canvas.width = Math.max(1, Math.ceil(baseW * scale));
		canvas.height = Math.max(1, Math.ceil(baseH * scale));

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(scale, 0, 0, scale, 0, 0);

		ctx.font = `${fontWeight} ${fontSize}px ${selectedFontFamily}`;
		ctx.textBaseline = "top";
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.fillStyle = color;

		if (borderWidth > 0) {
			ctx.strokeStyle = borderColor;
			ctx.lineWidth = borderWidth;
		}

		for (let i = 0; i < lines.length; i++) {
			const x = padding;
			const y = padding + i * lineHeight;
			const line = lines[i] || " ";

			if (borderWidth > 0) {
				ctx.strokeText(line, x, y);
			}
			ctx.fillText(line, x, y);
		}
	}

	useEffect(() => {
		let raf = 0;
		raf = window.requestAnimationFrame(() => drawPreview());
		return () => window.cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text, color, fontWeight, borderWidth, borderColor, selectedFontFamily]);

	async function generatePng() {
		setError("");
		setIsGenerating(true);
		setTransparentCheck(null);

		try {
			if (typeof window === "undefined") {
				throw new Error("此功能只能在瀏覽器使用");
			}

			const family = selectedFontId ? await loadFontIfNeeded(selectedFontId) : DEFAULT_FAMILY;

			const lines = (text || "")
				.split("\n")
				.map((l) => l.replace(/\r/g, ""));

			const fontSize = 96;
			const lineHeight = Math.ceil(fontSize * 1.25);
			const padding = 24 + Math.max(0, borderWidth);

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d", { alpha: true });
			if (!ctx) throw new Error("無法獲取 Canvas 上下文");

			ctx.font = `${fontWeight} ${fontSize}px ${family}`;
			ctx.textBaseline = "top";
			ctx.lineJoin = "round";
			ctx.lineCap = "round";

			let maxWidth = 1;
			for (const line of lines) {
				const m = ctx.measureText(line || " ");
				maxWidth = Math.max(maxWidth, m.width);
			}

			canvas.width = Math.ceil(maxWidth + padding * 2);
			canvas.height = Math.ceil(lines.length * lineHeight + padding * 2);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Must reset font after resizing canvas
			ctx.font = `${fontWeight} ${fontSize}px ${family}`;
			ctx.textBaseline = "top";
			ctx.lineJoin = "round";
			ctx.lineCap = "round";

			ctx.fillStyle = color;

			if (borderWidth > 0) {
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
			}

			for (let i = 0; i < lines.length; i++) {
				const x = padding;
				const y = padding + i * lineHeight;
				const line = lines[i] || " ";

				if (borderWidth > 0) {
					ctx.strokeText(line, x, y);
				}
				ctx.fillText(line, x, y);
			}

			// Transparency sanity check: corners should be fully transparent (alpha=0)
			try {
				const w = canvas.width;
				const h = canvas.height;
				const points: Array<[number, number]> = [
					[0, 0],
					[Math.max(0, w - 1), 0],
					[0, Math.max(0, h - 1)],
					[Math.max(0, w - 1), Math.max(0, h - 1)],
				];
				const alphas = points.map(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] ?? 255);
				const isTransparent = alphas.every((a) => a === 0);
				setTransparentCheck({ isTransparent, cornerAlphas: alphas });
			} catch {
				// ignore (some environments may block getImageData)
			}

			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG 產生失敗"))), "image/png");
			});
			lastPngBlobRef.current = blob;

			if (lastObjectUrlRef.current) {
				URL.revokeObjectURL(lastObjectUrlRef.current);
			}

			const url = URL.createObjectURL(blob);
			lastObjectUrlRef.current = url;
			setPngUrl(url);
		} catch (e) {
			setError(e instanceof Error ? e.message : "PNG 產生失敗");
		} finally {
			setIsGenerating(false);
		}
	}

	async function shareToPhone() {
		setError("");
		try {
			if (typeof window === "undefined") throw new Error("此功能只能在瀏覽器使用");
			const blob = lastPngBlobRef.current;
			if (!blob || !pngUrl) throw new Error("請先輸出 PNG");

			const file = new File([blob], downloadName, { type: "image/png" });
			const nav = navigator as Navigator & {
				canShare?: (data: { files: File[] }) => boolean;
				share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
			};

			if (typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
				await nav.share({ files: [file], title: "PNG", text: "" });
				return;
			}

			// Fallback: open image in a new tab so mobile users can long-press to save to Photos
			window.open(pngUrl, "_blank", "noopener,noreferrer");
		} catch (e) {
			setError(e instanceof Error ? e.message : "分享失敗");
		}
	}

	const selectedFontMeta = useMemo(() => fonts.find((f) => f.id === selectedFontId), [fonts, selectedFontId]);
	const downloadName = useMemo(() => {
		const base = selectedFontMeta?.name ? `${selectedFontMeta.name}_text` : "text";
		return `${base}.png`;
	}, [selectedFontMeta]);

	function applyColorPreset(preset: { fill: string; stroke: string }) {
		setColor(preset.fill);
		setBorderColor(preset.stroke);
	}

	return (
		<main className="min-h-screen p-3 sm:p-6">
			<div className="mx-auto max-w-5xl">
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-lg md:text-2xl font-semibold tracking-tight">文字圖片</h1>
					<div
						className="rounded-full border border-gray-200 dark:border-gray-800 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap"
						title={
							transparentCheck
								? `角落 alpha: ${transparentCheck.cornerAlphas.join(", ")}`
								: "輸出/預覽後會顯示透明檢查"
						}
					>
						透明 {transparentCheck ? (transparentCheck.isTransparent ? "OK" : "? ") : "…"}
					</div>
				</div>

				<div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 md:auto-rows-min">
					<section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 md:p-4 md:col-start-1 md:row-start-1">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div className="space-y-1">
								<label className="block text-xs font-medium text-gray-700 dark:text-gray-200">上傳 TTF</label>
								<input
									type="file"
									accept=".ttf,font/ttf"
									onChange={(e) => handleUpload(e.currentTarget.files?.[0] ?? null)}
									className="block w-full text-[16px] file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-[16px] file:font-medium hover:file:bg-gray-200 dark:file:bg-gray-800 dark:hover:file:bg-gray-700"
								/>
							</div>
							<div className="space-y-1">
								<label className="block text-xs font-medium text-gray-700 dark:text-gray-200">字體</label>
								<select
									value={selectedFontId}
									onChange={(e) => handleSelectFont(e.currentTarget.value)}
									disabled={isLoadingFonts}
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-2 py-2 text-[16px]"
								>
									<option value="">系統預設</option>
									{PUBLIC_TTF_FONTS.map((f) => (
										<option key={f.id} value={f.id}>
											{f.name}
										</option>
									))}
									{fonts.map((f) => (
										<option key={f.id} value={f.id}>
											{f.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</section>

					<section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 md:p-4 md:col-start-2 md:row-start-1 md:row-span-2">
						<div className="flex items-center justify-between">
							<div className="text-xs font-medium text-gray-700 dark:text-gray-200">即時預覽</div>
							<div className="text-xs text-gray-600 dark:text-gray-300">調整會即時更新</div>
						</div>
						<div className="mt-2 overflow-auto max-h-[240px] md:max-h-[420px] rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2">
							<canvas ref={previewCanvasRef} style={{ maxWidth: "100%", height: "auto" }} />
						</div>

						<div className="mt-3 hidden md:flex items-center gap-2">
							<button
								type="button"
								onClick={generatePng}
								disabled={isGenerating}
								className="rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-[16px] font-medium disabled:opacity-60"
							>
								{isGenerating ? "輸出中…" : "輸出 PNG"}
							</button>

							<button
								type="button"
								onClick={() => {
									if (pngUrl) window.open(pngUrl, "_blank", "noopener,noreferrer");
								}}
								disabled={!pngUrl}
								className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-[16px] font-medium disabled:opacity-50"
								title="開新分頁預覽/長按存圖"
							>
								開啟
							</button>

							<button
								type="button"
								onClick={shareToPhone}
								disabled={!pngUrl}
								className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-[16px] font-medium disabled:opacity-50"
							>
								手機分享
							</button>
						</div>
						<div className="mt-2 hidden md:block text-xs text-gray-600 dark:text-gray-300">
							{pngUrl ? "iPhone：用「手機分享」最省步驟；Google Photos 可能把透明變白底。" : "先按「輸出 PNG」才可下載/分享。"}
						</div>
					</section>

					<section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 md:p-4 md:col-start-1 md:row-start-2">
						<div className="space-y-3">
							<div className="space-y-1">
								<label className="block text-xs font-medium text-gray-700 dark:text-gray-200">文字</label>
								<textarea
									value={text}
									onChange={(e) => setText(e.currentTarget.value)}
									rows={3}
									className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-2 py-2 text-[16px]"
								/>
							</div>

							<div className="flex md:hidden items-center gap-2">
								<button
									type="button"
									onClick={generatePng}
									disabled={isGenerating}
									className="rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-[16px] font-medium disabled:opacity-60"
								>
									{isGenerating ? "輸出中…" : "輸出 PNG"}
								</button>

								<button
									type="button"
									onClick={() => {
										if (pngUrl) window.open(pngUrl, "_blank", "noopener,noreferrer");
									}}
									disabled={!pngUrl}
									className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-[16px] font-medium disabled:opacity-50"
									title="開新分頁預覽/長按存圖"
								>
									開啟
								</button>

								<button
									type="button"
									onClick={shareToPhone}
									disabled={!pngUrl}
									className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-[16px] font-medium disabled:opacity-50"
								>
									手機分享
								</button>
							</div>
							<div className="md:hidden text-xs text-gray-600 dark:text-gray-300">
								{pngUrl ? "iPhone：用「手機分享」最省步驟；Google Photos 可能把透明變白底。" : "先按「輸出 PNG」才可下載/分享。"}
							</div>

							<div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
								<div className="flex items-center justify-between">
									<div className="text-xs font-medium text-gray-700 dark:text-gray-200">樣式</div>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={color}
											onChange={(e) => setColor(e.currentTarget.value)}
											className="h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
											title="文字顏色"
										/>
										<input
											type="color"
											value={borderColor}
											onChange={(e) => setBorderColor(e.currentTarget.value)}
											className="h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
											title="邊框顏色"
										/>
									</div>
								</div>

								<div className="mt-3">
									<div className="flex items-center justify-between">
										<span className="text-xs font-medium text-gray-700 dark:text-gray-200">預設配色</span>
										<span className="text-xs text-gray-600 dark:text-gray-300">點一下套用</span>
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										{COLOR_PRESETS.map((p) => (
											<button
												key={p.name}
												type="button"
												onClick={() => applyColorPreset(p)}
												className="group rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-2"
												title={p.name}
												aria-label={`套用配色：${p.name}`}
											>
												<span className="flex items-center gap-1">
													<span className="h-5 w-5 rounded border border-gray-300 dark:border-gray-700" style={{ backgroundColor: p.fill }} />
													<span className="h-5 w-5 rounded border border-gray-300 dark:border-gray-700" style={{ backgroundColor: p.stroke }} />
												</span>
											</button>
										))}
									</div>
								</div>

								<div className="mt-3 space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-xs w-10 text-gray-600 dark:text-gray-300">字重</span>
										<input
											type="range"
											min={100}
											max={900}
											step={100}
											value={fontWeight}
											onChange={(e) => setFontWeight(Number(e.currentTarget.value))}
											className="w-full accent-gray-900 dark:accent-gray-100"
										/>
										<span className="rounded-md border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 min-w-[3rem] text-center">
											{Math.round(fontWeight / 100)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs w-10 text-gray-600 dark:text-gray-300">邊框</span>
										<input
											type="range"
											min={0}
											max={10}
											step={1}
											value={borderWidth}
											onChange={(e) => setBorderWidth(Number(e.currentTarget.value))}
											className="w-full accent-gray-900 dark:accent-gray-100"
										/>
										<span className="rounded-md border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 min-w-[3rem] text-center">
											{borderWidth}
										</span>
									</div>
								</div>
							</div>

							{error ? (
								<div className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">
									{error}
								</div>
							) : null}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
