import FeaturePageNav from "../components/navigation/FeaturePageNav";
import RailGame from "../components/rail/RailGame";
import "../styles/rail.css";

export function meta() {
	return [
		{ title: "火車軌道 RAIL" },
		{ name: "description", content: "收集材料、製作鐵軌，讓列車安全抵達終點車站。" },
	];
}

export default function RailRoute() {
	return (
		<div className="rail-page">
			<div className="rail-page__glow rail-page__glow--left" />
			<div className="rail-page__glow rail-page__glow--right" />
			<section className="rail-page__shell">
				<header className="rail-page__hero">
					<div>
						<p className="rail-page__eyebrow">Arcade Route</p>
						<h1>火車軌道 RAIL</h1>
						<p className="rail-page__lead">
							一邊開路、一邊補給，讓列車穿過森林工區並安全駛進終點站。
						</p>
					</div>
					<div className="rail-page__nav">
						<FeaturePageNav current="/rail" />
					</div>
				</header>

				<div className="rail-page__content">
					<div className="rail-page__game">
						<RailGame />
					</div>
					<aside className="rail-page__sidebar">
						<section>
							<p className="rail-page__label">玩法</p>
							<ul>
								<li>靠近樹木與岩石即可自動採集木頭與石材。</li>
								<li>把材料送到製作台，會自動合成新的鐵軌。</li>
								<li>拿著鐵軌走到現有軌道前方一格，即可完成鋪設。</li>
							</ul>
						</section>

						<section>
							<p className="rail-page__label">操作</p>
							<ul>
								<li>桌機可用方向鍵或 WASD。</li>
								<li>手機可用下方搖桿控制角色移動。</li>
								<li>難度滑桿會直接調整列車推進速度。</li>
							</ul>
						</section>

						<section>
							<p className="rail-page__label">目標</p>
							<p>
								在列車追上斷軌前，完成 15 格延伸鐵路，讓列車抵達 Victory Station。
							</p>
						</section>
					</aside>
				</div>
			</section>
		</div>
	);
}