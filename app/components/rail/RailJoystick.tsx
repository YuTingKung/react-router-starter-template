import { useEffect, useRef } from "react";

type Direction = {
	x: number;
	y: number;
};

type RailJoystickProps = {
	disabled: boolean;
	isClient: boolean;
	onDirectionChange: (direction: Direction) => void;
	onInteract: () => void;
	onReset: () => void;
};

export default function RailJoystick({
	disabled,
	isClient,
	onDirectionChange,
	onInteract,
	onReset,
}: RailJoystickProps) {
	const baseRef = useRef<HTMLDivElement | null>(null);
	const stickRef = useRef<HTMLDivElement | null>(null);
	const activePointerIdRef = useRef<number | null>(null);
	const isActiveRef = useRef(false);

	function setStickOffset(dx: number, dy: number) {
		if (stickRef.current) {
			stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
		}
	}

	function resetStick() {
		activePointerIdRef.current = null;
		isActiveRef.current = false;
		setStickOffset(0, 0);
		onDirectionChange({ x: 0, y: 0 });
	}

	useEffect(() => {
		if (disabled) resetStick();
	}, [disabled]);

	useEffect(() => {
		const base = baseRef.current;
		if (!base) return;

		const updateJoystick = (clientX: number, clientY: number) => {
			const rect = base.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			let dx = clientX - centerX;
			let dy = clientY - centerY;
			const distance = Math.hypot(dx, dy);
			const maxDistance = 35;

			if (distance > maxDistance) {
				dx *= maxDistance / distance;
				dy *= maxDistance / distance;
			}

			setStickOffset(dx, dy);

			if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
				onDirectionChange(
					Math.abs(dx) > Math.abs(dy)
						? { x: dx > 0 ? 1 : -1, y: 0 }
						: { x: 0, y: dy > 0 ? 1 : -1 }
				);
				return;
			}

			onDirectionChange({ x: 0, y: 0 });
		};

		const handlePointerDown = (event: PointerEvent) => {
			if (disabled) return;
			event.preventDefault();
			onInteract();
			isActiveRef.current = true;
			activePointerIdRef.current = event.pointerId;
			updateJoystick(event.clientX, event.clientY);
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (disabled || !isActiveRef.current || activePointerIdRef.current !== event.pointerId) return;
			event.preventDefault();
			updateJoystick(event.clientX, event.clientY);
		};

		const handlePointerUp = (event: PointerEvent) => {
			if (activePointerIdRef.current !== null && activePointerIdRef.current !== event.pointerId) return;
			resetStick();
		};

		base.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("pointermove", handlePointerMove, { passive: false });
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerUp);

		return () => {
			base.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerUp);
		};
	}, [disabled, onDirectionChange, onInteract]);

	return (
		<div className="rail-game-card__footer">
			<div className="rail-joystick-panel">
				<div ref={baseRef} className="rail-joystick-base" aria-label="移動搖桿">
					<div ref={stickRef} className="rail-joystick-stick" />
				</div>
			</div>

			<div className="rail-status-panel">
				<p>收集木頭與石頭，丟進紫色製作台，再把生成的鐵軌往北延伸。</p>
				<div className="rail-status-panel__actions">
					<button type="button" className="rail-secondary-button" onClick={onReset}>
						重設關卡
					</button>
					<span>{isClient ? "方向鍵 / WASD / 觸控搖桿" : "載入中"}</span>
				</div>
			</div>
		</div>
	);
}