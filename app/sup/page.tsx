'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SupPage() {
  const [kod, setKod] = useState('')
  const [pass, setPass] = useState('')
  const [sekolah, setSekolah] = useState<any>(null)
  const [pusatList, setPusatList] = useState<any[]>([])
  const [guruList, setGuruList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // Auto login jika datang dari Home ?kod=BEA0091&p=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const k = params.get('kod')
    const p = params.get('p')
    if(k && p){ setKod(k); setPass(p); setTimeout(()=>{ (document.getElementById('loginBtn') as any)?.click() }, 500) }
  }, [])

  async function handleLogin(e: any) {
    if(e) e.preventDefault()
    setLoading(true); setErr('')
    try {
      const kodUpper = kod.trim().toUpperCase()
      // GUNA COLUMN password LAMA 1-369
      const { data, error } = await supabase
        .from('sekolah_master')
        .select('*')
        .eq('kod_sekolah', kodUpper)
        .eq('password', pass.toString().trim())
        .single()
      
      if (error || !data) throw new Error(`Kod ${kodUpper} / Password ${pass} salah. Password = 1-369 BA->BK. Contoh BEA0091=1`)
      
      setSekolah(data)

      if (data.senarai_pusat) {
        const list = data.senarai_pusat.split(',').map((s:string)=>s.trim().toUpperCase()).filter(Boolean)
        const { data: pusatData } = await supabase
          .from('pusat_master')
          .select('*')
          .in('no_pusat', list)
        setPusatList(pusatData || [])
      }

      const { data: guruData } = await supabase
        .from('guru_master')
        .select('*')
        .eq('kod_sekolah', kodUpper)
        .order('nama_guru')
      setGuruList(guruData || [])

    } catch (e:any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sekolah) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-[#0d47a1]">{sekolah.password}. {sekolah.nama_sekolah} ({sekolah.kod_sekolah})</h2>
              <p className="text-sm text-slate-600">{sekolah.kod_ppd} - {sekolah.ppd} | Password: {sekolah.password}/369 (BA 1 -> BK 369) | Bil Pusat: {sekolah.bil_pusat}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sekolah.senarai_pusat?.split(',').map((p:string)=><span key={p} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-mono font-bold">{p.trim().toUpperCase()}</span>)}
              </div>
            </div>
            <button onClick={()=>{setSekolah(null); setKod(''); setPass(''); setPusatList([]); setGuruList([])}} className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg border">Log Keluar</button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="font-bold mb-3 text-[#0d47a1]">Senarai Pusat Peperiksaan ({pusatList.length}) - Kod Pusat UPPER BA, BK</h3>
              <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b bg-slate-50"><th className="p-2">No Pusat</th><th className="p-2">Nama Pusat</th><th className="p-2">Calon</th><th className="p-2">Kelas</th><th className="p-2">Petugas</th></tr></thead>
                <tbody>{pusatList.map(p=><tr key={p.no_pusat} className="border-b hover:bg-slate-50"><td className="p-2 font-mono font-bold">{p.no_pusat}</td><td className="p-2">{p.nama_pusat}</td><td className="p-2">{p.jumlah_calon || p.calon}</td><td className="p-2">{p.jumlah_kelas || p.bilik}</td><td className="p-2">{p.petugas_needed}</td></tr>)}</tbody>
              </table>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="font-bold mb-3 text-[#0d47a1]">Senarai Guru {sekolah.kod_sekolah} ({guruList.length} orang) - Dari guru_master 59,998</h3>
              <div className="max-h-[600px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white"><tr className="text-left border-b bg-slate-50"><th className="p-2">Nama Guru</th><th className="p-2">IC</th><th className="p-2">Gred / Jawatan</th></tr></thead>
                  <tbody>{guruList.map((g:any)=><tr key={g.id} className="border-b hover:bg-slate-50"><td className="p-2">{g.nama_guru}<br/><span className="text-xs text-slate-400">{g.kod_ppd} | {g.data?.POSKOD_RUMAH || g.poskod_rumah || ''}</span></td><td className="p-2 font-mono text-xs">{g.ic_guru}</td><td className="p-2 text-xs">{g.data?.GRED || '-'}<br/>{g.data?.JAWATAN_HAKIKI || ''}<br/>Exp SPM: {g.data?.PENGALAMAN_SPM || g.pengalaman_spm || '0'}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-[#0d47a1] text-white py-2 rounded-lg font-bold">Simpan Cadangan Petugas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-xs">JATA</div>
          <h1 className="text-sm font-extrabold text-[#0d47a1]">JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
          <p className="text-lg font-bold mt-3 text-[#0d47a1]">LOG MASUK SUP</p>
          <p className="text-xs text-slate-500 mt-1">Guna Kod Sekolah + Password Lama 1-369<br/>BA Klang 1-49 hingga BK Petaling Utama 334-369</p>
          <p className="text-[10px] text-green-600 mt-2 font-mono">Kod Pusat dah fix UPPER BA049, BK550 etc. Kod PPD dah UPPER BA etc.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Kod Sekolah (Contoh BEA0091)</label>
            <input value={kod} onChange={e=>setKod(e.target.value.toUpperCase())} placeholder="BEA0091" className="w-full mt-1 p-3 border rounded-lg font-mono uppercase" required />
          </div>
          <div>
            <label className="text-sm font-medium">Kata Laluan / Password (1-369)</label>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="1" type="text" className="w-full mt-1 p-3 border rounded-lg" required />
            <p className="text-[11px] text-slate-400 mt-1">ZZZ0022 SM BESTARI ASIA PACIFIC = 369 (terakhir BK)</p>
          </div>
          {err && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{err}</p>}
          <button id="loginBtn" disabled={loading} className="w-full bg-[#0d47a1] text-white p-3 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50">{loading?'Menyemak 369 sekolah...':'Log Masuk SUP'}</button>
        </form>
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs border">
          <p className="font-bold mb-1">Demo Login (dah siap fix UPPER):</p>
          <button onClick={()=>{setKod('BEA0091'); setPass('1')}} className="w-full text-left p-2 hover:bg-white rounded border mb-1">BEA0091 / 1 = SMK RAJA MAHADI (BA001) 2 pusat BA049,BA050</button>
          <button onClick={()=>{setKod('BGAJ003'); setPass('360')}} className="w-full text-left p-2 hover:bg-white rounded border mb-1">BGAJ003 / 360 = SEKOLAH SRI BESTARI BK550</button>
          <button onClick={()=>{setKod('ZZZ0022'); setPass('369')}} className="w-full text-left p-2 hover:bg-white rounded border">ZZZ0022 / 369 = SM BESTARI ASIA PACIFIC BK566 (Last)</button>
        </div>
        <div className="mt-3 text-center">
          <a href="/" className="text-xs text-blue-600 hover:underline">← Kembali Home</a>
        </div>
      </div>
    </div>
  )
}
