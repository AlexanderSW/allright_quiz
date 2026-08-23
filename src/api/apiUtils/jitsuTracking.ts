import { APIRequestContext } from '@playwright/test';
import { env, quizStartUrl } from '../../config/env';

export interface JitsuConfig {
    host: string;
    writeKey: string;
    datasetsConfigs: Array<{
        eventName: string[];
        writeKey: string;
    }>;
}

interface FrontendConfig {
    jitsu: JitsuConfig;
}

interface JitsuTrackingEvent {
    event: string;
    writeKey: string;
}

export async function getJitsuConfig(request: APIRequestContext): Promise<JitsuConfig> {
    const response = await request.get(quizStartUrl());
    if (!response.ok()) {
        throw new Error(`Could not load frontend config: HTTP ${response.status()}`);
    }

    const html = await response.text();
    const metaTag = html.match(/<meta\b[^>]*\bname=["']frontend\/config\/environment["'][^>]*>/i)?.[0];
    const encodedConfig = metaTag?.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (!encodedConfig) {
        throw new Error('Could not find frontend/config/environment meta content');
    }

    const config = JSON.parse(decodeURIComponent(encodedConfig)) as Partial<FrontendConfig>;
    if (
        !config.jitsu
        || typeof config.jitsu.host !== 'string'
        || typeof config.jitsu.writeKey !== 'string'
        || !Array.isArray(config.jitsu.datasetsConfigs)
    ) {
        throw new Error('Frontend config does not contain a valid Jitsu configuration');
    }

    return config.jitsu;
}

export function getJitsuWriteKey(config: JitsuConfig, frontendEventName: string): string {
    const eventName = frontendEventName.replace(/^FRONTEND_/, '');
    const dataset = config.datasetsConfigs.find(({ eventName: configuredEvents }) =>
        configuredEvents.some((configuredEvent) => eventName.includes(configuredEvent)),
    );

    return dataset?.writeKey ?? config.writeKey;
}

export async function sendJitsuTrackingEvent<T extends JitsuTrackingEvent>(
    request: APIRequestContext,
    config: JitsuConfig,
    event: T,
) {
    if (!env.baseUrl) {
        throw new Error('QUIZ_BASE_URL is required');
    }

    const writeKey = getJitsuWriteKey(config, event.event);
    return request.post(`${config.host}/api/s/track`, {
        headers: {
            Origin: env.baseUrl,
            Referer: `${env.baseUrl}/`,
            'x-write-key': writeKey,
        },
        data: {
            ...event,
            writeKey,
        },
    });
}
