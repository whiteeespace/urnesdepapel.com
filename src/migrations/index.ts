import * as migration_20261027_145650_initial from './20261027_145650_initial';
import * as migration_20261028_143156_option_summary from './20261028_143156_option_summary';
import * as migration_20261102_155820_remove_home_values from './20261102_155820_remove_home_values';
import * as migration_20261102_185527_media_object_key from './20261102_185527_media_object_key';

export const migrations = [
  {
    up: migration_20261027_145650_initial.up,
    down: migration_20261027_145650_initial.down,
    name: '20261027_145650_initial',
  },
  {
    up: migration_20261028_143156_option_summary.up,
    down: migration_20261028_143156_option_summary.down,
    name: '20261028_143156_option_summary',
  },
  {
    up: migration_20261102_155820_remove_home_values.up,
    down: migration_20261102_155820_remove_home_values.down,
    name: '20261102_155820_remove_home_values',
  },
  {
    up: migration_20261102_185527_media_object_key.up,
    down: migration_20261102_185527_media_object_key.down,
    name: '20261102_185527_media_object_key'
  },
];
