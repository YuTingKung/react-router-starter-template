import { useCallback, useRef } from "react";
import type { RailSoundEvent } from "./railGameTypes";

type ToneOptions = {
	frequency: number;
	duration: number;
	type?: OscillatorType;
	volume?: number;
	delay?: number;
};

export function useRailAudio(enabled: boolean) {
	const audioContextRef = useRef<AudioContext | null>(null);
	const lastPlayedAtRef = useRef<Record<string, number>>({});

	const ensureContext = useCallback(async () => {
		if (typeof window === "undefined") return null;

		const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioContextCtor) return null;

		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContextCtor();
		}

		if (audioContextRef.current.state === "suspended") {
			await audioContextRef.current.resume();
		}

		return audioContextRef.current;
	}, []);

	const playTone = useCallback(async (tones: ToneOptions[]) => {
		if (!enabled) return;

		const context = await ensureContext();
		if (!context) return;

		const startAt = context.currentTime;
		for (const tone of tones) {
			const oscillator = context.createOscillator();
			const gainNode = context.createGain();

			oscillator.type = tone.type ?? "sine";
			oscillator.frequency.value = tone.frequency;
			gainNode.gain.setValueAtTime(0.0001, startAt);

			const toneStart = startAt + (tone.delay ?? 0);
			const toneEnd = toneStart + tone.duration;
			gainNode.gain.exponentialRampToValueAtTime(tone.volume ?? 0.05, toneStart + 0.01);
			gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

			oscillator.connect(gainNode);
			gainNode.connect(context.destination);
			oscillator.start(toneStart);
			oscillator.stop(toneEnd + 0.02);
		}
	}, [enabled, ensureContext]);

	const play = useCallback((event: RailSoundEvent) => {
		const now = typeof performance !== "undefined" ? performance.now() : Date.now();
		const throttleMs = event === "collect" ? 70 : event === "craft" ? 120 : 0;
		const lastPlayedAt = lastPlayedAtRef.current[event] ?? 0;
		if (throttleMs > 0 && now - lastPlayedAt < throttleMs) return;
		lastPlayedAtRef.current[event] = now;

		switch (event) {
			case "collect":
				void playTone([{ frequency: 620, duration: 0.08, type: "triangle", volume: 0.03 }]);
				break;
			case "craft":
				void playTone([
					{ frequency: 440, duration: 0.08, type: "square", volume: 0.025 },
					{ frequency: 660, duration: 0.1, type: "triangle", volume: 0.03, delay: 0.08 },
				]);
				break;
			case "place-track":
				void playTone([
					{ frequency: 520, duration: 0.06, type: "square", volume: 0.028 },
					{ frequency: 780, duration: 0.08, type: "triangle", volume: 0.035, delay: 0.05 },
				]);
				break;
			case "game-over":
				void playTone([
					{ frequency: 360, duration: 0.12, type: "sawtooth", volume: 0.04 },
					{ frequency: 180, duration: 0.22, type: "sawtooth", volume: 0.045, delay: 0.11 },
				]);
				break;
			case "victory":
				void playTone([
					{ frequency: 523.25, duration: 0.08, type: "triangle", volume: 0.03 },
					{ frequency: 659.25, duration: 0.1, type: "triangle", volume: 0.035, delay: 0.09 },
					{ frequency: 783.99, duration: 0.16, type: "triangle", volume: 0.04, delay: 0.2 },
				]);
				break;
			case "reset":
				void playTone([{ frequency: 480, duration: 0.05, type: "triangle", volume: 0.02 }]);
				break;
		}
	}, [playTone]);

	return { play, ensureContext };
}