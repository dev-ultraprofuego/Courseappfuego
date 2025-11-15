import React from 'react';
import type { PricingTier, PricingPlan, Theme } from '@/types';

interface PricingEditorProps {
    tiers: PricingTier[];
    onChange: (tiers: PricingTier[]) => void;
    theme: Theme;
    t: any;
    inputClass: string;
    textareaClass: string;
}

const PricingEditor: React.FC<PricingEditorProps> = ({ tiers, onChange, theme, t, inputClass, textareaClass }) => {
    const handleTierChange = (tierId: 'fr' | 'us', field: keyof PricingTier, value: string) => {
        onChange(tiers.map(t => t.id === tierId ? { ...t, [field]: value } : t));
    };

    const handlePlanChange = (tierId: 'fr' | 'us', planId: string, field: keyof PricingPlan, value: string | number | boolean | string[]) => {
        onChange(tiers.map(tier => {
            if (tier.id === tierId) {
                return {
                    ...tier,
                    plans: tier.plans.map(plan => plan.id === planId ? { ...plan, [field]: value } : plan)
                };
            }
            return tier;
        }));
    };
    
    return (
        <div className="space-y-6">
            {tiers.map(tier => (
                <div key={tier.id} className="bg-gray-900 p-6 rounded-lg">
                    <input type="text" value={tier.name} onChange={e => handleTierChange(tier.id, 'name', e.target.value)} className={`text-2xl font-bold bg-transparent border-none p-0 mb-4 focus:ring-0 ${theme === 'iris' ? 'text-teal-300' : 'text-red-300'}`} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {tier.plans.map(plan => (
                            <div key={plan.id} className="bg-gray-800 p-4 rounded-md space-y-3">
                                <h3 className="font-semibold text-lg">{t.edit} {plan.name}</h3>
                                <label className="block"><span className="text-gray-400 text-sm">{t.name}</span><input type="text" value={plan.name} onChange={e => handlePlanChange(tier.id, plan.id, 'name', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.duration}</span><input type="text" value={plan.duration} onChange={e => handlePlanChange(tier.id, plan.id, 'duration', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.price}</span><input type="number" value={plan.price} onChange={e => handlePlanChange(tier.id, plan.id, 'price', parseFloat(e.target.value))} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.priceDetails}</span><input type="text" value={plan.priceDetails} onChange={e => handlePlanChange(tier.id, plan.id, 'priceDetails', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.ctaText}</span><input type="text" value={plan.ctaText} onChange={e => handlePlanChange(tier.id, plan.id, 'ctaText', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.ctaUrl}</span><input type="text" value={plan.ctaUrl} onChange={e => handlePlanChange(tier.id, plan.id, 'ctaUrl', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.finePrint}</span><input type="text" value={plan.finePrint} onChange={e => handlePlanChange(tier.id, plan.id, 'finePrint', e.target.value)} className={`mt-1 ${inputClass}`} /></label>
                                <label className="block"><span className="text-gray-400 text-sm">{t.features}</span><textarea value={plan.features.join('\n')} onChange={e => handlePlanChange(tier.id, plan.id, 'features', e.target.value.split('\n'))} className={`mt-1 ${textareaClass}`} /></label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PricingEditor;