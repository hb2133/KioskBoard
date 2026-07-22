import type { Configuration } from 'webpack';
import path from 'path';
import { config as LoadEnvironment } from 'dotenv';
import { DefinePlugin } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

LoadEnvironment({ path: path.resolve(__dirname, '.env.local') });

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new DefinePlugin({
      __SUPABASE_URL__: JSON.stringify(process.env.KIOSKBOARD_SUPABASE_URL ?? ''),
      __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(process.env.KIOSKBOARD_SUPABASE_PUBLISHABLE_KEY ?? ''),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
