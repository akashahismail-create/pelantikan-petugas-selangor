'use client'
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2f7 0%, #dbeafe 100%)', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', textAlign: 'center', borderTop: '6px solid #0d47a1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, background: '#facc15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '3px solid #ca8a04', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>JATA</div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 13, fontWeight: 900, color: '#0d47a1', margin: 0, letterSpacing: 0.5 }}>JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>Kementerian Pendidikan Malaysia</p>
            </div>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '16px 0 8px 0', lineHeight: 1.2 }}>SISTEM PELANTIKAN PETUGAS SPM 2026</h2>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Pengurusan Pelantikan Pengawas, Ketua Pengawas & Petugas Peperiksaan SPM Negeri Selangor</p>
          <div style={{ marginTop: 16, display: 'inline-flex', gap: 8, background: '#f1f5f9', padding: '6px 14px', borderRadius: 20, fontSize: 10, color: '#334155', border: '1px solid #e2e8f0' }}>
            <span>✓ Kod Pusat UPPER BA049 BK550</span><span>•</span><span>✓ Password 1-369</span><span>•</span><span>✓ 369 Sekolah</span>
          </div>
        </div>

        {/* 4 CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <a href="/jpns" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0d47a1, #1e40af)', color: 'white', padding: 24, borderRadius: 18, boxShadow: '0 10px 20px rgba(13,71,161,0.3)', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏛️</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>JPNS LOGIN</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>Jabatan Pendidikan Negeri Selangor - Pentadbir Negeri</div>
            <div style={{ marginTop: 12, fontSize: 10, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 10px', borderRadius: 20 }}>Masuk →</div>
          </a>
          <a href="/ppd" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #15803d, #16a34a)', color: 'white', padding: 24, borderRadius: 18, boxShadow: '0 10px 20px rgba(21,128,61,0.3)', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>PPD LOGIN</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>Pejabat Pendidikan Daerah - 10 PPD Selangor</div>
            <div style={{ marginTop: 12, fontSize: 10, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 10px', borderRadius: 20 }}>Masuk →</div>
          </a>
          <a href="/sup" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #b45309, #d97706)', color: 'white', padding: 24, borderRadius: 18, boxShadow: '0 10px 20px rgba(180,83,9,0.3)', display: 'block', border: '2px solid #fbbf24' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎓</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>SUP LOGIN</div>
            <div style={{ fontSize: 11, opacity: 0.95, marginTop: 4, fontWeight: 'bold' }}>Pengetua / Guru Besar - Kod Sekolah BEA0091 Password 1</div>
            <div style={{ marginTop: 12, fontSize: 10, background: 'white', color: '#b45309', display: 'inline-block', padding: '6px 14px', borderRadius: 20, fontWeight: 900 }}>★ SUDAH SIAP CANTIK →</div>
          </a>
          <a href="/pusat" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #7e22ce, #a855f7)', color: 'white', padding: 24, borderRadius: 18, boxShadow: '0 10px 20px rgba(126,34,206,0.3)', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>PUSAT LOGIN</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>Ketua Pusat Peperiksaan - Kod Pusat BA049 BK550</div>
            <div style={{ marginTop: 12, fontSize: 10, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '4px 10px', borderRadius: 20 }}>Masuk →</div>
          </a>
        </div>

        {/* INFO */}
        <div style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 900, color: '#0f172a' }}>Maklumat Sistem</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 11, color: '#475569' }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9' }}><b style={{ color: '#0d47a1' }}>369 Sekolah</b><br/>BA Klang 1-49 hingga BK Petaling Utama 334-369</div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9' }}><b style={{ color: '#15803d' }}>Kod Pusat UPPER</b><br/>BA049, BA050, BK550 - Auto uppercase fix</div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9' }}><b style={{ color: '#b45309' }}>Demo SUP</b><br/>BEA0091 / 1 - SMK RAJA MAHADI 2 pusat</div>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>© 2026 Jabatan Pendidikan Negeri Selangor - Sistem Pelantikan Petugas SPM - Dibangunkan untuk Kegunaan Rasmi</div>
        </div>

      </div>
    </div>
  )
}
