export default function AdminLoading() {
	return (
		<div className="px-6 py-8 max-w-7xl mx-auto animate-pulse">
			<div className="mb-8">
				<div className="h-3 w-36 rounded bg-white/[0.06]" />
				<div className="mt-4 h-10 w-72 rounded bg-white/[0.06]" />
				<div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="glass rounded-2xl h-32" />
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
				<div className="glass rounded-2xl h-72 lg:col-span-2" />
				<div className="glass rounded-2xl h-72" />
			</div>
		</div>
	);
}
