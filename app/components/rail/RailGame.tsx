import { useEffect, useRef, useState } from "react";
import RailCanvas from "./RailCanvas";
import RailHud from "./RailHud";
import RailJoystick from "./RailJoystick";
import { WIN_DISTANCE, createResetState, drawGame, getRemainingTracks, tryMovePlayer, updateGameState } from "./railGameCore";
import { useRailAudio } from "./useRailAudio";
import type { Difficulty, GameState, OverlayState } from "./railGameTypes";

const HIGH_SCORE_STORAGE_KEY = "rail.highScore";
const BEST_TIME_STORAGE_KEY = "rail.bestTimeMs";

function formatDuration(milliseconds: number | null) {
	if (milliseconds === null || Number.isNaN(milliseconds)) return "--:--.-";
	const totalTenths = Math.floor(milliseconds / 100);
	const minutes = Math.floor(totalTenths / 600);
	const seconds = Math.floor((totalTenths % 600) / 10);
	const tenths = totalTenths % 10;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

export default function RailGame() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const moveIntervalRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number | null>(null);
	const overlayRef = useRef<OverlayState>("start");
	const difficultyRef = useRef<Difficulty>(1);
	const moveDirRef = useRef({ x: 0, y: 0 });
	const gameStateRef = useRef<GameState>(createResetState());
	const hudRef = useRef({ score: 0, remaining: getRemainingTracks(gameStateRef.current) });
	const elapsedMsRef = useRef(0);
	const elapsedDisplayRef = useRef(0);

	const [difficulty, setDifficulty] = useState<Difficulty>(1);
	const [score, setScore] = useState(0);
	const [remainingTracks, setRemainingTracks] = useState(WIN_DISTANCE);
	const [overlay, setOverlay] = useState<OverlayState>("start");
	const [isClient, setIsClient] = useState(false);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const { play, ensureContext } = useRailAudio(soundEnabled);

	function syncHud(state: GameState) {
		const nextRemaining = getRemainingTracks(state);

		if (hudRef.current.score !== state.score) {
			hudRef.current.score = state.score;
			setScore(state.score);
		}

		if (hudRef.current.remaining !== nextRemaining) {
			hudRef.current.remaining = nextRemaining;
			setRemainingTracks(nextRemaining);
		}
	}

	function persistHighScore(nextScore: number) {
		setHighScore((current) => {
			const value = Math.max(current, nextScore);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(value));
			}
			return value;
		});
	}

	function persistBestTime(nextTimeMs: number) {
		setBestTimeMs((current) => {
			const value = current === null ? nextTimeMs : Math.min(current, nextTimeMs);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(BEST_TIME_STORAGE_KEY, String(value));
			}
			return value;
		});
	}

	function resetGame() {
		const nextState = createResetState();
		gameStateRef.current = nextState;
		hudRef.current = { score: nextState.score, remaining: getRemainingTracks(nextState) };
		elapsedMsRef.current = 0;
		elapsedDisplayRef.current = 0;
		lastFrameTimeRef.current = null;
		setScore(nextState.score);
		setRemainingTracks(getRemainingTracks(nextState));
		setElapsedMs(0);
		overlayRef.current = "start";
		setOverlay("start");
		moveDirRef.current = { x: 0, y: 0 };
		play("reset");
	}

	function startGame() {
		void ensureContext();
		lastFrameTimeRef.current = null;
		overlayRef.current = "none";
		setOverlay("none");
	}

	useEffect(() => {
		setIsClient(true);
		const nextState = createResetState();
		gameStateRef.current = nextState;
		hudRef.current = { score: nextState.score, remaining: getRemainingTracks(nextState) };
		setScore(nextState.score);
		setRemainingTracks(getRemainingTracks(nextState));

		if (typeof window !== "undefined") {
			const storedHighScore = Number(window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY) ?? "0");
			const storedBestTime = Number(window.localStorage.getItem(BEST_TIME_STORAGE_KEY) ?? "NaN");
			if (Number.isFinite(storedHighScore)) setHighScore(storedHighScore);
			if (Number.isFinite(storedBestTime)) setBestTimeMs(storedBestTime);
		}
	}, []);

	useEffect(() => {
		difficultyRef.current = difficulty;
	}, [difficulty]);

	useEffect(() => {
		overlayRef.current = overlay;
	}, [overlay]);

	useEffect(() => {
		const resize = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			canvas.width = Math.max(1, Math.floor(rect.width));
			canvas.height = Math.max(1, Math.floor(rect.height));
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (overlayRef.current === "start") {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					startGame();
				}
				return;
			}

			if (overlayRef.current !== "none") return;

			let nextX = gameStateRef.current.player.x;
			let nextY = gameStateRef.current.player.y;

			void ensureContext();

			if (event.key.includes("Up") || event.key === "w" || event.key === "W") nextY -= 1;
			if (event.key.includes("Down") || event.key === "s" || event.key === "S") nextY += 1;
			if (event.key.includes("Left") || event.key === "a" || event.key === "A") nextX -= 1;
			if (event.key.includes("Right") || event.key === "d" || event.key === "D") nextX += 1;

			if (nextX !== gameStateRef.current.player.x || nextY !== gameStateRef.current.player.y) {
				event.preventDefault();
				tryMovePlayer(gameStateRef.current, nextX, nextY);
			}
		};

		window.addEventListener("resize", resize);
		window.addEventListener("keydown", handleKeyDown);
		resize();

		moveIntervalRef.current = window.setInterval(() => {
			if (overlayRef.current === "none" && (moveDirRef.current.x !== 0 || moveDirRef.current.y !== 0)) {
				tryMovePlayer(
					gameStateRef.current,
					gameStateRef.current.player.x + moveDirRef.current.x,
					gameStateRef.current.player.y + moveDirRef.current.y
				);
			}
		}, 160);

		const loop = (timestamp: number) => {
			if (lastFrameTimeRef.current === null) lastFrameTimeRef.current = timestamp;
			const deltaMs = Math.min(64, timestamp - lastFrameTimeRef.current);
			lastFrameTimeRef.current = timestamp;

			const state = gameStateRef.current;
			if (overlayRef.current === "none" && !state.isGameOver) {
				elapsedMsRef.current += deltaMs;
				const nextDisplay = Math.floor(elapsedMsRef.current / 100);
				if (nextDisplay !== elapsedDisplayRef.current) {
					elapsedDisplayRef.current = nextDisplay;
					setElapsedMs(elapsedMsRef.current);
				}
			}

			if (overlayRef.current === "none") {
				const nextOverlay = updateGameState(state, difficultyRef.current, deltaMs, play);
				if (nextOverlay !== "none") {
					overlayRef.current = nextOverlay;
					setOverlay(nextOverlay);
					persistHighScore(state.score);
					if (nextOverlay === "victory") {
						persistBestTime(elapsedMsRef.current);
					}
				} else if (state.score > highScore) {
					persistHighScore(state.score);
				}
			}

			syncHud(state);

			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			if (canvas && ctx) {
				drawGame(ctx, canvas, state);
			}

			animationFrameRef.current = window.requestAnimationFrame(loop);
		};

		animationFrameRef.current = window.requestAnimationFrame(loop);

		return () => {
			window.removeEventListener("resize", resize);
			window.removeEventListener("keydown", handleKeyDown);
			if (moveIntervalRef.current !== null) window.clearInterval(moveIntervalRef.current);
			if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
		};
	}, [ensureContext, highScore, play]);

	return (
		<div className="rail-game-card">
			<RailHud
				difficulty={difficulty}
				score={score}
				highScore={highScore}
				remainingTracks={remainingTracks}
				elapsedLabel={formatDuration(elapsedMs)}
				bestTimeLabel={formatDuration(bestTimeMs)}
				soundEnabled={soundEnabled}
				onDifficultyChange={setDifficulty}
				onToggleSound={() => setSoundEnabled((current) => !current)}
			/>

			<RailCanvas
				canvasRef={canvasRef}
				overlay={overlay}
				elapsedLabel={formatDuration(elapsedMs)}
				onStart={startGame}
				onReset={resetGame}
			/>

			<RailJoystick
				disabled={overlay !== "none"}
				isClient={isClient}
				onDirectionChange={(direction) => {
					moveDirRef.current = direction;
				}}
				onInteract={() => {
					void ensureContext();
				}}
				onReset={resetGame}
			/>
		</div>
	);
}