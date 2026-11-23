import {Component} from "vue";
import GeneralSection from "./GeneralSection.vue";
import AccessibilitySection from "./AccessibilitySection.vue";
import LibrarySection from "./LibrarySection.vue";
import AppearanceSection from "./AppearanceSection.vue";
import IntegrationSection from "./IntegrationSection.vue";
import UpdatesSection from "./UpdatesSection.vue";
import AdvancedSection from "./AdvancedSection.vue";
import AboutSection from "./AboutSection.vue";

export interface SettingsSection {
    id: string;
    label: string;
    component: Component;
}

export const settingsSections: SettingsSection[] = [
    {id: 'general', label: 'GENERAL', component: GeneralSection},
    {id: 'accessibility', label: 'ACCESSIBILITY', component: AccessibilitySection},
    {id: 'library', label: 'LIBRARY', component: LibrarySection},
    {id: 'appearance', label: 'APPEARANCE', component: AppearanceSection},
    {id: 'integrations', label: 'INTEGRATION', component: IntegrationSection},
    {id: 'updates', label: 'UPDATE', component: UpdatesSection},
    {id: 'advanced', label: 'ADVANCED', component: AdvancedSection},
    {id: 'about', label: 'ABOUT', component: AboutSection},
];
