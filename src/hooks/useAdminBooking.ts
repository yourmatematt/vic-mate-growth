import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BookingBlackoutDate, BookingTimeSlot, TimeSlotFormData } from '@/types/booking';

export const useAdminBlackoutDates = () => {
    const [blackoutDates, setBlackoutDates] = useState<BookingBlackoutDate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlackoutDates = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('booking_blackout_dates')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) throw error;
            setBlackoutDates(data || []);
        } catch (error) {
            console.error('Error fetching blackout dates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlackoutDates();
    }, [fetchBlackoutDates]);

    const createBlackoutDate = async (dateData: Omit<BookingBlackoutDate, 'id' | 'created_at' | 'updated_at'>) => {
        const { error } = await supabase
            .from('booking_blackout_dates')
            .insert([dateData]);

        if (error) throw error;
        await fetchBlackoutDates();
    };

    const updateBlackoutDate = async (id: string, dateData: Partial<BookingBlackoutDate>) => {
        const { error } = await supabase
            .from('booking_blackout_dates')
            .update(dateData)
            .eq('id', id);

        if (error) throw error;
        await fetchBlackoutDates();
    };

    const deleteBlackoutDate = async (id: string) => {
        const { error } = await supabase
            .from('booking_blackout_dates')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchBlackoutDates();
    };

    return {
        blackoutDates,
        loading,
        createBlackoutDate,
        updateBlackoutDate,
        deleteBlackoutDate,
        refreshBlackoutDates: fetchBlackoutDates
    };
};

export const useAdminTimeSlots = () => {
    const [timeSlots, setTimeSlots] = useState<BookingTimeSlot[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeSlots = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('booking_time_slots')
                .select('*')
                .order('day_of_week', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;
            setTimeSlots(data || []);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimeSlots();
    }, [fetchTimeSlots]);

    const createTimeSlot = async (slotData: TimeSlotFormData) => {
        const { error } = await supabase
            .from('booking_time_slots')
            .insert([slotData]);

        if (error) throw error;
        await fetchTimeSlots();
    };

    const updateTimeSlot = async (id: string, slotData: Partial<TimeSlotFormData>) => {
        const { error } = await supabase
            .from('booking_time_slots')
            .update(slotData)
            .eq('id', id);

        if (error) throw error;
        await fetchTimeSlots();
    };

    const deleteTimeSlot = async (id: string) => {
        const { error } = await supabase
            .from('booking_time_slots')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchTimeSlots();
    };

    const toggleTimeSlotAvailability = async (id: string, isAvailable: boolean) => {
        const { error } = await supabase
            .from('booking_time_slots')
            .update({ is_available: isAvailable })
            .eq('id', id);

        if (error) throw error;
        await fetchTimeSlots();
    };

    return {
        timeSlots,
        loading,
        createTimeSlot,
        updateTimeSlot,
        deleteTimeSlot,
        toggleTimeSlotAvailability,
        refreshTimeSlots: fetchTimeSlots
    };
};
