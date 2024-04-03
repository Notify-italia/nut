import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'api',
  buildName: 'nfc-api',
  productionContainer: 'notify-api',
  developContainer: 'ptc-notify-api',
});

export const runApiBuild = async () => {
  await baseBundler(
    manifest,
    `bun build --target=bun ./apps/${manifest.buildName}/src/main.ts --outdir ./dist/apps/${manifest.buildName}`
  );
};
