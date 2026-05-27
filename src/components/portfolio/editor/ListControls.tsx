"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useEditor } from "./EditorProvider";

interface ItemControlsProps {
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	label?: string;
}

export function ItemControls({
	onDelete,
	onMoveUp,
	onMoveDown,
	canMoveUp,
	canMoveDown,
	label,
}: ItemControlsProps) {
	const { isOwner, editMode } = useEditor();
	if (!isOwner || !editMode) return null;
	return (
		<div className="inline-flex items-center gap-1 rounded-lg bg-black/40 border border-white/10 px-1 py-0.5 text-white/70">
			{label && (
				<span className="px-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
					{label}
				</span>
			)}
			{onMoveUp && (
				<button
					type="button"
					onClick={onMoveUp}
					disabled={!canMoveUp}
					className="inline-flex items-center justify-center size-6 rounded hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
					title="Move up"
				>
					<ChevronUp className="size-3.5" />
				</button>
			)}
			{onMoveDown && (
				<button
					type="button"
					onClick={onMoveDown}
					disabled={!canMoveDown}
					className="inline-flex items-center justify-center size-6 rounded hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
					title="Move down"
				>
					<ChevronDown className="size-3.5" />
				</button>
			)}
			<button
				type="button"
				onClick={onDelete}
				className="inline-flex items-center justify-center size-6 rounded hover:bg-red-500/15 hover:text-red-300"
				title="Delete"
			>
				<Trash2 className="size-3.5" />
			</button>
		</div>
	);
}

interface AddButtonProps {
	onClick: () => void;
	children: React.ReactNode;
}

export function AddButton({ onClick, children }: AddButtonProps) {
	const { isOwner, editMode } = useEditor();
	if (!isOwner || !editMode) return null;
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-white/15 bg-white/[0.02] text-[12px] text-white/55 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/[0.04] transition-colors"
		>
			<Plus className="size-3.5" />
			{children}
		</button>
	);
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
	if (to < 0 || to >= arr.length) return arr;
	const copy = [...arr];
	const [item] = copy.splice(from, 1);
	copy.splice(to, 0, item);
	return copy;
}
