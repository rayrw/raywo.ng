// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { SITE_LOCALES, SITE_DEFAULT_LOCALE } from './src/common/consts';
import { remarkReadingTime } from './src/common/remark';
import { ogImage } from './src/common/og-image';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://rayrw.dev',
	integrations: [mdx(), sitemap(), ogImage()],

	markdown: {
		shikiConfig: {
			theme: 'github-dark-high-contrast',
		},
		remarkPlugins: [remarkReadingTime],
	},

	i18n: {
		locales: SITE_LOCALES,
		defaultLocale: SITE_DEFAULT_LOCALE,
		routing: {
			redirectToDefaultLocale: false,
			prefixDefaultLocale: false,
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
