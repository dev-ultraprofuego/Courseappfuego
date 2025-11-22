
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
    
    const labelClass = `block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 font-heading`;

    return (
        <div className="space-y-8">
            {tiers.map(tier => (
                <div key={tier.id} className="bg-[#0a0d0c] border border-white/5 p-6 rounded-xl">
                    <div className="mb-6 border-b border-white/5 pb-4">
                        <label className={labelClass}>Titre du Tier ({tier.id.toUpperCase()})</label>
                        <input type="text" value={tier.name} onChange={e => handleTierChange(tier.id, 'name', e.target.value)} className={`text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'} w-full font-heading`} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {tier.plans.map(plan => (
                            <div key={plan.id} className="bg-[#0E1110] p-5 rounded-lg border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wide font-heading">{plan.name}</h3>
                                    {plan.isPopular && <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-bold">POPULAR</span>}
                                </div>

                                <label className="block"><span className={labelClass}>{t.name}</span><input type="text" value={plan.name} onChange={e => handlePlanChange(tier.id, plan.id, 'name', e.target.value)} className={inputClass} /></label>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block"><span className={labelClass}>{t.price}</span><input type="number" value={plan.price} onChange={e => handlePlanChange(tier.id, plan.id, 'price', parseFloat(e.target.value))} className={inputClass} /></label>
                                    <label className="block"><span className={labelClass}>{t.duration}</span><input type="text" value={plan.duration} onChange={e => handlePlanChange(tier.id, plan.id, 'duration', e.target.value)} className={inputClass} /></label>
                                </div>

                                <label className="block"><span className={labelClass}>{t.priceDetails}</span><input type="text" value={plan.priceDetails} onChange={e => handlePlanChange(tier.id, plan.id, 'priceDetails', e.target.value)} className={inputClass} /></label>
                                
                                <div className="border-t border-white/5 my-1"></div>

                                <label className="block"><span className={labelClass}>{t.ctaText}</span><input type="text" value={plan.ctaText} onChange={e => handlePlanChange(tier.id, plan.id, 'ctaText', e.target.value)} className={inputClass} /></label>
                                <label className="block"><span className={labelClass}>{t.ctaUrl}</span><input type="text" value={plan.ctaUrl} onChange={e => handlePlanChange(tier.id, plan.id, 'ctaUrl', e.target.value)} className={inputClass} /></label>
                                <label className="block"><span className={labelClass}>{t.finePrint}</span><input type="text" value={plan.finePrint} onChange={e => handlePlanChange(tier.id, plan.id, 'finePrint', e.target.value)} className={inputClass} /></label>
                                
                                <label className="block flex-grow">
                                    <span className={labelClass}>{t.features} (Une par ligne)</span>
                                    <textarea 
                                        value={plan.features.join('\n')} 
                                        onChange={e => handlePlanChange(tier.id, plan.id, 'features', e.target.value.split('\n'))} 
                                        className={`${textareaClass} h-40 text-xs leading-relaxed`} 
                                        placeholder="• Accès illimité&#10;• Support 24/7&#10;• Tous les fichiers"
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PricingEditor;
