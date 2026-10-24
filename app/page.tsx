'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PPD_LIST = [
  { kod: 'BA', nama: 'KLANG', count: 49, range: '1-49' },
  { kod: 'BB', nama: 'KUALA LANGAT', count: 23, range: '50-72' },
  { kod: 'BC', nama: 'KUALA SELANGOR', count: 27, range: '73-99' },
  { kod: 'BD', nama: 'HULU LANGAT', count: 64, range: '100-163' },
  { kod: 'BE', nama: 'HULU SELANGOR', count: 22, range: '164-185' },
  { kod: 'BF', nama: 'SABAK BERNAM', count: 21, range: '186-206' },
  { kod: 'BG', nama: 'GOMBAK', count: 46, range: '207-252' },
  { kod: 'BH', nama: 'PETALING PERDANA', count: 62, range: '253-314' },
  { kod: 'BJ', nama: 'SEPANG', count: 19, range: '315-333' },
  { kod: 'BK', nama: 'PETALING UTAMA', count: 36, range: '334-369' },
]

export default function Home() {
  const [showPPD, setShowPPD] = useState(false)
  const [showSekolah, setShowSekolah] = useState(false)
  const [selectedPPD, setSelectedPPD] = useState<any>(null)
  const [sekolahList, setSekolahList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSelectPPD = async (ppd: any) => {
    setSelectedPPD(ppd)
    setShowPPD(false)
    setLoading(true)
    setShowSekolah(true)
    const { data } = await supabase.from('sekolah_master').select('*').eq('kod_ppd', ppd.kod).order('password', { ascending: true })
    setSekolahList(data || [])
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0d47a1', color: 'white', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: '#facc15', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900, fontSize: 10, border: '3px solid #ca8a04' }}>JATA NEGARA</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
        <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>KEMENTERIAN PENDIDIKAN MALAYSIA</p>
        <div style={{ background: 'white', color: '#0d47a1', marginTop: 16, padding: '8px 16px', fontWeight: 900, letterSpacing: 1, fontSize: 12, display: 'inline-block', borderRadius: 6 }}>SISTEM PELANTIKAN PETUGAS SPM 2026 - Password 1-369 (BA-&gt;BK)</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap', padding: '0 16px' }}>
        <button onClick={() => window.location.href='/sup'} style={{ background: '#1976d2', color: 'white', padding: '24px 48px', borderRadius: 16, fontWeight: 900, fontSize: 20, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
          SUP<br/><span style={{ fontSize: 10, fontWeight: 400 }}>369 Sekolah</span>
        </button>
        <button onClick={() => setShowPPD(true)} style={{ background: '#1976d2', color: 'white', padding: '24px 48px', borderRadius: 16, fontWeight: 900, fontSize: 20, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
          PPD<br/><span style={{ fontSize: 10, fontWeight: 400 }}>10 PPD</span>
        </button>
        <button onClick={() => window.location.href='/jpns'} style={{ background: '#1976d2', color: 'white', padding: '24px 48px', borderRadius: 16, fontWeight: 900, fontSize: 20, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
          JPN<br/><span style={{ fontSize: 10, fontWeight: 400 }}>Admin</span>
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '40px auto 0 auto', background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12, border: '1px solid #e2e8f0' }}>
        <p style={{ fontWeight: 900, margin: '0 0 6px 0' }}>Info Password SUP (column password lama):</p>
        <p style={{ margin: 0, lineHeight: 1.5, color: '#475569' }}>BA Klang = 1-49 (BEA0091 SMK RAJA MAHADI = 1), BK Petaling Utama = 334-369 (ZZZ0022 SM BESTARI ASIA PACIFIC = 369). Kod pusat dah UPPER BA049 etc.</p>
      </div>

      {showPPD && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={() => setShowPPD(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 900, color: '#1e40af', margin: 0, fontSize: 14 }}>PILIH DAERAH / PPD (BA-&gt;BK)</h2>
              <button onClick={() => setShowPPD(false)} style={{ fontWeight: 900, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {PPD_LIST.map(ppd => (
                <button key={ppd.kod} onClick={() => handleSelectPPD(ppd)} style={{ width: '100%', textAlign: 'left', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 13 }}>{ppd.kod} - {ppd.nama}</span>
                  <span style={{ fontSize: 10, background: '#dbeafe', padding: '2px 8px', borderRadius: 10 }}>{ppd.range} ({ppd.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSekolah && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={() => setShowSekolah(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 900, color: '#1e40af', margin: 0, fontSize: 13 }}>SEKOLAH - {selectedPPD?.nama} ({selectedPPD?.kod}) Password {selectedPPD?.range}</h2>
              <button onClick={() => setShowSekolah(false)} style={{ fontWeight: 900, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {loading ? <p>Loading 369 sekolah...</p> : sekolahList.map((s) => (
                <button key={s.id} onClick={() => window.location.href=`/sup?kod=${s.kod_sekolah}&p=${s.password}`} style={{ width: '100%', textAlign: 'left', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s.password}. {s.kod_sekolah}</span> - {s.nama_sekolah}<br/><span style={{ fontSize: 10, color: '#64748b' }}>{s.bil_pusat} pusat: {s.senarai_pusat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
