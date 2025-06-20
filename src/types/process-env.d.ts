export {};

declare global {
	namespace Bun {
		interface ProcessEnv {
			PROVIDER_ACCOUNT_NAME: string;
			APP_ENV: 'local' | 'homolog' | 'production';
			CAPTCHA_KEY: string;
			PROXY_ENABLED: 'true' | 'false';
		}
	}
}
