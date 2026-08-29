// frontend/src/constants/index.js

// CISCO par défaut
export const CISCO_DEFAUT = 'Midongy Atsimo';

// Communes du District de Midongy Sud (7 communes)
export const COMMUNES = [
    'Andranolalina',
    'Ankazovelo',
    'Bevaho',
    'Ivondro',
    'Nosifeno',
    'Soakibany',
    'Zara'
];

// ZAP du District avec noms complets
export const ZAP_OPTIONS = [
    { value: 'ZAP1', label: 'ZAP Andranolalina' },
    { value: 'ZAP2', label: 'ZAP Ankazovelo' },
    { value: 'ZAP3', label: 'ZAP Bevaho' },
    { value: 'ZAP4', label: 'ZAP Ivondro' },
    { value: 'ZAP5', label: 'ZAP Nosifeno' },
    { value: 'ZAP6', label: 'ZAP Soakibany' },
    { value: 'ZAP7', label: 'ZAP Zara' }
];

// Mapping commune -> ZAP
export const COMMUNE_ZAP_MAPPING = {
    'Andranolalina': { value: 'ZAP1', label: 'ZAP Andranolalina' },
    'Ankazovelo': { value: 'ZAP2', label: 'ZAP Ankazovelo' },
    'Bevaho': { value: 'ZAP3', label: 'ZAP Bevaho' },
    'Ivondro': { value: 'ZAP4', label: 'ZAP Ivondro' },
    'Nosifeno': { value: 'ZAP5', label: 'ZAP Nosifeno' },
    'Soakibany': { value: 'ZAP6', label: 'ZAP Soakibany' },
    'Zara': { value: 'ZAP7', label: 'ZAP Zara' }
};

// Types de Kits
export const KIT_SECTIONS = [
    'Préscolaire',
    'Primaire',
    'Secondaire (CEG)',
    'Secondaire (Lycée)'
];

// Rôles utilisateurs
export const USER_ROLES = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'gestionnaire', label: 'Gestionnaire' }
];

// ============================================
// ✅ FONCTIONS UTILITAIRES (AJOUTER CE CODE)
// ============================================

/**
 * Obtenir le label d'un ZAP à partir de sa valeur
 * @param {string} zapValue - La valeur du ZAP (ex: 'ZAP5')
 * @returns {string} - Le label du ZAP (ex: 'ZAP Nosifeno')
 */
export function getZapLabel(zapValue) {
    if (!zapValue) return '-';
    const zap = ZAP_OPTIONS.find(z => z.value === zapValue);
    return zap ? zap.label : zapValue;
}

/**
 * Obtenir les informations du ZAP à partir du nom de la commune
 * @param {string} commune - Le nom de la commune
 * @returns {object|null} - L'objet ZAP { value, label } ou null
 */
export function getZapByCommune(commune) {
    if (!commune) return null;
    return COMMUNE_ZAP_MAPPING[commune] || null;
}

/**
 * Obtenir la valeur du ZAP à partir du nom de la commune
 * @param {string} commune - Le nom de la commune
 * @returns {string} - La valeur du ZAP (ex: 'ZAP5')
 */
export function getZapValueByCommune(commune) {
    const zap = getZapByCommune(commune);
    return zap ? zap.value : '';
}

/**
 * Obtenir le label du ZAP à partir du nom de la commune
 * @param {string} commune - Le nom de la commune
 * @returns {string} - Le label du ZAP (ex: 'ZAP Nosifeno')
 */
export function getZapLabelByCommune(commune) {
    const zap = getZapByCommune(commune);
    return zap ? zap.label : '-';
}