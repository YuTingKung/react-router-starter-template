import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/text-to-png";
import { getStoredFontData, listStoredFonts, saveTtfFont, type StoredFontMeta } from "../utils/fontStorage";

type LoadedFont = {
	id: string;
	family: string;
};

const DEFAULT_FAMILY = "ui-sans-serif, system-ui, sans-serif";

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

export default function TextToPngRoute() {
	const [fonts, setFonts] = useState<StoredFontMeta[]>([]);
	const [selectedFontId, setSelectedFontId] = useState<string>("");
	const [text, setText] = useState<string>("在這裡輸入文字\n第二行");
	const [color, setColor] = useState<string>("#000000");
	const [fontWeight, setFontWeight] = useState<number>(600);
	const [borderWidth, setBorderWidth] = useState<number>(4);
	const [borderColor, setBorderColor] = useState<string>("#ffffff");
	const [error, setError] = useState<string>("");
	const [pngUrl, setPngUrl] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [isLoadingFonts, setIsLoadingFonts] = useState<boolean>(true);

	const loadedFontsRef = useRef<Map<string, LoadedFont>>(new Map());
	const lastObjectUrlRef = useRef<string>("");
	const lastPngBlobRef = useRef<Blob | null>(null);

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

	const selectedFamily = useMemo(() => {
		if (!selectedFontId) return DEFAULT_FAMILY;
		const loaded = loadedFontsRef.current.get(selectedFontId);
		return loaded?.family ?? DEFAULT_FAMILY;
	}, [selectedFontId]);

	async function refreshFontList() {
		const list = await listStoredFonts();
		setFonts(list);
	}

	async function loadFontIfNeeded(id: string): Promise<string> {
		const existing = loadedFontsRef.current.get(id);
		if (existing) return existing.family;

		const familyName = `UploadedFont_${id.replace(/[^a-zA-Z0-9_\-]/g, "_")}`;
		await ensureFontLoaded(id, familyName);
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

		if (!id) return;

		try {
			await loadFontIfNeeded(id);
		} catch (e) {
			setError(e instanceof Error ? e.message : "字體載入失敗");
		}
	}

	async function generatePng() {
		setError("");
		setIsGenerating(true);

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

	return (
		<main className="min-h-screen p-6">
			<div className="mx-auto max-w-5xl space-y-6">
				<header className="space-y-2">
					<h1 className="text-2xl font-semibold">文字輸出 PNG</h1>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						上傳 TTF 後可在下拉選單選擇字體，輸入文字並調整顏色/粗細/邊框，最後輸出成透明背景 PNG。
					</p>
				</header>

				<section className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium">上傳 TTF 字體</label>
							<input
								type="file"
								accept=".ttf,font/ttf"
								onChange={(e) => handleUpload(e.currentTarget.files?.[0] ?? null)}
								className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 dark:file:bg-gray-800 dark:hover:file:bg-gray-700"
							/>
							<p className="text-xs text-gray-600 dark:text-gray-300">字體會保存在此瀏覽器（IndexedDB），下次可直接選用。</p>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium">選擇字體</label>
							<select
								value={selectedFontId}
								onChange={(e) => handleSelectFont(e.currentTarget.value)}
								disabled={isLoadingFonts}
								className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
							>
								<option value="">系統預設字體</option>
								{fonts.map((f) => (
									<option key={f.id} value={f.id}>
										{f.name} ({formatBytes(f.size)})
									</option>
								))}
							</select>
							{isLoadingFonts ? (
								<p className="text-xs text-gray-600 dark:text-gray-300">字體載入中…</p>
							) : fonts.length === 0 ? (
								<p className="text-xs text-gray-600 dark:text-gray-300">尚未上傳字體（可先用系統預設字體）。</p>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium">文字內容</label>
							<textarea
								value={text}
								onChange={(e) => setText(e.currentTarget.value)}
								rows={5}
								className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
							/>
							<div className="text-xs text-gray-600 dark:text-gray-300" style={{ fontFamily: selectedFamily, fontWeight }}>
								預覽：{(text.split("\n")[0] || " ").slice(0, 40)}
							</div>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium">文字顏色</label>
									<input
										type="color"
										value={color}
										onChange={(e) => setColor(e.currentTarget.value)}
										className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium">粗細 (Weight)</label>
									<select
										value={fontWeight}
										onChange={(e) => setFontWeight(Number(e.currentTarget.value))}
										className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
									>
										{[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => (
											<option key={w} value={w}>
												{w}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="block text-sm font-medium">邊框粗細</label>
									<input
										type="number"
										min={0}
										step={1}
										value={borderWidth}
										onChange={(e) => setBorderWidth(Math.max(0, Number(e.currentTarget.value) || 0))}
										className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
									/>
									<p className="text-xs text-gray-600 dark:text-gray-300">設 0 代表不要邊框</p>
								</div>

								<div className="space-y-2">
									<label className="block text-sm font-medium">邊框顏色</label>
									<input
										type="color"
										value={borderColor}
										onChange={(e) => setBorderColor(e.currentTarget.value)}
										className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
									/>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={generatePng}
									disabled={isGenerating}
									className="rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
								>
									{isGenerating ? "產生中…" : "輸出 PNG"}
								</button>

								{pngUrl ? (
									<a
										href={pngUrl}
										download={downloadName}
										className="text-sm font-medium text-gray-900 dark:text-gray-100 underline"
									>
										下載 PNG
									</a>
								) : null}

								{pngUrl ? (
									<button
										type="button"
										onClick={shareToPhone}
										className="text-sm font-medium text-gray-900 dark:text-gray-100 underline"
									>
										手機儲存/分享
									</button>
								) : null}
							</div>
							<p className="text-xs text-gray-600 dark:text-gray-300">
								PNG 背景是透明的；如果你的預覽程式看起來像白底，通常只是預覽顯示方式，貼到支援透明的軟體會保留去背。
							</p>
							{pngUrl ? (
								<p className="text-xs text-gray-600 dark:text-gray-300">
									手機上建議按「手機儲存/分享」；若瀏覽器不支援，會開新分頁，你可以長按圖片選「加入相片/儲存圖片」。
								</p>
							) : null}
						</div>
					</div>

					{error ? (
						<div className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">
							{error}
						</div>
					) : null}
				</section>

				<section className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
					<h2 className="text-sm font-medium">輸出預覽</h2>
					{pngUrl ? (
						<div className="overflow-auto">
							<img src={pngUrl} alt="PNG preview" className="max-w-full" />
						</div>
					) : (
						<p className="text-sm text-gray-600 dark:text-gray-300">按「輸出 PNG」後會在這裡顯示預覽。</p>
					)}
				</section>
			</div>
		</main>
	);
}
