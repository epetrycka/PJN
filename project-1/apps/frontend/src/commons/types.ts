export type FeatureId = "frequency" | "zipf" | "core" | "nouns" | "semantic";

export type FeatureTab = {
	id: FeatureId;
	label: string;
};

export type FrequencyEntry = {
	rank: number;
	word: string;
	count: number;
	relative_frequency: number;
};

export type FrequencyMetadata = {
	total_tokens: number;
	unique_words: number;
	source_corpus_tokens: number;
};

export type FrequencyResponse = {
	metadata: FrequencyMetadata;
	data: FrequencyEntry[];
};

export type FrequencySortKey =
	| "rank"
	| "word"
	| "count"
	| "relative_frequency";

export type ZipfPoint = {
	rank: number;
	word: string;
	frequency: number;
	log_rank: number;
	log_frequency: number;
};

export type ZipfMetadata = {
	points_count: number;
	slope: number;
	intercept: number;
	r_squared: number;
	expected_frequency_factor: number;
};

export type ZipfResponse = {
	metadata: ZipfMetadata;
	points: ZipfPoint[];
};

export type CoreNode = {
	id: string;
	frequency: number;
	unique_neighbors: number;
	connection_weight: number;
};

export type CoreEdge = {
	source: string;
	target: string;
	weight: number;
};

export type CoreMetadata = {
	target_unique_words: number;
	unique_words_observed: number;
	total_tokens_observed: number;
	articles_used?: number;
	files_considered?: number;
	lemma_strategy?: string;
	min_frequency?: number;
	min_connection_weight?: number;
	max_nodes?: number;
	selected_nodes?: number;
	selected_edges?: number;
};

export type CoreResponse = {
	metadata: CoreMetadata;
	nodes: CoreNode[];
	edges: CoreEdge[];
};

export type SemanticNode = {
	id: string;
	frequency: number;
};

export type SemanticEdge = {
	source: string;
	target: string;
	weight: number;
};

export type SemanticSubgraphMetadata = {
	left_label: string;
	right_label: string;
	left_count: number;
	right_count: number;
	edge_count: number;
};

export type SemanticSubgraph = {
	metadata: SemanticSubgraphMetadata;
	left_nodes: SemanticNode[];
	right_nodes: SemanticNode[];
	edges: SemanticEdge[];
};

export type SemanticMetadata = {
	top_n: number;
	min_connection: number;
	target_tokens: number;
	total_tokens_observed: number;
	lemma_strategy: string;
	pos_strategy: string;
};

export type SemanticResponse = {
	metadata: SemanticMetadata;
	adjective_noun: SemanticSubgraph;
	verb_noun: SemanticSubgraph;
};
