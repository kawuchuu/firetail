import { shallowRef, type Component } from 'vue'
import { loadPlugin, type LoadedPlugin, type NavItem } from './loader'

interface PluginRoute {
  routeName: string,
  routePath: string,
  component: Component
}

const loadedPlugins = shallowRef<LoadedPlugin[]>([]);
const navItems = shallowRef<NavItem[]>([]);
const pluginRoutes = shallowRef<PluginRoute[]>([]);

async function loadAll() {
  const entries = await window.plugins.getPluginManifests();
  const results = await Promise.allSettled(entries.map(({ pluginDir, manifest }) => loadPlugin(pluginDir, manifest)));

  const loaded: LoadedPlugin[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') loaded.push(result.value);
    else console.error('Failed to load plugin:', result.reason);
  }
  loadedPlugins.value = loaded;

  navItems.value = loaded.flatMap(p => (p.manifest.contributes.navItems ?? []).map(item => ({...item, id: p.manifest.id, route: { name: `${p.manifest.id}:${item.route}` }})));

  pluginRoutes.value = loaded.flatMap(p =>
      (p.manifest.contributes.routes ?? []).map(route => ({
        routeName: `${p.manifest.id}:${route.path}`,
        routePath: `${p.manifest.id}/${route.path}`,
        component: p.components.find(x => x.name === route.componentName)!.component
      }))
  );
}

export function usePlugins() {
  return { loadedPlugins, navItems, pluginRoutes, loadAll }
}