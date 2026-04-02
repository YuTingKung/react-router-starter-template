import { NavLink } from "react-router";
import HomeLinkButton from "./HomeLinkButton";

type FeatureRoute = "/invoice" | "/text-to-png" | "/rail";

type FeaturePageNavProps = {
	current: FeatureRoute;
	className?: string;
};

const featureLinks: Array<{ to: FeatureRoute; label: string }> = [
	{ to: "/invoice", label: "發票辨識" },
	{ to: "/text-to-png", label: "文字圖片" },
	{ to: "/rail", label: "火車軌道" },
];

export default function FeaturePageNav({ current, className = "" }: FeaturePageNavProps) {
	const classes = ["feature-page-nav", className].filter(Boolean).join(" ");

	return (
		<nav className={classes} aria-label="功能頁面導覽">
			<HomeLinkButton label="首頁" className="feature-page-nav__home" />
			<div className="feature-page-nav__links">
				{featureLinks.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						className={({ isActive }) =>
							[
								"feature-page-nav__link",
								isActive || current === link.to ? "feature-page-nav__link--active" : "",
							]
								.filter(Boolean)
								.join(" ")
						}
					>
						{link.label}
					</NavLink>
				))}
			</div>
		</nav>
	);
}