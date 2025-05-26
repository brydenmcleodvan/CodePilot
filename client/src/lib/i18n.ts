import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';

// Regional configuration for compliance and health guidance
const regionalConfig = {
  'en-US': {
    region: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    emergencyNumber: '911',
    healthSystem: 'imperial',
    regulations: ['HIPAA', 'HITECH']
  },
  'en-GB': {
    region: 'UK',
    currency: 'GBP', 
    dateFormat: 'DD/MM/YYYY',
    emergencyNumber: '999',
    healthSystem: 'metric',
    regulations: ['UK-GDPR', 'DPA2018']
  },
  'es': {
    region: 'ES',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY', 
    emergencyNumber: '112',
    healthSystem: 'metric',
    regulations: ['GDPR', 'LOPD']
  },
  'es-MX': {
    region: 'MX',
    currency: 'MXN',
    dateFormat: 'DD/MM/YYYY',
    emergencyNumber: '911', 
    healthSystem: 'metric',
    regulations: ['LFPDPPP']
  },
  'fr': {
    region: 'FR',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    emergencyNumber: '15',
    healthSystem: 'metric',
    regulations: ['GDPR', 'HDS']
  },
  'de': {
    region: 'DE', 
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    emergencyNumber: '112',
    healthSystem: 'metric',
    regulations: ['GDPR', 'BDSG']
  },
  'zh': {
    region: 'CN',
    currency: 'CNY',
    dateFormat: 'YYYY/MM/DD',
    emergencyNumber: '120',
    healthSystem: 'metric',
    regulations: ['PIPL', 'CSL']
  }
};

const resources = {
  en: {
    common: enCommon
  },
  es: {
    common: esCommon
  },
  fr: {
    common: {
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        telehealth: "Parler à un Médecin",
        coach: "Tableau de bord Coach",
        summary: "Intelligence Santé",
        email: "Automatisation Email",
        settings: "Paramètres",
        privacy: "Confidentialité"
      },
      health: {
        score: "Score de Santé",
        metrics: "Métriques de Santé",
        goals: "Objectifs de Santé",
        insights: "Insights IA",
        alerts: "Alertes Santé",
        trends: "Tendances Santé",
        recommendations: "Recommandations",
        analysis: "Analyse de Santé"
      },
      telehealth: {
        title: "Parler à un Médecin",
        subtitle: "Connectez-vous instantanément avec des professionnels médicaux agréés",
        emergency: "Consultation d'urgence",
        routine: "Consultation de routine",
        emergency_disclaimer: "Pour les urgences vitales, appelez le 15 immédiatement"
      },
      compliance: {
        title: "Confidentialité et Protection des Données",
        consent_management: "Gestion du Consentement",
        data_processing: "Consentement de Traitement des Données",
        your_rights: "Vos Droits de Confidentialité"
      },
      common: {
        loading: "Chargement...",
        save: "Enregistrer",
        cancel: "Annuler",
        confirm: "Confirmer"
      }
    }
  },
  de: {
    common: {
      navigation: {
        home: "Startseite",
        dashboard: "Dashboard",
        telehealth: "Mit einem Arzt sprechen",
        coach: "Coach Dashboard",
        summary: "Gesundheitsintelligenz",
        email: "E-Mail-Automatisierung",
        settings: "Einstellungen",
        privacy: "Datenschutz"
      },
      health: {
        score: "Gesundheitswert",
        metrics: "Gesundheitsmetriken",
        goals: "Gesundheitsziele",
        insights: "KI-Erkenntnisse",
        alerts: "Gesundheitswarnungen",
        trends: "Gesundheitstrends",
        recommendations: "Empfehlungen",
        analysis: "Gesundheitsanalyse"
      },
      telehealth: {
        title: "Mit einem Arzt sprechen",
        subtitle: "Sofortige Verbindung mit lizenzierten Medizinern",
        emergency: "Notfallberatung",
        routine: "Routineberatung",
        emergency_disclaimer: "Bei lebensbedrohlichen Notfällen rufen Sie sofort 112 an"
      },
      compliance: {
        title: "Datenschutz und Datenschutz",
        consent_management: "Einverständnisverwaltung",
        data_processing: "Datenverarbeitungseinverständnis",
        your_rights: "Ihre Datenschutzrechte"
      },
      common: {
        loading: "Wird geladen...",
        save: "Speichern",
        cancel: "Abbrechen",
        confirm: "Bestätigen"
      }
    }
  },
  zh: {
    common: {
      navigation: {
        home: "首页",
        dashboard: "仪表板",
        telehealth: "与医生交谈",
        coach: "教练仪表板",
        summary: "健康智能",
        email: "邮件自动化",
        settings: "设置",
        privacy: "隐私"
      },
      health: {
        score: "健康评分",
        metrics: "健康指标",
        goals: "健康目标",
        insights: "AI洞察",
        alerts: "健康警报",
        trends: "健康趋势",
        recommendations: "建议",
        analysis: "健康分析"
      },
      telehealth: {
        title: "与医生交谈",
        subtitle: "立即与持牌医疗专业人士联系",
        emergency: "紧急咨询",
        routine: "常规咨询",
        emergency_disclaimer: "如遇危及生命的紧急情况，请立即拨打120"
      },
      compliance: {
        title: "隐私和数据保护",
        consent_management: "同意管理",
        data_processing: "数据处理同意",
        your_rights: "您的隐私权利"
      },
      common: {
        loading: "加载中...",
        save: "保存",
        cancel: "取消",
        confirm: "确认"
      }
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'healthmap_language',
      caches: ['localStorage']
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

// Helper functions for regional configuration
export const getRegionalConfig = (language: string) => {
  return regionalConfig[language] || regionalConfig['en-US'];
};

export const getEmergencyNumber = (language: string) => {
  const config = getRegionalConfig(language);
  return config.emergencyNumber;
};

export const getRegulationsForLanguage = (language: string) => {
  const config = getRegionalConfig(language);
  return config.regulations;
};

export const formatHealthValue = (value: number, metric: string, language: string) => {
  const config = getRegionalConfig(language);
  
  if (metric === 'weight') {
    if (config.healthSystem === 'imperial') {
      return `${value} lbs`;
    } else {
      return `${(value * 0.453592).toFixed(1)} kg`;
    }
  }
  
  if (metric === 'height') {
    if (config.healthSystem === 'imperial') {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      return `${feet}'${inches}"`;
    } else {
      return `${(value * 2.54).toFixed(0)} cm`;
    }
  }
  
  return value.toString();
};

export const getCurrencySymbol = (language: string) => {
  const config = getRegionalConfig(language);
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'MXN': '$',
    'CNY': '¥'
  };
  return symbols[config.currency] || '$';
};

export default i18n;