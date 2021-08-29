export function verifyAndFillConfiguration(cfg) {
  const {fields} = cfg;
  const pluginName = 'PluginDigitalIxnMetrics';
  if (! cfg)
    throw new Error(`${pluginName}: attributes.${pluginName} NOT configured. See README for instructions.`);
  return cfg;
}
