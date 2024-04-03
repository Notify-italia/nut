import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'company',
  projectName: 'nfc-company-client',
  productionContainer: 'company-client',
  developContainer: 'ptc-company-client',
  serve: {
    port: 4220,
  },
});

export const runCompanyClientBuild = async () => {
  await baseBundler(manifest);
};
