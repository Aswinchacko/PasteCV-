"use client";

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { useEditor } from "./EditorProvider";

interface EditableTextProps {
	value: string;
	onChange: (next: string) => void;
	placeholder?: string;
	multiline?: boolean;
	className?: string;
	style?: CSSProperties;
	/** When true, the user can leave the field blank without showing placeholder text in static mode. */
	allowEmpty?: boolean;
	as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Inline-editable text. Renders a plain element when not in edit mode (or when
 * the viewer isn't the owner), and a borderless contenteditable area when
 * editing is active. Resizes the textarea to fit its content.
 */
export function EditableText({
	value,
	onChange,
	placeholder = "Empty",
	multiline = false,
	className = "",
	style,
	allowEmpty = false,
	as: Tag = "span",
}: EditableTextProps) {
	const { isOwner, editMode } = useEditor();
	const taRef = useRef<HTMLTextAreaElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [local, setLocal] = useState(value);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	useLayoutEffect(() => {
		if (multiline && taRef.current) {
			taRef.current.style.height = "auto";
			taRef.current.style.height = `${taRef.current.scrollHeight}px`;
		}
	}, [local, multiline, editMode]);

	const active = isOwner && editMode;

	if (!active) {
		const display = value || (allowEmpty ? "" : placeholder);
		const empty = !value;
		return (
			<Tag
				className={
					className +
					(empty && !allowEmpty ? " opacity-40 italic" : "")
				}
				style={style}
			>
				{display}
			</Tag>
		);
	}

	const sharedClass =
		"w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 resize-none caret-[var(--color-accent)] hover:bg-current/[0.04] focus:bg-current/[0.06] rounded-md px-1 -mx-1 transition-colors";

	function commit() {
		if (local !== value) onChange(local);
	}

	if (multiline) {
		return (
			<textarea
				ref={taRef}
				value={local}
				placeholder={placeholder}
				onChange={(e) => setLocal(e.target.value)}
				onBlur={commit}
				rows={1}
				className={`${className} ${sharedClass}`}
				style={style}
			/>
		);
	}

	return (
		<input
			ref={inputRef}
			value={local}
			placeholder={placeholder}
			onChange={(e) => setLocal(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					(e.currentTarget as HTMLInputElement).blur();
				}
			}}
			className={`${className} ${sharedClass}`}
			style={style}
		/>
	);
}
