import type { Difficulty, GameState, ItemType, OverlayState, RailSoundEvent, TrackTile } from "./railGameTypes";

export const TILE_SIZE = 45;
export const GRID_W = 9;
export const WIN_DISTANCE = 15;

export const INITIAL_TRACKS: TrackTile[] = [
	{ x: 4, y: 11 },
	{ x: 4, y: 10 },
	{ x: 4, y: 9 },
];

export const SPEEDS: Record<Difficulty, number> = {
	1: 1 / 14000,
	2: 1 / 5500,
	3: 1 / 2200,
};

export const LABELS: Record<Difficulty, string> = {
	1: "銅牌",
	2: "銀牌",
	3: "金牌",
};

export const COLORS: Record<Difficulty, string> = {
	1: "#cd7f32",
	2: "#c0c0c0",
	3: "#ffd700",
};

export function createInitialState(): GameState {
	const frontTrackY = INITIAL_TRACKS[INITIAL_TRACKS.length - 1]?.y ?? 9;

	return {
		player: { x: 4, y: 8, inventory: [] },
		train: { x: 4, y: 10, progress: 0 },
		tracks: INITIAL_TRACKS.map((track) => ({ ...track })),
		resources: [],
		droppedItems: [],
		crafter: { x: 1, y: 1, woodIn: 0, stoneIn: 0, ready: 0 },
		score: 0,
		isGameOver: false,
		cameraY: 0,
		maxInventory: 5,
		stationY: frontTrackY - WIN_DISTANCE - 1,
	};
}

export function createResetState(): GameState {
	const nextState = createInitialState();
	initMap(nextState);
	return nextState;
}

export function initMap(state: GameState) {
	state.resources = [];
	state.droppedItems = [];

	for (let row = state.stationY - 5; row < 12; row++) {
		if (row > 8) continue;

		const count = row < 0 ? 3 : 2;
		for (let index = 0; index < count; index++) {
			let rx = Math.floor(Math.random() * GRID_W);
			if (rx === 4) rx = Math.random() > 0.5 ? 3 : 5;

			state.resources.push({
				x: rx,
				y: row,
				type: Math.random() > 0.4 ? "tree" : "rock",
				health: 100,
			});
		}
	}
}

export function getRemainingTracks(state: GameState) {
	const lastTrack = state.tracks[state.tracks.length - 1] ?? INITIAL_TRACKS[INITIAL_TRACKS.length - 1];
	return Math.max(0, lastTrack.y - (state.stationY + 1));
}

export function tryMovePlayer(state: GameState, nextX: number, nextY: number) {
	if (state.isGameOver) return false;

	const hitResource = state.resources.some((resource) => resource.x === nextX && resource.y === nextY);
	if (!hitResource && nextX >= 0 && nextX < GRID_W && nextY > state.stationY - 2 && nextY < 15) {
		state.player.x = nextX;
		state.player.y = nextY;
		return true;
	}

	return false;
}

export function updateGameState(
	state: GameState,
	difficulty: Difficulty,
	deltaMs: number,
	emitSound: (event: RailSoundEvent) => void
): OverlayState {
	if (state.isGameOver) return "none";

	state.train.progress += SPEEDS[difficulty] * deltaMs;
	while (state.train.progress >= 1) {
		state.train.y -= 1;
		state.train.progress -= 1;

		const onTrack = state.tracks.some((track) => track.x === state.train.x && track.y === state.train.y);
		if (!onTrack) {
			state.isGameOver = true;
			emitSound("game-over");
			return "game-over";
		}

		if (state.train.y <= state.stationY + 1) {
			state.isGameOver = true;
			emitSound("victory");
			return "victory";
		}
	}

	for (let index = state.resources.length - 1; index >= 0; index--) {
		const resource = state.resources[index];
		if (Math.abs(resource.x - state.player.x) <= 1 && Math.abs(resource.y - state.player.y) <= 1) {
			resource.health -= 3;
			if (resource.health <= 0) {
				state.droppedItems.push({
					x: resource.x,
					y: resource.y,
					type: resource.type === "tree" ? "wood" : "stone",
				});
				state.resources.splice(index, 1);
				emitSound("collect");
			}
		}
	}

	for (let index = state.droppedItems.length - 1; index >= 0; index--) {
		const item = state.droppedItems[index];
		if (
			item.x === state.player.x &&
			item.y === state.player.y &&
			state.player.inventory.length < state.maxInventory
		) {
			state.player.inventory.push(item.type);
			state.droppedItems.splice(index, 1);
		}
	}

	if (state.player.x === state.crafter.x && state.player.y === state.crafter.y) {
		const woodIndex = state.player.inventory.indexOf("wood");
		const stoneIndex = state.player.inventory.indexOf("stone");

		if (woodIndex !== -1) {
			state.crafter.woodIn += 1;
			state.player.inventory.splice(woodIndex, 1);
		} else if (stoneIndex !== -1) {
			state.crafter.stoneIn += 1;
			state.player.inventory.splice(stoneIndex, 1);
		} else if (state.crafter.ready > 0 && state.player.inventory.length < state.maxInventory) {
			state.player.inventory.push("track");
			state.crafter.ready -= 1;
		}
	}

	if (state.crafter.woodIn >= 1 && state.crafter.stoneIn >= 1) {
		state.crafter.woodIn -= 1;
		state.crafter.stoneIn -= 1;
		state.crafter.ready += 1;
		emitSound("craft");
	}

	const trackIndex = state.player.inventory.indexOf("track");
	if (trackIndex !== -1) {
		const lastTrack = state.tracks[state.tracks.length - 1];
		const distance = Math.abs(state.player.x - lastTrack.x) + Math.abs(state.player.y - lastTrack.y);

		if (!state.tracks.some((track) => track.x === state.player.x && track.y === state.player.y) && distance === 1) {
			state.tracks.push({ x: state.player.x, y: state.player.y });
			state.player.inventory.splice(trackIndex, 1);
			state.score += 10;
			emitSound("place-track");

			if (state.player.y < state.crafter.y - 3) {
				state.crafter.y -= 4;
			}
		}
	}

	return "none";
}

function drawItem(ctx: CanvasRenderingContext2D, x: number, y: number, type: ItemType, scale = 1) {
	if (type === "wood") ctx.fillStyle = "#8d6e63";
	if (type === "stone") ctx.fillStyle = "#bdbdbd";
	if (type === "track") ctx.fillStyle = "#ffcc80";

	const size = 16 * scale;
	ctx.fillRect(x * TILE_SIZE + 22 - size / 2, y * TILE_SIZE + 22 - size / 2, size, size);
}

export function drawGame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: GameState) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	const targetCameraY = -state.player.y * TILE_SIZE + canvas.height * 0.6;
	state.cameraY += (targetCameraY - state.cameraY) * 0.1;
	ctx.translate(0, state.cameraY);

	ctx.fillStyle = "#f1c40f";
	ctx.globalAlpha = 0.88;
	ctx.fillRect(0, state.stationY * TILE_SIZE, canvas.width, TILE_SIZE * 3);
	ctx.globalAlpha = 1;
	ctx.fillStyle = "#1f1603";
	ctx.textAlign = "center";
	ctx.font = "700 16px Inter, sans-serif";
	ctx.fillText("VICTORY STATION", canvas.width / 2, (state.stationY + 1.7) * TILE_SIZE);

	ctx.fillStyle = "#5d4037";
	state.tracks.forEach((track) => {
		ctx.fillRect(track.x * TILE_SIZE + 15, track.y * TILE_SIZE + 4, 15, TILE_SIZE - 8);
		ctx.fillRect(track.x * TILE_SIZE + 2, track.y * TILE_SIZE + 10, TILE_SIZE - 4, 4);
		ctx.fillRect(track.x * TILE_SIZE + 2, track.y * TILE_SIZE + 30, TILE_SIZE - 4, 4);
	});

	state.resources.forEach((resource) => {
		if (resource.type === "tree") {
			ctx.fillStyle = "#2e7d32";
			ctx.beginPath();
			ctx.moveTo(resource.x * TILE_SIZE + TILE_SIZE / 2, resource.y * TILE_SIZE + 5);
			ctx.lineTo(resource.x * TILE_SIZE + 5, resource.y * TILE_SIZE + TILE_SIZE - 5);
			ctx.lineTo(resource.x * TILE_SIZE + TILE_SIZE - 5, resource.y * TILE_SIZE + TILE_SIZE - 5);
			ctx.fill();
			return;
		}

		ctx.fillStyle = "#95a5a6";
		ctx.beginPath();
		ctx.arc(resource.x * TILE_SIZE + TILE_SIZE / 2, resource.y * TILE_SIZE + TILE_SIZE / 2, 16, 0, Math.PI * 2);
		ctx.fill();
	});

	state.droppedItems.forEach((item) => drawItem(ctx, item.x, item.y, item.type));

	ctx.fillStyle = "#8e44ad";
	ctx.fillRect(state.crafter.x * TILE_SIZE + 4, state.crafter.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
	ctx.fillStyle = "#ffffff";
	ctx.font = "10px Inter, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(
		`木:${state.crafter.woodIn} 石:${state.crafter.stoneIn}`,
		state.crafter.x * TILE_SIZE + 22,
		state.crafter.y * TILE_SIZE + 25
	);
	if (state.crafter.ready > 0) {
		ctx.fillStyle = "#ffcc80";
		ctx.fillRect(state.crafter.x * TILE_SIZE + 10, state.crafter.y * TILE_SIZE + 30, 25, 8);
	}

	const trainY = (state.train.y - state.train.progress) * TILE_SIZE;
	ctx.fillStyle = "#c0392b";
	ctx.fillRect(state.train.x * TILE_SIZE + 5, trainY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
	ctx.fillStyle = "#111111";
	ctx.fillRect(state.train.x * TILE_SIZE + 15, trainY + 10, 15, 10);

	ctx.fillStyle = "#f1c40f";
	ctx.beginPath();
	ctx.arc(state.player.x * TILE_SIZE + 22, state.player.y * TILE_SIZE + 22, 16, 0, Math.PI * 2);
	ctx.fill();

	state.player.inventory.forEach((item, index) => {
		drawItem(ctx, state.player.x, state.player.y + (index + 1) * 0.2, item, 0.6);
	});

	ctx.restore();
}