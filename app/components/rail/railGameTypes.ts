export type Difficulty = 1 | 2 | 3;
export type ItemType = "wood" | "stone" | "track";
export type ResourceType = "tree" | "rock";
export type OverlayState = "start" | "none" | "game-over" | "victory";

export type PlayerState = {
	x: number;
	y: number;
	inventory: ItemType[];
};

export type TrainState = {
	x: number;
	y: number;
	progress: number;
};

export type TrackTile = {
	x: number;
	y: number;
};

export type ResourceNode = {
	x: number;
	y: number;
	type: ResourceType;
	health: number;
};

export type DroppedItem = {
	x: number;
	y: number;
	type: ItemType;
};

export type CrafterState = {
	x: number;
	y: number;
	woodIn: number;
	stoneIn: number;
	ready: number;
};

export type GameState = {
	player: PlayerState;
	train: TrainState;
	tracks: TrackTile[];
	resources: ResourceNode[];
	droppedItems: DroppedItem[];
	crafter: CrafterState;
	score: number;
	isGameOver: boolean;
	cameraY: number;
	maxInventory: number;
	stationY: number;
};

export type RailSoundEvent =
	| "collect"
	| "craft"
	| "place-track"
	| "game-over"
	| "victory"
	| "reset";