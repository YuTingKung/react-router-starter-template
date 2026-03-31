import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function publicTtfFontsPlugin(): Plugin {
	const VIRTUAL_ID = "virtual:public-ttf-fonts";
	const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

	function scanPublicTtfFiles(): Array<{ id: string; name: string; url: string }> {
		const publicDir = path.resolve(process.cwd(), "public");
		if (!fs.existsSync(publicDir)) return [];

		const results: Array<{ id: string; name: string; url: string }> = [];

		function walk(dir: string) {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const full = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					walk(full);
					continue;
				}
				if (!entry.isFile()) continue;
				if (!entry.name.toLowerCase().endsWith(".ttf")) continue;

				const rel = path.relative(publicDir, full).replace(/\\/g, "/");
				const baseName = path.basename(entry.name, path.extname(entry.name));
				results.push({
					id: `public:${rel}`,
					name: baseName,
					url: `/${rel}`,
				});
			}
		}

		walk(publicDir);
		results.sort((a, b) => a.url.localeCompare(b.url, "en"));
		return results;
	}

	return {
		name: "public-ttf-fonts",
		enforce: "pre",
		resolveId(source) {
			if (source === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
			return undefined;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_ID) return undefined;
			const fonts = scanPublicTtfFiles();
			return `export const publicTtfFonts = ${JSON.stringify(fonts)};\n`;
		},
		configureServer(server) {
			const publicDir = path.resolve(process.cwd(), "public");
			server.watcher.add(publicDir);

			const invalidate = () => {
				const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
				if (mod) server.moduleGraph.invalidateModule(mod);
			};

			server.watcher.on("add", (file) => {
				if (file.toLowerCase().endsWith(".ttf") && file.startsWith(publicDir)) invalidate();
			});
			server.watcher.on("unlink", (file) => {
				if (file.toLowerCase().endsWith(".ttf") && file.startsWith(publicDir)) invalidate();
			});
			server.watcher.on("change", (file) => {
				if (file.toLowerCase().endsWith(".ttf") && file.startsWith(publicDir)) invalidate();
			});
		},
	};
}

export default defineConfig({
	plugins: [
		publicTtfFontsPlugin(),
		cloudflare({ 
			viteEnvironment: { name: "ssr" },
			persist: false,
		}),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
	],
	optimizeDeps: {
		exclude: ["pdfjs-dist"],
	},
});
