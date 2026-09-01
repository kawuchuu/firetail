import type { Component } from 'vue'

export interface PluginManifest {
  id: string,
  name: string,
  version: string,
  entry: string,
  cssFile: string,
  contributes: {
    routes?: Routes[],
    navItems?: NavItem[]
  }
}
export interface NavItem {
  label: string,
  icon: string,
  route: string | { name: string },
  id?: string
}
export interface PluginComponent {
  name: string,
  component: Component
}
export interface Routes {
  path: string,
  componentName: string
}
export interface LoadedPlugin {
  manifest: PluginManifest,
  components: PluginComponent[]
}

async function loadPluginModule(pluginDir: string, entry: string, cssFile?: string): Promise<PluginComponent[]> {
  const filePath = await window.path.join(pluginDir, entry);
  const source = await window.plugins.readPluginFile(filePath);
  if (cssFile) {
    const cssFilePath = await window.path.join(pluginDir, cssFile);
    const cssFileSource = await window.plugins.readPluginFile(cssFilePath);
    const styleEl = document.createElement("style");
    styleEl.innerHTML = cssFileSource;
    document.head.appendChild(styleEl);
  }
  const fn = new Function('FiretailVue', 'FiretailAPI', `${source}; return FiretailPlugin`);
  const plugin = fn((window as any).FiretailVue, (window as any).FiretailAPI);
  if (!plugin?.components) throw new Error(`Plugin at ${filePath} does not export a component`);
  return plugin.components.map((item: PluginComponent) => ({ name: item.name, component: item.component }));
}

export async function loadPlugin(pluginDir: string, manifest: PluginManifest): Promise<LoadedPlugin> {
  const components = await loadPluginModule(pluginDir, manifest.entry, manifest.cssFile ?? manifest.cssFile);
  return { manifest, components }
}