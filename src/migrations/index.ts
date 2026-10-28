import * as migration_20261027_145650_initial from './20261027_145650_initial';
import * as migration_20261028_143156_option_summary from './20261028_143156_option_summary';

export const migrations = [
  {
    up: migration_20261027_145650_initial.up,
    down: migration_20261027_145650_initial.down,
    name: '20261027_145650_initial',
  },
  {
    up: migration_20261028_143156_option_summary.up,
    down: migration_20261028_143156_option_summary.down,
    name: '20261028_143156_option_summary'
  },
];
