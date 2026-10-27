import * as migration_20261027_145650_initial from './20261027_145650_initial';

export const migrations = [
  {
    up: migration_20261027_145650_initial.up,
    down: migration_20261027_145650_initial.down,
    name: '20261027_145650_initial'
  },
];
