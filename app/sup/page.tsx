'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SupPage() {
  const [kod, setKod] = useState('BEA0091')
  const [pass, setPass] = useState('1')
  const [sekolah, setSekolah] = useState<any>(null)
  const [pusatList, setPusatList] = useState<any[]>([])
  const [guruList, setGuruList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin(e: any) {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const kodUpper = kod.trim().toUpperCase()
      const { data, error } = await supabase.from('sekolah_master').select('*').eq('kod_sekolah', kodUpper).eq('password', pass.trim()).single()
      if (error || !data) throw new Error('Kod ' + kodUpper + ' atau Password ' + pass + ' salah. Cuba BEA0091 / 1')
      setSekolah(data)
      if (data.senarai_pusat) {
        const list = data.senarai_pusat.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
        if (list.length > 0) {
          const { data: pusatData } = await supabase.from('pusat_master').select('*').in('no_pusat', list)
          setPusatList(pusatData || [])
        }
      }
      const { data: guruData } = await supabase.from('guru_master').select('*').eq('kod_sekolah', kodUpper).order('nama_guru')
      setGuruList(guruData || [])
    } catch (e: any) { setErr(e.message) } finally { setLoading(false) }
  }

  if (sekolah) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: 20, fontFamily: 'Arial' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, borderLeft: '6px solid #0d47a1', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0d47a1', fontWeight: 900 }}>{sekolah.password}. {sekolah.nama_sekolah} ({sekolah.kod_sekolah})</h2>
              <p style={{ margin: '6px 0', fontSize: 13, color: '#555' }}>{sekolah.kod_ppd} {sekolah.ppd} | Password {sekolah.password} dari 369 | Bil Pusat {sekolah.bil_pusat}</p>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {sekolah.senarai_pusat?.split(',').map((p: string) => (
                  <span key={p} style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', border: '1px solid #bfdbfe' }}>{p.trim().toUpperCase()}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setSekolah(null)} style={{ height: 36, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0 16px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Keluar</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
            <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0d47a1', fontWeight: 'bold' }}>Senarai Pusat ({pusatList.length})</h3>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>No Pusat</th><th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Nama Pusat</th></tr></thead>
                <tbody>{pusatList.map((p: any) => <tr key={p.no_pusat} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>{p.no_pusat}</td><td style={{ padding: 8 }}>{p.nama_pusat}</td></tr>)}</tbody>
              </table>
            </div>
            <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#0d47a1', fontWeight: 'bold' }}>Senarai Guru ({guruList.length})</h3>
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>Nama Guru</th><th style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>IC</th></tr></thead>
                  <tbody>{guruList.map((g: any) => <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: 8 }}>{g.nama_guru}</td><td style={{ padding: 8, fontFamily: 'monospace', fontSize: 11 }}>{g.ic_guru}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, background: '#facc15', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, border: '2px solid #ca8a04' }}>JATA</div>
          <h1 style={{ fontSize: 12, fontWeight: 900, color: '#0d47a1', margin: 0, letterSpacing: 0.5 }}>JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0d47a1', margin: '16px 0 0 0' }}>LOG MASUK SUP</h2>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>Guna Kod Sekolah tambah Password Lama 1 hingga 369<br/>BA Klang 1 hingga 49 hingga BK Petaling Utama 334 hingga 369<br/>Kod Pusat dah fix UPPER BA049, BK550</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>Kod Sekolah (Contoh BEA0091)</label>
            <input value={kod} onChange={e => setKod(e.target.value.toUpperCase())} placeholder="BEA0091" style={{ width: '100%', marginTop: 4, padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>Kata Laluan / Password (1 hingga 369)</label>
            <input value={pass} onChange={e => setPass(e.target.value)} placeholder="1" style={{ width: '100%', marginTop: 4, padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }} required />
          </div>
          {err && <div style={{ fontSize: 12, color: '#b91c1c', background: '#fef2f2', padding: 10, borderRadius: 10, border: '1px solid #fecaca' }}>{err}</div>}
          <button disabled={loading} style={{ width: '100%', background: '#0d47a1', color: 'white', padding: 14, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Menyemak...' : 'Log Masuk SUP'}</button>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 12, fontSize: 11, border: '1px solid #e2e8f0' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', color: '#334155' }}>Demo Login (dah siap fix UPPER):</p>
          <button onClick={() => { setKod('BEA0091'); setPass('1'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6, fontFamily: 'monospace', cursor: 'pointer' }}>BEA0091 / 1 - SMK RAJA MAHADI (BA001) 2 pusat BA049 BA050</button>
          <button onClick={() => { setKod('BGAJ003'); setPass('360'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6, fontFamily: 'monospace', cursor: 'pointer' }}>BGAJ003 / 360 - SRI BESTARI BK550</button>
          <button onClick={() => { setKod('ZZZ0022'); setPass('369'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'monospace', cursor: 'pointer' }}>ZZZ0022 / 369 - BESTARI ASIA PACIFIC BK566</button>
        </div>
        <div style={{ marginTop: 16, textAlign: 'center' }}><a href="/" style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 'bold' }}>Kembali Home</a></div>
      </div>
    </div>
  )
}
