import React from 'react';
import { Check, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type SubscriptionTier = 'starter' | 'growth' | 'pro';

interface PlanComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: SubscriptionTier;
    onSelectPlan: (tier: SubscriptionTier) => void;
    isLoading?: boolean;
}

const PLANS = [
    {
        id: 'starter' as const,
        name: 'Starter',
        price: '$99',
        period: '/month',
        description: 'Perfect for small tradies just getting started.',
        features: [
            '30 scheduled posts per month',
            'Facebook & Instagram',
            'Basic AI Content Generation',
            'Email Support',
        ],
        missing: [
            'LinkedIn & Twitter',
            'Advanced Tone Learning',
            'Priority Support',
        ],
    },
    {
        id: 'growth' as const,
        name: 'Growth',
        price: '$199',
        period: '/month',
        description: 'For growing local businesses needing more reach.',
        features: [
            '100 scheduled posts per month',
            'Facebook, Instagram & LinkedIn',
            'Advanced AI Tone Learning',
            'Monthly Strategy Call',
            'Priority Email Support',
        ],
        missing: [
            'Twitter Integration',
            'Dedicated Account Manager',
        ],
        popular: true,
    },
    {
        id: 'pro' as const,
        name: 'Pro',
        price: '$399',
        period: '/month',
        description: 'Full-service digital presence for established businesses.',
        features: [
            '500 scheduled posts per month',
            'All Platforms (incl. Twitter)',
            'Premium AI Content Generation',
            'Bi-weekly Strategy Calls',
            'Dedicated Account Manager',
            'Priority Phone Support',
        ],
        missing: [],
    },
];

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({
    isOpen,
    onClose,
    currentTier,
    onSelectPlan,
    isLoading = false,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-6">
                    <DialogTitle className="text-3xl font-bold font-heading">
                        Choose the Right Plan for Your Business
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Simple, transparent pricing. No hidden fees, no lock-in contracts.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const isCurrent = currentTier === plan.id;

                        return (
                            <Card
                                key={plan.id}
                                className={`flex flex-col relative ${plan.popular
                                        ? 'border-primary shadow-lg scale-105 z-10'
                                        : 'border-border shadow-sm'
                                    } ${isCurrent ? 'bg-accent/10' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1 text-sm">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <div className="mt-4 flex items-baseline justify-center text-4xl font-extrabold">
                                        {plan.price}
                                        <span className="text-base font-medium text-muted-foreground ml-1">
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <ul className="space-y-3 text-sm">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.missing.map((feature) => (
                                            <li key={feature} className="flex items-start text-muted-foreground">
                                                <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mr-2" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={isCurrent ? "outline" : plan.popular ? "default" : "secondary"}
                                        disabled={isCurrent || isLoading}
                                        onClick={() => onSelectPlan(plan.id)}
                                    >
                                        {isCurrent ? (
                                            "Current Plan"
                                        ) : (
                                            isLoading ? "Processing..." : `Switch to ${plan.name}`
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>All plans include our standard "No BS" guarantee. Cancel anytime.</p>
                    <p>Need a custom solution? <button className="text-primary underline hover:text-primary/80">Give us a bell</button>.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PlanComparisonModal;
