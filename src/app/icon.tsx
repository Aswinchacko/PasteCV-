import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#cdff5b",
					color: "#06080a",
					fontSize: 22,
					fontWeight: 700,
					fontFamily:
						"ui-monospace, 'SF Mono', Menlo, monospace",
					borderRadius: 7,
					letterSpacing: -1,
				}}
			>
				P
			</div>
		),
		{ ...size },
	);
}
