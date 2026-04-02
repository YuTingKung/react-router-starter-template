import { useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import "../styles/home.css";

const featureCards = [
	{
		id: "invoice",
		to: "/invoice",
		title: "發票辨識系統",
		description: "上傳發票圖片，交給 AI 擷取欄位與結果。",
		badge: "INVOICE",
		gradient: "linear-gradient(135deg, #7b61ff, #00e5ff)",
		points: ["圖像上傳", "AI 結果解析", "欄位化輸出"],
		summary: "適合把紙本或截圖發票快速轉成可讀資料。",
	},
	{
		id: "text",
		to: "/text-to-png",
		title: "文字圖片",
		description: "選字體、調整描邊與粗細，輸出透明 PNG。",
		badge: "TEXT",
		gradient: "linear-gradient(135deg, #ff9a62, #ffd36e)",
		points: ["自訂字體", "描邊與粗細", "透明輸出"],
		summary: "適合做標題字、社群貼文素材或直播圖卡。",
	},
	{
		id: "rail",
		to: "/rail",
		title: "火車軌道 RAIL",
		description: "收集資源、製作鐵軌，在列車失控前把路打通。",
		badge: "ARCADE",
		gradient: "linear-gradient(135deg, #ff9b54, #4cb782)",
		points: ["即時鋪軌", "難度速度切換", "計時與最高分"],
		summary: "適合拿來測試互動、Canvas 與小型遊戲迴圈。",
	},
] as const;

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home({}: Route.ComponentProps) {
	const [activeTab, setActiveTab] = useState<(typeof featureCards)[number]["id"]>("invoice");
	const activeFeature = featureCards.find((card) => card.id === activeTab) ?? featureCards[0];

	return (
		<section className="home-shell">
			<div className="home-tabs">
				<div className="home-tabs__list" role="tablist" aria-label="功能分頁">
					{featureCards.map((card) => (
						<button
							key={card.id}
							type="button"
							role="tab"
							aria-selected={activeTab === card.id}
							aria-controls={`feature-panel-${card.id}`}
							id={`feature-tab-${card.id}`}
							className="home-tabs__button"
							onClick={() => setActiveTab(card.id)}
						>
							<span>{card.badge}</span>
							<strong>{card.title}</strong>
						</button>
					))}
				</div>

				<div
					role="tabpanel"
					id={`feature-panel-${activeFeature.id}`}
					aria-labelledby={`feature-tab-${activeFeature.id}`}
					className="home-tabs__panel"
				>
					<div className="home-tabs__hero" style={{ background: activeFeature.gradient }}>
						<span className="home-tabs__badge">{activeFeature.badge}</span>
						<h2>{activeFeature.title}</h2>
						<p>{activeFeature.description}</p>
						<Link className="home-tabs__cta" to={activeFeature.to}>
							進入功能
						</Link>
					</div>

					<div className="home-tabs__meta">
						<section>
							<h3>功能摘要</h3>
							<p>{activeFeature.summary}</p>
						</section>
						<section>
							<h3>重點能力</h3>
							<ul>
								{activeFeature.points.map((point) => (
									<li key={point}>{point}</li>
								))}
							</ul>
						</section>
					</div>
				</div>
			</div>
		</section>
	);
}
