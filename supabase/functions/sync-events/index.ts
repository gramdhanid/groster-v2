import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { client_id, events } = await req.json();
    const results = [];

    for (const event of events) {
        try {
            // Check idempotency
            const { data: existing } = await supabase
                .from('sync_events')
                .select('status')
                .eq('id', event.id)
                .single();

            if (existing?.status === 'SUCCESS') {
                results.push({ event_id: event.id, success: true, message: 'Already processed' });
                continue;
            }

            // Process based on event type
            if (event.event_type === 'CREATE_TRANSACTION') {
                await handleCreateTransaction(supabase, event.payload);
            } else if (event.event_type === 'UPDATE_STOCK') {
                await handleUpdateStock(supabase, event.payload);
            } else if (event.event_type === 'CREATE_CUSTOMER') {
                await handleCreateCustomer(supabase, event.payload);
            }

            // Mark as success
            await supabase.from('sync_events').upsert({
                id: event.id,
                event_type: event.event_type,
                payload: event.payload,
                client_id,
                client_timestamp: event.client_timestamp,
                status: 'SUCCESS',
                processed_at: new Date().toISOString()
            });

            results.push({ event_id: event.id, success: true });
        } catch (error) {
            // Use error.message safely
            const message = error instanceof Error ? error.message : String(error);
            results.push({ event_id: event.id, success: false, error: message });
        }
    }

    return new Response(JSON.stringify({ results }), {
        headers: { 'Content-Type': 'application/json' }
    });
});

async function handleCreateTransaction(supabase: any, payload: any) {
    // Validate stock
    for (const item of payload.items) {
        const { data: stock } = await supabase
            .from('product_stock')
            .select('stock_qty')
            .eq('product_id', item.product_id)
            .single();

        const qtyNeeded = item.qty * item.qty_per_base_unit;
        if (!stock || stock.stock_qty < qtyNeeded) {
            throw new Error(`Stok tidak cukup untuk ${item.product_name}`);
        }
    }

    // Insert transaction
    const { data: tx } = await supabase
        .from('transactions')
        .insert({
            customer_id: payload.customer_id,
            payment_method: payload.payment_method,
            total: payload.total,
            paid_amount: payload.paid_amount,
            notes: payload.notes,
            synced_at: new Date().toISOString()
        })
        .select()
        .single();

    // Insert items
    const items = payload.items.map((item: any) => ({
        transaction_id: tx.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit_type: item.unit_type,
        qty: item.qty,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        subtotal: item.qty * item.unit_price
    }));
    await supabase.from('transaction_items').insert(items);

    // Reduce stock
    for (const item of payload.items) {
        const qtyToReduce = item.qty * item.qty_per_base_unit;
        await supabase.rpc('reduce_stock', {
            p_product_id: item.product_id,
            p_qty: qtyToReduce
        });
    }

    // Calculate profit
    const profit = payload.items.reduce((acc: number, item: any) => {
        return acc + (item.unit_price - item.unit_cost) * item.qty;
    }, 0);
    await supabase.from('transactions').update({ profit }).eq('id', tx.id);
}

async function handleUpdateStock(supabase: any, payload: any) {
    await supabase.rpc('adjust_stock', {
        p_product_id: payload.product_id,
        p_adjustment: payload.adjustment
    });
}

async function handleCreateCustomer(supabase: any, payload: any) {
    await supabase.from('customers').insert(payload);
}
