'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  JAWATAN_ORDER, PPD_MAP, SESSION_KEY, bacaExcel, cetak, isHantar, isLantik, isLulus, kiraKelas, kiraPerlu,
  kiraPetugas, noSurat, normGuru, simpanExcel, statusOf, suratHtml,
} from '@/lib/helpers'

const MENU = [
  ['dashboard', '📊 Dashboard'], ['senarai', '📋 Senarai Guru'], ['tambah', '➕ Tambah Guru'],
  ['import', '📤 Import Excel'], ['buang', '🗑️ Buang Guru'], ['cadangan', '📝 Cadangan Lantikan'],
  ['hantar', '📤 Hantar ke PPD'], ['petugas', '👥 Petugas Hadir di Sekolah Saya'],
  ['surat', '📄 Surat Lantikan Saya'], ['keluar', '🚪 Log Keluar'],
] as const

const JAWATAN = [
  'Ketua Pengawas', 'Timbalan Ketua Pengawas', 'Penyelia Kawasan', 'Pengawas Peperiksaan', 'Juru Tulis',
  'Juru Baca', 'Ketua Pengawas Hospital', 'Pengawas Hospital', 'Pengawas Pengiring', 'Pengemas Bilik',
]
const kosongForm = { nama: '', ic: '', jantina: 'LELAKI', poskod: '', alamat: '', telefon: '', email: '', jawatan: 'Pengawas Peperiksaan', pengalaman: '', noPusatAsal: '' }

export default function SupPage() {
  const router = useRouter()
  const [sek, setSek] = useState<any>(null)
  const [menu, setMenu] = useState('dashboard')
  const [pusat, setPusat] = useState<any[]>([])
  const [guruRaw, setGuruRaw] = useState<any[]>([])
  const [cad, setCad] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState('')
  const [cari, setCari] = useState('')
  const [form, setForm] = useState(kosongForm)
  const [edit, setEdit] = useState<any>(null)
  const [fail, setFail] = useState<any[]>([])
  const [preview, setPreview] = useState<any[]>([])
  const [pilih, setPilih] = useState<string[]>([])
  const [jawCad, setJawCad] = useState('Pengawas Peperiksaan')
  const [pengCad, setPengCad] = useState('')
  const [cariCad, setCariCad] = useState('')
  const [batal, setBatal] = useState<number[]>([])
  const [sahReset, setSahReset] = useState(false)
  const [pusatPilih, setPusatPilih] = useState('')
  const [petugas, setPetugas] = useState<any[] | null>(null)
  const [tmpl, setTmpl] = useState<Record<string, string>>({})
  const [namaPusat, setNamaPusat] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const ok = (m: string) => setMsg('✅ ' + m)
  const ralat = (m: string) => setMsg('❌ ' + m)

  async function muat(s: any) {
    const kod = s.kod_sekolah
    const senarai = (s.senarai_pusat || '').split(',').map((x: string) => x.trim().toUpperCase()).filter(Boolean)
    const [p, g, c, t] = await Promise.all([
      senarai.length ? supabase.from('pusat_master').select('*').in('no_pusat', senarai) : Promise.resolve({ data: [] as any[] }),
      supabase.from('guru_master').select('*').eq('kod_sekolah', kod).order('nama_guru').limit(2000),
      supabase.from('cadangan_sup').select('*').eq('kod_sekolah', kod).order('id').limit(5000),
      supabase.from('surat_templates_jpn').select('jawatan,template_html'),
    ])
    setPusat((p as any).data || [])
    setGuruRaw(g.data || [])
    setCad(c.data || [])
    const tm: Record<string, string> = {}
    ;(t.data || []).forEach((x: any) => { tm[String(x.jawatan).toUpperCase().trim()] = x.template_html })
    setTmpl(tm)
    const kodPusat = Array.from(new Set((c.data || []).map((x: any) => x.kod_pusat).filter(Boolean)))
    if (kodPusat.length) {
      const { data } = await supabase.from('pusat_master').select('no_pusat,nama_pusat').in('no_pusat', kodPusat as string[])
      const m: Record<string, string> = {}
      ;(data || []).forEach((x: any) => { m[String(x.no_pusat).toUpperCase()] = x.nama_pusat })
      setNamaPusat(m)
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return void router.replace('/')
    const s = JSON.parse(raw)
    setSek(s); muat(s)
  }, []) // eslint-disable-line

  const kod = sek?.kod_sekolah || ''
  const ppdKod = String(sek?.kod_ppd || '').toUpperCase()
  const guru = useMemo(() => guruRaw.map(r => normGuru(r, kod)), [guruRaw, kod])

  const baris = useMemo(() => pusat.map(p => {
    const calon = parseInt(String(p.jumlah_calon ?? p.calon ?? 0), 10) || 0
    const kelas = kiraKelas(calon)
    return { no: p.no_pusat, nama: p.nama_pusat, calon, kelas, petugas: kiraPetugas(kelas), perlu: kiraPerlu(kelas) }
  }), [pusat])
  const jumlah = (k: 'calon' | 'kelas' | 'petugas' | 'perlu') => baris.reduce((a, b) => a + b[k], 0)

  const jawatanList = useMemo(() => {
    const idx = (x: string) => (JAWATAN_ORDER.includes(x) ? JAWATAN_ORDER.indexOf(x) : 99)
    return Array.from(new Set<string>(guru.map(g => String(g.jawatan)))).sort((a, b) => idx(a) - idx(b) || a.localeCompare(b))
  }, [guru])

  const guruTapis = guru.filter(g =>
    (!filter || g.jawatan === filter) &&
    (!cari || g.nama.toLowerCase().includes(cari.toLowerCase()) || g.ic.includes(cari)))

  const tidakLengkap = (g: any) => !g.jantina || !g.poskod || !g.alamat || !g.telefon

  // ---------- GURU ----------
  async function tambah(e: React.FormEvent) {
    e.preventDefault()
    const f = form
    const data = { 'NAMA GURU': f.nama.toUpperCase(), IC: f.ic, JANTINA: f.jantina, POSKOD_RUMAH: f.poskod, ALAMAT_RUMAH: f.alamat,
      TELEFON_GURU: f.telefon, EMAIL_GURU: f.email, JAWATAN_CADANGAN: f.jawatan, PENGALAMAN_SPM: f.pengalaman, NO_PUSAT_ASAL: f.noPusatAsal, KOD_SEKOLAH: kod }
    const asas = { kod_ppd: ppdKod.toLowerCase(), kod_sekolah: kod, nama_guru: f.nama.toUpperCase(), ic_guru: f.ic }
    let { error } = await supabase.from('guru_master').insert({ ...asas, jantina: f.jantina, poskod_rumah: f.poskod, alamat_rumah: f.alamat,
      telefon_guru: f.telefon, email_guru: f.email, jawatan_cadangan: f.jawatan, pengalaman_spm: f.pengalaman, no_pusat_asal: f.noPusatAsal, data })
    if (error) ({ error } = await supabase.from('guru_master').insert({ ...asas, data }))
    if (error) return ralat(error.message)
    ok(f.nama.toUpperCase() + ' berjaya ditambah'); setForm(kosongForm); muat(sek)
  }

  async function simpanEdit() {
    const g = edit, data = { ...(guruRaw.find(r => r.id === g.id)?.data || {}), JANTINA: g.jantina, POSKOD_RUMAH: g.poskod, ALAMAT_RUMAH: g.alamat,
      TELEFON_GURU: g.telefon, EMAIL_GURU: g.email, JAWATAN_CADANGAN: g.jawatan, PENGALAMAN_SPM: g.pengalaman }
    let { error } = await supabase.from('guru_master').update({ jantina: g.jantina, poskod_rumah: g.poskod, alamat_rumah: g.alamat,
      telefon_guru: g.telefon, email_guru: g.email, jawatan_cadangan: g.jawatan, pengalaman_spm: g.pengalaman, data }).eq('id', g.id)
    if (error) ({ error } = await supabase.from('guru_master').update({ data }).eq('id', g.id))
    if (error) return ralat(error.message)
    ok('Data guru dikemaskini'); setEdit(null); muat(sek)
  }

  async function buang(ids: number[]) {
    if (!confirm(`Buang ${ids.length} guru?`)) return
    const { error } = await supabase.from('guru_master').delete().in('id', ids)
    error ? ralat(error.message) : ok(`${ids.length} guru dibuang`)
    muat(sek)
  }

  async function importExcel() {
    setBusy(true); let berjaya = 0
    for (let i = 0; i < preview.length; i += 500) {
      const batch = preview.slice(i, i + 500).map(r => {
        const d: any = {}; Object.entries(r).forEach(([k, v]) => (d[k] = v == null ? '' : String(v)))
        const nama = String(d['NAMA GURU'] || '').toUpperCase().trim()
        if (!nama) return null
        return { kod_ppd: (d['KOD PPD'] || ppdKod).toLowerCase(), kod_sekolah: (d['KOD SEKOLAH'] || kod).toUpperCase(), nama_guru: nama, ic_guru: d['IC'] || '', data: d }
      }).filter(Boolean)
      const { error } = await supabase.from('guru_master').insert(batch as any[])
      error ? ralat(`Batch ${i}: ${error.message}`) : (berjaya += batch.length)
    }
    setBusy(false); setPreview([]); ok(`${berjaya} guru diimport`); muat(sek)
  }

  // ---------- CADANGAN ----------
  const adaCad = new Set(cad.map(c => c.ic_guru))
  const guruBolehCadang = guru.filter(g => g.ic && !adaCad.has(g.ic) &&
    (!cariCad || g.nama.toLowerCase().includes(cariCad.toLowerCase()) || g.ic.includes(cariCad)))

  async function simpanCadangan() {
    setBusy(true); let berjaya = 0
    for (const ic of pilih) {
      const g = guru.find(x => x.ic === ic); if (!g) continue
      const penuh = { kod_ppd: ppdKod, kod_sekolah: kod, kod_sekolah_asal: g.kodSekolah || kod, nama_sekolah_asal: g.namaSekolah || sek.nama_sekolah,
        ic_guru: ic, nama_guru: g.nama, jantina: g.jantina, poskod_rumah: g.poskod, alamat_rumah: g.alamat, telefon_guru: g.telefon, email_guru: g.email,
        jawatan_cadangan: jawCad, pengalaman_spm: pengCad || g.pengalaman, status: 'DICADANGKAN', tarikh_cadang: new Date().toISOString().slice(0, 10) }
      let { error } = await supabase.from('cadangan_sup').insert(penuh)
      if (error) ({ error } = await supabase.from('cadangan_sup').insert({ kod_ppd: ppdKod, kod_sekolah: kod, ic_guru: ic, nama_guru: g.nama, jawatan_cadangan: jawCad, status: 'DICADANGKAN' }))
      error ? ralat(`${g.nama}: ${error.message}`) : berjaya++
    }
    setBusy(false); setPilih([]); if (berjaya) ok(`${berjaya} guru dicadangkan sebagai ${jawCad}`); muat(sek)
  }

  // ---------- HANTAR ----------
  const baru = cad.filter(c => !isHantar(c) && !isLulus(c))
  async function hantarPPD() {
    const ids = baru.map(c => c.id)
    const { error } = await supabase.from('cadangan_sup').update({ status: 'HANTAR KE PPD' }).in('id', ids)
    error ? ralat(error.message) : ok(`${ids.length} cadangan dihantar ke PPD ${ppdKod} - ${PPD_MAP[ppdKod]}`)
    muat(sek)
  }
  async function batalCad(ids: number[]) {
    const boleh = cad.filter(c => ids.includes(c.id) && !isLulus(c)).map(c => c.id)
    if (!boleh.length) return setMsg('⚠️ Tiada cadangan boleh dibatal (yang LULUS PPD tak boleh dibatal)')
    const { error } = await supabase.from('cadangan_sup').delete().in('id', boleh)
    error ? ralat(error.message) : ok(`${boleh.length} cadangan dibatal`)
    setBatal([]); setSahReset(false); muat(sek)
  }

  // ---------- PETUGAS ----------
  async function loadPetugas(no: string) {
    setPusatPilih(no); setPetugas(null)
    if (!no) return
    const { data } = await supabase.from('cadangan_sup').select('*').eq('kod_pusat', no).limit(5000)
    setPetugas((data || []).filter(c => isLantik(c) && String(c.kod_sekolah_asal || c.kod_sekolah || '').toUpperCase() !== kod.toUpperCase()))
  }

  // ---------- SURAT ----------
  const bersurat = cad.filter(c => noSurat(c))
  const htmlSurat = (c: any) => suratHtml(c, ppdKod, namaPusat[String(c.kod_pusat || '').toUpperCase()] || '', tmpl[String(c.jawatan_cadangan || '').toUpperCase().trim()])

  function pilihMenu(k: string) {
    if (k === 'keluar') { sessionStorage.removeItem(SESSION_KEY); router.push('/'); return }
    setMsg(''); setMenu(k)
  }

  if (!sek) return <div className="wrap">Memuatkan...</div>
  const noPusat = baris.map(b => b.no).join(', ')
  const Msg = () => msg ? <div className={msg.startsWith('✅') ? 'ok' : msg.startsWith('❌') ? 'err' : 'info'} style={{ margin: '10px 0' }}>{msg}</div> : null
  const hitung = (j: string) => cad.filter(c => c.jawatan_cadangan === j).length
  const warna = (c: any) => (isHantar(c) || isLulus(c) ? { background: '#c8e6c9', color: '#1b5e20', fontWeight: 800 } : { background: '#fff9c4', color: '#e65100' })

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>🏫 SUP {kod}</h3>
        <div className="nama">{sek.nama_sekolah}</div>
        <div className="muted">{ppdKod} - {PPD_MAP[ppdKod]}</div>
        <div className="pusat-box"><b>📍 NO PUSAT SEKOLAH:</b><span>{noPusat || 'Tiada pusat'}</span></div>
        <button className="btn" style={{ width: '100%', margin: '6px 0 10px' }} onClick={() => muat(sek)}>🔄 Refresh Data</button>
        {MENU.map(([k, label]) => (
          <button key={k} className={'menu-item' + (menu === k ? ' active' : '')} onClick={() => pilihMenu(k)}>{label}</button>
        ))}
      </aside>

      <main className="main">
        {/* ============ DASHBOARD ============ */}
        {menu === 'dashboard' && (<>
          <h2>Dashboard SUP - {kod} {sek.nama_sekolah}</h2>
          {baris.length > 0 ? (
            <div className="banner">
              <h3>🏫 KEPERLUAN PENGAWAS SEKOLAH ANDA - {kod}</h3>
              <div>Sekolah anda ada <b>{baris.length} pusat</b> | <b>{jumlah('calon')} calon</b> | <b>{jumlah('kelas')} kelas</b> (1 kelas = 20 calon)<br />
                <span className="muted">Formula: Kelas = CEIL(Calon/20), Petugas = Kelas+9, Sekolah Perlu = Kelas+12</span></div>
              <div className="metrics">
                <div className="metric"><small>JUMLAH KELAS</small><div>{jumlah('kelas')}</div></div>
                <div className="metric"><small>PETUGAS DIPERLUKAN</small><div>{jumlah('petugas')}</div></div>
                <div className="metric red"><small>SEKOLAH WAJIB CALONKAN</small><div>{jumlah('perlu')} ORANG</div></div>
              </div>
            </div>
          ) : <div className="info" style={{ margin: '14px 0' }}>⚠️ Tiada pusat dijumpai untuk sekolah {kod}. Hubungi PPD.</div>}
          <div className="metrics">
            <div className="metric"><small>Jumlah Guru</small><div>{guru.length}</div></div>
            <div className="metric"><small>Pusat Sekolah Ini</small><div>{baris.length}</div></div>
            <div className="metric"><small>Cadangan Dihantar</small><div>{cad.filter(c => isHantar(c) || isLulus(c)).length}</div></div>
          </div>
          {baris.length > 0 && <div className="card"><h3>📍 Senarai Pusat Sekolah Anda</h3><div className="scroll"><table>
            <thead><tr><th>No Pusat</th><th>Nama Pusat</th><th>Calon</th><th>Kelas</th><th>Petugas</th><th>Perlu Calonkan</th></tr></thead>
            <tbody>{baris.map(b => <tr key={b.no}><td className="mono">{b.no}</td><td>{b.nama}</td><td>{b.calon}</td><td>{b.kelas}</td><td>{b.petugas}</td><td>{b.perlu}</td></tr>)}</tbody></table></div></div>}
        </>)}

        {/* ============ SENARAI GURU ============ */}
        {menu === 'senarai' && (<>
          <h2>Senarai Guru - {kod}</h2><Msg />
          <div className="row">
            <div><label>Filter Jawatan</label><select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">Semua jawatan</option>{jawatanList.map(j => <option key={j}>{j}</option>)}</select></div>
            <div><label>Cari nama / IC</label><input className="input" value={cari} onChange={e => setCari(e.target.value)} /></div>
            <div><button className="btn" onClick={() => simpanExcel(guruTapis.map(g => ({ 'NAMA GURU': g.nama, IC: g.ic, JANTINA: g.jantina, POSKOD: g.poskod, ALAMAT: g.alamat, TELEFON: g.telefon, EMAIL: g.email, JAWATAN: g.jawatan, PENGALAMAN: g.pengalaman })), `guru_${kod}.xlsx`)}>📥 Export Excel</button></div>
          </div>
          {guruTapis.some(tidakLengkap) && <div className="info">⚠️ {guruTapis.filter(tidakLengkap).length} guru ada data kosong (jantina/poskod/alamat/telefon). Klik Edit untuk lengkapkan.</div>}
          <div className="card" style={{ marginTop: 12 }}><h3>{guruTapis.length} guru</h3><div className="scroll"><table>
            <thead><tr><th>Nama</th><th>IC</th><th>Jantina</th><th>Poskod</th><th>Telefon</th><th>Jawatan</th><th></th></tr></thead>
            <tbody>{guruTapis.map(g => <tr key={g.id} style={tidakLengkap(g) ? { background: '#fffbeb' } : {}}>
              <td>{g.nama}</td><td className="mono">{g.ic}</td><td>{g.jantina || '-'}</td><td>{g.poskod || '-'}</td><td>{g.telefon || '-'}</td><td>{g.jawatan}</td>
              <td><button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setEdit({ ...g })}>✏️ Edit</button></td></tr>)}</tbody></table></div></div>
          {edit && <div className="card" style={{ marginTop: 14 }}><h3>✏️ Edit - {edit.nama}</h3><div className="grid2"><div>
            <label>Jantina</label><select className="input" value={edit.jantina} onChange={e => setEdit({ ...edit, jantina: e.target.value })}><option value="">-</option><option>LELAKI</option><option>PEREMPUAN</option></select>
            <label>Poskod</label><input className="input" value={edit.poskod} onChange={e => setEdit({ ...edit, poskod: e.target.value })} />
            <label>Alamat</label><textarea className="input" value={edit.alamat} onChange={e => setEdit({ ...edit, alamat: e.target.value })} /></div><div>
            <label>Telefon</label><input className="input" value={edit.telefon} onChange={e => setEdit({ ...edit, telefon: e.target.value })} />
            <label>Email</label><input className="input" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} />
            <label>Jawatan</label><select className="input" value={edit.jawatan} onChange={e => setEdit({ ...edit, jawatan: e.target.value })}>{JAWATAN.map(j => <option key={j}>{j}</option>)}</select>
            <label>Pengalaman SPM</label><input className="input" value={edit.pengalaman} onChange={e => setEdit({ ...edit, pengalaman: e.target.value })} /></div></div>
            <div className="row"><button className="btn primary" onClick={simpanEdit}>💾 Simpan</button><button className="btn" onClick={() => setEdit(null)}>Batal</button></div></div>}
        </>)}

        {/* ============ TAMBAH ============ */}
        {menu === 'tambah' && (<>
          <h2>Tambah Guru - {kod}</h2>
          <form className="card" onSubmit={tambah}><div className="grid2"><div>
            <label>Nama Guru *</label><input className="input" required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            <label>No IC * (12 digit)</label><input className="input" required pattern="[0-9]{12}" title="12 digit" value={form.ic} onChange={e => setForm({ ...form, ic: e.target.value })} />
            <label>Jantina</label><select className="input" value={form.jantina} onChange={e => setForm({ ...form, jantina: e.target.value })}><option>LELAKI</option><option>PEREMPUAN</option></select>
            <label>Poskod Rumah</label><input className="input" value={form.poskod} onChange={e => setForm({ ...form, poskod: e.target.value })} />
            <label>Alamat Rumah *</label><textarea className="input" required value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} /></div><div>
            <label>No Telefon *</label><input className="input" required value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
            <label>Email</label><input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label>Jawatan Cadangan</label><select className="input" value={form.jawatan} onChange={e => setForm({ ...form, jawatan: e.target.value })}>{JAWATAN.map(j => <option key={j}>{j}</option>)}</select>
            <label>Pengalaman SPM</label><input className="input" placeholder="Contoh: 3 tahun" value={form.pengalaman} onChange={e => setForm({ ...form, pengalaman: e.target.value })} />
            <label>No Pusat Asal</label><input className="input" placeholder="Contoh: BA142" value={form.noPusatAsal} onChange={e => setForm({ ...form, noPusatAsal: e.target.value.toUpperCase() })} /></div></div>
            <button className="btn primary">💾 Simpan Guru Lengkap</button><Msg /></form>
        </>)}

        {/* ============ IMPORT ============ */}
        {menu === 'import' && (<>
          <h2>Import Excel Guru - {kod}</h2>
          <div className="info">Lajur: NAMA GURU, IC, JANTINA, NO TELEFON GURU, EMAIL GURU, ALAMAT RUMAH, POSKOD_RUMAH, JAWATAN_CADANGAN, KOD SEKOLAH, KOD PPD</div>
          <div className="row"><button className="btn" onClick={() => simpanExcel([{ 'NAMA GURU': '', IC: '', JANTINA: '', 'NO TELEFON GURU': '', 'EMAIL GURU': '', 'ALAMAT RUMAH': '', POSKOD_RUMAH: '', JAWATAN_CADANGAN: '', 'KOD SEKOLAH': kod, 'KOD PPD': ppdKod }], 'template_guru.xlsx')}>📥 Download Template</button>
            <div><input type="file" accept=".xlsx,.xls" onChange={async e => e.target.files?.[0] && setPreview(await bacaExcel(e.target.files[0]))} /></div></div>
          <Msg />
          {preview.length > 0 && <div className="card"><h3>Preview {preview.length} baris</h3><div className="scroll"><table>
            <thead><tr>{Object.keys(preview[0]).slice(0, 6).map(k => <th key={k}>{k}</th>)}</tr></thead>
            <tbody>{preview.slice(0, 20).map((r, i) => <tr key={i}>{Object.values(r).slice(0, 6).map((v: any, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody></table></div>
            <button className="btn primary" disabled={busy} onClick={importExcel}>{busy ? 'Mengimport...' : `Import ${preview.length} guru`}</button></div>}
        </>)}

        {/* ============ BUANG ============ */}
        {menu === 'buang' && (<>
          <h2>Buang Guru - {kod}</h2><Msg />
          <div className="card"><div className="row"><button className="btn danger" disabled={!fail.length} onClick={() => { buang(fail.map(g => g.id)); setFail([]) }}>🗑️ Buang {fail.length} terpilih</button></div>
            <div className="scroll"><table><thead><tr><th></th><th>Nama</th><th>IC</th><th>Telefon</th></tr></thead>
              <tbody>{guru.map(g => <tr key={g.id}><td><input type="checkbox" checked={fail.some(x => x.id === g.id)} onChange={e => setFail(e.target.checked ? [...fail, g] : fail.filter(x => x.id !== g.id))} /></td>
                <td>{g.nama}</td><td className="mono">{g.ic}</td><td>{g.telefon}</td></tr>)}</tbody></table></div></div>
        </>)}

        {/* ============ CADANGAN ============ */}
        {menu === 'cadangan' && (<>
          <h2>Cadangan Lantikan - {kod}</h2><Msg />
          <div style={{ background: '#fff8e1', borderLeft: '5px solid #ff8f00', padding: 14, borderRadius: 10, margin: '12px 0' }}>
            <b style={{ color: '#e65100' }}>📢 KEPERLUAN WAJIB SEKOLAH ANDA</b><br />
            Pusat: {baris.length} | Calon: {jumlah('calon')} | Kelas: {jumlah('kelas')}<br />
            <b style={{ color: '#c62828' }}>WAJIB:</b> Ketua Pengawas 1 + Timbalan Ketua 1 &nbsp;|&nbsp; <b style={{ color: '#2e7d32' }}>OPTIONAL:</b> Penyelia Kawasan 1 &nbsp;|&nbsp;
            <b style={{ color: '#1565c0' }}>Pengawas Peperiksaan: {jumlah('kelas')} orang</b><br /><b>Total perlu calonkan: {jumlah('perlu')} orang</b>
          </div>
          <div className="metrics">
            <div className="metric"><small>Ketua Pengawas (wajib 1)</small><div>{hitung('Ketua Pengawas')}</div></div>
            <div className="metric"><small>Timbalan KP (wajib 1)</small><div>{hitung('Timbalan Ketua Pengawas')}</div></div>
            <div className="metric"><small>Penyelia Kawasan</small><div>{hitung('Penyelia Kawasan')}</div></div>
            <div className="metric"><small>Pengawas (perlu {jumlah('kelas')})</small><div>{hitung('Pengawas Peperiksaan')}</div></div>
          </div>
          <div className="card"><h3>Pilih guru untuk dicadangkan</h3>
            <div className="row"><div><label>Jawatan Lantikan</label><select className="input" value={jawCad} onChange={e => setJawCad(e.target.value)}>{JAWATAN.map(j => <option key={j}>{j}</option>)}</select></div>
              <div><label>Pengalaman SPM</label><input className="input" placeholder="Contoh: 3 tahun" value={pengCad} onChange={e => setPengCad(e.target.value)} /></div>
              <div><label>Cari guru</label><input className="input" value={cariCad} onChange={e => setCariCad(e.target.value)} /></div></div>
            <div className="scroll" style={{ maxHeight: 300 }}><table><tbody>{guruBolehCadang.map(g => <tr key={g.id}>
              <td style={{ width: 30 }}><input type="checkbox" checked={pilih.includes(g.ic)} onChange={e => setPilih(e.target.checked ? [...pilih, g.ic] : pilih.filter(x => x !== g.ic))} /></td>
              <td>{g.nama}</td><td className="mono">{g.ic}</td><td className="muted">{tidakLengkap(g) ? '⚠️ data tak lengkap' : ''}</td></tr>)}</tbody></table></div>
            <button className="btn primary" disabled={!pilih.length || busy} onClick={simpanCadangan}>{busy ? 'Menyimpan...' : `Simpan Cadangan - ${pilih.length} guru`}</button></div>
          <div className="card" style={{ marginTop: 14 }}><h3>Senarai Cadangan Sekolah Ini ({cad.length})</h3>
            <div className="muted">🟢 Hijau = sudah hantar / lulus &nbsp;|&nbsp; 🟡 Kuning = baru dicadangkan</div>
            <div className="scroll"><table><thead><tr><th>Nama</th><th>IC</th><th>Jawatan</th><th>Status</th></tr></thead>
              <tbody>{cad.map(c => <tr key={c.id}><td><span style={{ ...warna(c), padding: '2px 8px', borderRadius: 4 }}>{c.nama_guru}</span></td><td className="mono">{c.ic_guru}</td><td>{c.jawatan_cadangan}</td><td>{statusOf(c)}</td></tr>)}</tbody></table></div>
            <div className="row"><button className="btn" onClick={() => simpanExcel(cad.map(c => ({ NAMA: c.nama_guru, IC: c.ic_guru, JAWATAN: c.jawatan_cadangan, STATUS: statusOf(c) })), `cadangan_${kod}.xlsx`)}>📥 Export Cadangan</button></div></div>
        </>)}

        {/* ============ HANTAR ============ */}
        {menu === 'hantar' && (<>
          <h2>Hantar Cadangan ke PPD {ppdKod} - {PPD_MAP[ppdKod]}</h2><Msg />
          {cad.length === 0 ? <div className="info">Belum ada cadangan. Pergi menu Cadangan Lantikan dulu.</div> : (<>
            <div className="metrics">
              <div className="metric"><small>Belum dihantar</small><div>{baru.length}</div></div>
              <div className="metric"><small>Sudah dihantar</small><div>{cad.filter(isHantar).length}</div></div>
              <div className="metric"><small>Lulus PPD</small><div>{cad.filter(isLulus).length}</div></div>
            </div>
            {baru.some(c => !c.poskod_rumah || !c.alamat_rumah || !c.telefon_guru) &&
              <div className="info">⚠️ Ada cadangan belum lengkap (poskod/alamat/telefon). PPD tak boleh jana ikut terdekat. Lengkapkan di Senarai Guru.</div>}
            <div className="card" style={{ marginTop: 12 }}><div className="scroll"><table><thead><tr><th>Nama</th><th>IC</th><th>Jawatan</th><th>Status</th></tr></thead>
              <tbody>{cad.map(c => <tr key={c.id}><td><span style={{ ...warna(c), padding: '2px 8px', borderRadius: 4 }}>{c.nama_guru}</span></td><td className="mono">{c.ic_guru}</td><td>{c.jawatan_cadangan}</td><td>{statusOf(c)}</td></tr>)}</tbody></table></div>
              <button className="btn primary" disabled={!baru.length} onClick={hantarPPD}>📤 Hantar {baru.length} Cadangan ke PPD</button></div>
            <div className="grid2" style={{ marginTop: 14 }}>
              <div className="card"><h3>Batal Cadangan</h3><div className="muted">Selagi PPD belum lantik</div>
                <div className="scroll" style={{ maxHeight: 200 }}>{cad.filter(c => !isLulus(c)).map(c => <div key={c.id}><label style={{ fontWeight: 400 }}>
                  <input type="checkbox" checked={batal.includes(c.id)} onChange={e => setBatal(e.target.checked ? [...batal, c.id] : batal.filter(x => x !== c.id))} /> {c.nama_guru}</label></div>)}</div>
                <button className="btn danger" disabled={!batal.length} onClick={() => batalCad(batal)}>❌ Batal Terpilih</button></div>
              <div className="card"><h3>Reset Semua</h3><div className="muted">Padam semua cadangan kecuali yang sudah LULUS</div>
                <label style={{ fontWeight: 400 }}><input type="checkbox" checked={sahReset} onChange={e => setSahReset(e.target.checked)} /> Ya, saya pasti</label>
                <button className="btn danger" disabled={!sahReset} onClick={() => batalCad(cad.map(c => c.id))}>🔄 Reset Semua Cadangan</button></div>
            </div></>)}
        </>)}

        {/* ============ PETUGAS HADIR ============ */}
        {menu === 'petugas' && (<>
          <div className="banner" style={{ background: 'linear-gradient(135deg,#e65100,#ef6c00)', color: '#fff', border: 0 }}><h2 style={{ color: '#fff' }}>👥 Petugas Hadir di Sekolah Saya</h2>Petugas luar yang telah dilantik PPD untuk bertugas di pusat sekolah anda.</div>
          {baris.length === 0 ? <div className="info">Tiada pusat dijumpai untuk sekolah {kod}.</div> : (<>
            <label>Pilih Pusat Di Sekolah Anda</label>
            <select className="input" value={pusatPilih} onChange={e => loadPetugas(e.target.value)}>
              <option value="">-- pilih pusat --</option>{baris.map(b => <option key={b.no} value={b.no}>{b.no} - {String(b.nama || '').slice(0, 40)}</option>)}</select>
            {pusatPilih && petugas === null && <div className="info" style={{ marginTop: 12 }}>Memuatkan...</div>}
            {petugas && petugas.length === 0 && <div className="info" style={{ marginTop: 12 }}>⏳ Belum ada petugas luar dilantik untuk pusat {pusatPilih}. Cikgu sekolah sendiri tidak dipaparkan.</div>}
            {petugas && petugas.length > 0 && <div className="card" style={{ marginTop: 12 }}>
              <div className="metrics">
                <div className="metric"><small>Ketua Pengawas (Luar)</small><div>{petugas.filter(p => /ketua pengawas/i.test(p.jawatan_cadangan) && !/timbalan/i.test(p.jawatan_cadangan)).length}</div></div>
                <div className="metric"><small>Timbalan KP (Luar)</small><div>{petugas.filter(p => /timbalan/i.test(p.jawatan_cadangan)).length}</div></div>
                <div className="metric"><small>Pengawas (Luar)</small><div>{petugas.filter(p => !/ketua pengawas|timbalan/i.test(p.jawatan_cadangan)).length}</div></div></div>
              <div className="scroll"><table><thead><tr><th>Nama</th><th>IC</th><th>Jawatan</th><th>Sekolah Asal</th><th>No Surat</th></tr></thead>
                <tbody>{petugas.map(p => <tr key={p.id}><td>{p.nama_guru}</td><td className="mono">{p.ic_guru}</td><td>{p.jawatan_cadangan}</td><td>{p.kod_sekolah_asal}</td><td>{noSurat(p)}</td></tr>)}</tbody></table></div>
              <button className="btn" onClick={() => simpanExcel(petugas.map(p => ({ NAMA: p.nama_guru, IC: p.ic_guru, JAWATAN: p.jawatan_cadangan, 'SEKOLAH ASAL': p.kod_sekolah_asal, 'NO SURAT': noSurat(p) })), `petugas_luar_${pusatPilih}.xlsx`)}>📥 Export Petugas Luar</button></div>}
          </>)}
        </>)}

        {/* ============ SURAT ============ */}
        {menu === 'surat' && (<>
          <div className="banner" style={{ background: 'linear-gradient(135deg,#4a148c,#7b1fa2)', color: '#fff', border: 0 }}><h2 style={{ color: '#fff' }}>📄 Surat Lantikan Saya</h2>Surat guru sekolah anda yang telah dilantik PPD. Klik Cetak, kemudian pilih "Save as PDF".</div>
          <div className="metrics">
            <div className="metric"><small>Total Cadangan</small><div>{cad.length}</div></div>
            <div className="metric"><small>✅ Sudah Ada Surat</small><div>{bersurat.length}</div></div>
            <div className="metric"><small>⏳ Tunggu Surat</small><div>{cad.length - bersurat.length}</div></div>
          </div>
          {bersurat.length > 0 && <button className="btn primary" style={{ width: 'auto' }} onClick={() => cetak(bersurat.map(htmlSurat))}>🖨️ Cetak / PDF Semua ({bersurat.length} surat)</button>}
          <div className="card" style={{ marginTop: 14 }}><div className="scroll"><table><thead><tr><th>Nama</th><th>Jawatan</th><th>Pusat</th><th>No Surat</th><th></th></tr></thead>
            <tbody>{cad.map(c => <tr key={c.id}><td>{c.nama_guru}</td><td>{c.jawatan_cadangan}</td><td className="mono">{c.kod_pusat || '-'}</td><td>{noSurat(c) || '⏳ menunggu'}</td>
              <td>{noSurat(c) && <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => cetak([htmlSurat(c)])}>🖨️ Cetak</button>}</td></tr>)}</tbody></table></div></div>
        </>)}
      </main>
    </div>
  )
}
