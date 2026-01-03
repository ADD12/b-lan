
/**
 * Local Data Service
 * In a real B-LAN scenario, this would interface with a local SQL Lite or PG instance.
 * Here we use LocalStorage to ensure persistence between reloads in the browser.
 */

export const getLocalData = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(`blan_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

export const setLocalData = <T,>(key: string, data: T): void => {
  localStorage.setItem(`blan_${key}`, JSON.stringify(data));
};

export const generateHash = (data: any): string => {
  // Simple hashing for simulation of immutable sidechain
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
};
