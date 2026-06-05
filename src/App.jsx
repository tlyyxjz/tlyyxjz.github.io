import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

/* ===== 数据 ===== */
const PROJECTS = [
  { year: '2026', title: 'HiveSwarm — AI黑客蜂群', desc: '16个安全Agent + 蜂巢大脑 + 监督者 + 5把自动武器 + 18套组合技。一句话拉满火力全覆盖。开源项目', tags: ['Python', 'AI Agent', 'Security'], link: 'https://github.com/tlyyxjz/HiveSwarm' },
  { year: '2026', title: '个人主页', desc: 'React + Tailwind + Framer Motion，全动画科技风', tags: ['React', 'Tailwind', 'Framer Motion'], link: '' },
]
const BOOKS = [
  { title: '蛊真人', sub: '仙侠', bg: 'from-amber-900 via-yellow-800 to-amber-950' },
  { title: '深入理解\n计算机系统', sub: 'CS:APP', bg: 'from-slate-900 via-blue-950 to-indigo-950' },
  { title: '算法导论', sub: 'CLRS', bg: 'from-slate-800 via-slate-900 to-gray-900' },
  { title: 'C程序设计\n语言', sub: 'K&R', bg: 'from-red-950 via-rose-900 to-red-900' },
  { title: '剑指Offer', sub: '面试', bg: 'from-red-900 via-rose-800 to-pink-900' },
  { title: '数据结构\n与算法分析', sub: 'C语言', bg: 'from-teal-900 via-cyan-900 to-sky-950' },
]
const SONGS = [
  { title: '青花瓷', artist: '周杰伦', id: '410316', source: 'qq', color: 'from-cyan-500 to-blue-600', note: '❀', delay: 0 },
  { title: '红尘客栈', artist: '周杰伦', id: '3585888', source: 'qq', color: 'from-amber-500 to-orange-600', note: '✤', delay: -1 },
  { title: '辞九门回忆', artist: '等什么君', id: '3344448818', source: 'netease', color: 'from-purple-500 to-indigo-600', note: '❁', delay: -2 },
  { title: '牵丝戏', artist: '银临 / Aki阿杰', id: '30352891', source: 'netease', color: 'from-rose-500 to-amber-600', note: '✿', delay: -1.5 },
]

/* ===== 3D 粒子场 ===== */
function ParticleField() {
  const ref = useRef()
  const count = 120
  const [positions] = useState(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) p[i] = (Math.random() - 0.5) * 10
    return p
  })
  useFrame((state, delta) => {
    if (!ref.current) return
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.15
      if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = -4
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = state.mouse.x * 0.1
  })
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#06b6d4" size={0.035} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
    </Points>
  )
}
function ThreeDBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true, antialias: false }} dpr={[1, 1]}>
        <Suspense fallback={null}><ParticleField /></Suspense>
      </Canvas>
    </div>
  )
}

/* ===== 光标光晕 ===== */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <div className="fixed pointer-events-none z-50" style={{ left: pos.x - 150, top: pos.y - 150, width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', borderRadius: '50%', transition: 'left 0.4s ease-out, top 0.4s ease-out' }} />
}

/* ===== 噪点纹理 ===== */
function NoiseOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`
    }} />
  )
}

/* ===== 粒子 ===== */
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-500/15"
          style={{ width: 2 + Math.random() * 4, height: 2 + Math.random() * 4, left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }}
          animate={{ y: [-20, -120], opacity: [0, 0.4, 0], rotate: [0, 180] }}
          transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, delay: Math.random() * 15, ease: 'linear' }} />
      ))}
    </div>
  )
}

/* ===== 玻璃卡片 ===== */
function GlassCard({ children, className = '', hover = true, glow = false }) {
  return (
    <motion.div
      className={`rounded-3xl border backdrop-blur-2xl transition-all duration-500 relative overflow-hidden ${hover ? 'hover:border-white/15 hover:bg-white/[0.05]' : ''} bg-white/[0.02] border-white/[0.06] group ${className}`}
      whileHover={hover ? { y: -2, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } : {}}
    >
      {glow && <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, transparent 50%, rgba(139,92,246,0.06) 100%)' }} />}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

/* ===== 区块标题 ===== */
function SectionTitle({ children, align = 'left' }) {
  return (
    <div className={`flex items-center gap-4 mb-10 ${align === 'center' ? 'justify-center' : ''}`}>
      <span className="text-[11px] uppercase tracking-[0.2em] text-cyan-400/70 font-semibold">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  )
}

/* ===== 打字机 ===== */
function Typewriter({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [cursor, setCursor] = useState(true)
  useEffect(() => {
    let i = 0; setDisplayed('')
    const t = setInterval(() => { if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++ } else clearInterval(t) }, 100)
    return () => clearInterval(t)
  }, [text])
  useEffect(() => { const t = setTimeout(() => setCursor(false), text.length * 100 + 300); return () => clearTimeout(t) }, [text.length])
  return <span>{displayed}{cursor && <span className="animate-pulse text-cyan-300">|</span>}</span>
}

/* ===== 滚动动画 ===== */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true, margin: '-80px' })
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}>{children}</motion.div>
}

/* ===== 技能条 ===== */
function SkillBar({ name, level, emoji }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true })
  const w = level === '入门' ? 35 : level === '正在学' ? 18 : 60
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[13px] font-medium mb-1.5"><span>{emoji} {name}</span><span className="text-white/30">{level}</span></div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div ref={ref} className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" initial={{ width: 0 }} animate={inView ? { width: `${w}%` } : {}} transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }} />
      </div>
    </div>
  )
}

/* ===== 国风黑胶唱片 ===== */
function Vinyl({ title, artist, color, note, id, delay, isPlaying, onPlay }) {
  const playing = isPlaying === id
  return (
    <motion.div className="text-center group cursor-pointer relative" whileHover={{ y: -4 }} onClick={() => onPlay(id)}>
      {/* 浮动国风装饰 */}
      <motion.span className="absolute -top-3 -right-1 text-lg pointer-events-none z-10"
        animate={{ y: [-3, 4, -3], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>{note}</motion.span>
      {/* 唱片主体 */}
      <div className="relative w-36 h-36 mx-auto">
        {/* 唱臂 - 简洁金属风 */}
        <div className="absolute -right-2 -top-1 z-20"
          style={{ transformOrigin: '100% 0%', transform: playing ? 'rotate(22deg)' : 'rotate(-8deg)', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <svg width="32" height="52" viewBox="0 0 32 52" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
            <rect x="12" y="0" width="3" height="40" rx="1.5" fill="#b8a88a"/>
            <rect x="10" y="36" width="7" height="3.5" rx="1" fill="#9b8a6a"/>
            <circle cx="13.5" cy="42" r="3.5" fill="#c4b896" stroke="#a89470" strokeWidth="0.5"/>
          </svg>
        </div>
        {/* 黑胶转盘 */}
        <div className="w-36 h-36 rounded-full relative shadow-2xl shadow-black/60 animate-spin"
          style={{
            animationDuration: playing ? '4s' : '10s',
            background: 'repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 2px, #262626 2px, #262626 2.5px, #111 2.5px, #111 3.5px)',
          }}>
          {/* 金边外圈 */}
          <div className="absolute inset-[3px] rounded-full border border-amber-700/30" />
          {/* 唱片光泽 */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)' }} />
          {/* 朱砂印章 — 专辑"封面" */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-md border border-amber-500/20 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #2a1a1a 0%, #1a1010 50%, #1f1111 100%)' }}>
            {/* 印章纹理 */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #c4a962 0.5px, transparent 0.5px), radial-gradient(circle at 70% 60%, #c4a962 0.5px, transparent 0.5px), radial-gradient(circle at 40% 80%, #c4a962 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] opacity-80">{note}</span>
              <span className="text-[8px] text-amber-400/40 tracking-[0.3em] mt-0.5">{title.slice(0, 2)}</span>
            </div>
          </div>
          {/* 中心针孔 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0a0505] border border-amber-800/30 z-10" />
          {/* 朱砂红播放指示 */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ opacity: playing ? 1 : 0, transition: 'opacity 0.4s' }}>
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse" />
          </div>
        </div>
      </div>
      <p className={`text-xs font-medium mt-2 transition-colors ${playing ? 'text-red-400' : 'text-white/70 group-hover:text-white/90'}`}>
        {playing && '♫ '}{title}
      </p>
      <p className="text-[10px] text-white/30">{artist}</p>
    </motion.div>
  )
}

/* ===== 三玖桌宠 ===== */
function DesktopPet() {
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 110 : 700, y: 300 })
  const [chat, setChat] = useState(false); const [msgs, setMsgs] = useState([{ from: 'her', text: '你好呀，我是三玖 💙\n问问关于徐浚钊的事情吧～' }])
  const [input, setInput] = useState(''); const [talking, setTalking] = useState(false)
  const [mood, setMood] = useState('idle'); const [direction, setDirection] = useState(1)
  const [dragging, setDragging] = useState(false); const msgsRef = useRef(null)
  const dragRef = useRef({ ox: 0, oy: 0, startX: 0, startY: 0 })

  useEffect(() => {
    if (dragging) return
    const walk = () => {
      const maxX = window.innerWidth - 110; const maxY = document.documentElement.scrollHeight - 200
      const scrollY = window.scrollY; const tx = 60 + Math.random() * (maxX - 60)
      const ty = scrollY + 100 + Math.random() * Math.min(window.innerHeight - 200, maxY - scrollY - 100)
      setDirection(tx > pos.x ? 1 : -1); setPos({ x: tx, y: ty })
    }
    const timer = setInterval(walk, 4000 + Math.random() * 4000); walk()
    return () => clearInterval(timer)
  }, [dragging])

  const onMouseDown = (e) => { setDragging(true); dragRef.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y }; setMood('excited'); setTimeout(() => setMood('idle'), 2000) }
  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => { setPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY }) }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  const onDoubleClick = () => { setMood('happy'); setTimeout(() => setMood('idle'), 3000) }

  const reply = useCallback((q) => {
    const ql = q.toLowerCase().replace(/[？?！!。，,、\s]/g, '')
    const map = {
      '你好': '你好呀 (*´▽`*) 💙', '你是谁': '我是三玖！徐浚钊的桌面小助手～', '帮助': '问我：他是谁 / 技能 / 项目 / 爱好 / 学校 / 联系 / 音乐 / 篮球',
      '他是谁': '徐浚钊，上海建桥学院 CS 大一学生', '技能': '🐍 Python（入门）⚡ Node.js（入门）📦 C语言（正在学）🗄️ 数据结构（正在学）',
      '项目': '📁 个人主页 — React + Tailwind + Framer Motion 琉璃拟态风', '爱好': '🏀 篮球（Kyrie Irving！）🎮 CS 🎵 国风音乐 📚 阅读',
      '学校': '上海建桥学院 🏫 CS 专业 · 大一', '联系': 'Gitee/GitHub: tlyyxjz | Email: tlyyxjz@outlook.com',
      '彩蛋': '按 ↑↑↓↓←→←→BA 有惊喜！🌈', '谢谢': '不客气！(◍•ᴗ•◍)❤',
      '再见': '拜拜～(｡•̀ᴗ-)✧', '音乐': '周杰伦 青花瓷 | 等什么君 辞九门回忆 | 银临 牵丝戏 | 林俊杰 江南 🎵',
      '篮球': 'Kyrie Irving #11 🏀 球场上的艺术家！', '三玖': '是的！我是中野三玖 💙 五等分的新娘里的三玖！',
    }
    for (const [k, v] of Object.entries(map)) { if (ql.includes(k)) return v }
    if (ql.includes('python') || ql.includes('node') || ql.includes('c语言')) return map['技能']
    if (ql.includes('项目')) return map['项目']; if (ql.includes('联系') || ql.includes('邮箱')) return map['联系']
    if (ql.includes('学校') || ql.includes('大学')) return map['学校']
    return '这个问题我还不太懂呢 (｡•́︿•̀｡)\n试试问：他是谁 / 技能 / 项目 / 学校 / 联系'
  }, [])

  const send = (e) => { e.preventDefault(); const q = input.trim(); if (!q) return; setMsgs(m => [...m, { from: 'you', text: q }]); setInput(''); setTalking(true); setTimeout(() => { setMsgs(m => [...m, { from: 'her', text: reply(q) }]); setTalking(false) }, 500); setTimeout(() => msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' }), 100) }


  return (
    <>
      <motion.div className="fixed z-40 select-none" animate={{ left: pos.x, top: pos.y }} transition={{ type: 'spring', stiffness: 35, damping: 18, mass: 0.8 }} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
        <motion.div onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} onClick={() => { if (!dragging) setChat(!chat) }} className="relative" whileHover={{ scale: 1.08 }} animate={{ rotate: dragging ? [-3, 3, -3] : 0 }}>
          <motion.div
            animate={{
              y: mood === 'excited' ? [0, -8, 0, -8, 0] : [0, -3, 0],
              rotate: mood === 'excited' ? [0, -5, 5, -5, 0] : [0, -2, 2, 0],
            }}
            transition={{
              y: { duration: mood === 'excited' ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: mood === 'excited' ? 0.5 : 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <img
              src="/miku.png"
              alt="三玖"
              draggable={false}
              style={{
                width: 100,
                height: 'auto',
                transform: `scaleX(${direction})`,
                filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.5))',
              }}
            />
          </motion.div>
          <motion.div className="absolute -top-4 -right-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/80 backdrop-blur border border-white/10 text-white/80">{mood === 'idle' && '💙'}{mood === 'happy' && '💕'}{mood === 'excited' && '✨'}{mood === 'sleepy' && '💤'}</motion.div>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {chat && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-20 z-50 w-80 h-96 rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col bg-black/90 backdrop-blur-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <span className="text-lg">💙</span><span className="font-bold text-sm text-white/80">三玖</span>
              <span className="text-[10px] text-white/30">— 问问关于徐浚钊的事</span>
              <button onClick={() => setChat(false)} className="ml-auto text-white/30 hover:text-red-400">✕</button>
            </div>
            <div ref={msgsRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-line leading-relaxed ${m.from === 'you' ? 'bg-cyan-500/80 text-white rounded-br-md' : 'bg-white/[0.06] text-white/70 rounded-bl-md'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 p-3 border-t border-white/[0.06]">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="问我点什么..." className="flex-1 bg-white/[0.04] rounded-full px-4 py-1.5 text-xs outline-none border border-white/[0.06] focus:border-cyan-400/50 transition-colors text-white/80 placeholder:text-white/20" />
              <button type="submit" className="bg-cyan-500/80 hover:bg-cyan-400 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors">→</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ===== 主页面 ===== */
export default function App() {
  const { innerWidth: ww = 1200, innerHeight: wh = 800 } = typeof window !== 'undefined' ? window : {}
  const [activeSection, setActiveSection] = useState('')
  const [showTop, setShowTop] = useState(false)
  const [playingSong, setPlayingSong] = useState(null)

  useEffect(() => {
    const sections = ['about', 'bento', 'projects', 'contact']
    const onScroll = () => {
      setShowTop(window.scrollY > 400)
      const scrollY = window.scrollY + 100
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
          setActiveSection(id); break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <ThreeDBackground />
      <CursorGlow />
      <NoiseOverlay />
      <Particles />

      {/* Nav - glass */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/[0.06] bg-[#050505]/70">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight text-white/90">tlyyxjz</span>
          <div className="flex items-center gap-6 text-[13px] font-medium">
            {[{ id: 'about', label: '关于' }, { id: 'bento', label: '展示' }, { id: 'projects', label: '项目' }, { id: 'contact', label: '联系' }].map(({ id, label }) => (
              <a key={id} href={`#${id}`}
                className={`transition-colors ${activeSection === id ? 'text-cyan-300' : 'text-white/40 hover:text-white/90'}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }} className="relative z-10">
          <p className="text-white/30 text-sm mb-4 tracking-wider">在校学生 / 编程爱好者</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="text-white/90">你好，我是</span>{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-300 bg-clip-text text-transparent">
              <Typewriter text="徐浚钊" />
            </span>
          </h1>
          <motion.div className="mt-6 mb-2 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]"
            whileHover={{ scale: 1.03, borderColor: 'rgba(6,182,212,0.2)' }}>
            <span className="text-lg">📍</span>
            <span className="text-white/30 text-sm">中国 · 上海</span>
          </motion.div>
          <p className="max-w-sm mx-auto mt-6 text-sm text-white/25 leading-relaxed">计算机科学与技术大一新生<br />热爱编程，正在探索技术的无限可能</p>
        </motion.div>
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </motion.div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionTitle>关于我</SectionTitle>
          <Reveal>
            <GlassCard className="p-10">
              <p className="text-white/50 text-[15px] leading-relaxed mb-4">🎓 计算机科学与技术大一新生，热爱编程，喜欢用代码解决实际问题。目前在深入学习后端开发和数据结构。</p>
              <p className="text-white/50 text-[15px] leading-relaxed mb-6">🛠️ 课余时间喜欢折腾各种小项目，也会在 Gitee 上分享自己的代码。</p>
              <div className="flex flex-wrap gap-2">
                {['🐍 Python', '⚡ Node.js', '🌐 HTML/CSS', '🐧 Linux', '🤖 AI Agent'].map(s => (
                  <motion.span key={s} whileHover={{ y: -4, scale: 1.05 }}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.04] text-white/60 border border-white/[0.06] hover:border-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-400/[0.06] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-default backdrop-blur">{s}</motion.span>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="bento" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionTitle>展示</SectionTitle>
          <div className="grid grid-cols-6 gap-4 auto-rows-[160px]">
            {/* Skills - 3 col tall */}
            <Reveal className="col-span-3 row-span-2">
              <GlassCard className="p-8 h-full"><h3 className="text-sm font-semibold text-white/70 mb-6">📊 技能掌握</h3>
                <SkillBar name="Python" level="入门" emoji="🐍" /><SkillBar name="Node.js" level="入门" emoji="⚡" />
                <SkillBar name="C 语言" level="正在学" emoji="📦" /><SkillBar name="数据结构" level="正在学" emoji="🗄️" />
              </GlassCard>
            </Reveal>
            {/* Education */}
            <Reveal delay={0.05} className="col-span-2">
              <GlassCard className="p-6 h-full flex flex-col justify-center"><div className="text-3xl mb-2">🏫</div><h4 className="text-sm font-semibold text-white/70">教育背景</h4><p className="text-xs text-white/30 mt-1">上海建桥学院</p><p className="text-xs text-white/20">CS · 大一在读</p></GlassCard>
            </Reveal>
            {/* Learning */}
            <Reveal delay={0.1} className="col-span-1">
              <GlassCard className="p-5 h-full flex flex-col justify-center"><div className="text-2xl mb-1">📚</div><h4 className="text-xs font-semibold text-white/70">正在学</h4><p className="text-[10px] text-white/30 mt-1">C 语言</p><p className="text-[10px] text-white/20">数据结构</p></GlassCard>
            </Reveal>
            {/* Basketball */}
            <Reveal delay={0.08} className="col-span-3">
              <div className="rounded-3xl overflow-hidden border border-white/[0.08] h-full relative group cursor-default">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <motion.div className="text-3xl mb-2" animate={{ y: [0, -6, 0], rotate: [0, 60, 120, 180, 240, 360] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>🏀</motion.div>
                  <h4 className="text-sm font-semibold text-white/90">篮球 <span className="text-[10px] text-orange-400 ml-1">#11 · Kyrie Irving</span></h4>
                  <p className="text-xs text-white/40 mt-1">欧文的运球和终结能力，球场上的艺术家</p>
                </div>
              </div>
            </Reveal>
            {/* CS */}
            <Reveal delay={0.1} className="col-span-3">
              <div className="rounded-3xl overflow-hidden border border-white/[0.08] h-full relative group cursor-default">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <motion.div className="text-3xl mb-2" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity }}>🎯</motion.div>
                  <h4 className="text-sm font-semibold text-white/90">CS</h4>
                  <p className="text-xs text-white/40 mt-1">战术配合 · 精准枪法</p>
                </div>
              </div>
            </Reveal>
            {/* Music */}
            <Reveal delay={0.15} className="col-span-6">
              <GlassCard className="p-6 h-full relative overflow-hidden">
                {/* 国风水墨背景纹理 */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 20%, #c4a962 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #c4a962 0%, transparent 50%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-amber-400/50 text-lg">⿅</span>
                    <h4 className="text-sm font-semibold text-amber-300/60 tracking-[0.1em]">国风音乐</h4>
                    <span className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
                  </div>
                  <div className="flex justify-center gap-8 flex-wrap">
                    {SONGS.map((s, i) => <Vinyl key={i} {...s} isPlaying={playingSong} onPlay={setPlayingSong} />)}
                  </div>
                </div>
              </GlassCard>
            </Reveal>
            {/* Books */}
            <Reveal delay={0.2} className="col-span-6">
              <GlassCard className="p-6"><h4 className="text-sm font-semibold text-white/70 mb-4">📚 推荐书单</h4>
                <div className="grid grid-cols-6 gap-3">
                  {BOOKS.map((b, i) => (
                    <motion.div key={i} className="cursor-default" whileHover={{ y: -5 }}>
                      <div className={`h-28 rounded-xl bg-gradient-to-br ${b.bg} flex items-center justify-center p-2 relative overflow-hidden shadow-lg`}>
                        <span className="text-white/80 text-[11px] font-bold text-center leading-snug whitespace-pre-line">{b.title}</span>
                        <span className="absolute bottom-1.5 right-1.5 text-[9px] text-white/30 tracking-wider">{b.sub}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionTitle>项目作品</SectionTitle>
          <div className="space-y-5">
            {PROJECTS.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <GlassCard className="p-8 group" glow>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-500">🚀</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-bold text-cyan-400/60 tracking-wider">{p.year}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                        <h3 className="text-lg font-semibold text-white/80">{p.title}</h3>
                      </div>
                      <p className="text-sm text-white/30 mt-1 leading-relaxed">{p.desc}</p>
                      <div className="flex gap-2 mt-4">{p.tags.map(t => <span key={t} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-white/50 border border-white/[0.06]">{t}</span>)}</div>
                    </div>
                    <motion.a href={p.link || '#'} className="shrink-0 self-center px-4 py-2 rounded-full text-xs font-semibold border border-white/[0.08] text-white/40 hover:text-cyan-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] transition-all" whileHover={{ x: 3 }}>查看 &rarr;</motion.a>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <SectionTitle>联系方式</SectionTitle>
          <Reveal>
            <GlassCard className="p-10 text-center">
              <p className="text-white/30 text-sm mb-6">很高兴认识你，欢迎通过以下方式联系我</p>
              <div className="flex flex-wrap justify-center gap-4">
                {[{ href: 'https://gitee.com/tlyyxjz', icon: '🔗', label: 'Gitee' }, { href: 'https://github.com/tlyyxjz', icon: '🐙', label: 'GitHub' }, { href: 'mailto:tlyyxjz@outlook.com', icon: '📧', label: 'Email' }].map((l, i) => (
                  <motion.a key={i} href={l.href} target="_blank" rel="noopener"
                    className="px-6 py-3 rounded-full text-sm font-semibold bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-cyan-400/20 hover:text-cyan-200 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all backdrop-blur"
                    whileHover={{ y: -3, scale: 1.03 }}>{l.icon} {l.label}</motion.a>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      <footer className="py-10 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/15">© 2026 徐浚钊 · 用 React + Tailwind + Framer Motion 构建</p>
          <div className="flex items-center gap-6 text-xs text-white/15">
            <a href="#about" className="hover:text-white/50 transition-colors">关于</a>
            <a href="#bento" className="hover:text-white/50 transition-colors">展示</a>
            <a href="#projects" className="hover:text-white/50 transition-colors">项目</a>
            <a href="#contact" className="hover:text-white/50 transition-colors">联系</a>
          </div>
        </div>
      </footer>

      {/* Music Player Bar */}
      <AnimatePresence>
        {playingSong && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0505]/97 backdrop-blur-xl border-t border-amber-800/10 shadow-2xl shadow-black/80">
            <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-4">
              <button onClick={() => setPlayingSong(null)}
                className="text-white/20 hover:text-red-400 transition-colors text-lg">✕</button>
              <div className="text-xs text-white/40">
                <span className="text-amber-300/70 font-medium">{SONGS.find(s => s.id === playingSong)?.title}</span>
                <span className="mx-2 text-white/15">—</span>
                <span className="text-white/25">{SONGS.find(s => s.id === playingSong)?.artist}</span>
              </div>
              <div className="flex-1" />
              <div className="h-[66px] w-[330px] rounded overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                {(() => {
                  const song = SONGS.find(s => s.id === playingSong)
                  if (!song) return null
                  if (song.source === 'qq') {
                    return (
                      <iframe
                        title="music-player"
                        frameBorder="no"
                        marginWidth="0"
                        marginHeight="0"
                        width="330"
                        height="110"
                        src={`https://i.y.qq.com/n2/m/outchain/player/index.html?songid=${song.id}`}
                        style={{ marginTop: '-14px' }}
                      />
                    )
                  }
                  return (
                    <iframe
                      title="music-player"
                      frameBorder="no"
                      marginWidth="0"
                      marginHeight="0"
                      width="330"
                      height="86"
                      src={`https://music.163.com/outchain/player?type=2&id=${song.id}&auto=1&height=66`}
                      style={{ marginTop: '-10px' }}
                    />
                  )
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 left-8 z-40 w-10 h-10 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-xl text-white/40 hover:text-cyan-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all flex items-center justify-center"
            style={{ bottom: playingSong ? '90px' : '32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
          </motion.button>
        )}
      </AnimatePresence>

      <DesktopPet />
    </div>
  )
}
