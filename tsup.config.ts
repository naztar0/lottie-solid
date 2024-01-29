import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';

const preset_options: preset.PresetOptions = {
  entries: [{ entry: 'src/index.ts' }],
  // drop_console: true,
};

export default defineConfig(() => {
  const parsed_options = preset.parsePresetOptions(preset_options);
  const package_fields = preset.generatePackageExports(parsed_options);

  preset.writePackageJson(package_fields).then();

  return preset.generateTsupOptions(parsed_options);
});
