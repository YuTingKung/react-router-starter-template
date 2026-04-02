import type { RefObject } from "react";
import type { OverlayState } from "./railGameTypes";

type RailCanvasProps = {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	overlay: OverlayState;
	elapsedLabel: string;
	onStart: () => void;
	onReset: () => void;
};

export default function RailCanvas({ canvasRef, overlay, elapsedLabel, onStart, onReset }: RailCanvasProps) {
	return (
		<div className="rail-game-card__board">
			<canvas ref={canvasRef} className="rail-canvas" />

			{overlay === "start" ? (
				<div className="rail-overlay" role="dialog" aria-modal="true">
					<h2>準備發車</h2>
					<p>先規劃採集路線。按下開始後列車才會前進，預設銅牌速度也已放慢。</p>
					<button type="button" onClick={onStart}>
						開始鋪軌
					</button>
				</div>
			) : null}

			{overlay === "game-over" ? (
				<div className="rail-overlay" role="dialog" aria-modal="true">
					<h2>列車出軌</h2>
					<p>本次撐了 {elapsedLabel}。調整採集與鋪設節奏後再試一次。</p>
					<button type="button" onClick={onReset}>
						重新開始
					</button>
				</div>
			) : null}

			{overlay === "victory" ? (
				<div className="rail-overlay" role="dialog" aria-modal="true">
					<h2>抵達車站</h2>
					<p>成功通關，用時 {elapsedLabel}，列車順利抵達 Victory Station。</p>
					<button type="button" onClick={onReset}>
						再挑戰一次
					</button>
				</div>
			) : null}
		</div>
	);
}