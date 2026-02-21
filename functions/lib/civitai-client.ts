import { Civitai, Scheduler } from 'civitai';

let civitaiClient: Civitai | null = null;

export function getCivitaiClient(authToken: string): Civitai {
  if (!civitaiClient) {
    civitaiClient = new Civitai({ auth: authToken });
  }
  return civitaiClient;
}

// Civitai model URN mappings
export const CIVITAI_MODELS: Record<number, { urn: string; name: string }> = {
  6: { 
    urn: 'urn:air:sd1:checkpoint:civitai:2342797@2635223', 
    name: 'Z Image Base' 
  },
  7: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:827184@2514310', 
    name: 'WAI-illustrious-SDXL' 
  },
  9: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:140272@2615702', 
    name: 'Hassaku XL Illustrious' 
  },
  10: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:1224788@2684252', 
    name: 'Prefect Illustrious XL' 
  },
  11: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:833294@1190596', 
    name: 'NoobAI XL' 
  },
  12: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:795765@889818', 
    name: 'Illustrious XL' 
  },
  13: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:681901@2640896', 
    name: 'Indigo Void Furry Fused XL' 
  },
  14: { 
    urn: 'urn:air:sdxl:checkpoint:civitai:1374476@2212786', 
    name: 'BoytakuDream merge' 
  },
};

// Helper to get model URN by ID
export function getCivitaiModelUrn(modelId: number): string | null {
  return CIVITAI_MODELS[modelId]?.urn || null;
}

// Helper to check if a model ID is a Civitai model
export function isCivitaiModel(modelId: number): boolean {
  return modelId in CIVITAI_MODELS;
}

export { Scheduler };
