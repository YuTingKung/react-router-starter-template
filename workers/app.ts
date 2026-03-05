import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		// 記錄 API 請求到隊列
		try {
			await env.API_LOG_QUEUE.send({
				url: request.url,
				method: request.method,
				headers: Object.fromEntries(request.headers),
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error('Failed to send log to queue:', error);
		}

		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},

	// 隊列消費者處理器
	async queue(batch, env) {
		for (const message of batch.messages) {
			try {
				const logData = message.body;
				console.log('API Log:', JSON.stringify(logData, null, 2));
				
				// 這裡可以添加其他日誌處理邏輯，例如：
				// - 儲存到 D1 資料庫
				// - 發送到外部分析服務
				// - 寫入 R2 儲存
				
				message.ack();
			} catch (error) {
				console.error('Failed to process log message:', error);
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env>;
