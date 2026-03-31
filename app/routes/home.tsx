import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div>
			<Welcome message={loaderData.message} />
			<div style={{ textAlign: 'center', marginTop: '20px' }}>
				<Link 
					to="/invoice" 
					style={{
						display: 'inline-block',
						padding: '12px 24px',
						background: 'linear-gradient(135deg, #7b61ff, #00e5ff)',
						color: '#000',
						textDecoration: 'none',
						borderRadius: '8px',
						fontWeight: '600',
						transition: 'transform 0.2s',
					}}
					onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
					onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
				>
					🧾 發票辨識系統
				</Link>
				<div style={{ marginTop: '12px' }}>
					<Link 
						to="/text-to-png" 
						style={{
							display: 'inline-block',
							padding: '12px 24px',
							background: 'linear-gradient(135deg, #7b61ff, #00e5ff)',
							color: '#000',
							textDecoration: 'none',
							borderRadius: '8px',
							fontWeight: '600',
							transition: 'transform 0.2s',
						}}
						onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
						onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
					>
						🖼️ 文字圖片
					</Link>
				</div>
			</div>
		</div>
	);
}
