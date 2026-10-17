import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import Icon from '../components/Icon';
import { catOf } from '../components/OppCard';
import { Empty, Skeletons, Stat } from '../components/ui';

export default function Reports() {
  const { user } = useAuth();
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/reports/summary').then((x) => setR(x.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <><h1>Report summary</h1><Empty icon="alert-circle" title="Couldn't load your report" text={err} /></>;
  if (!r) return <><h1>Report summary</h1><Skeletons n={3} /></>;
  const by = Object.entries(r.hours_by_category || {}).sort((a, b) => b[1] - a[1]); const mx = Math.max(1, ...by.map(([, h]) => h));
  const date = new Date(r.generated_at).toLocaleDateString('en-PH', { dateStyle: 'long' });

  const downloadPdf = async () => {
    // Loaded on demand: jsPDF is large and most visitors never download a PDF.
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 64;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(0);
    doc.text('Volunteer Report', 48, y);
    y += 24; doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(90);
    doc.text(`${user.name} (${user.role})`, 48, y);
    y += 16; doc.text(`Generated ${date}`, 48, y);
    y += 18; doc.setDrawColor(200); doc.line(48, y, W - 48, y);
    y += 40;
    [[r.total_hours, 'Total hours'], [r.total_activities, 'Activities'], [r.completed, 'Completed']].forEach(([n, l], i) => {
      const x = 48 + i * 170;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(13, 92, 76); doc.text(String(n), x, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90); doc.text(l, x, y + 16);
    });
    y += 64;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(0);
    doc.text('Hours by category', 48, y);
    y += 24;
    if (!by.length) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(90);
      doc.text('No hours recorded yet. Hours appear once an organization confirms attendance.', 48, y);
    }
    by.forEach(([c, h]) => {
      if (y > 760) { doc.addPage(); y = 64; }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(0);
      doc.text(c, 48, y);
      doc.setFont('helvetica', 'bold'); doc.text(`${h} hrs`, W - 48, y, { align: 'right' });
      doc.setFillColor(230, 234, 232); doc.rect(48, y + 8, W - 96, 8, 'F');
      doc.setFillColor(13, 92, 76); doc.rect(48, y + 8, Math.max(2, (W - 96) * (h / mx)), 8, 'F');
      y += 38;
    });
    doc.save('volunteer-report.pdf');
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Report summary</h1><p className="mut">{user.name} · generated {date}</p></div>
        <div className="row no-print">
          <button className="btn g" onClick={() => window.print()}><Icon name="printer" />Print</button>
          <button className="btn" onClick={downloadPdf}><Icon name="download" />Download PDF</button>
        </div>
      </div>
      <div className="stats">
        <Stat n={r.total_hours} label="Total hours" icon="clock" />
        <Stat n={r.total_activities} label="Activities" icon="list" tone="a" />
        <Stat n={r.completed} label="Completed" icon="check" tone="b" />
      </div>
      <div className="card">
        <h2>Hours by category</h2>
        {by.map(([c, h]) => (
          <div key={c} className="hbar" style={{ '--h': catOf(c).h }}>
            <div className="row sp"><span className="row" style={{ gap: '.45rem' }}><Icon name={catOf(c).icon} />{c}</span><b>{h} hrs</b></div>
            <div className="meter"><i style={{ width: `${(h / mx) * 100}%` }} /></div>
          </div>
        ))}
        {!by.length && <Empty icon="chart" title="No hours recorded yet" text="Hours appear here once an organization confirms attendance." />}
      </div>
    </>
  );
}