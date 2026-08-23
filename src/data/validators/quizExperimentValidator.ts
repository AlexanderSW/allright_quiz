import { QuizExperimentResponseDto } from '../dto/quizExperimentDto';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Runtime validation is required here: a TypeScript interface alone does not
// verify JSON received from the stage API.
export function assertValidQuizExperimentResponse(payload: unknown): QuizExperimentResponseDto {
    if (!isRecord(payload) || !isRecord(payload.data)) {
        throw new Error('Experiment response must contain a "data" object');
    }

    const { data } = payload;
    if (data.type !== 'experiments') {
        throw new Error(`Expected data.type "experiments", got ${JSON.stringify(data.type)}`);
    }
    if (typeof data.id !== 'string' || data.id.length === 0) {
        throw new Error('Experiment data.id must be a non-empty string');
    }
    if (!isRecord(data.attributes)) {
        throw new Error('Experiment data.attributes must be an object');
    }

    const attributes = data.attributes;
    if (typeof attributes.alias !== 'string' || attributes.alias.length === 0) {
        throw new Error('Experiment attributes.alias must be a non-empty string');
    }
    if (typeof attributes.name !== 'string' || attributes.name.length === 0) {
        throw new Error('Experiment attributes.name must be a non-empty string');
    }
    if (!isRecord(attributes.desc)) {
        throw new Error('Experiment attributes.desc must be an object');
    }
    if (!isRecord(attributes.variants) || Object.keys(attributes.variants).length === 0) {
        throw new Error('Experiment attributes.variants must contain at least one variant');
    }

    for (const [variant, allocation] of Object.entries(attributes.variants)) {
        if (!variant || typeof allocation !== 'number' || !Number.isFinite(allocation) || allocation < 0) {
            throw new Error(`Invalid experiment variant allocation: ${JSON.stringify({ variant, allocation })}`);
        }
    }

    const currentVariant = attributes['current-variant'];
    if (typeof currentVariant !== 'string' || !(currentVariant in attributes.variants)) {
        throw new Error('Experiment current variant must be one of attributes.variants');
    }
    if (typeof attributes['is-deleted'] !== 'boolean') {
        throw new Error('Experiment attributes.is-deleted must be a boolean');
    }
    if (attributes['result-variant'] !== null && typeof attributes['result-variant'] !== 'string') {
        throw new Error('Experiment attributes.result-variant must be a string or null');
    }
    if (typeof attributes['created-at'] !== 'string' || Number.isNaN(Date.parse(attributes['created-at']))) {
        throw new Error('Experiment attributes.created-at must be an ISO date string');
    }
    if (typeof attributes['updated-at'] !== 'string' || Number.isNaN(Date.parse(attributes['updated-at']))) {
        throw new Error('Experiment attributes.updated-at must be an ISO date string');
    }
    if (payload.included !== undefined && !Array.isArray(payload.included)) {
        throw new Error('Experiment included must be an array when present');
    }

    return payload as unknown as QuizExperimentResponseDto;
}
