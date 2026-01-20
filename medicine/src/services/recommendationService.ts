import { HealthService } from './healthService';
import { ReportService } from './reportService';

export interface PersonalizedRecommendation {
  diet: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
    avoid: string[];
    hydration: string;
  };
  exercise: {
    cardio: string[];
    strength: string[];
    flexibility: string[];
    duration: string;
    frequency: string;
  };
  lifestyle: {
    sleep: string;
    stress: string[];
    habits: string[];
  };
  medical: {
    checkups: string[];
    monitoring: string[];
    supplements: string[];
  };
}

export const RecommendationService = {
  /**
   * Generate personalized recommendations based on:
   * - Latest medical report analysis
   * - Recent health metrics (steps, heart rate, sleep)
   * - User profile data
   */
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendation> {
    try {
      // Fetch user's latest data
      const [latestReport, weeklyMetrics, todayMetric] = await Promise.all([
        ReportService.getLatestReport(),
        HealthService.getWeeklyMetrics(),
        HealthService.getTodayMetric()
      ]);

      // Extract insights from report
      const reportInsights = this.extractReportInsights(latestReport);
      const healthInsights = this.extractHealthInsights(weeklyMetrics, todayMetric);

      // Generate comprehensive recommendations
      return this.generateRecommendations(reportInsights, healthInsights);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Return default recommendations
      return this.getDefaultRecommendations();
    }
  },

  extractReportInsights(report: any): any {
    if (!report?.analysis_result) {
      return { conditions: [], abnormals: [] };
    }

    const analysis = report.analysis_result;
    const conditions: string[] = [];
    const abnormals: string[] = [];

    // Check for abnormal results
    if (analysis.results) {
      analysis.results.forEach((result: any) => {
        if (result.status === 'High' || result.status === 'Low' || result.status === 'Borderline') {
          abnormals.push(result.test_name);

          // Map common test names to conditions
          if (result.test_name.toLowerCase().includes('glucose') || 
              result.test_name.toLowerCase().includes('hba1c')) {
            conditions.push('diabetes_risk');
          }
          if (result.test_name.toLowerCase().includes('cholesterol') || 
              result.test_name.toLowerCase().includes('ldl')) {
            conditions.push('heart_health');
          }
          if (result.test_name.toLowerCase().includes('blood pressure') || 
              result.test_name.toLowerCase().includes('bp')) {
            conditions.push('hypertension');
          }
        }
      });
    }

    return { conditions, abnormals, reportData: analysis };
  },

  extractHealthInsights(weeklyMetrics: any[], _todayMetric: any): any {
    const avgSteps = weeklyMetrics.length > 0
      ? weeklyMetrics.reduce((sum, m) => sum + (m.steps || 0), 0) / weeklyMetrics.length
      : 0;

    const avgSleep = weeklyMetrics.length > 0
      ? weeklyMetrics.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / weeklyMetrics.length
      : 0;

    const avgHeartRate = weeklyMetrics.length > 0
      ? weeklyMetrics.reduce((sum, m) => sum + (m.heart_rate || 0), 0) / weeklyMetrics.length
      : 0;

    return {
      activity: avgSteps < 5000 ? 'low' : avgSteps < 10000 ? 'moderate' : 'high',
      sleep: avgSleep < 6 ? 'insufficient' : avgSleep < 8 ? 'adequate' : 'optimal',
      heartRate: avgHeartRate < 60 ? 'low' : avgHeartRate < 100 ? 'normal' : 'elevated',
      avgSteps,
      avgSleep,
      avgHeartRate
    };
  },

  generateRecommendations(reportInsights: any, healthInsights: any): PersonalizedRecommendation {
    const recommendations: PersonalizedRecommendation = {
      diet: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        avoid: [],
        hydration: '8-10 glasses of water daily'
      },
      exercise: {
        cardio: [],
        strength: [],
        flexibility: [],
        duration: '30-45 minutes',
        frequency: '5 days per week'
      },
      lifestyle: {
        sleep: '7-9 hours per night',
        stress: [],
        habits: []
      },
      medical: {
        checkups: ['Annual physical examination'],
        monitoring: [],
        supplements: []
      }
    };

    // Diet recommendations based on conditions
    if (reportInsights.conditions.includes('diabetes_risk')) {
      recommendations.diet.breakfast.push('Oatmeal with berries and nuts', 'Greek yogurt with chia seeds');
      recommendations.diet.lunch.push('Grilled chicken salad with olive oil', 'Quinoa bowl with vegetables');
      recommendations.diet.dinner.push('Baked salmon with steamed broccoli', 'Lentil soup with whole grain bread');
      recommendations.diet.snacks.push('Almonds', 'Apple slices with peanut butter');
      recommendations.diet.avoid.push('Sugary drinks', 'White bread and pasta', 'Processed snacks');
      recommendations.medical.monitoring.push('Monitor blood glucose levels daily');
      recommendations.medical.checkups.push('Quarterly HbA1c tests');
    } else if (reportInsights.conditions.includes('heart_health')) {
      recommendations.diet.breakfast.push('Whole grain toast with avocado', 'Smoothie with spinach and berries');
      recommendations.diet.lunch.push('Mediterranean salad with feta', 'Tuna wrap with vegetables');
      recommendations.diet.dinner.push('Grilled fish with quinoa', 'Vegetable stir-fry with brown rice');
      recommendations.diet.snacks.push('Walnuts', 'Carrot sticks with hummus');
      recommendations.diet.avoid.push('Trans fats', 'High-sodium foods', 'Red meat');
      recommendations.medical.monitoring.push('Track blood pressure weekly');
      recommendations.medical.supplements.push('Omega-3 fatty acids');
    } else {
      // General healthy diet
      recommendations.diet.breakfast.push('Oatmeal with fruits', 'Whole grain cereal with milk', 'Eggs with whole wheat toast');
      recommendations.diet.lunch.push('Grilled chicken with vegetables', 'Whole grain sandwich', 'Vegetable soup with salad');
      recommendations.diet.dinner.push('Baked fish with vegetables', 'Chicken stir-fry', 'Vegetable curry with brown rice');
      recommendations.diet.snacks.push('Fresh fruits', 'Nuts', 'Yogurt');
      recommendations.diet.avoid.push('Excessive sugar', 'Processed foods', 'Fried foods');
    }

    // Exercise recommendations based on activity level
    if (healthInsights.activity === 'low') {
      recommendations.exercise.cardio.push('Start with 15-minute walks daily', 'Gradually increase to 30 minutes', 'Light cycling or swimming');
      recommendations.exercise.strength.push('Bodyweight exercises (wall push-ups, chair squats)', 'Use light resistance bands');
      recommendations.exercise.flexibility.push('Gentle stretching', 'Beginner yoga');
      recommendations.exercise.duration = '15-30 minutes';
      recommendations.lifestyle.habits.push('Take stairs instead of elevator', 'Park farther from entrances', 'Set hourly movement reminders');
    } else if (healthInsights.activity === 'moderate') {
      recommendations.exercise.cardio.push('Brisk walking 30-45 minutes', 'Jogging intervals', 'Cycling');
      recommendations.exercise.strength.push('Bodyweight exercises', 'Dumbbell exercises', 'Resistance training 2-3x/week');
      recommendations.exercise.flexibility.push('Yoga or Pilates', 'Dynamic stretching');
      recommendations.lifestyle.habits.push('Aim for 10,000 steps daily', 'Join group fitness classes');
    } else {
      recommendations.exercise.cardio.push('Running or cycling 45-60 minutes', 'High-intensity interval training (HIIT)', 'Sports activities');
      recommendations.exercise.strength.push('Weight training 3-4x/week', 'Progressive overload', 'Compound exercises');
      recommendations.exercise.flexibility.push('Advanced yoga', 'Mobility work', 'Foam rolling');
      recommendations.lifestyle.habits.push('Maintain consistent workout schedule', 'Track performance metrics');
    }

    // Sleep recommendations
    if (healthInsights.sleep === 'insufficient') {
      recommendations.lifestyle.sleep = 'Aim for 7-9 hours. Current average: ' + healthInsights.avgSleep.toFixed(1) + ' hours';
      recommendations.lifestyle.habits.push('Set consistent bedtime', 'Avoid screens 1 hour before bed', 'Create a relaxing bedtime routine');
    } else if (healthInsights.sleep === 'adequate') {
      recommendations.lifestyle.sleep = 'Good sleep duration. Focus on quality.';
      recommendations.lifestyle.habits.push('Keep bedroom cool and dark', 'Maintain sleep schedule on weekends');
    }

    // Stress management
    recommendations.lifestyle.stress.push('Practice mindfulness or meditation 10 minutes daily', 'Deep breathing exercises', 'Engage in hobbies you enjoy');

    // Heart rate specific
    if (healthInsights.heartRate === 'elevated') {
      recommendations.medical.monitoring.push('Monitor resting heart rate daily');
      recommendations.exercise.cardio.push('Include more low-impact cardio');
      recommendations.lifestyle.stress.push('Reduce caffeine intake', 'Practice relaxation techniques');
    }

    // Add supplements based on needs
    if (!reportInsights.conditions.length) {
      recommendations.medical.supplements.push('Multivitamin', 'Vitamin D (if deficient)');
    }

    return recommendations;
  },

  getDefaultRecommendations(): PersonalizedRecommendation {
    return {
      diet: {
        breakfast: ['Oatmeal with fruits', 'Whole grain toast with eggs', 'Greek yogurt with berries'],
        lunch: ['Grilled chicken salad', 'Quinoa bowl with vegetables', 'Whole grain sandwich'],
        dinner: ['Baked fish with vegetables', 'Chicken stir-fry', 'Lentil soup'],
        snacks: ['Fresh fruits', 'Nuts', 'Yogurt', 'Vegetables with hummus'],
        avoid: ['Excessive sugar', 'Processed foods', 'Trans fats'],
        hydration: '8-10 glasses of water daily'
      },
      exercise: {
        cardio: ['30-minute brisk walk', 'Cycling', 'Swimming'],
        strength: ['Bodyweight exercises', 'Light weights 2-3x/week'],
        flexibility: ['Stretching', 'Yoga'],
        duration: '30-45 minutes',
        frequency: '5 days per week'
      },
      lifestyle: {
        sleep: '7-9 hours per night',
        stress: ['Meditation', 'Deep breathing', 'Hobbies'],
        habits: ['Regular meal times', 'Limit screen time before bed', 'Stay hydrated']
      },
      medical: {
        checkups: ['Annual physical examination', 'Dental checkup every 6 months'],
        monitoring: ['Track weight monthly', 'Monitor blood pressure'],
        supplements: ['Multivitamin', 'Vitamin D']
      }
    };
  }
};
