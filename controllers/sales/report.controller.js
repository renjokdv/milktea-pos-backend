const dayjs = require('dayjs');
const Sale = require('../../models/sales/Sale');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const PDFDocument = require('pdfkit');

// helper to get date boundaries
function rangeFor(period) {
  const now = dayjs();
  switch (period) {
    case 'daily':   return { from: now.startOf('day'),   to: now.endOf('day') };
    case 'weekly':  return { from: now.startOf('week'),  to: now.endOf('week') };
    case 'monthly': return { from: now.startOf('month'), to: now.endOf('month') };
    case 'annual':  return { from: now.startOf('year'),  to: now.endOf('year') };
    default:        return null;
  }
}

exports.summary = async (req, res, next) => {
  try {
    const { period } = req.params; // daily|weekly|monthly|annual
    const r = rangeFor(period);
    if (!r) return res.status(400).json({ message: 'Invalid period' });

    const agg = await Sale.aggregate([
      { $match: { createdAt: { $gte: r.from.toDate(), $lte: r.to.toDate() } } },
      { $unwind: '$items' },
      { $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalItems: { $sum: '$items.qty' },
          transactions: { $sum: 1 }
      } }
    ]);

    res.json(agg[0] || { totalSales: 0, totalItems: 0, transactions: 0 });
  } catch (e) { next(e); }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { period } = req.params;
    const r = rangeFor(period);
    if (!r) return res.status(400).json({ message: 'Invalid period' });

    const sales = await Sale.find({ createdAt: { $gte: r.from.toDate(), $lte: r.to.toDate() } });

    const csv = createCsvWriter({
      header: [
        { id: 'date', title: 'DATE' },
        { id: 'total', title: 'TOTAL' },
        { id: 'paid', title: 'PAID' },
        { id: 'change', title: 'CHANGE' }
      ]
    }).stringifyRecords(sales.map(s => ({
      date: dayjs(s.createdAt).format('YYYY-MM-DD HH:mm'),
      total: s.total,
      paid: s.paid,
      change: s.change
    })));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales_${period}.csv"`);
    res.send(csv);
  } catch (e) { next(e); }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const { period } = req.params;
    const r = rangeFor(period);
    if (!r) return res.status(400).json({ message: 'Invalid period' });

    const sales = await Sale.find({ createdAt: { $gte: r.from.toDate(), $lte: r.to.toDate() } });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sales_${period}.pdf"`);

    doc.text(`Sales Report: ${period.toUpperCase()} (${r.from.format('YYYY-MM-DD')} to ${r.to.format('YYYY-MM-DD')})`);
    doc.moveDown();

    sales.forEach(s => {
      doc.text(`${dayjs(s.createdAt).format('YYYY-MM-DD HH:mm')}  -  TOTAL: ${s.total}`);
    });

    doc.end();
    doc.pipe(res);
  } catch (e) { next(e); }
};
