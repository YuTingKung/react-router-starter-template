type FontRecord = {
	id: string;
	name: string;
	data: ArrayBuffer;
	size: number;
	createdAt: number;
};

export type StoredFontMeta = {
	id: string;
	name: string;
	size: number;
	createdAt: number;
};

const DB_NAME = "rr_text_to_png";
const DB_VERSION = 1;
const STORE_NAME = "fonts";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
	});
}

function openDb(): Promise<IDBDatabase> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("IndexedDB is only available in the browser"));
	}

	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);

		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("name", "name", { unique: true });
				store.createIndex("createdAt", "createdAt", { unique: false });
			}
		};

		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? new Error("Failed to open IndexedDB"));
	});
}

function withTx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
	return openDb().then((db) =>
		new Promise<T>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, mode);
			const store = tx.objectStore(STORE_NAME);
			const req = fn(store);

			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));

			tx.oncomplete = () => db.close();
			tx.onerror = () => {
				reject(tx.error ?? new Error("IndexedDB transaction failed"));
				db.close();
			};
		})
	);
}

function randomId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function listStoredFonts(): Promise<StoredFontMeta[]> {
	const db = await openDb();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const req = store.getAll();

		req.onsuccess = () => {
			const all = (req.result as FontRecord[]) ?? [];
			const metas: StoredFontMeta[] = all
				.map((r) => ({ id: r.id, name: r.name, size: r.size, createdAt: r.createdAt }))
				.sort((a, b) => b.createdAt - a.createdAt);
			resolve(metas);
		};

		req.onerror = () => reject(req.error ?? new Error("Failed to list fonts"));
		tx.oncomplete = () => db.close();
		tx.onerror = () => {
			reject(tx.error ?? new Error("Failed to list fonts"));
			db.close();
		};
	});
}

export async function getStoredFontData(id: string): Promise<ArrayBuffer | null> {
	const record = await withTx<FontRecord | undefined>("readonly", (store) => store.get(id));
	return record?.data ?? null;
}

export async function saveTtfFont(file: File): Promise<StoredFontMeta> {
	if (!file.name.toLowerCase().endsWith(".ttf")) {
		throw new Error("請上傳 .ttf 檔案");
	}

	const db = await openDb();
	const name = file.name.replace(/\.ttf$/i, "");

	// Deduplicate by name (simple + predictable)
	const existing = await new Promise<FontRecord | undefined>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const index = store.index("name");
		const req = index.get(name);

		req.onsuccess = () => resolve(req.result as FontRecord | undefined);
		req.onerror = () => reject(req.error ?? new Error("Failed to read existing font"));
		tx.oncomplete = () => db.close();
		tx.onerror = () => {
			reject(tx.error ?? new Error("Failed to read existing font"));
			db.close();
		};
	});

	if (existing) {
		return { id: existing.id, name: existing.name, size: existing.size, createdAt: existing.createdAt };
	}

	// Need to reopen because we closed above
	const data = await file.arrayBuffer();
	const record: FontRecord = {
		id: randomId(),
		name,
		data,
		size: data.byteLength,
		createdAt: Date.now(),
	};

	await withTx<IDBValidKey>("readwrite", (store) => store.add(record));
	return { id: record.id, name: record.name, size: record.size, createdAt: record.createdAt };
}
