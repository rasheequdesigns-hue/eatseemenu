import { AppSettings } from '../types';

export const mockDB = {
  getSettings: (): AppSettings => ({
    appName: "Eatsee Menu Portal",
    appDescription: "Interactive food brand storefront and menu management.",
    showTextInput: true,
    logoBase64: "",
    systemInstruction: "You are a helpful assistant for Eatsee Food Products.",
    adminPassword: "admin",
    modelSelection: 'gemini-1.5-pro',
    safetyThreshold: 'Medium',
    enableVoiceInput: true,
    maintenanceMode: false
  })
};
