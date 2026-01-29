// Fast local risk analysis service - no API calls, instant results
import { supabase } from '../lib/supabase';

interface RiskArea {
    category: string;
    risk_level: 'Low' | 'Medium' | 'High';
    score: number;
    reason: string;
    recommendation: string;
    icon_suggestion: string;
}

interface RiskAnalysis {
    overall_risk: 'Low' | 'Medium' | 'High';
    confidence: number;
    risk_areas: RiskArea[];
    summary: string;
    positive_trends: string[];
    action_plan: {
        week_1_2: string;
        week_3_4: string;
    };
}

// Calculate risk score from health metrics (0-100, higher is riskier)
function calculateHeartRisk(heartRate?: number): { score: number; level: string; reason: string } {
    if (!heartRate) return { score: 30, level: 'Medium', reason: 'No heart rate data available' };

    if (heartRate < 60) return { score: 40, level: 'Medium', reason: `Heart rate ${heartRate} is below normal (60-100 bpm)` };
    if (heartRate <= 100) return { score: 10, level: 'Low', reason: `Heart rate ${heartRate} is in healthy range (60-100 bpm)` };
    if (heartRate <= 120) return { score: 60, level: 'Medium', reason: `Heart rate ${heartRate} is slightly elevated` };
    return { score: 85, level: 'High', reason: `Heart rate ${heartRate} is significantly elevated` };
}

function calculateOxygenRisk(bloodOxygen?: number): { score: number; level: string; reason: string } {
    if (!bloodOxygen) return { score: 30, level: 'Medium', reason: 'No blood oxygen data available' };

    if (bloodOxygen >= 95) return { score: 5, level: 'Low', reason: `Blood oxygen ${bloodOxygen}% is excellent (95-100%)` };
    if (bloodOxygen >= 90) return { score: 40, level: 'Medium', reason: `Blood oxygen ${bloodOxygen}% is acceptable but could improve` };
    if (bloodOxygen >= 85) return { score: 75, level: 'High', reason: `Blood oxygen ${bloodOxygen}% is concerning (below 90%)` };
    return { score: 95, level: 'High', reason: `Blood oxygen ${bloodOxygen}% is critically low` };
}

function calculateActivityRisk(steps?: number): { score: number; level: string; reason: string } {
    if (!steps) return { score: 50, level: 'Medium', reason: 'No activity data available' };

    if (steps >= 10000) return { score: 5, level: 'Low', reason: `${steps} steps exceeds recommended 10,000 daily` };
    if (steps >= 7000) return { score: 25, level: 'Low', reason: `${steps} steps is good, aim for 10,000 daily` };
    if (steps >= 4000) return { score: 50, level: 'Medium', reason: `${steps} steps is below recommended 7,000-10,000` };
    return { score: 80, level: 'High', reason: `${steps} steps indicates sedentary lifestyle` };
}

function calculateSleepRisk(sleepHours?: number): { score: number; level: string; reason: string } {
    if (!sleepHours) return { score: 40, level: 'Medium', reason: 'No sleep data available' };

    if (sleepHours >= 7 && sleepHours <= 9) return { score: 5, level: 'Low', reason: `${sleepHours}h sleep is optimal (7-9 hours)` };
    if (sleepHours >= 6 && sleepHours <= 10) return { score: 30, level: 'Medium', reason: `${sleepHours}h sleep is acceptable, aim for 7-9 hours` };
    if (sleepHours >= 5) return { score: 65, level: 'High', reason: `${sleepHours}h sleep is insufficient (need 7-9 hours)` };
    return { score: 90, level: 'High', reason: `${sleepHours}h sleep is critically low` };
}

function getRecommendation(category: string, level: string): string {
    const recommendations: Record<string, Record<string, string>> = {
        'Cardiovascular': {
            'Low': 'Maintain your healthy heart rate through regular cardio exercise',
            'Medium': 'Monitor heart rate during activities and consider light cardio exercise',
            'High': 'Consult a cardiologist and avoid strenuous activities until cleared'
        },
        'Respiratory': {
            'Low': 'Your oxygen levels are excellent, keep up good breathing habits',
            'Medium': 'Practice deep breathing exercises and ensure good ventilation',
            'High': 'Seek immediate medical attention if experiencing breathing difficulties'
        },
        'Physical Activity': {
            'Low': 'Great job staying active! Maintain your current activity level',
            'Medium': 'Increase daily steps gradually, aim for 10,000 steps daily',
            'High': 'Start with short walks and gradually increase activity duration'
        },
        'Sleep Quality': {
            'Low': 'Excellent sleep pattern, maintain your sleep schedule',
            'Medium': 'Improve sleep hygiene: consistent bedtime, dark room, no screens',
            'High': 'Address sleep issues with sleep specialist, create relaxing bedtime routine'
        }
    };

    return recommendations[category]?.[level] || 'Maintain healthy lifestyle habits';
}

export const RiskAnalysisService = {
    // Fast local calculation - no API calls
    async calculateLocalRisk(): Promise<RiskAnalysis> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get latest health metrics
            const { data: metrics } = await supabase
                .from('health_metrics')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            // Get latest report for health score
            const { data: reports } = await supabase
                .from('reports')
                .select('analysis')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const latestReport = reports?.[0]?.analysis;
            const healthScore = latestReport?.health_score || 0;

            // Calculate risk for each area
            const heartRisk = calculateHeartRisk(metrics?.heart_rate);
            const oxygenRisk = calculateOxygenRisk(metrics?.blood_oxygen);
            const activityRisk = calculateActivityRisk(metrics?.steps);
            const sleepRisk = calculateSleepRisk(metrics?.sleep_hours);

            const riskAreas: RiskArea[] = [
                {
                    category: 'Cardiovascular',
                    risk_level: heartRisk.level as 'Low' | 'Medium' | 'High',
                    score: heartRisk.score,
                    reason: heartRisk.reason,
                    recommendation: getRecommendation('Cardiovascular', heartRisk.level),
                    icon_suggestion: 'Heart'
                },
                {
                    category: 'Respiratory',
                    risk_level: oxygenRisk.level as 'Low' | 'Medium' | 'High',
                    score: oxygenRisk.score,
                    reason: oxygenRisk.reason,
                    recommendation: getRecommendation('Respiratory', oxygenRisk.level),
                    icon_suggestion: 'Droplet'
                },
                {
                    category: 'Physical Activity',
                    risk_level: activityRisk.level as 'Low' | 'Medium' | 'High',
                    score: activityRisk.score,
                    reason: activityRisk.reason,
                    recommendation: getRecommendation('Physical Activity', activityRisk.level),
                    icon_suggestion: 'Activity'
                },
                {
                    category: 'Sleep Quality',
                    risk_level: sleepRisk.level as 'Low' | 'Medium' | 'High',
                    score: sleepRisk.score,
                    reason: sleepRisk.reason,
                    recommendation: getRecommendation('Sleep Quality', sleepRisk.level),
                    icon_suggestion: 'Moon'
                }
            ];

            // Calculate overall risk (average of all scores)
            const avgScore = riskAreas.reduce((sum, area) => sum + area.score, 0) / riskAreas.length;
            const overallRisk = avgScore < 30 ? 'Low' : avgScore < 60 ? 'Medium' : 'High';

            // Confidence based on data availability
            const dataPoints = [metrics?.heart_rate, metrics?.blood_oxygen, metrics?.steps, metrics?.sleep_hours]
                .filter(v => v !== undefined && v !== null).length;
            const confidence = Math.round((dataPoints / 4) * 100);

            return {
                overall_risk: overallRisk,
                confidence: confidence,
                risk_areas: riskAreas,
                summary: this.generateSummary(overallRisk, riskAreas, healthScore),
                positive_trends: [
                    metrics?.steps && metrics.steps > 8000 ? 'High physical activity level maintained' : 'Consistent health tracking active',
                    metrics?.sleep_hours && metrics.sleep_hours >= 7 ? 'Optimal sleep duration achieved' : 'Health monitoring established'
                ],
                action_plan: {
                    week_1_2: 'Focus on consistent hydration and maintaining current activity levels.',
                    week_3_4: 'Gradually increase cardiovascular exercise duration by 10%.'
                }
            };

        } catch (error) {
            console.error('Error calculating local risk:', error);
            // Return safe defaults if error
            return {
                overall_risk: 'Medium',
                confidence: 0,
                risk_areas: [
                    {
                        category: 'Overall Health',
                        risk_level: 'Medium',
                        score: 50,
                        reason: 'Unable to load health data',
                        recommendation: 'Update your health metrics and upload medical reports for accurate risk assessment',
                        icon_suggestion: 'Shield'
                    }
                ],
                summary: 'Unable to calculate risk analysis. Please ensure your health data is up to date.',
                positive_trends: ['Continuous health monitoring enabled'],
                action_plan: {
                    week_1_2: 'Please update your daily health metrics for a personalized plan.',
                    week_3_4: 'Consult with the AI assistant for specific health queries.'
                }
            };
        }
    },

    generateSummary(overallRisk: string, riskAreas: RiskArea[], healthScore: number): string {
        const highRiskAreas = riskAreas.filter(a => a.risk_level === 'High').length;
        const mediumRiskAreas = riskAreas.filter(a => a.risk_level === 'Medium').length;

        if (overallRisk === 'Low') {
            return `Your overall health is in good condition with a health score of ${healthScore}/100. ${mediumRiskAreas > 0 ? `There are ${mediumRiskAreas} areas that could use improvement.` : 'Keep up your healthy habits!'
                }`;
        } else if (overallRisk === 'Medium') {
            return `Your health requires attention with a health score of ${healthScore}/100. ${highRiskAreas} high-risk and ${mediumRiskAreas} medium-risk areas need improvement. Focus on the recommendations below.`;
        } else {
            return `Your health needs immediate attention with a health score of ${healthScore}/100. ${highRiskAreas} critical areas require focus. Please consult with healthcare professionals and follow the recommendations closely.`;
        }
    }
};
