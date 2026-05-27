"use client";

import type { ResumeData } from "@/lib/ai/schema";
import type { TemplateId } from "@/lib/db/portfolios";
import { EditorProvider, useEditor } from "./editor/EditorProvider";
import { EditToolbar } from "./editor/EditToolbar";
import { LinearDarkTemplate } from "./templates/LinearDark";
import { PaperLightTemplate } from "./templates/PaperLight";
import { TerminalMonoTemplate } from "./templates/TerminalMono";

interface PortfolioRendererProps {
	slug: string;
	data: ResumeData;
	template: TemplateId;
	isOwner: boolean;
	views: number;
}

export function PortfolioRenderer({
	slug,
	data,
	template,
	isOwner,
	views,
}: PortfolioRendererProps) {
	return (
		<EditorProvider
			slug={slug}
			initialData={data}
			initialTemplate={template}
			isOwner={isOwner}
		>
			<TemplateDispatch />
			<EditToolbar views={views} />
		</EditorProvider>
	);
}

function TemplateDispatch() {
	const { template } = useEditor();
	switch (template) {
		case "paper-light":
			return <PaperLightTemplate />;
		case "terminal-mono":
			return <TerminalMonoTemplate />;
		case "linear-dark":
		default:
			return <LinearDarkTemplate />;
	}
}
