/**
 * Genetic Health Insight Engine
 * Transforms DNA data into actionable health recommendations and insights
 */

class GeneticHealthEngine {
  constructor() {
    this.userGeneticProfiles = new Map();
    this.geneticVariants = new Map();
    this.ancestryData = new Map();
    this.traitPredictions = new Map();
    
    // Genetic variant database with health implications
    this.variantDatabase = {
      // Caffeine metabolism
      'CYP1A2': {
        gene_name: 'CYP1A2',
        function: 'Caffeine metabolism enzyme',
        variants: {
          'rs762551_AA': {
            genotype: 'AA',
            trait: 'fast_caffeine_metabolism',
            description: 'Fast caffeine metabolizer',
            implications: 'Can handle higher caffeine intake without jitters or sleep disruption',
            recommendations: ['Up to 400mg caffeine daily is typically well-tolerated', 'Caffeine before workouts may enhance performance'],
            frequency: { european: 0.45, asian: 0.15, african: 0.25 }
          },
          'rs762551_AC': {
            genotype: 'AC',
            trait: 'moderate_caffeine_metabolism',
            description: 'Moderate caffeine metabolizer',
            implications: 'Average caffeine processing speed',
            recommendations: ['Limit caffeine to 200-300mg daily', 'Avoid caffeine after 2 PM for better sleep'],
            frequency: { european: 0.40, asian: 0.35, african: 0.45 }
          },
          'rs762551_CC': {
            genotype: 'CC',
            trait: 'slow_caffeine_metabolism',
            description: 'Slow caffeine metabolizer',
            implications: 'Caffeine stays in system longer, higher sensitivity',
            recommendations: ['Limit to 100-200mg caffeine daily', 'Avoid caffeine after noon', 'Consider decaf alternatives'],
            frequency: { european: 0.15, asian: 0.50, african: 0.30 }
          }
        }
      },
      
      // Vitamin D metabolism
      'VDR': {
        gene_name: 'VDR',
        function: 'Vitamin D receptor',
        variants: {
          'rs2228570_AA': {
            genotype: 'AA',
            trait: 'efficient_vitamin_d_processing',
            description: 'Efficient vitamin D utilization',
            implications: 'Better absorption and utilization of vitamin D',
            recommendations: ['Standard vitamin D supplementation (1000-2000 IU)', 'Regular sun exposure beneficial'],
            frequency: { european: 0.40, asian: 0.55, african: 0.75 }
          },
          'rs2228570_AG': {
            genotype: 'AG',
            trait: 'moderate_vitamin_d_processing',
            description: 'Moderate vitamin D processing',
            implications: 'Average vitamin D metabolism',
            recommendations: ['Consider higher vitamin D intake (2000-3000 IU)', 'Monitor vitamin D levels regularly'],
            frequency: { european: 0.45, asian: 0.35, african: 0.20 }
          },
          'rs2228570_GG': {
            genotype: 'GG',
            trait: 'reduced_vitamin_d_processing',
            description: 'Reduced vitamin D efficiency',
            implications: 'May need higher vitamin D intake for optimal levels',
            recommendations: ['Higher vitamin D supplementation (3000-4000 IU)', 'Regular blood testing recommended', 'Consider vitamin D3 over D2'],
            frequency: { european: 0.15, asian: 0.10, african: 0.05 }
          }
        }
      },
      
      // Folate metabolism (MTHFR)
      'MTHFR': {
        gene_name: 'MTHFR',
        function: 'Methylenetetrahydrofolate reductase',
        variants: {
          'rs1801133_CC': {
            genotype: 'CC',
            trait: 'normal_folate_metabolism',
            description: 'Normal folate processing',
            implications: 'Efficient folate and B-vitamin metabolism',
            recommendations: ['Standard folate intake adequate', 'Folic acid supplements work well'],
            frequency: { european: 0.45, asian: 0.65, african: 0.85 }
          },
          'rs1801133_CT': {
            genotype: 'CT',
            trait: 'mildly_reduced_folate_metabolism',
            description: 'Mildly reduced folate processing',
            implications: '30% reduction in enzyme activity',
            recommendations: ['Consider methylfolate over folic acid', 'Increase leafy green vegetables', 'B-complex vitamins beneficial'],
            frequency: { european: 0.40, asian: 0.30, african: 0.14 }
          },
          'rs1801133_TT': {
            genotype: 'TT',
            trait: 'significantly_reduced_folate_metabolism',
            description: 'Significantly reduced folate processing',
            implications: '70% reduction in enzyme activity, increased cardiovascular risk',
            recommendations: ['Methylfolate supplementation essential', 'Higher B-vitamin needs', 'Avoid folic acid', 'Regular homocysteine monitoring'],
            frequency: { european: 0.15, asian: 0.05, african: 0.01 }
          }
        }
      },
      
      // Alcohol metabolism
      'ALDH2': {
        gene_name: 'ALDH2',
        function: 'Aldehyde dehydrogenase',
        variants: {
          'rs671_GG': {
            genotype: 'GG',
            trait: 'normal_alcohol_metabolism',
            description: 'Normal alcohol processing',
            implications: 'Efficient alcohol metabolism',
            recommendations: ['Moderate alcohol consumption as per guidelines', 'Standard liver detox capacity'],
            frequency: { european: 0.95, asian: 0.50, african: 0.95 }
          },
          'rs671_GA': {
            genotype: 'GA',
            trait: 'reduced_alcohol_metabolism',
            description: 'Reduced alcohol processing',
            implications: 'Slower alcohol clearance, increased aldehyde buildup',
            recommendations: ['Limit alcohol consumption', 'Increased cancer risk with alcohol', 'Consider avoiding alcohol'],
            frequency: { european: 0.05, asian: 0.35, african: 0.05 }
          },
          'rs671_AA': {
            genotype: 'AA',
            trait: 'deficient_alcohol_metabolism',
            description: 'Deficient alcohol processing',
            implications: 'Severe alcohol intolerance, "Asian flush" reaction',
            recommendations: ['Avoid alcohol completely', 'Significantly increased cancer risk', 'Alternative stress management methods'],
            frequency: { european: 0.00, asian: 0.15, african: 0.00 }
          }
        }
      },
      
      // Iron absorption
      'HFE': {
        gene_name: 'HFE',
        function: 'Iron regulation protein',
        variants: {
          'rs1800562_CC': {
            genotype: 'CC',
            trait: 'normal_iron_metabolism',
            description: 'Normal iron regulation',
            implications: 'Standard iron absorption and storage',
            recommendations: ['Standard iron intake recommendations', 'Regular iron-rich foods'],
            frequency: { european: 0.85, asian: 0.95, african: 0.97 }
          },
          'rs1800562_CG': {
            genotype: 'CG',
            trait: 'increased_iron_absorption',
            description: 'Increased iron absorption',
            implications: 'Higher risk of iron overload',
            recommendations: ['Monitor iron levels regularly', 'Limit iron supplements unless deficient', 'Consider blood donation'],
            frequency: { european: 0.14, asian: 0.05, african: 0.03 }
          },
          'rs1800562_GG': {
            genotype: 'GG',
            trait: 'hereditary_hemochromatosis_risk',
            description: 'High risk of iron overload',
            implications: 'Hereditary hemochromatosis predisposition',
            recommendations: ['Regular iron monitoring essential', 'Avoid iron supplements', 'Therapeutic blood donation may be needed', 'Medical supervision required'],
            frequency: { european: 0.01, asian: 0.00, african: 0.00 }
          }
        }
      }
    };

    // Ancestry-specific health predispositions
    this.ancestryHealthData = {
      european: {
        name: 'European',
        common_conditions: {
          'cystic_fibrosis': { frequency: 0.0004, carrier_rate: 0.04 },
          'hemochromatosis': { frequency: 0.005, carrier_rate: 0.10 },
          'lactose_intolerance': { frequency: 0.10, adult_onset: true },
          'celiac_disease': { frequency: 0.01, gluten_sensitivity: 0.06 },
          'cardiovascular_disease': { baseline_risk: 'moderate', modifiable_factors: ['diet', 'exercise', 'stress'] }
        },
        nutritional_considerations: [
          'Generally efficient vitamin D synthesis',
          'Higher alcohol tolerance on average',
          'Lactase persistence common',
          'Higher folate requirements in some populations'
        ]
      },
      
      east_asian: {
        name: 'East Asian',
        common_conditions: {
          'alcohol_intolerance': { frequency: 0.50, severity: 'moderate_to_severe' },
          'lactose_intolerance': { frequency: 0.90, adult_onset: true },
          'dry_earwax': { frequency: 0.95, genetic_marker: true },
          'hypertension': { baseline_risk: 'higher', salt_sensitivity: true },
          'gastric_cancer': { baseline_risk: 'higher', h_pylori_susceptibility: true }
        },
        nutritional_considerations: [
          'Higher risk of vitamin D deficiency',
          'Increased salt sensitivity',
          'Lower alcohol tolerance',
          'Higher omega-3 requirements for cardiovascular health'
        ]
      },
      
      african: {
        name: 'African',
        common_conditions: {
          'sickle_cell_trait': { frequency: 0.08, carrier_protective: 'malaria' },
          'lactose_intolerance': { frequency: 0.80, adult_onset: true },
          'hypertension': { baseline_risk: 'higher', salt_sensitivity: true },
          'diabetes_type2': { baseline_risk: 'higher', insulin_resistance: true },
          'keloid_scarring': { frequency: 0.15, wound_healing: 'excessive' }
        },
        nutritional_considerations: [
          'Higher vitamin D requirements due to melanin',
          'Increased iron needs in some populations',
          'Higher risk of salt-sensitive hypertension',
          'Better heat tolerance and sweat efficiency'
        ]
      },
      
      south_asian: {
        name: 'South Asian',
        common_conditions: {
          'diabetes_type2': { baseline_risk: 'highest', early_onset: true },
          'cardiovascular_disease': { baseline_risk: 'higher', metabolic_syndrome: true },
          'lactose_intolerance': { frequency: 0.70, regional_variation: true },
          'thalassemia': { frequency: 0.03, carrier_rate: 0.15 },
          'glucose_6pd_deficiency': { frequency: 0.05, drug_sensitivity: true }
        },
        nutritional_considerations: [
          'Higher diabetes risk requires carbohydrate management',
          'Increased cardiovascular disease risk',
          'Higher protein requirements for muscle maintenance',
          'Turmeric and spices may provide protective benefits'
        ]
      }
    };

    this.initializeEngine();
  }

  /**
   * Process user's genetic data and generate comprehensive insights
   */
  async processGeneticData(userId, geneticData) {
    try {
      const insights = {
        trait_predictions: [],
        ancestry_insights: [],
        health_predispositions: [],
        nutritional_recommendations: [],
        carrier_screening: [],
        lifestyle_optimizations: [],
        risk_assessments: []
      };

      // Store user's genetic profile
      this.userGeneticProfiles.set(userId, geneticData);

      // Analyze genetic variants for traits
      const traitAnalysis = await this.analyzeGeneticTraits(geneticData);
      insights.trait_predictions = traitAnalysis;

      // Perform ancestry analysis
      const ancestryAnalysis = await this.analyzeAncestry(geneticData);
      insights.ancestry_insights = ancestryAnalysis;

      // Generate health predispositions based on ancestry
      const healthPredispositions = await this.analyzeHealthPredispositions(ancestryAnalysis);
      insights.health_predispositions = healthPredispositions;

      // Create personalized nutritional recommendations
      const nutritionalRecs = await this.generateNutritionalRecommendations(traitAnalysis, ancestryAnalysis);
      insights.nutritional_recommendations = nutritionalRecs;

      // Perform carrier screening analysis
      const carrierScreening = await this.performCarrierScreening(geneticData, ancestryAnalysis);
      insights.carrier_screening = carrierScreening;

      // Generate lifestyle optimizations
      const lifestyleOpts = await this.generateLifestyleOptimizations(traitAnalysis, ancestryAnalysis);
      insights.lifestyle_optimizations = lifestyleOpts;

      // Calculate risk assessments
      const riskAssessments = await this.calculateRiskAssessments(traitAnalysis, ancestryAnalysis);
      insights.risk_assessments = riskAssessments;

      // Store insights
      this.traitPredictions.set(userId, insights);

      return {
        success: true,
        insights,
        processed_variants: Object.keys(geneticData.variants || {}).length,
        ancestry_confidence: ancestryAnalysis.confidence || 0,
        disclaimer: this.getGeneticDisclaimer()
      };

    } catch (error) {
      console.error('Genetic data processing error:', error);
      throw new Error(`Failed to process genetic data: ${error.message}`);
    }
  }

  /**
   * Analyze genetic variants for trait predictions
   */
  async analyzeGeneticTraits(geneticData) {
    const traits = [];
    const variants = geneticData.variants || {};

    for (const [geneSymbol, geneData] of Object.entries(this.variantDatabase)) {
      for (const [variantId, variantData] of Object.entries(geneData.variants)) {
        const [rsId, genotype] = variantId.split('_');
        
        if (variants[rsId] && variants[rsId].genotype === genotype) {
          traits.push({
            gene: geneSymbol,
            variant: rsId,
            genotype: genotype,
            trait: variantData.trait,
            description: variantData.description,
            implications: variantData.implications,
            recommendations: variantData.recommendations,
            confidence: this.calculateTraitConfidence(variantData, geneticData.quality),
            frequency_data: variantData.frequency
          });
        }
      }
    }

    return traits;
  }

  /**
   * Analyze ancestry composition
   */
  async analyzeAncestry(geneticData) {
    // In production, this would use actual ancestry informative markers
    // For now, simulate ancestry analysis
    const ancestryComposition = geneticData.ancestry || {
      european: 0.65,
      east_asian: 0.20,
      african: 0.10,
      south_asian: 0.05
    };

    const primaryAncestry = Object.entries(ancestryComposition)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      composition: ancestryComposition,
      primary_ancestry: primaryAncestry[0],
      primary_percentage: primaryAncestry[1],
      confidence: 0.95,
      populations_included: Object.keys(ancestryComposition)
    };
  }

  /**
   * Analyze health predispositions based on ancestry
   */
  async analyzeHealthPredispositions(ancestryData) {
    const predispositions = [];
    
    for (const [population, percentage] of Object.entries(ancestryData.composition)) {
      if (percentage > 0.1) { // Only include populations >10%
        const ancestryInfo = this.ancestryHealthData[population];
        if (ancestryInfo) {
          for (const [condition, data] of Object.entries(ancestryInfo.common_conditions)) {
            predispositions.push({
              condition: condition.replace('_', ' '),
              ancestry_contribution: population,
              percentage_contribution: percentage,
              baseline_risk: data.baseline_risk || 'varied',
              frequency: data.frequency,
              description: this.getConditionDescription(condition, data),
              preventive_measures: this.getPreventiveMeasures(condition)
            });
          }
        }
      }
    }

    return predispositions;
  }

  /**
   * Generate personalized nutritional recommendations
   */
  async generateNutritionalRecommendations(traits, ancestry) {
    const recommendations = [];
    
    // Trait-based recommendations
    for (const trait of traits) {
      if (trait.gene === 'CYP1A2') {
        recommendations.push({
          type: 'caffeine_metabolism',
          recommendation: trait.recommendations[0],
          genetic_basis: `${trait.gene} variant ${trait.genotype}`,
          confidence: trait.confidence
        });
      }
      
      if (trait.gene === 'VDR') {
        recommendations.push({
          type: 'vitamin_d',
          recommendation: trait.recommendations[0],
          genetic_basis: `${trait.gene} variant ${trait.genotype}`,
          confidence: trait.confidence
        });
      }
      
      if (trait.gene === 'MTHFR') {
        recommendations.push({
          type: 'folate_b_vitamins',
          recommendation: trait.recommendations[0],
          genetic_basis: `${trait.gene} variant ${trait.genotype}`,
          confidence: trait.confidence
        });
      }
    }

    // Ancestry-based recommendations
    const primaryAncestry = this.ancestryHealthData[ancestry.primary_ancestry];
    if (primaryAncestry) {
      for (const consideration of primaryAncestry.nutritional_considerations) {
        recommendations.push({
          type: 'ancestry_based',
          recommendation: consideration,
          genetic_basis: `${ancestry.primary_ancestry} ancestry (${Math.round(ancestry.primary_percentage * 100)}%)`,
          confidence: ancestry.confidence
        });
      }
    }

    return recommendations;
  }

  /**
   * Perform carrier screening analysis
   */
  async performCarrierScreening(geneticData, ancestryData) {
    const screening = [];
    
    const primaryAncestry = this.ancestryHealthData[ancestryData.primary_ancestry];
    if (primaryAncestry) {
      for (const [condition, data] of Object.entries(primaryAncestry.common_conditions)) {
        if (data.carrier_rate) {
          screening.push({
            condition: condition.replace('_', ' '),
            carrier_risk: data.carrier_rate,
            population_frequency: data.frequency,
            ancestry_group: ancestryData.primary_ancestry,
            screening_recommended: data.carrier_rate > 0.01, // >1% carrier rate
            genetic_counseling: data.carrier_rate > 0.05, // >5% carrier rate
            description: this.getCarrierDescription(condition, data)
          });
        }
      }
    }

    return screening;
  }

  /**
   * Generate lifestyle optimizations
   */
  async generateLifestyleOptimizations(traits, ancestry) {
    const optimizations = [];
    
    // Exercise recommendations based on genetics
    const caffeineMetabolism = traits.find(t => t.gene === 'CYP1A2');
    if (caffeineMetabolism) {
      if (caffeineMetabolism.trait === 'fast_caffeine_metabolism') {
        optimizations.push({
          category: 'exercise',
          optimization: 'Pre-workout caffeine (200-300mg) can enhance performance',
          genetic_basis: 'Fast caffeine metabolism allows effective pre-exercise use',
          timing: 'Consume 30-45 minutes before training'
        });
      } else if (caffeineMetabolism.trait === 'slow_caffeine_metabolism') {
        optimizations.push({
          category: 'exercise',
          optimization: 'Avoid caffeine before afternoon/evening workouts',
          genetic_basis: 'Slow caffeine metabolism may disrupt sleep if consumed late',
          timing: 'Exercise without caffeine or use very small amounts'
        });
      }
    }

    // Sleep optimizations
    const vitaminD = traits.find(t => t.gene === 'VDR');
    if (vitaminD && vitaminD.trait === 'reduced_vitamin_d_processing') {
      optimizations.push({
        category: 'sleep',
        optimization: 'Prioritize morning sunlight exposure for circadian rhythm',
        genetic_basis: 'Reduced vitamin D processing may affect sleep-wake cycles',
        timing: 'Get 15-30 minutes morning sunlight daily'
      });
    }

    // Ancestry-based optimizations
    if (ancestry.primary_ancestry === 'east_asian') {
      optimizations.push({
        category: 'social',
        optimization: 'Consider alcohol-free social alternatives',
        genetic_basis: 'Higher likelihood of alcohol intolerance in East Asian populations',
        timing: 'Plan social activities around non-alcoholic options'
      });
    }

    return optimizations;
  }

  /**
   * Calculate comprehensive risk assessments
   */
  async calculateRiskAssessments(traits, ancestry) {
    const assessments = [];
    
    // Cardiovascular risk based on ancestry and genetics
    const primaryAncestry = this.ancestryHealthData[ancestry.primary_ancestry];
    if (primaryAncestry?.common_conditions?.cardiovascular_disease) {
      const cvdData = primaryAncestry.common_conditions.cardiovascular_disease;
      assessments.push({
        risk_category: 'cardiovascular',
        baseline_risk: cvdData.baseline_risk,
        genetic_factors: ['ancestry predisposition'],
        modifiable_factors: cvdData.modifiable_factors || [],
        recommendation: 'Focus on diet, exercise, and stress management',
        monitoring: 'Regular blood pressure and cholesterol screening'
      });
    }

    // Metabolic risk assessments
    const mthfrVariant = traits.find(t => t.gene === 'MTHFR');
    if (mthfrVariant && mthfrVariant.trait === 'significantly_reduced_folate_metabolism') {
      assessments.push({
        risk_category: 'cardiovascular_metabolic',
        baseline_risk: 'elevated',
        genetic_factors: ['MTHFR variant affecting homocysteine metabolism'],
        modifiable_factors: ['folate intake', 'B-vitamin status', 'exercise'],
        recommendation: 'Methylfolate supplementation and homocysteine monitoring',
        monitoring: 'Annual homocysteine and B-vitamin levels'
      });
    }

    return assessments;
  }

  // Helper methods

  calculateTraitConfidence(variantData, dataQuality) {
    const baseConfidence = 0.85;
    const qualityModifier = (dataQuality?.overall || 0.8) * 0.15;
    const frequencyModifier = Math.min(...Object.values(variantData.frequency)) * 0.05;
    
    return Math.min(0.99, baseConfidence + qualityModifier + frequencyModifier);
  }

  getConditionDescription(condition, data) {
    const descriptions = {
      'cystic_fibrosis': 'Genetic disorder affecting lungs and digestive system',
      'hemochromatosis': 'Iron overload disorder causing organ damage',
      'lactose_intolerance': 'Inability to digest lactose in dairy products',
      'alcohol_intolerance': 'Genetic inability to process alcohol efficiently',
      'sickle_cell_trait': 'Protective against malaria but can cause complications',
      'diabetes_type2': 'Metabolic disorder affecting blood sugar regulation',
      'hypertension': 'High blood pressure with cardiovascular implications'
    };
    
    return descriptions[condition] || 'Genetic predisposition requiring monitoring';
  }

  getPreventiveMeasures(condition) {
    const measures = {
      'cardiovascular_disease': ['Mediterranean diet', 'Regular exercise', 'Stress management', 'No smoking'],
      'diabetes_type2': ['Low glycemic diet', 'Regular physical activity', 'Weight management', 'Stress reduction'],
      'hypertension': ['Low sodium diet', 'DASH diet principles', 'Regular exercise', 'Limit alcohol'],
      'osteoporosis': ['Adequate calcium/vitamin D', 'Weight-bearing exercise', 'Limit alcohol/caffeine']
    };
    
    return measures[condition] || ['Regular medical monitoring', 'Healthy lifestyle', 'Genetic counseling'];
  }

  getCarrierDescription(condition, data) {
    if (data.carrier_protective) {
      return `Carrier status may provide protection against ${data.carrier_protective}`;
    }
    return `Genetic variant that could be passed to offspring`;
  }

  getGeneticDisclaimer() {
    return {
      medical_disclaimer: 'This analysis is for informational purposes only and should not replace professional medical advice.',
      accuracy_note: 'Genetic predictions are probabilistic and influenced by environmental factors.',
      consultation_advice: 'Consult healthcare providers and genetic counselors for medical decisions.',
      data_privacy: 'Genetic data is highly sensitive and should be protected accordingly.',
      limitations: 'Analysis based on current scientific understanding which continues to evolve.'
    };
  }

  async getUserGeneticInsights(userId) {
    return this.traitPredictions.get(userId) || null;
  }

  initializeEngine() {
    console.log('Genetic Health Insight Engine initialized with', Object.keys(this.variantDatabase).length, 'genetic markers');
  }
}

// Export singleton instance
const geneticHealthEngine = new GeneticHealthEngine();

module.exports = {
  GeneticHealthEngine,
  geneticHealthEngine
};