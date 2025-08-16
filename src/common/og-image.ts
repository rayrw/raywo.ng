import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export function ogImage(): AstroIntegration {
	return {
		name: 'og-image-plugin',
		hooks: {
			'astro:build:done': async ({ assets, logger }) => {
				logger.info('generating og images');

				const ogImages = assets
					.values()
					.flatMap((urls) => [...urls])
					.map((url) => url.pathname)
					.filter((pathname) => pathname.endsWith('index.html'))
					.map((pathname) => generateOgImage(pathname, logger));

				await Promise.all(ogImages);

				logger.info('og images generated');
			},
		},
	};
}

async function generateOgImage(
	pathname: string,
	logger: AstroIntegrationLogger,
) {
	const html = await readFile(pathname, { encoding: 'utf-8' });
	const title = html.match(/<meta property="og:title" content="(.*?)">/i)?.[1];
	const description = html.match(
		/<meta property="og:description" content="(.*?)">/i,
	)?.[1];
	const publishDate = html.match(/<span id="publish-date">(.*?)<\/span>/i)?.[1];
	const readingTime = html.match(/<span id="reading-time">(.*?)<\/span>/i)?.[1];

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: 1200,
					height: 600,
					boxSizing: 'border-box',
					padding: '72px 36px 60px 36px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontFamily: 'DejaVu Mono',
					background: '#ffffff',
					color: '#040711',
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center',
							},
							children: [
								{
									type: 'h1',
									props: {
										style: { fontWeight: 700, fontSize: '72px' },
										children: title,
									},
								},
								{
									type: 'p',
									props: {
										style: {
											fontSize: '28px',
											textAlign: 'center',
											color: '#505967',
										},
										children: description,
									},
								},
								...(publishDate && readingTime
									? [
											{
												type: 'div',
												props: {
													style: {
														fontSize: '28px',
														textAlign: 'center',
													},
													children: `${publishDate} - ${readingTime}`,
												},
											},
										]
									: []),
							],
						},
					},
					{
						type: 'div',
						props: {
							style: {
								fontSize: '28px',
								textAlign: 'center',
								opacity: '0.9',
							},
							children: 'Ray Wong - https://rayrw.dev',
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 600,
			fonts: [
				{
					name: 'DejaVu Mono',
					weight: 400,
					data: await readFile(
						'./public/fonts/dejavu-mono-latin-400-normal.woff',
					),
					style: 'normal',
				},
				{
					name: 'DejaVu Mono',
					weight: 700,
					data: await readFile(
						'./public/fonts/dejavu-mono-latin-700-normal.woff',
					),
					style: 'normal',
				},
				{
					name: 'Noto Sans JP Variable',
					weight: 400,
					data: await readFile(
						'./public/fonts/noto-sans-jp-japanese-400-normal.woff',
					),
					style: 'normal',
				},
				{
					name: 'Noto Sans JP Variable',
					weight: 700,
					data: await readFile(
						'./public/fonts/noto-sans-jp-japanese-700-normal.woff',
					),
					style: 'normal',
				},
			],
		},
	);

	const resvg = new Resvg(svg);
	const png = resvg.render();
	const pngBuffer = png.asPng();

	const writePath = pathname.replace(/\/index\.html$/, '/og.png');
	logger.info(writePath);
	await writeFile(writePath, pngBuffer);
}
