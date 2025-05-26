/**
 * i18n Configuration for Language Switching
 * Enables dynamic language switching with health-specific translations
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from '../locales/en/common.json';
import esTranslations from '../locales/es/common.json';

const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: {
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        telehealth: "Consulter un Médecin",
        coach: "Tableau de bord Coach",
        summary: "Intelligence Santé",
        marketplace: "Marché de la Santé",
        "b2b-licensing": "Licences B2B",
        settings: "Paramètres",
        privacy: "Confidentialité"
      },
      health: {
        score: "Score de Santé",
        metrics: "Métriques de Santé",
        goals: "Objectifs de Santé",
        insights: "Insights IA",
        recommendations: "Recommandations"
      },
      telehealth: {
        title: "Consulter un Médecin",
        subtitle: "Connectez-vous instantanément avec des professionnels médicaux agréés",
        emergency: "Consultation d'urgence",
        routine: "Consultation de routine",
        emergency_disclaimer: "Pour les urgences vitales, appelez le 15 immédiatement"
      },
      marketplace: {
        title: "Marché Intelligent de la Santé",
        personalized_recommendations: "Recommandations personnalisées basées sur vos données de santé",
        shop_now: "Acheter maintenant",
        evidence_level: "Niveau de preuve",
        community_results: "Résultats de la communauté"
      },
      subscription: {
        basic: "Suivi de Santé Basique",
        premium: "Intelligence Santé Premium",
        pro: "Plateforme Santé Professionnelle",
        upgrade: "Mettre à niveau",
        features: "Fonctionnalités"
      },
      common: {
        loading: "Chargement...",
        save: "Enregistrer",
        cancel: "Annuler",
        confirm: "Confirmer",
        success: "Succès",
        error: "Erreur"
      }
    }
  },
  de: {
    translation: {
      navigation: {
        home: "Startseite",
        dashboard: "Dashboard",
        telehealth: "Arzt konsultieren",
        coach: "Coach Dashboard",
        summary: "Gesundheitsintelligenz",
        marketplace: "Gesundheitsmarkt",
        "b2b-licensing": "B2B-Lizenzen",
        settings: "Einstellungen",
        privacy: "Datenschutz"
      },
      health: {
        score: "Gesundheitswert",
        metrics: "Gesundheitsmetriken",
        goals: "Gesundheitsziele",
        insights: "KI-Erkenntnisse",
        recommendations: "Empfehlungen"
      },
      telehealth: {
        title: "Arzt konsultieren",
        subtitle: "Sofortige Verbindung mit lizenzierten Medizinern",
        emergency: "Notfallberatung",
        routine: "Routineberatung",
        emergency_disclaimer: "Bei lebensbedrohlichen Notfällen rufen Sie sofort 112 an"
      },
      marketplace: {
        title: "Intelligenter Gesundheitsmarkt",
        personalized_recommendations: "Personalisierte Empfehlungen basierend auf Ihren Gesundheitsdaten",
        shop_now: "Jetzt einkaufen",
        evidence_level: "Evidenzlevel",
        community_results: "Community-Ergebnisse"
      },
      subscription: {
        basic: "Basis-Gesundheitsverfolgung",
        premium: "Premium-Gesundheitsintelligenz",
        pro: "Professionelle Gesundheitsplattform",
        upgrade: "Upgrade",
        features: "Funktionen"
      },
      common: {
        loading: "Wird geladen...",
        save: "Speichern",
        cancel: "Abbrechen",
        confirm: "Bestätigen",
        success: "Erfolg",
        error: "Fehler"
      }
    }
  },
  zh: {
    translation: {
      navigation: {
        home: "首页",
        dashboard: "仪表板",
        telehealth: "咨询医生",
        coach: "教练仪表板",
        summary: "健康智能",
        marketplace: "健康市场",
        "b2b-licensing": "B2B许可",
        settings: "设置",
        privacy: "隐私"
      },
      health: {
        score: "健康评分",
        metrics: "健康指标",
        goals: "健康目标",
        insights: "AI洞察",
        recommendations: "建议"
      },
      telehealth: {
        title: "咨询医生",
        subtitle: "立即与持牌医疗专业人士联系",
        emergency: "紧急咨询",
        routine: "常规咨询",
        emergency_disclaimer: "如遇危及生命的紧急情况，请立即拨打120"
      },
      marketplace: {
        title: "智能健康市场",
        personalized_recommendations: "基于您的健康数据的个性化推荐",
        shop_now: "立即购买",
        evidence_level: "证据水平",
        community_results: "社区结果"
      },
      subscription: {
        basic: "基础健康追踪",
        premium: "高级健康智能",
        pro: "专业健康平台",
        upgrade: "升级",
        features: "功能"
      },
      common: {
        loading: "加载中...",
        save: "保存",
        cancel: "取消",
        confirm: "确认",
        success: "成功",
        error: "错误"
      }
    }
  }
};

// Regional health guidance and emergency information
const regionalHealthData = {
  en: {
    emergencyNumber: '911',
    healthSystem: 'imperial',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    regulations: ['HIPAA', 'HITECH'],
    healthGuidance: {
      exercise: 'Aim for 150 minutes of moderate aerobic activity weekly',
      nutrition: 'Follow MyPlate guidelines with balanced portions',
      sleep: 'Adults should get 7-9 hours of quality sleep nightly'
    }
  },
  es: {
    emergencyNumber: '112',
    healthSystem: 'metric',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    regulations: ['GDPR', 'LOPD'],
    healthGuidance: {
      exercise: 'Busque 150 minutos de actividad aeróbica moderada semanalmente',
      nutrition: 'Siga una dieta mediterránea equilibrada rica en frutas y verduras',
      sleep: 'Los adultos deben dormir de 7-9 horas de calidad por noche'
    }
  },
  fr: {
    emergencyNumber: '15',
    healthSystem: 'metric',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    regulations: ['GDPR', 'HDS'],
    healthGuidance: {
      exercise: 'Visez 150 minutes d\'activité aérobique modérée par semaine',
      nutrition: 'Suivez un régime méditerranéen riche en fruits et légumes',
      sleep: 'Les adultes devraient dormir 7-9 heures de qualité par nuit'
    }
  },
  de: {
    emergencyNumber: '112',
    healthSystem: 'metric',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    regulations: ['GDPR', 'BDSG'],
    healthGuidance: {
      exercise: 'Streben Sie 150 Minuten moderate aerobe Aktivität pro Woche an',
      nutrition: 'Befolgen Sie eine ausgewogene Ernährung reich an Obst und Gemüse',
      sleep: 'Erwachsene sollten 7-9 Stunden qualitativ hochwertigen Schlaf bekommen'
    }
  },
  zh: {
    emergencyNumber: '120',
    healthSystem: 'metric',
    currency: 'CNY',
    dateFormat: 'YYYY/MM/DD',
    regulations: ['PIPL', 'CSL'],
    healthGuidance: {
      exercise: '每周进行150分钟中等强度有氧运动',
      nutrition: '遵循均衡饮食，多吃水果和蔬菜',
      sleep: '成人应每晚获得7-9小时的优质睡眠'
    }
  }
};

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'healthmap_language',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    }
  });

// Language switching utilities
export const changeLanguage = (languageCode) => {
  i18n.changeLanguage(languageCode);
  localStorage.setItem('healthmap_language', languageCode);
  
  // Update document language attribute
  document.documentElement.lang = languageCode;
  
  // Trigger custom event for other components to react to language change
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: languageCode } 
  }));
};

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' }
];

export const getCurrentLanguage = () => i18n.language || 'en';

export const getRegionalHealthData = (languageCode = null) => {
  const lang = languageCode || getCurrentLanguage();
  return regionalHealthData[lang] || regionalHealthData['en'];
};

export const formatHealthValue = (value, metric, unit = null) => {
  const regionalData = getRegionalHealthData();
  
  // Convert imperial to metric if needed
  if (regionalData.healthSystem === 'metric') {
    switch (metric) {
      case 'weight':
        if (unit === 'lbs') return `${(value * 0.453592).toFixed(1)} kg`;
        break;
      case 'height':
        if (unit === 'ft') return `${(value * 30.48).toFixed(0)} cm`;
        break;
      case 'temperature':
        if (unit === 'F') return `${((value - 32) * 5/9).toFixed(1)}°C`;
        break;
    }
  } else {
    // Convert metric to imperial if needed
    switch (metric) {
      case 'weight':
        if (unit === 'kg') return `${(value * 2.20462).toFixed(1)} lbs`;
        break;
      case 'height':
        if (unit === 'cm') {
          const totalInches = value / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);
          return `${feet}'${inches}"`;
        }
        break;
      case 'temperature':
        if (unit === 'C') return `${(value * 9/5 + 32).toFixed(1)}°F`;
        break;
    }
  }
  
  return `${value}${unit ? ' ' + unit : ''}`;
};

export const formatCurrency = (amount, currency = null) => {
  const regionalData = getRegionalHealthData();
  const currencyCode = currency || regionalData.currency;
  
  return new Intl.NumberFormat(getCurrentLanguage(), {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

export const formatDate = (date, format = null) => {
  const regionalData = getRegionalHealthData();
  const dateFormat = format || regionalData.dateFormat;
  
  const dateObj = new Date(date);
  
  return new Intl.DateTimeFormat(getCurrentLanguage(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

// Health-specific translation helpers
export const getHealthTerminology = (term, language = null) => {
  const lang = language || getCurrentLanguage();
  
  const terminology = {
    en: {
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate',
      bloodSugar: 'Blood Sugar',
      cholesterol: 'Cholesterol',
      bmi: 'Body Mass Index',
      temperature: 'Temperature'
    },
    es: {
      bloodPressure: 'Presión Arterial',
      heartRate: 'Frecuencia Cardíaca',
      bloodSugar: 'Azúcar en Sangre',
      cholesterol: 'Colesterol',
      bmi: 'Índice de Masa Corporal',
      temperature: 'Temperatura'
    },
    fr: {
      bloodPressure: 'Tension Artérielle',
      heartRate: 'Fréquence Cardiaque',
      bloodSugar: 'Glycémie',
      cholesterol: 'Cholestérol',
      bmi: 'Indice de Masse Corporelle',
      temperature: 'Température'
    },
    de: {
      bloodPressure: 'Blutdruck',
      heartRate: 'Herzfrequenz',
      bloodSugar: 'Blutzucker',
      cholesterol: 'Cholesterin',
      bmi: 'Body-Mass-Index',
      temperature: 'Temperatur'
    },
    zh: {
      bloodPressure: '血压',
      heartRate: '心率',
      bloodSugar: '血糖',
      cholesterol: '胆固醇',
      bmi: '身体质量指数',
      temperature: '体温'
    }
  };
  
  return terminology[lang]?.[term] || terminology['en'][term] || term;
};

export default i18n;