import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'root-api',
  projectName: 'nfc-root-api',
  productionContainer: 'notify-root-api',
  developContainer: 'notify-root-api',
});

export const runRootApiBuild = async () => {
  await baseBundler(
    manifest,
    `bun build --target=bun ./apps/${manifest.projectName}/src/main.ts --outdir ./dist/apps/${manifest.projectName}`
  );
};
