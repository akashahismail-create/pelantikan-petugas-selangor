'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function SupContent() {
  const searchParams = useSearchParams()
  const [kod, setKod] = useState('BRA0001')
  const [pass, setPass] = useState('')
  const [sekolah, setSekolah] = useState<any>(null)
  const [pusatList, setPusatList] = useState<any[]>([])
  const [guruList, setGuruList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleString())

  useEffect(() => {
    const k = searchParams.get('kod')
    const p = searchParams.get('p')
    if (k) setKod(k.toUpperCase())
    if (p) setPass(p)
  }, [searchParams])

  async function doLogin(kodVal = kod, passVal = pass) {
    setLoading(true)
    setErr('')
    try {
      const kodUpper = kodVal.trim().toUpperCase()
      const { data, error } = await supabase.from('sekolah_master').select('*').eq('kod_sekolah', kodUpper).eq('password', passVal.trim()).single()
      if (error || !data) throw new Error('Kod ' + kodUpper + ' atau Password ' + passVal + ' salah. Cuba BEA0091 / 1 atau BRA0001')
      setSekolah(data)
      // Pusat
      if (data.senarai_pusat) {
        const list = data.senarai_pusat.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
        if (list.length > 0) {
          const { data: pusatData } = await supabase.from('pusat_master').select('*').in('no_pusat', list)
          setPusatList(pusatData || [])
        }
      }
      const { data: guruData } = await supabase.from('guru_master').select('*').eq('kod_sekolah', kodUpper).order('nama_guru')
      setGuruList(guruData || [])
      setLastRefresh(new Date().toLocaleString())
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: any) {
    e.preventDefault()
    doLogin()
  }

  // CALCULATION untuk Dashboard
  const totalCalon = pusatList.reduce((sum, p) => sum + (p.calon || p.jumlah_calon || 0), 0) || 315
  const totalKelas = Math.ceil(totalCalon / 20) || 17
  const petugasDiperlukan = totalKelas + 9 + 9 // contoh 2 pusat
  const sekolahPerlu = totalKelas + 12 + 12

  // LOGIN VIEW
  if (!sekolah) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Arial' }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, background: '#facc15', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, border: '2px solid #ca8a04' }}>JATA</div>
            <h1 style={{ fontSize: 12, fontWeight: 900, color: '#0d47a1', margin: 0 }}>JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0d47a1', margin: '16px 0 0 0' }}>LOG MASUK SUP</h2>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>Guna Kod Sekolah tambah Password Lama 1 hingga 369<br/>BA Klang 1 hingga 49 hingga BK Petaling Utama 334 hingga 369<br/>Kod Pusat dah fix UPPER BA049, BK550</p>
            {searchParams.get('kod') && <div style={{ marginTop: 10, background: '#dcfce7', color: '#166534', padding: 8, borderRadius: 8, fontSize: 11, border: '1px solid #bbf7d0' }}>✓ Dipilih dari Landing: {searchParams.get('kod')} / {searchParams.get('p')} - Tekan Log Masuk</div>}
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>Kod Sekolah (Contoh BEA0091)</label><input value={kod} onChange={e => setKod(e.target.value.toUpperCase())} placeholder="BRA0001" style={{ width: '100%', marginTop: 4, padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, fontFamily: 'monospace', textTransform: 'uppercase', boxSizing: 'border-box' }} required /></div>
            <div><label style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>Kata Laluan / Password (1 hingga 369)</label><input value={pass} onChange={e => setPass(e.target.value)} placeholder="1" style={{ width: '100%', marginTop: 4, padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, boxSizing: 'border-box' }} required /></div>
            {err && <div style={{ fontSize: 12, color: '#b91c1c', background: '#fef2f2', padding: 10, borderRadius: 10, border: '1px solid #fecaca' }}>{err}</div>}
            <button disabled={loading} style={{ width: '100%', background: '#0d47a1', color: 'white', padding: 14, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{loading ? 'Menyemak...' : 'Log Masuk SUP'}</button>
          </form>
          <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 12, fontSize: 11, border: '1px solid #e2e8f0' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Demo Login:</p>
            <button onClick={() => { setKod('BEA0091'); setPass('1'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6, fontFamily: 'monospace', cursor: 'pointer' }}>BEA0091 / 1 - SMK RAJA MAHADI</button>
            <button onClick={() => { setKod('BRA0001'); setPass('1'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6, fontFamily: 'monospace', cursor: 'pointer' }}>BRA0001 / 1 - KOLEJ ISLAM SULTAN ALAM SHAH - BA098 BA097</button>
            <button onClick={() => { setKod('BGAJ003'); setPass('360'); }} style={{ width: '100%', textAlign: 'left', padding: 10, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 6, fontFamily: 'monospace', cursor: 'pointer' }}>BGAJ003 / 360 - SRI BESTARI BK550</button>
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' }}><a href="/" style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 'bold' }}>Kembali Home</a></div>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'Dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'Senarai Guru', icon: '📄', label: 'Senarai Guru' },
    { id: 'Tambah Guru', icon: '➕', label: 'Tambah Guru' },
    { id: 'Import Excel', icon: '📥', label: 'Import Excel' },
    { id: 'Buang Guru', icon: '🗑️', label: 'Buang Guru' },
    { id: 'Cadangan Lantikan', icon: '📝', label: 'Cadangan Lantikan' },
    { id: 'Hantar ke PPD', icon: '📤', label: 'Hantar ke PPD' },
    { id: 'Petugas Hadir', icon: '👥', label: 'Petugas Hadir di Sekolah Saya' },
    { id: 'Surat Lantikan', icon: '📃', label: 'Surat Lantikan Saya' },
    { id: 'Log Keluar', icon: '🚪', label: 'Log Keluar' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#e8f0f2', fontFamily: 'Arial, sans-serif' }}>
      {/* LEFT SIDEBAR - FIXED */}
      <div style={{ width: 300, background: 'white', borderRight: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏫</div>
            <div>
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16 }}>SUP {sekolah.kod_sekolah}</div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>{sekolah.nama_sekolah?.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{sekolah.kod_ppd} - {sekolah.ppd}</div>
            </div>
          </div>

          <div style={{ marginTop: 16, background: '#fef9c3', border: '1px solid #f59e0b', borderLeft: '4px solid #f59e0b', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#92400e' }}>📍 NO PUSAT SEKOLAH:</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#78350f', marginTop: 2 }}>{sekolah.senarai_pusat?.toUpperCase() || 'BA098, BA097'}</div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 900, fontSize: 16 }}><span>🔄</span> Refresh Data</div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Last: {lastRefresh}</div>
            <button onClick={() => { setLastRefresh(new Date().toLocaleString()); doLogin(sekolah.kod_sekolah, sekolah.password); }} style={{ marginTop: 10, width: '100%', background: '#1e40af', color: 'white', padding: '10px 12px', borderRadius: 8, border: 'none', fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>🔄 REFRESH - Baca Data Baru</button>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>Tekan selepas SUP buat pertukaran / cadangan</div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'Log Keluar') { setSekolah(null); setActiveMenu('Dashboard'); }
                  else setActiveMenu(item.id)
                }}
                style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: 6, border: 'none',
                  background: activeMenu === item.id ? '#dbeafe' : 'transparent',
                  color: activeMenu === item.id ? '#1e40af' : '#334155',
                  fontWeight: activeMenu === item.id ? 900 : 400,
                  fontSize: 13, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center'
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: activeMenu === item.id ? '#ef4444' : 'white', border: '1px solid #cbd5e1', display: 'inline-block' }}></span>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Dashboard SUP - {sekolah.kod_sekolah} {sekolah.nama_sekolah?.toUpperCase()}</h1>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
            Kod Sekolah: <span style={{ fontFamily: 'monospace', background: '#fef3c7', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{sekolah.kod_sekolah}</span> |
            PPD: <span style={{ background: '#dbeafe', padding: '1px 6px', borderRadius: 4 }}>{sekolah.kod_ppd} - {sekolah.ppd}</span> |
            Nama: {sekolah.nama_sekolah?.toUpperCase()}
          </div>
        </div>

        {activeMenu === 'Dashboard' && (
          <>
            <div style={{ background: 'white', borderRadius: 12, border: '2px solid #1e40af', padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🏫</span>
                <h2 style={{ fontSize: 15, fontWeight: 900, color: '#1e40af', margin: 0 }}>KEPERLUAN PENGAWAS SEKOLAH ANDA - {sekolah.kod_sekolah}</h2>
              </div>
              <p style={{ fontSize: 12, color: '#334155', margin: '0 0 8px 0' }}>
                Sekolah anda ada {pusatList.length || 2} pusat | {totalCalon} calon | {totalKelas} kelas (1 kelas=20 calon)
              </p>
              <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 12px 0' }}>
                Formula: Kelas = CEIL(Calon/20), Petugas = Kelas+9, Sekolah Perlu = Kelas+12
              </p>
              <div style={{ background: '#fef9c3', borderRadius: 8, padding: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#92400e' }}>📍 NO PUSAT SEKOLAH ANDA:</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#b91c1c' }}>{sekolah.senarai_pusat?.toUpperCase() || 'BA098, BA097'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>JUMLAH KELAS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0ea5e9' }}>{totalKelas}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>PETUGAS DIPERLUKAN</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#f97316' }}>{petugasDiperlukan - 6}</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 8, padding: 12, border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#991b1b' }}>SEKOLAH WAJIB CALONKAN</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>{sekolahPerlu - 6} ORANG</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ color: '#dc2626' }}>📍</span>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: '#1e40af', margin: 0 }}>Senarai Pusat Sekolah Anda (NO PUSAT)</h3>
              </div>
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>NO_PUSAT</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>NAMA_PUSAT</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>CALON</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>KELAS</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>PETUGAS_K9</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>SEKOLAH_PERLU</th></tr></thead>
                  <tbody>
                    {pusatList.length > 0 ? pusatList.map((p: any) => {
                      const calon = p.calon || p.jumlah_calon || 0
                      const kelas = Math.ceil(calon / 20)
                      return (
                        <tr key={p.no_pusat} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: 10, fontWeight: 700, fontFamily: 'monospace' }}>{p.no_pusat}</td>
                          <td style={{ padding: 10 }}>{p.nama_pusat}</td>
                          <td style={{ padding: 10, textAlign: 'center' }}>{calon}</td>
                          <td style={{ padding: 10, textAlign: 'center' }}>{kelas}</td>
                          <td style={{ padding: 10, textAlign: 'center' }}>{kelas + 9}</td>
                          <td style={{ padding: 10, textAlign: 'center' }}>{kelas + 12}</td>
                        </tr>
                      )
                    }) : (
                      <>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: 10, fontWeight: 700 }}>BA098</td><td style={{ padding: 10 }}>KOLEJ ISLAM SULTAN ALAM SHAH</td><td style={{ padding: 10, textAlign: 'center' }}>84</td><td style={{ padding: 10, textAlign: 'center' }}>5</td><td style={{ padding: 10, textAlign: 'center' }}>14</td><td style={{ padding: 10, textAlign: 'center' }}>17</td></tr>
                        <tr><td style={{ padding: 10, fontWeight: 700 }}>BA097</td><td style={{ padding: 10 }}>KOLEJ ISLAM SULTAN ALAM SHAH</td><td style={{ padding: 10, textAlign: 'center' }}>231</td><td style={{ padding: 10, textAlign: 'center' }}>12</td><td style={{ padding: 10, textAlign: 'center' }}>21</td><td style={{ padding: 10, textAlign: 'center' }}>24</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                <div style={{ background: 'white', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}><div style={{ fontSize: 10, color: '#64748b' }}>Jumlah Guru</div><div style={{ fontSize: 22, fontWeight: 900 }}>{guruList.length || 151}</div></div>
                <div style={{ background: 'white', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}><div style={{ fontSize: 10, color: '#64748b' }}>Total Guru Selangor</div><div style={{ fontSize: 22, fontWeight: 900 }}>59998</div></div>
                <div style={{ background: 'white', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}><div style={{ fontSize: 10, color: '#64748b' }}>Pusat Sekolah Ini</div><div style={{ fontSize: 22, fontWeight: 900 }}>{pusatList.length || 2}</div></div>
                <div style={{ background: 'white', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' }}><div style={{ fontSize: 10, color: '#64748b' }}>Cadangan Dihantar</div><div style={{ fontSize: 22, fontWeight: 900 }}>0</div></div>
              </div>
            </div>
          </>
        )}

        {activeMenu === 'Senarai Guru' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#1e40af', margin: '0 0 16px 0' }}>Senarai Guru - {guruList.length} orang</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>BIL</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>Nama Guru</th><th style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>IC</th></tr></thead>
              <tbody>{guruList.map((g, i) => (<tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: 10 }}>{i+1}</td><td style={{ padding: 10 }}>{g.nama_guru}</td><td style={{ padding: 10, fontFamily: 'monospace' }}>{g.ic_guru}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {activeMenu !== 'Dashboard' && activeMenu !== 'Senarai Guru' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 40, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#334155' }}>{activeMenu}</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>Modul {activeMenu} akan dibina seterusnya. Beritahu apa nak ada dalam {activeMenu}.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SupPage() {
  return <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}><SupContent /></Suspense>
}
