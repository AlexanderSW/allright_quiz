export interface QuizExperimentAttributesDto {
    alias: string;
    name: string;
    desc: Record<string, string>;
    variants: Record<string, number>;
    'current-variant': string;
    'is-deleted': boolean;
    'result-variant': string | null;
    'created-at': string;
    'updated-at': string;
}

export interface QuizExperimentResponseDto {
    data: {
        type: 'experiments';
        id: string;
        attributes: QuizExperimentAttributesDto;
        relationships?: Record<string, unknown>;
    };
    included?: Array<{
        type: string;
        id: string;
        attributes: Record<string, unknown>;
    }>;
}
