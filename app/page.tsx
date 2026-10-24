'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
    const { data } = await supabase.from('sekolah_master').select('*').eq('kod_ppd', ppd.kod).order('password', {ascending: true})
    setSekolahList(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="bg-[#0d47a1] text-white p-6 text-center">
        <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center text-black font-bold text-xs">JATA NEGARA</div>
        <h1 className="text-2xl font-bold">JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
        <p className="text-sm opacity-90">KEMENTERIAN PENDIDIKAN MALAYSIA</p>
        <div className="bg-white text-[#0d47a1] mt-4 py-2 font-bold tracking-wider">SISTEM PELANTIKAN PETUGAS SPM 2026 - Password 1-369 (BA-&gt;BK)</div>
      </div>

      <div className="flex justify-center gap-6 mt-12 flex-wrap px-4">
        <button onClick={() => window.location.href='/sup'} className="bg-[#1976d2] hover:bg-blue-800 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg transition">SUP<br/><span className="text-xs font-normal">369 Sekolah</span></button>
        <button onClick={() => setShowPPD(true)} className="bg-[#1976d2] hover:bg-blue-800 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg transition">PPD<br/><span className="text-xs font-normal">10 PPD</span></button>
        <button onClick={() => window.location.href='/jpn'} className="bg-[#1976d2] hover:bg-blue-800 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg transition">JPN<br/><span className="text-xs font-normal">Admin</span></button>
      </div>

      <div className="max-w-3xl mx-auto mt-10 bg-white p-4 rounded-xl shadow text-sm">
        <p className="font-bold">Info Password SUP (column password lama):</p>
        <p>BA Klang = 1-49 (BEA0091 SMK RAJA MAHADI = 1), BK Petaling Utama = 334-369 (ZZZ0022 SM BESTARI ASIA PACIFIC = 369). Kod pusat dah UPPER BA049 etc.</p>
      </div>

      {showPPD && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPPD(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-blue-800">PILIH DAERAH / PPD (BA-&gt;BK)</h2><button onClick={() => setShowPPD(false)} className="font-bold">X</button></div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {PPD_LIST.map(ppd => (
                <button key={ppd.kod} onClick={() => handleSelectPPD(ppd)} className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border flex justify-between">
                  <span>{ppd.kod} - {ppd.nama}</span><span className="text-xs bg-blue-100 px-2 py-1 rounded">{ppd.range} ({ppd.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSekolah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSekolah(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-blue-800">SEKOLAH - {selectedPPD?.nama} ({selectedPPD?.kod}) Password {selectedPPD?.range}</h2><button onClick={() => setShowSekolah(false)}>X</button></div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {loading ? <p>Loading 369 sekolah...</p> : sekolahList.map((s) => (
                <button key={s.id} onClick={() => window.location.href=`/sup?kod=${s.kod_sekolah}&p=${s.password}`} className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border text-sm">
                  <span className="font-mono font-bold">{s.password}. {s.kod_sekolah}</span> - {s.nama_sekolah}<br/><span className="text-xs text-slate-500">{s.bil_pusat} pusat: {s.senarai_pusat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
