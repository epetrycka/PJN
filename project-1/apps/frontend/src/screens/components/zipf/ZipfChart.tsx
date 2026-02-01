import type { ZipfMetadata, ZipfPoint } from "../../../../commons/types";

type ZipfChartProps = {
	points: ZipfPoint[];
	metadata: ZipfMetadata;
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 320;
const MARGIN = { top: 20, right: 28, bottom: 40, left: 46 };

export default function ZipfChart({ points, metadata }: ZipfChartProps) {
	const logRanks = points.map((point) => point.log_rank);
	const logFrequencies = points.map((point) => point.log_frequency);

	const minLogRank = Math.min(...logRanks);
	const maxLogRank = Math.max(...logRanks);
	const minLogFrequency = Math.min(...logFrequencies);
	const maxLogFrequency = Math.max(...logFrequencies);

	const chartWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
	const chartHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

	const rankRange = Math.max(maxLogRank - minLogRank, 1e-6);
	const frequencyRange = Math.max(maxLogFrequency - minLogFrequency, 1e-6);

	const scaleX = (value: number) =>
		MARGIN.left + ((value - minLogRank) / rankRange) * chartWidth;

	const scaleY = (value: number) =>
		CHART_HEIGHT - MARGIN.bottom - ((value - minLogFrequency) / frequencyRange) * chartHeight;

	const lineStartY = metadata.slope * minLogRank + metadata.intercept;
	const lineEndY = metadata.slope * maxLogRank + metadata.intercept;
	const linePath = `M${scaleX(minLogRank)} ${scaleY(lineStartY)} L${scaleX(
		maxLogRank
	)} ${scaleY(lineEndY)}`;

	const TICK_COUNT = 4;
	const xTicks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => {
		const ratio = index / TICK_COUNT;
		return minLogRank + ratio * rankRange;
	});
	const yTicks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => {
		const ratio = index / TICK_COUNT;
		return minLogFrequency + ratio * frequencyRange;
	});

	return (
		<div className="w-full overflow-x-auto">
			<svg
				role="img"
				aria-label="Wykres log-log rangi słowa względem jego częstości"
				viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
				className="h-[320px] w-full"
			>
				<rect
					x={0}
					y={0}
					width="100%"
					height="100%"
					fill="transparent"
				/>

				{xTicks.map((tickValue) => (
					<g key={`x-${tickValue}`}>
						<line
							x1={scaleX(tickValue)}
							x2={scaleX(tickValue)}
							y1={MARGIN.top}
							y2={CHART_HEIGHT - MARGIN.bottom}
							stroke="var(--color-base-content)"
							strokeOpacity={0.12}
						/>
						<text
							x={scaleX(tickValue)}
							y={CHART_HEIGHT - MARGIN.bottom + 18}
							fontSize={11}
							fill="var(--color-base-content)"
							textAnchor="middle"
						>
							{tickValue.toFixed(1)}
						</text>
					</g>
				))}

				{yTicks.map((tickValue) => (
					<g key={`y-${tickValue}`}>
						<line
							x1={MARGIN.left}
							x2={CHART_WIDTH - MARGIN.right}
							y1={scaleY(tickValue)}
							y2={scaleY(tickValue)}
							stroke="var(--color-base-content)"
							strokeOpacity={0.08}
						/>
						<text
							x={MARGIN.left - 8}
							y={scaleY(tickValue) + 4}
							fontSize={11}
							fill="var(--color-base-content)"
							textAnchor="end"
						>
							{tickValue.toFixed(1)}
						</text>
					</g>
				))}

				<line
					x1={MARGIN.left}
					x2={CHART_WIDTH - MARGIN.right}
					y1={CHART_HEIGHT - MARGIN.bottom}
					y2={CHART_HEIGHT - MARGIN.bottom}
					stroke="var(--color-base-content)"
					strokeWidth={1}
				/>
				<line
					x1={MARGIN.left}
					x2={MARGIN.left}
					y1={MARGIN.top}
					y2={CHART_HEIGHT - MARGIN.bottom}
					stroke="var(--color-base-content)"
					strokeWidth={1}
				/>

				<path
					d={linePath}
					fill="none"
					stroke="var(--color-primary)"
					strokeWidth={2.5}
					strokeLinecap="round"
				/>

				{points.map((point) => (
					<circle
						key={`${point.rank}-${point.word}`}
						cx={scaleX(point.log_rank)}
						cy={scaleY(point.log_frequency)}
						r={3}
						fill="var(--color-secondary)"
					>
						<title>
							{point.rank}. {point.word} — {point.frequency.toLocaleString("pl-PL")}
						</title>
					</circle>
				))}

				<text
					x={CHART_WIDTH - MARGIN.right}
					y={CHART_HEIGHT - 10}
					fontSize={11}
					fill="var(--color-base-content)"
					textAnchor="end"
				>
					log(ranga)
				</text>
				<text
					x={MARGIN.left}
					y={10}
					fontSize={11}
					fill="var(--color-base-content)"
					textAnchor="start"
				>
					log(częstości)
				</text>
			</svg>
		</div>
	);
}
