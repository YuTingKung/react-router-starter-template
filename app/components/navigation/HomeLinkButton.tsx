import { Link } from "react-router";

type HomeLinkButtonProps = {
	label?: string;
	className?: string;
};

export default function HomeLinkButton({ label = "回到首頁", className = "" }: HomeLinkButtonProps) {
	const classes = ["home-link-button", className].filter(Boolean).join(" ");

	return (
		<Link to="/" className={classes}>
			{label}
		</Link>
	);
}