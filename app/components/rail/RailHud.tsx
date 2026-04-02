import { COLORS, LABELS } from "./railGameCore";
import type { Difficulty } from "./railGameTypes";

type RailHudProps = {
	difficulty: Difficulty;
	score: number;
	highScore: number;
	remainingTracks: number;
	elapsedLabel: string;
	bestTimeLabel: string;
	soundEnabled: boolean;
	onDifficultyChange: (difficulty: Difficulty) => void;
	onToggleSound: () => void;
};

export default function RailHud({
	difficulty,
	score,
	highScore,
	remainingTracks,
	elapsedLabel,
	bestTimeLabel,
	soundEnabled,
	onDifficultyChange,
	onToggleSound,
}: RailHudProps) {
	return (
		<div className="rail-game-card__hud">
			<div className="rail-stat">
				<span className="rail-stat__label">分數</span>
				<strong>{score}</strong>
			</div>

			<div className="rail-stat">
				<span className="rail-stat__label">最高分</span>
				<strong>{highScore}</strong>
			</div>

			<div className="rail-stat rail-stat--timer">
				<span className="rail-stat__label">計時</span>
				<strong>{elapsedLabel}</strong>
				<span className="rail-stat__sub">最佳時間 {bestTimeLabel}</span>
			</div>

			<div className="rail-stat rail-stat--difficulty">
				<div>
					<span className="rail-stat__label">難度</span>
					<strong style={{ color: COLORS[difficulty] }}>{LABELS[difficulty]}</strong>
				</div>
				<input
					aria-label="調整難度"
					type="range"
					min="1"
					max="3"
					step="1"
					value={difficulty}
					onChange={(event) => onDifficultyChange(Number(event.target.value) as Difficulty)}
				/>
			</div>

			<div className="rail-stat rail-stat--compact">
				<span className="rail-stat__label">剩餘軌道</span>
				<strong>{remainingTracks}</strong>
				<button type="button" className="rail-sound-toggle" onClick={onToggleSound}>
					{soundEnabled ? "音效開" : "音效關"}
				</button>
			</div>
		</div>
	);
}