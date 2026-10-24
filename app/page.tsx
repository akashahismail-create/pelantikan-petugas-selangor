'use client'
export default function Home() {
  const btn = (bg: string, label: string, href: string) => (
    <a href={href} style={{ display: 'block', background: bg, color: 'white', padding: 20, borderRadius: 16, textDecoration: 'none', fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', fontSize: 14 }}>
      {label}
    </a>
  )
  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', padding: 24, fontFamily: 'Arial' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <div style={{ width: 64, height: 64, background: '#facc15', borderRadius: '50%', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #ca8a04' }}>JATA</div>
          <h1 style={{ color: '#0d47a1', fontWeight: 900, fontSize: 18, margin: 0 }}>JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
          <h2 style={{ color: '#0f172a', fontWeight: 900, fontSize: 22, margin: '12px 0 6px 0' }}>SISTEM PELANTIKAN PETUGAS SPM 2026</h2>
          <p style={{ color: '#64748b', fontSize: 12 }}>Selangor - Kod Pusat UPPER BA049 BK550 - Password 1 hingga 369</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
            <a href="/jpns" style={{ display: 'block', background: '#0d47a1', color: 'white', padding: 20, borderRadius: 16, textDecoration: 'none', fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>JPNS LOGIN<br/><span style={{ fontSize: 10, fontWeight: 400 }}>Negeri Selangor</span></a>
            <a href="/ppd" style={{ display: 'block', background: '#15803d', color: 'white', padding: 20, borderRadius: 16, textDecoration: 'none', fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>PPD LOGIN<br/><span style={{ fontSize: 10, fontWeight: 400 }}>Pejabat PPD</span></a>
            <a href="/sup" style={{ display: 'block', background: '#b45309', color: 'white', padding: 20, borderRadius: 16, textDecoration: 'none', fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>SUP LOGIN<br/><span style={{ fontSize: 10, fontWeight: 400 }}>Pengetua / Guru Besar</span></a>
            <a href="/pusat" style={{ display: 'block', background: '#7e22ce', color: 'white', padding: 20, borderRadius: 16, textDecoration: 'none', fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>PUSAT LOGIN<br/><span style={{ fontSize: 10, fontWeight: 400 }}>Ketua Pusat</span></a>
          </div>

          <div style={{ marginTop: 24, background: '#f8fafc', padding: 12, borderRadius: 12, fontSize: 11, border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <b>Demo SUP:</b> BEA0091 / 1 (SMK RAJA MAHADI - BA049 BA050) | BGAJ003 / 360 (BK550) | ZZZ0022 / 369 (BK566) - Kod Pusat dah fix UPPER, Password 1-369
          </div>
        </div>
      </div>
    </div>
  )
}
