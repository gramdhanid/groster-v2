import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

serve(async (req) => {
    const { transaction_id } = await req.json();

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tx, error } = await supabase
        .from('transactions')
        .select(`
      *,
      customer:customers(name, phone),
      items:transaction_items(*)
    `)
        .eq('id', transaction_id)
        .single();

    if (error || !tx) {
        return new Response(JSON.stringify({ error: 'Transaction not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('STRUK PEMBAYARAN', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`No: ${tx.id.substring(0, 8)}`, 20, 35);
    doc.text(`Tanggal: ${new Date(tx.created_at).toLocaleString('id-ID')}`, 20, 42);

    if (tx.customer && !Array.isArray(tx.customer) && typeof tx.customer === 'object') {
        doc.text(`Customer: ${(tx.customer as any).name}`, 20, 49);
    }

    // Items
    let y = 60;
    doc.setFontSize(9);
    doc.text('Produk', 20, y);
    doc.text('Qty', 100, y);
    doc.text('Harga', 130, y);
    doc.text('Subtotal', 165, y);

    y += 7;
    doc.line(20, y, 190, y);
    y += 5;

    for (const item of tx.items) {
        doc.text(item.product_name, 20, y);
        doc.text(`${item.qty} ${item.unit_type}`, 100, y);
        doc.text(`Rp ${item.unit_price.toLocaleString('id-ID')}`, 130, y);
        doc.text(`Rp ${item.subtotal.toLocaleString('id-ID')}`, 165, y);
        y += 7;
    }

    y += 3;
    doc.line(20, y, 190, y);
    y += 7;

    doc.setFontSize(11);
    doc.text(`Total: Rp ${tx.total.toLocaleString('id-ID')}`, 165, y, { align: 'right' });

    y += 7;
    doc.text(`Bayar (${tx.payment_method}): Rp ${tx.paid_amount.toLocaleString('id-ID')}`, 165, y, { align: 'right' });

    if (tx.payment_method === 'KREDIT') {
        y += 7;
        const remaining = tx.total - tx.paid_amount;
        doc.text(`Sisa: Rp ${remaining.toLocaleString('id-ID')}`, 165, y, { align: 'right' });
    }

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    return new Response(JSON.stringify({ pdf_base64: pdfBase64 }), {
        headers: { 'Content-Type': 'application/json' }
    });
});
