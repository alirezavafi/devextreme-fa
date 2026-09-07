import { BuildOptions } from 'esbuild';
import { join, resolve } from 'path';
import ignoreMissingCss from '../plugins/ignore-missing-css';
import {
  getDestinationPathByDemo, getSourcePathByDemo,
} from '../helper';
import { ESBundler } from '../helper/bundler';
import { Demo } from '../helper/types';

export default class ReactBundler extends ESBundler {
  constructor() {
    super('React');
  }

  getBuildOptions = (demo: Demo): BuildOptions => {
    const sourceDemoPath = getSourcePathByDemo(demo, this.framework);
    const destinationDemoPath = getDestinationPathByDemo(demo, this.framework);

    const options: BuildOptions = {
      bundle: true,
      minify: true,
      loader: {
        '.js': 'jsx',
        '.png': 'dataurl',
        '.svg': 'dataurl',
      },
      entryNames: '[dir]/bundle.[hash]',
      outdir: destinationDemoPath,
      alias: {
        react: resolve(__dirname, '../../../node_modules/react'),
        'react-dom': resolve(__dirname, '../../../node_modules/react-dom'),
        // Bare specifier that only the SystemJS demo configs map (see
        // configs/React/config.js); esbuild needs the same mapping.
        'anti-forgery': resolve(__dirname, '../../../shared/anti-forgery/fetch-override.js'),
      },
      entryPoints: this.#getEntryPoints(sourceDemoPath),
      plugins: [ignoreMissingCss],
    };

    return options;
  };

  #getEntryPoints = (sourceDemoPath: string) => [join(sourceDemoPath, 'index.js'), join(sourceDemoPath, 'styles.css')];
}
