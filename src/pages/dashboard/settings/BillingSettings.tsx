import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import PlanComparisonModal, { SubscriptionTier } from '@/components/billing/PlanComparisonModal';

const BillingSettings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Fetch user profile to get subscription tier
    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['userProfile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            // In a real app, we'd fetch from Supabase
            // For now, if we are in demo mode (mock user), we might fail or return mock data
            // Let's try to fetch real data first
            const { data, error } = await supabase
                .from('user_profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            if (error) {
                console.warn('Error fetching profile:', error);
                // Fallback for demo/mock users if they don't exist in DB
                return { subscription_tier: 'starter' as SubscriptionTier };
            }

            return data as { subscription_tier: SubscriptionTier };
        },
        enabled: !!user?.id,
    });

    // Mutation to handle plan change (mocked for now)
    const changePlanMutation = useMutation({
        mutationFn: async (newTier: SubscriptionTier) => {
            // 1. Log the attempt
            await supabase.from('plan_change_attempts').insert({
                user_id: user?.id,
                target_tier: newTier
            });

            // 2. Simulate Stripe Checkout creation
            // In production, this would call a Supabase Edge Function to create a Stripe Session
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For now, we'll just update the local state to simulate a successful switch
            // In reality, this would happen via webhook after payment
            if (user?.id) {
                // Only update DB if we have a real user ID that matches a record
                // We'll skip the DB update here to avoid breaking if the user doesn't exist
                // But we can try:
                /*
                await supabase.from('user_profiles')
                  .update({ subscription_tier: newTier })
                  .eq('id', user.id);
                */
            }

            return newTier;
        },
        onSuccess: (newTier) => {
            toast({
                title: "Redirecting to Checkout...",
                description: `Initiating upgrade to ${newTier} plan. (Stripe integration pending)`,
            });
            setIsUpgradeModalOpen(false);
            // In a real flow, we would redirect to Stripe URL here
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to initiate plan change. Please try again.",
                variant: "destructive",
            });
        }
    });

    const currentTier = profile?.subscription_tier || 'starter';

    const handlePlanSelect = (tier: SubscriptionTier) => {
        changePlanMutation.mutate(tier);
    };

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-heading">Billing & Subscription</h2>
                <p className="text-muted-foreground">
                    Manage your plan, payment methods, and billing details.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Current Plan
                            <Badge variant="secondary" className="capitalize">
                                {currentTier}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            You are currently on the <strong>{currentTier}</strong> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {currentTier === 'starter' ? 'Basic Features' :
                                        currentTier === 'growth' ? 'Growth Features' : 'Pro Features'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {currentTier === 'starter' ? '30 posts/mo • FB & Insta' :
                                        currentTier === 'growth' ? '100 posts/mo • FB, Insta & LinkedIn' :
                                            '500 posts/mo • All Platforms'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 rounded-md border p-4 bg-muted/50">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Next Billing Date</p>
                                <p className="text-sm text-muted-foreground">
                                    December 21, 2025 (Estimated)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => setIsUpgradeModalOpen(true)} className="w-full sm:w-auto">
                            Change Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Payment Method Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>
                            Manage your payment details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <CreditCard className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Visa ending in 4242</p>
                                <p className="text-sm text-muted-foreground">Expires 12/2028</p>
                            </div>
                            <Button variant="ghost" size="sm">Update</Button>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Secure Payments</AlertTitle>
                            <AlertDescription>
                                All payments are securely processed by Stripe. We do not store your card details.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full sm:w-auto">
                            View Payment History
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <PlanComparisonModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentTier={currentTier}
                onSelectPlan={handlePlanSelect}
                isLoading={changePlanMutation.isPending}
            />
        </div>
    );
};

export default BillingSettings;
