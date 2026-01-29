import { Procedure } from '../types';

const DEFAULT_STORE = "Saint-Antoine";
const GLOBAL_CC = "anthony.ballester@iservices.fr, christopher.dejean@iservices.fr, tiago.costa@iservices.pt";

const STORES = [
    "Saint-Antoine",
    "Forum des Halles",
    "Rue de Rennes",
    "Commerce",
    "Saint Dominique",
    "Passy",
    "So Ouest",
    "4 Temps",
    "Aéroville",
    "Créteil",
    "Belle Epine",
    "Carré Sénart",
    "Dijon",
    "Lyon La Part Dieu",
    "Montpellier",
    "Toulouse",
    "Saint Rome ( Toulouse )"
];

export const procedures: Procedure[] = [
  {
      id: 'reprise', code: 'REPRISE', category: 'admin', icon: 'fa-mobile-retro',
      title: 'Déclaration Reprise',
      customSubject: 'REPRISE',
      desc: 'Rachat équipement client avec détails de l\'appareil.',
      to: 'central.distribuicao@iservices.pt',
      cc: GLOBAL_CC,
      staticFields: [
          { id: 'magasin', label: 'Nom du magasin', default: DEFAULT_STORE },
          { id: 'facture', label: 'N° Facture iServices', default: 'FC4', placeholder: 'Ex: FS 2024/123' }
      ],
      dynamicFields: [
          { id: 'model', label: 'iPhone (Modèle)', width: 'w-1/6', placeholder: 'Ex: 13 Pro' },
          { id: 'storage', label: 'Stockage', width: 'w-24', placeholder: '128GB' },
          { id: 'color', label: 'Couleur', width: 'w-24', placeholder: 'Gris' },
          { id: 'grade', label: 'Grade', width: 'w-24', placeholder: 'Excellent' },
          { id: 'imei', label: 'IMEI', width: 'w-1/6', placeholder: 'Numéro IMEI' },
          { id: 'val', label: 'Valeur €', width: 'w-24', type: 'number', placeholder: '0.00' },
          { id: 'info', label: 'Infos Complémentaires', width: 'flex-1', placeholder: 'Nouvel écran, Batterie HS...' }
      ]
  },
  {
      id: 'conso', code: 'CONSO', category: 'stock', icon: 'fa-box-tissue',
      title: 'Commande Consommables',
      customSubject: 'CONS',
      desc: 'Commande de packaging, produits de nettoyage et sacs.',
      to: 'consumiveis@iservices.pt',
      cc: "anthony.ballester@iservices.fr, christopher.dejean@iservices.fr, diogo.inverno@iservices.pt",
      staticFields: [
          { id: 'magasin', label: 'Nom du magasin', default: DEFAULT_STORE }
      ],
      dynamicFields: [
          { id: 'article', label: 'Article', width: 'flex-1', placeholder: 'Ex: Sacs moyens, Alcool...' },
          { id: 'qty', label: 'Qté souhaitée', width: 'w-32', type: 'number', default: '' }
      ]
  },
  {
      id: 'trf', code: 'TRF', category: 'stock', icon: 'fa-truck-fast',
      title: 'Demande de Transfert',
      customSubject: 'TRF',
      desc: 'Expédition de pièces entre magasins.',
      to: 'central.distribuicao@iservices.pt',
      cc: GLOBAL_CC,
      staticFields: [
          { id: 'exp', label: 'Magasin Expéditeur', placeholder: 'Sélectionner...', options: STORES },
          { id: 'dest', label: 'Magasin Destinataire', placeholder: 'Sélectionner...', options: STORES }
      ],
      dynamicFields: [
          { id: 'ref', label: 'Référence', width: 'flex-1' },
          { id: 'qty', label: 'Qté', width: 'w-20', type: 'number', default: '' },
          { id: 'imei', label: 'IMEI / SN', width: 'flex-1', placeholder: 'Optionnel' }
      ]
  },
  {
      id: 'ent', code: 'ENT', category: 'stock', icon: 'fa-circle-plus',
      title: 'Entrée de Stock',
      customSubject: 'ENT',
      desc: 'Demander des entrées de stock non liées aux bons de livraison.',
      to: 'central.distribuicao@iservices.pt',
      cc: GLOBAL_CC,
      staticFields: [
          { id: 'magasin', label: 'Nom du magasin', default: DEFAULT_STORE },
          { id: 'reason', label: 'Justification globale', placeholder: 'Oubli réception commande X' }
      ],
      dynamicFields: [
          { id: 'ref', label: 'Référence Article', width: 'flex-1' },
          { id: 'qty', label: 'Qté', width: 'w-24', type: 'number', default: '' },
          { id: 'imei', label: 'IMEI', width: 'flex-1', placeholder: 'Optionnel' }
      ]
  },
  {
      id: 'sort', code: 'SORT | SAI', category: 'stock', icon: 'fa-circle-minus',
      title: 'Sortie de Stock',
      customSubject: 'SORT', 
      desc: "Sorties non liées aux bons, articles d'occasion ou usage magasin.",
      to: 'central.distribuicao@iservices.pt',
      cc: GLOBAL_CC,
      staticFields: [
          { id: 'magasin', label: 'Nom du magasin', default: DEFAULT_STORE },
          { id: 'reason', label: 'Justification globale', placeholder: 'Usage interne / SAV' }
      ],
      dynamicFields: [
          { id: 'ref', label: 'Référence Article', width: 'flex-1' },
          { id: 'qty', label: 'Qté', width: 'w-24', type: 'number', default: '' },
          { id: 'imei', label: 'IMEI', width: 'flex-1', placeholder: 'Optionnel' }
      ]
  }
];