import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'api',
  projectName: 'nfc-api',
  productionContainer: 'notify-api',
  developContainer: 'ptc-notify-api',
});

export const runApiBuild = async () => {
  await baseBundler(
    manifest,
    `bun build --target=bun ./apps/${manifest.projectName}/src/main.ts --outdir ./dist/apps/${manifest.projectName}`
  );
};
