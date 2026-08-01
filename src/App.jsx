import React, { useState, useEffect, useRef } from "react";
import {
  supabase,
  getDeviceId,
  fetchServerProfile,
  upsertServerProfile,
  insertServerOrder,
  fetchServerOrders,
  insertServerRedemption,
  upsertServerDelivery,
  insertServerNotice,
  fetchDeliveryWorkers,
  fetchDeliveryByPhone,
  registerDeliveryWorker,
  loginDeliveryWorker,
  insertCoupon,
  fetchCoupons,
  markCouponUsed,
} from "./supabase.js";
import {
  Home, UtensilsCrossed, Gift, ShoppingBag, Plus, Minus, X,
  Star, Flame, Leaf, Truck, MapPin, Check, Clock, Download,
  ArrowLeft, Camera, MessageCircle, LogOut, Phone, Ticket, BadgePercent, User, Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Paleta y datos de la marca                                         */
/* ------------------------------------------------------------------ */

const COLORS = {
  red: "#D62839",
  redDark: "#8C1626",
  cream: "#FFF8EE",
  yellow: "#F4B942",
  brown: "#2C1810",
  green: "#4C7A4C",
  muted: "#8a6f56",
  line: "#F1E4CE",
};

const FLAVORS = [
  { id: "quesos", name: "4 Quesos", desc: "Muzzarella, provolone, parmesano y azul.", base: "blanca", topping: "queso", veg: true, popular: true, tag: "Clásica" },
  { id: "tomate", name: "Tomate y Albahaca", desc: "Muzzarella, tomate fresco y albahaca.", base: "roja", topping: "tomate", veg: true, popular: true, tag: "Best seller" },
  { id: "calabresa", name: "Calabresa", desc: "Muzzarella y calabresa picante.", base: "roja", topping: "calabresa", picante: true, popular: true, tag: "Picante" },
  { id: "fugazzeta", name: "Fugazzeta", desc: "Doble muzzarella y cebolla a la piedra.", base: "blanca", topping: "cebolla", veg: true, popular: true, tag: "Clásica" },
  { id: "aceitunas", name: "Aceitunas", desc: "Muzzarella, aceitunas verdes y negras.", base: "roja", topping: "aceituna", veg: true },
  { id: "huevo", name: "Huevo", desc: "Muzzarella y huevo frito en rodajas.", base: "roja", topping: "huevo", veg: true },
  { id: "atun", name: "Atún", desc: "Muzzarella, atún y cebolla morada.", base: "roja", topping: "atun" },
  { id: "caballa", name: "Caballa", desc: "Muzzarella, caballa y morrones.", base: "roja", topping: "caballa" },
  { id: "ajo", name: "Ajo y Perejil", desc: "Muzzarella, ajo asado y perejil fresco.", base: "blanca", topping: "ajo", veg: true },
  { id: "jamon", name: "Jamón y Morrones", desc: "Muzzarella, jamón cocido y morrones.", base: "roja", topping: "jamon" },
  { id: "hongos", name: "Champiñones", desc: "Muzzarella y champiñones salteados.", base: "roja", topping: "hongo", veg: true },
  { id: "rucula", name: "Rúcula y Parmesano", desc: "Muzzarella, rúcula fresca y parmesano.", base: "blanca", topping: "rucula", veg: true, tag: "Fresca" },
];

const BOX_SIZES = [
  { id: "x3", units: 3, people: 2, price: 9000, coquitos: 30 },
  { id: "x4", units: 4, people: 3, price: 13000, coquitos: 40 },
  { id: "x6", units: 6, people: 4, price: 18000, coquitos: 50 },
];

const ADDONS = [
  { id: "pepinillos", name: "Pepinillos", price: 600 },
  { id: "tomate_fresco", name: "Tomate fresco", price: 600 },
  { id: "panceta", name: "Panceta crocante", price: 900 },
  { id: "aceitunas_extra", name: "Aceitunas extra", price: 600 },
  { id: "cebolla_morada", name: "Cebolla morada", price: 500 },
  { id: "queso_extra", name: "Queso extra", price: 800 },
  { id: "huevo_extra", name: "Huevo extra", price: 700 },
  { id: "oregano", name: "Orégano extra", price: 200 },
];

const REWARDS = [
  { id: "rolls_canela", name: "Rolls de canela", cost: 250, icon: "🍥", type: "Postre" },
  { id: "pera_vino", name: "Pera al vino", cost: 250, icon: "🍐", type: "Postre" },
  { id: "cookies", name: "Cookies 😵‍💫🍪", cost: 470, icon: "🍪", type: "Postre" },
  { id: "tiramisu", name: "Tiramisú", cost: 450, icon: "🍰", type: "Postre" },
  { id: "cupon_25", name: "Cupón 25% OFF", cost: 120, icon: "🎟️", type: "Descuento", value: 25 },
  { id: "cupon_35", name: "Cupón 35% OFF", cost: 180, icon: "🎟️", type: "Descuento", value: 35 },
  { id: "cupon_50", name: "Cupón 50% OFF", cost: 300, icon: "🎟️", type: "Descuento", value: 50 },
  { id: "cupon_70", name: "Cupón 70% OFF", cost: 450, icon: "🎟️", type: "Descuento", value: 70 },
];

const APP_VERSION = "1.4.1";
const GITHUB_REPO = "gonzalokronemberger3-beep/ke-bajon-pizzetas";
const DOWNLOAD_URL = "https://ke-bajon-app.vercel.app/kebajon-release.apk";
const ADMIN_PIN = "5173";
const DELIVERY_COSTS = { cercana: 2000, alejada: 3500 };

const STEPS = [
  { n: 1, title: "Elegí tu caja", desc: "x3, x4 o x6 pizzetas" },
  { n: 2, title: "Sumá tus gustos", desc: "Combiná los sabores que quieras" },
  { n: 3, title: "Agregá extras", desc: "Pepinillos, panceta y más" },
  { n: 4, title: "Recibilo en casa", desc: "O retiralo en el local" },
];

const formatPrice = (n) => `$${n.toLocaleString("es-AR")}`;

function resizeImage(file, maxSize = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/* Arte ilustrado de las pizzetas (SVG original, sin fotos externas)  */
/* ------------------------------------------------------------------ */

const SCATTER = [
  { x: 100, y: 52 }, { x: 136, y: 66 }, { x: 128, y: 100 }, { x: 104, y: 130 },
  { x: 72, y: 128 }, { x: 62, y: 96 }, { x: 70, y: 62 }, { x: 100, y: 90 },
  { x: 118, y: 58 }, { x: 80, y: 110 }, { x: 130, y: 86 }, { x: 95, y: 135 },
];

function CheeseBubbles() {
  return SCATTER.map((p, i) => (
    <circle key={`b${i}`} cx={p.x} cy={p.y} r={5 + (i % 3) * 1.5} fill="#ffffff" opacity={0.1} />
  ));
}

function Toppings({ type }) {
  const pts = SCATTER;
  switch (type) {
    case "queso":
      return pts.slice(0, 8).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={7} fill={i % 2 ? "#8FA8C7" : "#FBD16B"} opacity={0.9} />
      ));
    case "aceituna":
      return pts.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={6} ry={5} fill={i % 2 ? "#2F2A22" : "#3B5B3B"} />
      ));
    case "huevo":
      return [{ x: 96, y: 88 }, { x: 60, y: 118 }, { x: 132, y: 66 }].map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx={17} ry={13} fill="#FFF8E7" stroke="#F1DDB0" strokeWidth="1.5" />
          <circle cx={p.x + 3} cy={p.y + 1} r={7} fill="#F4B942" />
        </g>
      ));
    case "calabresa":
      return pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={9} fill="#B23A2E" stroke="#7A2419" strokeWidth="1.5" />
      ));
    case "atun":
      return pts.map((p, i) =>
        i % 3 === 0 ? (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill="none" stroke="#A83279" strokeWidth="2.5" />
        ) : (
          <ellipse key={i} cx={p.x} cy={p.y} rx={9} ry={5} fill="#E8A798" transform={`rotate(${i * 23} ${p.x} ${p.y})`} />
        )
      );
    case "caballa":
      return pts.map((p, i) =>
        i % 3 === 0 ? (
          <rect key={i} x={p.x - 6} y={p.y - 4} width={12} height={8} rx={2} fill="#E0652A" />
        ) : (
          <ellipse key={i} cx={p.x} cy={p.y} rx={8} ry={5} fill="#7C8FA6" transform={`rotate(${i * 17} ${p.x} ${p.y})`} />
        )
      );
    case "tomate":
      return pts.map((p, i) =>
        i % 4 === 0 ? (
          <path key={i} d={`M ${p.x - 7} ${p.y} Q ${p.x} ${p.y - 10} ${p.x + 7} ${p.y} Q ${p.x} ${p.y + 10} ${p.x - 7} ${p.y} Z`} fill="#4C7A4C" />
        ) : (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={9} fill="#C1392B" />
            <circle cx={p.x} cy={p.y} r={5} fill="#E77C6B" />
          </g>
        )
      );
    case "ajo":
      return pts.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={7} ry={4} fill="#F5EFD9" stroke="#DCCB9A" strokeWidth="0.8" transform={`rotate(${i * 22} ${p.x} ${p.y})`} />
      ));
    case "jamon":
      return pts.map((p, i) =>
        i % 2 === 0 ? (
          <rect key={i} x={p.x - 7} y={p.y - 7} width={14} height={14} rx={3} fill="#F1A7A0" />
        ) : (
          <rect key={i} x={p.x - 6} y={p.y - 4} width={12} height={8} rx={2} fill="#E0652A" />
        )
      );
    case "cebolla":
      return pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={7} fill="none" stroke="#C9A0DC" strokeWidth="2.5" />
      ));
    case "hongo":
      return pts.map((p, i) => (
        <path key={i} d={`M ${p.x - 8} ${p.y} a 8 8 0 0 1 16 0 Z`} fill="#D8B992" stroke="#B5905F" strokeWidth="0.6" transform={`rotate(${i * 40} ${p.x} ${p.y})`} />
      ));
    case "rucula":
      return pts.map((p, i) =>
        i % 2 === 0 ? (
          <path key={i} d={`M ${p.x} ${p.y - 8} Q ${p.x + 8} ${p.y} ${p.x} ${p.y + 8} Q ${p.x - 8} ${p.y} ${p.x} ${p.y - 8} Z`} fill="#5B8C5A" />
        ) : (
          <polygon key={i} points={`${p.x},${p.y - 4} ${p.x + 4},${p.y + 3} ${p.x - 4},${p.y + 3}`} fill="#FDFDF8" />
        )
      );
    default:
      return null;
  }
}

function PizzaArt({ flavor, size = 92 }) {
  const isBlanca = flavor.base === "blanca";
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={flavor.name}>
      <circle cx="100" cy="100" r="96" fill="#E8B672" />
      <circle cx="100" cy="100" r="80" fill={isBlanca ? "#F6E7B0" : "#C1392B"} />
      <circle cx="100" cy="100" r="73" fill={isBlanca ? "#FCE9A8" : "#F2A33C"} opacity="0.95" />
      <CheeseBubbles />
      <Toppings type={flavor.topping} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mascota original: "Don Bajón"                                      */
/* ------------------------------------------------------------------ */

function Mascot({ size = 140, mood = "happy" }) {
  return (
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} aria-hidden="true">
      <path d="M20 190 Q100 232 180 190 L165 148 Q100 174 35 148 Z" fill="#E8B672" stroke="#C98A3E" strokeWidth="3" />
      <path d="M35 148 L100 18 L165 148 Q100 174 35 148 Z" fill="#F2A33C" />
      <circle cx="80" cy="88" r="9" fill="#B23A2E" />
      <circle cx="122" cy="108" r="9" fill="#B23A2E" />
      <circle cx="100" cy="65" r="6" fill="#4C7A4C" />
      <path d="M58 55 Q100 76 142 55 L132 38 Q100 54 68 38 Z" fill="#D62839" />
      <path d="M40 138 Q8 118 14 86" stroke="#C98A3E" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="84" r="10" fill="#F2A33C" />
      <path d="M160 138 Q192 96 176 66" stroke="#C98A3E" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="177" cy="64" r="10" fill="#F2A33C" />
      <circle cx="82" cy="106" r="12" fill="#2C1810" />
      <circle cx="118" cy="106" r="12" fill="#2C1810" />
      <circle cx="85" cy="102" r="3.5" fill="#fff" />
      <circle cx="121" cy="102" r="3.5" fill="#fff" />
      <ellipse cx="68" cy="123" rx="7" ry="4" fill="#F0857A" opacity="0.55" />
      <ellipse cx="132" cy="123" rx="7" ry="4" fill="#F0857A" opacity="0.55" />
      {mood === "sad" ? (
        <path d="M85 133 Q100 124 115 133" stroke="#2C1810" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M84 128 Q100 146 116 128" stroke="#2C1810" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      <ellipse cx="70" cy="207" rx="18" ry="10" fill="#D62839" />
      <ellipse cx="130" cy="207" rx="18" ry="10" fill="#D62839" />
    </svg>
  );
}

function MascotFace({ size = 32 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#D62839" />
      <circle cx="50" cy="50" r="40" fill="#F2A33C" />
      <circle cx="36" cy="52" r="6" fill="#2C1810" />
      <circle cx="64" cy="52" r="6" fill="#2C1810" />
      <circle cx="37.5" cy="50" r="2" fill="#fff" />
      <circle cx="65.5" cy="50" r="2" fill="#fff" />
      <path d="M36 64 Q50 76 64 64" stroke="#2C1810" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M28 30 Q50 42 72 30 L66 20 Q50 30 34 20 Z" fill="#fff" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Piezas de UI reutilizables                                         */
/* ------------------------------------------------------------------ */

function TagBadge({ icon: Icon, label, color }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full" style={{ background: color + "22", color }}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function FlavorCard({ flavor, qty, remaining, onInc, onDec }) {
  const Icon = flavor.picante ? Flame : flavor.veg ? Leaf : Star;
  const tagColor = flavor.picante ? COLORS.red : flavor.veg ? COLORS.green : COLORS.yellow;
  const plusDisabled = remaining === 0;
  const minusDisabled = qty === 0;
  return (
    <div className="rounded-2xl p-3 flex flex-col items-center text-center shadow-sm" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
      <PizzaArt flavor={flavor} size={84} />
      {flavor.tag && (
        <div className="mt-1">
          <TagBadge icon={Icon} label={flavor.tag} color={tagColor} />
        </div>
      )}
      <div className="font-extrabold text-sm mt-1" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
        {flavor.name}
      </div>
      <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>{flavor.desc}</div>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={onDec}
          disabled={minusDisabled}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.red}`, opacity: minusDisabled ? 0.3 : 1 }}
        >
          <Minus size={14} color={COLORS.red} />
        </button>
        <span className="w-5 text-center font-bold" style={{ color: COLORS.brown }}>{qty}</span>
        <button
          onClick={onInc}
          disabled={plusDisabled}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: COLORS.red, opacity: plusDisabled ? 0.3 : 1 }}
        >
          <Plus size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function AddonChip({ addon, qty, onInc, onDec }) {
  const minusDisabled = qty === 0;
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
      <div>
        <div className="text-sm font-bold" style={{ color: COLORS.brown }}>{addon.name}</div>
        <div className="text-xs" style={{ color: COLORS.muted }}>+{formatPrice(addon.price)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          disabled={minusDisabled}
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.red}`, opacity: minusDisabled ? 0.3 : 1 }}
        >
          <Minus size={12} color={COLORS.red} />
        </button>
        <span className="w-4 text-center text-sm font-bold" style={{ color: COLORS.brown }}>{qty}</span>
        <button onClick={onInc} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: COLORS.red }}>
          <Plus size={12} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function BoxSizeCard({ box, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1 transition"
      style={{ background: active ? COLORS.red : "#fff", border: `2px solid ${active ? COLORS.red : COLORS.line}` }}
    >
      <span className="text-lg font-extrabold" style={{ color: active ? "#fff" : COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
        x{box.units}
      </span>
      <span className="text-xs font-semibold" style={{ color: active ? "#FFE1C2" : COLORS.muted }}>{box.people} personas</span>
      <span className="text-sm font-bold" style={{ color: active ? "#fff" : COLORS.red }}>{formatPrice(box.price)}</span>
    </button>
  );
}

function Header({ coquitos, onPointsClick, onInstallClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3" style={{ background: "#fff", borderBottom: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center gap-2">
        <MascotFace size={34} />
        <span style={{ fontFamily: "'Baloo 2', sans-serif" }} className="text-xl font-extrabold">
          <span style={{ color: COLORS.red }}>Ke Bajón</span>
          <span style={{ color: COLORS.yellow }}>!</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onInstallClick}
          aria-label="Descargar la app"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.yellow}` }}
        >
          <Download size={16} color={COLORS.brown} />
        </button>
        <button onClick={onPointsClick} className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.yellow}` }}>
          <span style={{ fontSize: 15 }}>🥥</span>
          <span className="text-sm font-extrabold" style={{ color: COLORS.brown }}>{coquitos}</span>
        </button>
      </div>
    </header>
  );
}

function BottomNav({ tab, setTab, cartCount }) {
  const items = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "menu", label: "Menú", icon: UtensilsCrossed },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "rewards", label: "Coquitos", icon: Gift },
    { id: "cart", label: "Pedido", icon: ShoppingBag },
  ];
  return (
    <nav
      className="fixed z-30 flex"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 28,
        width: "calc(100% - 24px)",
        maxWidth: 406,
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 18,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2 relative">
            <Icon size={20} color={active ? COLORS.red : "#B79B7B"} />
            <span className="text-xs font-bold" style={{ color: active ? COLORS.red : "#B79B7B" }}>{it.label}</span>
            {it.id === "cart" && cartCount > 0 && (
              <span
                className="absolute rounded-full flex items-center justify-center text-xs font-extrabold"
                style={{ top: 2, right: 26, background: COLORS.red, color: "#fff", width: 16, height: 16 }}
              >
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function InstallBanner({ onInstallClick, onDismiss }) {
  return (
    <div className="px-4 py-2 flex items-center justify-between gap-2" style={{ background: COLORS.yellow }}>
      <button onClick={onInstallClick} className="flex items-center gap-2 flex-1 text-left">
        <Download size={16} color={COLORS.brown} />
        <span className="text-xs font-extrabold" style={{ color: COLORS.brown }}>
          Descargá la app (Android/iPhone)
        </span>
      </button>
      <button onClick={onDismiss} className="p-1 flex-shrink-0" aria-label="Cerrar">
        <X size={14} color={COLORS.brown} />
      </button>
    </div>
  );
}

function IosInstallModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5"
        style={{ maxWidth: "430px", background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-extrabold text-lg mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
          Instalar en iPhone
        </div>
        <ol className="text-sm flex flex-col gap-2" style={{ color: COLORS.brown }}>
          <li>1. Tocá el ícono de compartir (el cuadrado con la flecha hacia arriba) en Safari</li>
          <li>2. Elegí "Agregar a pantalla de inicio"</li>
          <li>3. Tocá "Agregar"</li>
        </ol>
        <button
          onClick={onClose}
          className="w-full mt-4 rounded-full py-2 font-extrabold"
          style={{ background: COLORS.red, color: "#fff" }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function PinModal({ onClose, onSubmit, title, error }) {
  const [value, setValue] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5"
        style={{ maxWidth: "430px", background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-extrabold text-lg mb-1" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
          {title}
        </div>
        <p className="text-xs mb-3" style={{ color: COLORS.muted }}>Ingresá el PIN de seguridad.</p>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(value);
          }}
          placeholder="••••"
          inputMode="numeric"
          type="password"
          autoFocus
          className="w-full rounded-xl px-3 py-3 text-center text-xl font-extrabold tracking-widest"
          style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.line}`, color: COLORS.brown }}
        />
        {error && <p className="text-xs mt-2 text-center font-bold" style={{ color: COLORS.red }}>{error}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2 font-extrabold"
            style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.line}`, color: COLORS.brown }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit(value)}
            disabled={value.length === 0}
            className="flex-1 rounded-full py-2 font-extrabold"
            style={{ background: COLORS.red, color: "#fff", opacity: value.length === 0 ? 0.5 : 1 }}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed left-1/2 z-40 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
      style={{ bottom: "7.5rem", transform: "translateX(-50%)", background: COLORS.brown, color: "#fff" }}
    >
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vistas                                                              */
/* ------------------------------------------------------------------ */

function HomeView({ onGoMenu, onGoRewards, onGoAdmin, popularFlavors }) {
  return (
    <div>
      <section className="px-5 pt-6 pb-8 rounded-b-3xl" style={{ background: `linear-gradient(160deg, ${COLORS.red} 0%, ${COLORS.redDark} 100%)` }}>
        <div className="flex justify-center">
          <Mascot size={130} />
        </div>
        <h1 className="text-center text-3xl font-extrabold mt-2" style={{ color: "#fff", fontFamily: "'Baloo 2', sans-serif" }}>
          ¿Te agarró un bajón?
        </h1>
        <p className="text-center mt-2" style={{ color: "#FFE1C2" }}>
          Pizzetas grandes, recién horneadas, con la variedad que quieras en cada caja.
        </p>
        <button
          onClick={onGoMenu}
          className="mt-5 w-full rounded-full py-3 font-extrabold text-lg flex items-center justify-center gap-2 active:scale-95 transition"
          style={{ background: COLORS.yellow, color: COLORS.brown }}
        >
          Armar mi caja 🍕
        </button>
      </section>

      <section className="px-5 py-5">
        <h2 className="font-extrabold text-lg" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Cómo pedís</h2>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-sm mb-1" style={{ background: COLORS.red, color: "#fff" }}>
                {s.n}
              </div>
              <div className="font-bold text-sm" style={{ color: COLORS.brown }}>{s.title}</div>
              <div className="text-xs" style={{ color: COLORS.muted }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5">
        <h2 className="font-extrabold text-lg px-5" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Los más pedidos</h2>
        <div className="flex gap-3 overflow-x-auto px-5 mt-3">
          {popularFlavors.map((f) => (
            <button
              key={f.id}
              onClick={onGoMenu}
              className="flex-shrink-0 rounded-2xl p-3 flex flex-col items-center"
              style={{ background: "#fff", border: `1px solid ${COLORS.line}`, width: 120 }}
            >
              <PizzaArt flavor={f} size={70} />
              <div className="text-xs font-bold mt-1 text-center" style={{ color: COLORS.brown }}>{f.name}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pb-4 flex flex-col gap-3">
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#FFF1DC", border: `1px solid ${COLORS.yellow}` }}>
          <Truck size={22} color={COLORS.red} />
          <div className="text-sm font-bold" style={{ color: COLORS.brown }}>
            El costo del envío lo confirma el/la repartidor/a de turno
          </div>
        </div>
        <button onClick={onGoRewards} className="rounded-2xl p-4 flex items-center gap-3 text-left" style={{ background: "#FFF1DC", border: `1px solid ${COLORS.yellow}` }}>
          <Gift size={22} color={COLORS.red} />
          <div className="text-sm font-bold" style={{ color: COLORS.brown }}>Sumás coquitos 🥥 con cada caja y los canjeás por postres</div>
        </button>
        <p className="text-xs text-center mt-1" style={{ color: COLORS.muted }}>
          Nuestras pizzetas son bien grandes: con 1 y media o 2, una persona ya se llena. 😋
        </p>
      </section>

      <section className="px-5 pb-8 flex flex-col items-center gap-2">
        <button onClick={onGoAdmin} className="text-xs font-bold underline" style={{ color: COLORS.muted }}>
          Panel del dueño
        </button>
      </section>
    </div>
  );
}

function MenuView({
  boxSize, onSelectBoxSize, boxFlavors, usedUnits, remaining, capacity, currentBox,
  onIncFlavor, onDecFlavor, boxAddons, onIncAddon, onDecAddon, boxSubtotal, onAddBoxToCart,
}) {
  const progressPct = Math.min(100, Math.round((usedUnits / capacity) * 100));
  const canAdd = usedUnits === capacity;
  return (
    <div className="px-4 pt-4">
      <div className="flex gap-2">
        {BOX_SIZES.map((b) => (
          <BoxSizeCard key={b.id} box={b} active={boxSize === b.id} onClick={() => onSelectBoxSize(b.id)} />
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-between text-sm font-bold" style={{ color: COLORS.brown }}>
          <span>Elegiste {usedUnits} de {capacity}</span>
          <span>{currentBox.people} personas</span>
        </div>
        <div className="w-full h-2 rounded-full mt-2" style={{ background: COLORS.line }}>
          <div className="h-2 rounded-full" style={{ width: `${progressPct}%`, background: COLORS.red, transition: "width 0.2s" }} />
        </div>
        <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
          {remaining > 0
            ? `Elegí ${remaining} pizzeta${remaining === 1 ? "" : "s"} más para completar tu caja`
            : "¡Caja completa! Ya podés agregarla a tu pedido."}
        </div>
      </div>

      <h3 className="font-extrabold text-lg mt-5 mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Elegí tus gustos</h3>
      <div className="grid grid-cols-2 gap-3">
        {FLAVORS.map((f) => (
          <FlavorCard
            key={f.id}
            flavor={f}
            qty={boxFlavors[f.id] || 0}
            remaining={remaining}
            onInc={() => onIncFlavor(f.id)}
            onDec={() => onDecFlavor(f.id)}
          />
        ))}
      </div>

      <h3 className="font-extrabold text-lg mt-6 mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Sumale algo extra</h3>
      <div className="flex flex-col gap-2">
        {ADDONS.map((a) => (
          <AddonChip
            key={a.id}
            addon={a}
            qty={boxAddons[a.id] || 0}
            onInc={() => onIncAddon(a.id)}
            onDec={() => onDecAddon(a.id)}
          />
        ))}
      </div>

      <div className="sticky mt-6 pb-4 pt-3" style={{ bottom: "6.5rem", background: "linear-gradient(180deg, rgba(255,248,238,0) 0%, #FFF8EE 35%)" }}>
        <button
          onClick={onAddBoxToCart}
          disabled={!canAdd}
          className="w-full rounded-full py-3 font-extrabold text-base flex items-center justify-center gap-2 active:scale-95 transition"
          style={{ background: COLORS.red, color: "#fff", opacity: canAdd ? 1 : 0.4 }}
        >
          Agregar caja · {formatPrice(boxSubtotal)}
        </button>
      </div>
    </div>
  );
}

function RewardsView({ profile, onRedeem }) {
  const level = profile.coquitos >= 500 ? "Bajón Legendario" : profile.coquitos >= 200 ? "Bajón Frecuente" : "Bajón Novato";
  return (
    <div className="px-4 pt-4 pb-6">
      <div className="rounded-2xl p-4 text-center" style={{ background: `linear-gradient(160deg, ${COLORS.red}, ${COLORS.redDark})` }}>
        <div className="text-sm font-bold" style={{ color: "#FFE1C2" }}>{level}</div>
        <div className="text-4xl font-extrabold mt-1" style={{ color: "#fff", fontFamily: "'Baloo 2', sans-serif" }}>
          {profile.coquitos} 🥥
        </div>
        <div className="text-xs mt-1" style={{ color: "#FFE1C2" }}>coquitos — sumás con cada caja que pedís</div>
      </div>

      <h3 className="font-extrabold text-lg mt-6 mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Canjeá tus coquitos</h3>
      <div className="grid grid-cols-2 gap-3">
        {REWARDS.map((r) => {
          const canRedeem = profile.coquitos >= r.cost;
          return (
            <div key={r.id} className="rounded-2xl p-3 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <span style={{ fontSize: 32 }}>{r.icon}</span>
              {r.value ? (
                <span className="text-[10px] font-extrabold mt-1 px-2 py-0.5 rounded-full" style={{ background: COLORS.red, color: "#fff" }}>
                  {r.value}% OFF
                </span>
              ) : (
                <span className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full" style={{ background: COLORS.line, color: COLORS.brown }}>{r.type}</span>
              )}
              <span className="text-sm font-bold mt-1" style={{ color: COLORS.brown }}>{r.name}</span>
              <span className="text-xs font-extrabold mt-0.5" style={{ color: COLORS.red }}>{r.cost} 🥥</span>
              <button
                onClick={() => onRedeem(r.id)}
                disabled={!canRedeem}
                className="mt-2 w-full rounded-full py-1.5 text-xs font-extrabold active:scale-95 transition"
                style={{ background: COLORS.red, color: "#fff", opacity: canRedeem ? 1 : 0.3 }}
              >
                Canjear
              </button>
            </div>
          );
        })}
      </div>

      {profile.redeemed.length > 0 && (
        <div className="mt-6">
          <h3 className="font-extrabold text-lg mb-2" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Tus canjes</h3>
          <div className="flex flex-col gap-2">
            {profile.redeemed.map((r, i) => (
              <div key={i} className="rounded-xl px-3 py-2" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: COLORS.brown }} className="font-bold">{r.name}</span>
                  <Check size={16} color={COLORS.green} />
                </div>
                {r.code && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="rounded-lg px-2 py-1 text-xs font-extrabold tracking-wider" style={{ background: COLORS.yellow, color: COLORS.brown }}>
                      {r.code}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: r.value ? COLORS.red : COLORS.muted }}>
                      {r.value ? `${r.value}% de descuento` : "Mostralo para canjear"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: COLORS.muted }}>
            Los cupones se aplican directo en tu pedido. Mostrá esta pantalla en el local para los canjes de postres.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl p-4 text-xs text-center" style={{ background: "#FFF1DC", color: COLORS.muted }}>
        🎉 ¡Próximamente habrá más recompensas!
      </div>
    </div>
  );
}

function CartView({
  cart, onRemoveItem, deliveryMode, setDeliveryMode, addrStreet, setAddrStreet, addrNumber, setAddrNumber,
  addrFloor, setAddrFloor, notes, setNotes,
  cartTotal, coquitosForOrder, coupons, selectedCoupon, onSelectCoupon, discount,
  deliveryZone, setDeliveryZone, deliveryCost, totalFinal, locating, onGetLocation,
  onPlaceOrder, onGoMenu,
}) {
  if (cart.length === 0) {
    return (
      <div className="px-6 pt-16 flex flex-col items-center text-center">
        <Mascot size={110} mood="sad" />
        <h2 className="font-extrabold text-xl mt-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
          Tu pedido está vacío... ¡qué bajón!
        </h2>
        <p className="text-sm mt-2" style={{ color: COLORS.muted }}>Andá al menú y armá tu caja de pizzetas.</p>
        <button onClick={onGoMenu} className="mt-5 rounded-full px-6 py-3 font-extrabold" style={{ background: COLORS.red, color: "#fff" }}>
          Ir al menú
        </button>
      </div>
    );
  }

  const canConfirm = deliveryMode === "retiro" || addrStreet.trim().length > 0;

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex flex-col gap-3">
        {cart.map((item) => {
          const box = BOX_SIZES.find((b) => b.id === item.boxSizeId);
          const flavorLines = Object.entries(item.flavors)
            .map(([fid, qty]) => `${qty} ${FLAVORS.find((x) => x.id === fid).name}`)
            .join(", ");
          const addonLines = Object.entries(item.addons)
            .map(([aid, qty]) => `${qty}x ${ADDONS.find((x) => x.id === aid).name}`)
            .join(", ");
          return (
            <div key={item.cartId} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-extrabold text-sm" style={{ color: COLORS.brown }}>Caja x{box.units} · {box.people} personas</div>
                  <div className="text-xs mt-1" style={{ color: COLORS.muted }}>{flavorLines}</div>
                  {addonLines && <div className="text-xs mt-1" style={{ color: COLORS.red }}>Extras: {addonLines}</div>}
                </div>
                <button onClick={() => onRemoveItem(item.cartId)} className="p-1">
                  <X size={16} color="#B79B7B" />
                </button>
              </div>
              <div className="text-right font-bold text-sm mt-2" style={{ color: COLORS.brown }}>{formatPrice(item.subtotal)}</div>
            </div>
          );
        })}
      </div>

      <h3 className="font-extrabold text-base mt-5 mb-2" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>¿Cómo lo recibís?</h3>
      <div className="flex gap-2">
        <button
          onClick={() => setDeliveryMode("delivery")}
          className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1"
          style={{ background: deliveryMode === "delivery" ? COLORS.red : "#fff", border: `2px solid ${deliveryMode === "delivery" ? COLORS.red : COLORS.line}` }}
        >
          <Truck size={20} color={deliveryMode === "delivery" ? "#fff" : COLORS.brown} />
          <span className="text-sm font-bold" style={{ color: deliveryMode === "delivery" ? "#fff" : COLORS.brown }}>Envío a domicilio</span>
        </button>
        <button
          onClick={() => setDeliveryMode("retiro")}
          className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1"
          style={{ background: deliveryMode === "retiro" ? COLORS.red : "#fff", border: `2px solid ${deliveryMode === "retiro" ? COLORS.red : COLORS.line}` }}
        >
          <MapPin size={20} color={deliveryMode === "retiro" ? "#fff" : COLORS.brown} />
          <span className="text-sm font-bold" style={{ color: deliveryMode === "retiro" ? "#fff" : COLORS.brown }}>Retiro en el local</span>
        </button>
      </div>

      {deliveryMode === "delivery" && (
        <div className="mt-3">
          <label className="text-xs font-bold" style={{ color: COLORS.brown }}>Dirección de entrega</label>
          <div className="flex gap-2 mt-1">
            <input
              value={addrStreet}
              onChange={(e) => setAddrStreet(e.target.value)}
              placeholder="Calle"
              maxLength={120}
              autoComplete="address-line1"
              className="flex-[3] min-w-0 rounded-xl px-3 py-2 text-sm"
              style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
            />
            <input
              value={addrNumber}
              onChange={(e) => setAddrNumber(e.target.value)}
              placeholder="Número"
              maxLength={20}
              inputMode="numeric"
              autoComplete="street-address"
              className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm"
              style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
            />
          </div>
          <input
            value={addrFloor}
            onChange={(e) => setAddrFloor(e.target.value)}
            placeholder="Piso / depto (opcional)"
            maxLength={40}
            className="w-full mt-2 rounded-xl px-3 py-2 text-sm"
            style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
          />
          <button
            onClick={onGetLocation}
            disabled={locating}
            className="w-full mt-2 rounded-xl py-2 text-sm font-extrabold flex items-center justify-center gap-2"
            style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.red}`, color: COLORS.red, opacity: locating ? 0.6 : 1 }}
          >
            <MapPin size={16} />
            {locating ? "Buscando tu ubicación..." : "Usar mi ubicación actual"}
          </button>
        </div>
      )}

      {deliveryMode === "delivery" && (
        <div className="mt-3">
          <label className="text-xs font-bold" style={{ color: COLORS.brown }}>Zona de entrega (estimado del envío)</label>
          <div className="flex gap-2 mt-1">
            {[
              { id: "cercana", label: "Zona cercana", price: DELIVERY_COSTS.cercana },
              { id: "alejada", label: "Zona alejada", price: DELIVERY_COSTS.alejada },
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setDeliveryZone(z.id)}
                className="flex-1 rounded-xl px-3 py-2 flex flex-col items-center gap-0.5"
                style={{ background: deliveryZone === z.id ? COLORS.red : "#fff", border: `2px solid ${deliveryZone === z.id ? COLORS.red : COLORS.line}` }}
              >
                <span className="text-xs font-bold" style={{ color: deliveryZone === z.id ? "#fff" : COLORS.brown }}>{z.label}</span>
                <span className="text-xs font-extrabold" style={{ color: deliveryZone === z.id ? "#FFE1C2" : COLORS.red }}>{formatPrice(z.price)}</span>
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: COLORS.muted }}>
            {deliveryZone === "alejada"
              ? "Zona alejada: el envío va de $3.000 a $3.500 según la distancia. Se estima en $3.500."
              : "Zona cercana: envío estimado en $2.000. El total lo confirma el repartidor."}
          </p>
        </div>
      )}

      <div className="mt-3">
        <label className="text-xs font-bold" style={{ color: COLORS.brown }}>Aclaraciones (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: la parte de atrás de la plaza, tocar timbre, sin picante, etc."
          rows={2}
          maxLength={300}
          className="w-full mt-1 rounded-xl px-3 py-2 text-sm"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
        />
      </div>

      {coupons.length > 0 && (
        <div className="mt-4">
          <h3 className="font-extrabold text-base mb-2" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
            Cupón de descuento
          </h3>
          <div className="flex flex-col gap-2">
            {coupons.map((c) => {
              const active = selectedCoupon?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCoupon(active ? null : c)}
                  className="rounded-2xl px-3 py-2.5 flex items-center justify-between"
                  style={{ background: active ? "#FFF1DC" : "#fff", border: `2px solid ${active ? COLORS.yellow : COLORS.line}` }}
                >
                  <span className="flex items-center gap-2">
                    <Ticket size={18} color={active ? COLORS.red : COLORS.muted} />
                    <span className="text-sm font-extrabold tracking-wider" style={{ color: COLORS.brown }}>{c.code}</span>
                    <BadgePercent size={16} color={COLORS.red} />
                    <span className="text-sm font-extrabold" style={{ color: COLORS.red }}>{c.value}%</span>
                  </span>
                  {active && <Check size={16} color={COLORS.green} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4 mt-5" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-between text-sm" style={{ color: COLORS.brown }}><span>Subtotal pizzetas</span><span>{formatPrice(cartTotal)}</span></div>
        <div className="flex justify-between text-sm mt-1" style={{ color: COLORS.brown }}>
          <span>Envío</span>
          <span>{deliveryMode === "retiro" ? "Sin cargo" : `${deliveryZone === "alejada" ? "Zona alejada" : "Zona cercana"} · ${formatPrice(deliveryCost)}`}</span>
        </div>
        {selectedCoupon && (
          <div className="flex justify-between text-sm mt-1" style={{ color: COLORS.red }}>
            <span>Cupón {selectedCoupon.code} ({selectedCoupon.value}% OFF)</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-lg mt-2 pt-2" style={{ color: COLORS.brown, borderTop: `1px dashed ${COLORS.line}` }}>
          <span>Total</span><span>{formatPrice(totalFinal)}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
          {deliveryMode === "delivery" ? "Entrega estimada: de 15 a 30 minutos." : "Listo para retirar en el local."}
        </div>
        <div className="text-xs mt-2" style={{ color: COLORS.red }}>
          Con este pedido sumás {coquitosForOrder} coquitos 🥥
        </div>
      </div>

      {!canConfirm && <div className="text-xs mt-2 text-center" style={{ color: COLORS.red }}>Ingresá tu dirección para poder confirmar el envío.</div>}

      <button
        onClick={onPlaceOrder}
        disabled={!canConfirm}
        className="w-full rounded-full py-3 mt-3 font-extrabold text-base active:scale-95 transition"
        style={{ background: COLORS.red, color: "#fff", opacity: canConfirm ? 1 : 0.4 }}
      >
        Confirmar pedido
      </button>
    </div>
  );
}

function ConfirmView({ summary, onBackHome }) {
  if (!summary) return null;
  return (
    <div className="px-6 pt-10 flex flex-col items-center text-center">
      <Mascot size={130} mood="happy" />
      <h2 className="font-extrabold text-2xl mt-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>¡Gracias por tu pedido!</h2>
      <p className="text-sm mt-2" style={{ color: COLORS.muted }}>Ya lo estamos preparando en el horno 🔥</p>

      <div className="w-full rounded-2xl p-4 mt-5 flex items-center gap-3 text-left" style={{ background: "#FFF1DC", border: `1px solid ${COLORS.yellow}` }}>
        <Clock size={24} color={COLORS.red} />
        <div>
          <div className="font-bold text-sm" style={{ color: COLORS.brown }}>
            {summary.mode === "delivery" ? "Llega en de 15 a 30 minutos" : `Listo para retirar en ${summary.etaMinutes} minutos`}
          </div>
          <div className="text-xs" style={{ color: COLORS.muted }}>
            {summary.mode === "delivery" ? "El envío estimado ya está incluido en tu total" : "Pasá por el local cuando quieras"}
          </div>
        </div>
      </div>

      <div className="w-full rounded-2xl p-4 mt-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
        <div className="flex justify-between text-sm" style={{ color: COLORS.brown }}><span>Subtotal pizzetas</span><span>{formatPrice(summary.total)}</span></div>
        {summary.deliveryCost > 0 && (
          <div className="flex justify-between text-sm mt-1" style={{ color: COLORS.brown }}>
            <span>Envío ({summary.zone === "alejada" ? "zona alejada" : "zona cercana"})</span>
            <span>{formatPrice(summary.deliveryCost)}</span>
          </div>
        )}
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm mt-1 font-bold" style={{ color: COLORS.red }}>
            <span>Cupón {summary.couponCode} ({summary.couponValue}% OFF)</span>
            <span>-{formatPrice(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold mt-2 pt-2" style={{ color: COLORS.brown, borderTop: `1px dashed ${COLORS.line}` }}>
          <span>Total</span>
          <span>{formatPrice(summary.total - summary.discount + (summary.deliveryCost || 0))}</span>
        </div>
        <div className="flex justify-between text-sm mt-2" style={{ color: COLORS.red }}><span>Coquitos sumados</span><span>+{summary.coquitosEarned} 🥥</span></div>
      </div>

      <p className="text-sm mt-4" style={{ color: COLORS.brown }}>¡Gracias por elegirnos, nos vemos en el próximo bajón! 🍕</p>

      <button onClick={onBackHome} className="mt-6 rounded-full px-8 py-3 font-extrabold" style={{ background: COLORS.red, color: "#fff" }}>
        Volver al inicio
      </button>
    </div>
  );
}

function AdminView({ orderLog, onBack }) {
  return (
    <div className="px-4 pt-4 pb-6">
      <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm font-bold" style={{ color: COLORS.red }}>
        <ArrowLeft size={16} /> Volver
      </button>
      <h2 className="font-extrabold text-xl mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
        Pedidos entrantes
      </h2>
      <div className="rounded-2xl p-3 mb-4 text-xs" style={{ background: "#FFF1DC", color: COLORS.muted }}>
        Pedidos en tiempo real desde el backend de Supabase: se ven acá los que llegan desde
        cualquier dispositivo (celular, Android o navegador).
      </div>

      {orderLog.length === 0 ? (
        <p className="text-sm text-center mt-8" style={{ color: COLORS.muted }}>Todavía no hay pedidos registrados acá.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orderLog.map((o) => (
            <div key={o.id} className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <div className="flex justify-between text-xs font-bold" style={{ color: COLORS.muted }}>
                <span>{new Date(o.date).toLocaleString("es-AR")}</span>
                <span>{o.mode === "delivery" ? "Envío" : "Retiro"}</span>
              </div>
              <div className="text-sm mt-1 font-bold" style={{ color: COLORS.brown }}>{o.summary}</div>
              {Array.isArray(o.details) && o.details.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {o.details.map((b, i) => (
                    <div key={i} className="rounded-lg px-2.5 py-2" style={{ background: COLORS.cream, border: `1px solid ${COLORS.line}` }}>
                      <div className="text-xs font-extrabold" style={{ color: COLORS.brown }}>
                        Caja {b.box} · {b.people} personas
                      </div>
                      <div className="text-xs mt-1" style={{ color: COLORS.brown }}>
                        {b.flavors.length > 0 ? b.flavors.map((f) => `${f.qty}x ${f.name}`).join(" · ") : "—"}
                      </div>
                      {Array.isArray(b.addons) && b.addons.length > 0 && (
                        <div className="text-xs mt-0.5" style={{ color: COLORS.red }}>
                          Extras: {b.addons.map((a) => `${a.qty}x ${a.name}`).join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {o.address && <div className="text-xs mt-1" style={{ color: COLORS.muted }}>📍 {o.address}</div>}
              {o.notes && <div className="text-xs mt-1" style={{ color: COLORS.muted }}>📝 {o.notes}</div>}
              {o.discount > 0 && (
                <div className="text-xs mt-1 font-bold" style={{ color: COLORS.red }}>
                  🎟️ {o.couponCode} · {o.couponValue}% OFF (ahorro {formatPrice(o.discount)})
                </div>
              )}
              <div className="flex justify-between mt-2 font-extrabold text-sm" style={{ color: COLORS.brown }}>
                <span>{formatPrice(o.deliveryCost > 0 ? o.total : o.total - o.discount)}</span>
                <span className="flex items-center gap-2">
                  {o.deliveryCost > 0 && (
                    <span className="text-[10px] font-bold" style={{ color: COLORS.muted }}>
                      🛵 {o.zone === "alejada" ? "zona alejada" : "zona cercana"} · {formatPrice(o.deliveryCost)}
                    </span>
                  )}
                  <span>~{o.etaMinutes} min</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkerActiveCard({ w }) {
  const digits = (w.phone || "").replace(/\D/g, "");
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
      {w.photo ? (
        <img
          src={w.photo}
          alt={`Foto de ${w.name || w.username || "repartidor"}`}
          className="w-14 h-14 rounded-full flex-shrink-0"
          style={{ objectFit: "cover", border: `2px solid ${COLORS.green}` }}
        />
      ) : (
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: COLORS.line }}>
          <User size={24} color={COLORS.muted} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-sm truncate" style={{ color: COLORS.brown }}>
          {w.name || w.username || "Repartidor"}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold mt-0.5">
          <span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: COLORS.green }} />
          <span style={{ color: COLORS.green }}>activo</span>
        </div>
      </div>
      {digits && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Escribir por WhatsApp"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#25D366" }}
        >
          <MessageCircle size={16} color="#fff" />
        </a>
      )}
      {digits && (
        <a
          href={`tel:${digits}`}
          aria-label="Llamar"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: COLORS.cream, border: `1px solid ${COLORS.line}` }}
        >
          <Phone size={16} color={COLORS.brown} />
        </a>
      )}
    </div>
  );
}

function AuthField({ icon: Icon, label, value, onChange, placeholder, type = "text", maxLength = 60 }) {
  return (
    <div>
      <label className="text-xs font-bold" style={{ color: COLORS.brown }}>{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={16} color={COLORS.muted} />
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          className="w-full rounded-xl pl-9 pr-3 py-2 text-sm"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
        />
      </div>
    </div>
  );
}

function DeliveryView({ worker, activeWorkers, onLogin, onRegister, onLogout, onChangePhoto, onToggleActive, onSendDelayNotice, onBack }) {
  const [mode, setMode] = useState("client");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [reg, setReg] = useState({ name: "", phone: "", username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [delayMsg, setDelayMsg] = useState("");
  const fileRef = useRef(null);

  const doLogin = async () => {
    if (!loginPhone.trim() || !loginPass) {
      setError("Completá teléfono y contraseña");
      return;
    }
    setBusy(true);
    setError("");
    const res = await onLogin(loginPhone.trim(), loginPass);
    setBusy(false);
    if (res.error) {
      setError(res.error === "invalid" ? "Teléfono o contraseña incorrectos" : res.error);
    } else {
      setMode("client");
      setLoginPhone("");
      setLoginPass("");
    }
  };

  const doRegister = async () => {
    if (!reg.name.trim() || !reg.phone.trim() || !reg.password) {
      setError("Nombre, teléfono y contraseña son obligatorios");
      return;
    }
    if (reg.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    setBusy(true);
    setError("");
    const res = await onRegister(reg);
    setBusy(false);
    if (res.error) {
      setError(res.error === "phone_taken" ? "Ese teléfono ya está registrado. Probá ingresar." : res.error);
    } else {
      setMode("client");
      setReg({ name: "", phone: "", username: "", password: "" });
    }
  };

  const backBtn = (
    <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm font-bold" style={{ color: COLORS.red }}>
      <ArrowLeft size={16} /> Volver
    </button>
  );

  if (worker) {
    return (
      <div className="px-4 pt-4 pb-6">
        {backBtn}
        <h2 className="font-extrabold text-xl mb-4" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
          Modo repartidor
        </h2>

        <div className="flex flex-col items-center mb-5">
          <div className="relative cursor-pointer" onClick={() => fileRef.current && fileRef.current.click()}>
            {worker.photo ? (
              <img
                src={worker.photo}
                alt="Foto de perfil del repartidor"
                className="w-24 h-24 rounded-full"
                style={{ border: `3px solid ${COLORS.red}`, objectFit: "cover" }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: COLORS.line, border: `3px solid ${COLORS.red}` }}
              >
                <Camera size={28} color={COLORS.muted} />
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ background: COLORS.red, color: "#fff" }}
            >
              Cambiar
            </span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onChangePhoto(e.target.files?.[0])} style={{ display: "none" }} />
          <span className="text-xs mt-1" style={{ color: COLORS.muted }}>Tu foto la ven los clientes cuando estás activo</span>
        </div>

        <div className="rounded-2xl p-3 flex flex-col gap-2.5" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
          <div className="flex items-center gap-3">
            <User size={18} color={COLORS.red} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>Nombre</div>
              <div className="text-sm font-extrabold" style={{ color: COLORS.brown }}>{worker.name || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} color={COLORS.red} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>Teléfono</div>
              <div className="text-sm font-extrabold" style={{ color: COLORS.brown }}>{worker.phone || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck size={18} color={COLORS.red} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.muted }}>Usuario</div>
              <div className="text-sm font-extrabold" style={{ color: COLORS.brown }}>{worker.username || worker.name || "—"}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleActive}
          className="w-full mt-4 rounded-2xl p-3 flex items-center justify-between"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}
        >
          <span className="text-sm font-bold" style={{ color: COLORS.brown }}>Tu estado</span>
          <span className="flex items-center gap-2">
            <span className="rounded-full" style={{ width: 10, height: 10, background: worker.active ? COLORS.green : "#B79B7B" }} />
            <span className="text-sm font-extrabold" style={{ color: worker.active ? COLORS.green : "#B79B7B" }}>
              {worker.active ? "Activo 🟢" : "Inactivo"}
            </span>
          </span>
        </button>
        <p className="text-xs mt-1.5" style={{ color: COLORS.muted }}>
          Si estás activo, aparecés en el listado de repartidores que ven los clientes.
        </p>

        <h3 className="font-extrabold text-base mt-6 mb-2" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
          Avisar demora a un cliente
        </h3>
        <textarea
          value={delayMsg}
          onChange={(e) => setDelayMsg(e.target.value)}
          placeholder="Ej: vamos a llegar 10 minutos más tarde por tránsito"
          rows={2}
          maxLength={200}
          className="w-full rounded-xl px-3 py-2 text-sm"
          style={{ background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.brown }}
        />
        <button
          onClick={() => {
            if (delayMsg.trim().length === 0) return;
            onSendDelayNotice(delayMsg);
            setDelayMsg("");
          }}
          className="w-full mt-2 rounded-full py-2.5 font-extrabold text-sm flex items-center justify-center gap-2"
          style={{ background: COLORS.red, color: "#fff" }}
        >
          <MessageCircle size={16} /> Enviar aviso
        </button>

        <button
          onClick={onLogout}
          className="w-full mt-5 rounded-2xl py-2.5 font-extrabold text-sm flex items-center justify-center gap-2"
          style={{ background: COLORS.cream, border: `1.5px solid ${COLORS.red}`, color: COLORS.red }}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {backBtn}
      <h2 className="font-extrabold text-xl mb-1" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>
        Repartidores
      </h2>

      {mode === "client" && (
        <>
          <div className="rounded-2xl p-3 mb-4 text-xs" style={{ background: "#FFF1DC", color: COLORS.muted }}>
            Acá ves quién está repartiendo ahora mismo. Tocá el botón verde para escribirle por WhatsApp o llamarlo.
          </div>

          {activeWorkers.length === 0 ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <Mascot size={80} mood="sad" />
              <p className="text-sm font-bold mt-2" style={{ color: COLORS.brown }}>Ahora no hay repartidores activos</p>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                Tu pedido igual se puede hacer: el local coordina la entrega. ¡Revisá de nuevo en unos minutos!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeWorkers.map((w) => (
                <WorkerActiveCard key={w.id} w={w} />
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: "#fff", border: `1px dashed ${COLORS.line}` }}>
            <p className="text-xs font-bold" style={{ color: COLORS.muted }}>¿Trabajás en delivery y querés repartir para Ke Bajón?</p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setMode("login")}
                className="flex-1 rounded-full py-2 text-xs font-extrabold"
                style={{ background: COLORS.red, color: "#fff" }}
              >
                Ingresar
              </button>
              <button
                onClick={() => setMode("register")}
                className="flex-1 rounded-full py-2 text-xs font-extrabold"
                style={{ background: COLORS.yellow, color: COLORS.brown }}
              >
                Registrarme
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "login" && (
        <div className="mt-2">
          <button onClick={() => setMode("client")} className="flex items-center gap-1 mb-3 text-sm font-bold" style={{ color: COLORS.red }}>
            <ArrowLeft size={16} /> Repartidores
          </button>
          <h3 className="font-extrabold text-lg mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Ingresar</h3>
          <div className="flex flex-col gap-3">
            <AuthField icon={Phone} label="Teléfono" value={loginPhone} onChange={setLoginPhone} placeholder="Ej: 5491123456789" />
            <AuthField icon={Lock} label="Contraseña" value={loginPass} onChange={setLoginPass} placeholder="Tu contraseña" type="password" />
          </div>
          {error && <p className="text-xs font-bold mt-3" style={{ color: COLORS.red }}>{error}</p>}
          <button
            onClick={doLogin}
            disabled={busy}
            className="w-full mt-4 rounded-full py-3 font-extrabold text-sm active:scale-95 transition"
            style={{ background: COLORS.red, color: "#fff", opacity: busy ? 0.5 : 1 }}
          >
            {busy ? "Ingresando..." : "Ingresar"}
          </button>
          <button onClick={() => { setError(""); setMode("register"); }} className="w-full mt-2 text-center text-xs font-bold underline" style={{ color: COLORS.muted }}>
            ¿Todavía no tenés cuenta? Registrate
          </button>
        </div>
      )}

      {mode === "register" && (
        <div className="mt-2">
          <button onClick={() => setMode("client")} className="flex items-center gap-1 mb-3 text-sm font-bold" style={{ color: COLORS.red }}>
            <ArrowLeft size={16} /> Repartidores
          </button>
          <h3 className="font-extrabold text-lg mb-3" style={{ color: COLORS.brown, fontFamily: "'Baloo 2', sans-serif" }}>Registrarme como repartidor</h3>
          <div className="flex flex-col gap-3">
            <AuthField icon={User} label="Nombre" value={reg.name} onChange={(v) => setReg((p) => ({ ...p, name: v }))} placeholder="Ej: Facu" />
            <AuthField icon={Phone} label="Teléfono (con código de país)" value={reg.phone} onChange={(v) => setReg((p) => ({ ...p, phone: v }))} placeholder="Ej: 5491123456789" />
            <AuthField icon={Truck} label="Usuario (opcional)" value={reg.username} onChange={(v) => setReg((p) => ({ ...p, username: v }))} placeholder="Ej: facu_delivery" />
            <AuthField icon={Lock} label="Contraseña" value={reg.password} onChange={(v) => setReg((p) => ({ ...p, password: v }))} placeholder="Mínimo 4 caracteres" type="password" />
          </div>
          {error && <p className="text-xs font-bold mt-3" style={{ color: COLORS.red }}>{error}</p>}
          <button
            onClick={doRegister}
            disabled={busy}
            className="w-full mt-4 rounded-full py-3 font-extrabold text-sm active:scale-95 transition"
            style={{ background: COLORS.red, color: "#fff", opacity: busy ? 0.5 : 1 }}
          >
            {busy ? "Creando cuenta..." : "Crear cuenta"}
          </button>
          <p className="text-xs mt-3 text-center" style={{ color: COLORS.muted }}>
            Después de registrarte vas a poder subir tu foto y ponerte "activo".
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Persistencia local (localStorage del navegador)                    */
/* ------------------------------------------------------------------ */

const PROFILE_KEY = "kebajon-perfil";
const ORDERS_KEY = "kebajon-pedidos";
const DELIVERY_KEY = "kebajon-repartidor";

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const coquitos = Number.isFinite(parsed.coquitos) ? Math.max(0, parsed.coquitos) : 0;
      const redeemed = Array.isArray(parsed.redeemed)
        ? parsed.redeemed.filter((r) => r && typeof r.name === "string").slice(0, 10)
        : [];
      return { coquitos, redeemed };
    }
  } catch (e) {
    /* localStorage no disponible o dato corrupto: seguimos con el default */
  }
  return { coquitos: 0, redeemed: [] };
}

function loadOrderLog() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 50);
    }
  } catch (e) {
    /* sin pedidos guardados todavía */
  }
  return [];
}

function loadDeliveryAuth() {
  try {
    const raw = localStorage.getItem(DELIVERY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        return {
          id: parsed.id,
          name: typeof parsed.name === "string" ? parsed.name : "",
          username: typeof parsed.username === "string" ? parsed.username : "",
          phone: typeof parsed.phone === "string" ? parsed.phone : "",
          photo: typeof parsed.photo === "string" ? parsed.photo : null,
          active: Boolean(parsed.active),
        };
      }
    }
  } catch (e) {
    /* sin sesión de repartidor guardada todavía */
  }
  return null;
}

function isNewerVersion(latest, current) {
  const toNum = (v) => String(v).split(".").map((n) => parseInt(n, 10) || 0);
  const a = toNum(latest);
  const b = toNum(current);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* App raíz                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [tab, setTab] = useState("home");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminPinError, setAdminPinError] = useState("");
  const [boxSize, setBoxSize] = useState("x6");
  const [boxFlavors, setBoxFlavors] = useState({});
  const [boxAddons, setBoxAddons] = useState({});
  const [cart, setCart] = useState([]);
  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [deliveryZone, setDeliveryZone] = useState("cercana");
  const [locating, setLocating] = useState(false);
  const [addrStreet, setAddrStreet] = useState("");
  const [addrNumber, setAddrNumber] = useState("");
  const [addrFloor, setAddrFloor] = useState("");
  const address = [addrStreet, addrNumber].filter(Boolean).join(" ") + (addrFloor ? `, ${addrFloor}` : "");
  const [notes, setNotes] = useState("");
  const [profile, setProfile] = useState(loadProfile);
  const [orderLog, setOrderLog] = useState(loadOrderLog);
  const [deliveryAuth, setDeliveryAuth] = useState(loadDeliveryAuth);
  const [activeWorkers, setActiveWorkers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [installEvent, setInstallEvent] = useState(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const toastTimer = useRef(null);
  const deviceId = getDeviceId();

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator?.standalone === true);
  const isIOS = typeof window !== "undefined" && /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      /* no se pudo guardar, no rompe la app */
    }
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const server = await fetchServerProfile(deviceId);
      if (cancelled) return;
      if (server) {
        setProfile((prev) => ({
          coquitos: Math.max(prev.coquitos, server.coquitos || 0),
          redeemed:
            server.redeemed > (prev.redeemed.length || 0)
              ? Array.from({ length: server.redeemed }, (_, i) => ({
                  name: "canje",
                  date: new Date().toISOString(),
                  id: i,
                }))
              : prev.redeemed,
        }));
      } else {
        upsertServerProfile({ id: deviceId, coquitos: 0, redeemed: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orderLog));
    } catch (e) {
      /* no se pudo guardar */
    }
  }, [orderLog]);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveryAuth));
    } catch (e) {
      /* no se pudo guardar */
    }
  }, [deliveryAuth]);

  useEffect(() => {
    if (tab !== "admin") return undefined;
    (async () => {
      const serverOrders = await fetchServerOrders();
      setOrderLog(
        serverOrders.map((o) => ({
          id: o.id,
          date: o.created_at || new Date().toISOString(),
          summary: o.summary || "",
          mode: o.mode || "retiro",
          address: o.address || "",
          notes: o.notes || "",
          total: o.total || 0,
          etaMinutes: o.eta_minutes || 30,
          couponCode: o.coupon_code || null,
          couponValue: o.coupon_value || null,
          discount: o.discount || 0,
          deliveryCost: o.delivery_cost || 0,
          zone: o.zone || null,
          details: o.details || [],
        }))
      );
    })();
    const channel = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new;
        if (!o) return;
        setOrderLog((prev) =>
          [
            {
              id: o.id,
              date: o.created_at || new Date().toISOString(),
              summary: o.summary || "",
              mode: o.mode || "retiro",
              address: o.address || "",
              notes: o.notes || "",
              total: o.total || 0,
              etaMinutes: o.eta_minutes || 30,
              couponCode: o.coupon_code || null,
              couponValue: o.coupon_value || null,
              discount: o.discount || 0,
              deliveryCost: o.delivery_cost || 0,
              zone: o.zone || null,
              details: o.details || [],
            },
            ...prev,
          ].slice(0, 100)
        );
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab, deviceId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchCoupons(deviceId);
      if (!cancelled) setCoupons(list.filter((c) => !c.used));
    })();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  useEffect(() => {
    if (tab !== "delivery") return undefined;
    (async () => {
      const list = await fetchDeliveryWorkers();
      setActiveWorkers(list);
    })();
    const channel = supabase
      .channel("delivery-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery" }, () => {
        fetchDeliveryWorkers().then(setActiveWorkers);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.tag_name) return;
        const latest = data.tag_name.replace(/^v/, "");
        if (isNewerVersion(latest, APP_VERSION)) {
          setUpdateAvailable({ version: latest, url: DOWNLOAD_URL });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const handleInstallClick = () => {
    if (isIOS && !isStandalone) {
      setShowIosModal(true);
      return;
    }
    window.open(DOWNLOAD_URL, "_blank", "noopener");
  };

  const showInstallBanner = !isStandalone && !bannerDismissed && (installEvent || isIOS);

  const currentBox = BOX_SIZES.find((b) => b.id === boxSize);
  const usedUnits = Object.values(boxFlavors).reduce((a, b) => a + b, 0);
  const remaining = currentBox.units - usedUnits;
  const addonsTotal = Object.entries(boxAddons).reduce((sum, [id, qty]) => {
    const a = ADDONS.find((x) => x.id === id);
    return sum + (a ? a.price * qty : 0);
  }, 0);
  const boxSubtotal = currentBox.price + addonsTotal;

  const handleSelectBoxSize = (id) => {
    if (id !== boxSize) {
      setBoxSize(id);
      setBoxFlavors({});
      setBoxAddons({});
    }
  };

  const incFlavor = (id) => {
    if (remaining <= 0) return;
    setBoxFlavors((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  const decFlavor = (id) => {
    setBoxFlavors((prev) => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };
  const incAddon = (id) => {
    setBoxAddons((prev) => {
      const cur = prev[id] || 0;
      if (cur >= 5) return prev;
      return { ...prev, [id]: cur + 1 };
    });
  };
  const decAddon = (id) => {
    setBoxAddons((prev) => {
      const cur = prev[id] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };

  const addBoxToCart = () => {
    if (usedUnits !== currentBox.units) {
      showToast(`Elegí ${remaining} pizzeta${remaining === 1 ? "" : "s"} más para completar la caja`);
      return;
    }
    const item = {
      cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      boxSizeId: boxSize,
      flavors: { ...boxFlavors },
      addons: { ...boxAddons },
      subtotal: boxSubtotal,
      coquitos: currentBox.coquitos,
    };
    setCart((prev) => [...prev, item]);
    setBoxFlavors({});
    setBoxAddons({});
    showToast("¡Caja agregada a tu pedido! 🍕");
  };

  const removeCartItem = (cartId) => setCart((prev) => prev.filter((it) => it.cartId !== cartId));

  const cartTotal = cart.reduce((s, it) => s + it.subtotal, 0);
  const coquitosForOrder = cart.reduce((s, it) => s + it.coquitos, 0);
  const deliveryCost = deliveryMode === "delivery" ? DELIVERY_COSTS[deliveryZone] : 0;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Tu navegador no soporta ubicación");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordsLabel = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=es`
          );
          const data = res.ok ? await res.json() : null;
          const addr = data && data.address ? data.address : {};
          const street =
            addr.road ||
            addr.pedestrian ||
            addr.footway ||
            addr.suburb ||
            addr.neighbourhood ||
            (data && data.display_name ? data.display_name.split(", ")[0] : "");
          setAddrStreet(street || `Mi ubicación ${coordsLabel}`);
          setAddrNumber(addr.house_number || "");
          setAddrFloor("");
        } catch (e) {
          setAddrStreet(`Mi ubicación ${coordsLabel}`);
          setAddrNumber("");
          setAddrFloor("");
        }
        setLocating(false);
        showToast("Ubicación cargada 📍");
      },
      () => {
        setLocating(false);
        showToast("No se pudo obtener tu ubicación");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    if (deliveryMode === "delivery" && address.trim().length === 0) {
      showToast("Ingresá tu dirección para el envío");
      return;
    }
    const etaMinutes = deliveryMode === "delivery" ? 30 : 15 + Math.floor(Math.random() * 11);
    const summaryText = cart
      .map((it) => `Caja x${BOX_SIZES.find((b) => b.id === it.boxSizeId).units}`)
      .join(" + ");
    const details = cart.map((it) => {
      const box = BOX_SIZES.find((b) => b.id === it.boxSizeId);
      return {
        box: `x${box.units}`,
        people: box.people,
        flavors: Object.entries(it.flavors)
          .filter(([, qty]) => qty > 0)
          .map(([fid, qty]) => ({ name: FLAVORS.find((x) => x.id === fid)?.name || fid, qty })),
        addons: Object.entries(it.addons)
          .filter(([, qty]) => qty > 0)
          .map(([aid, qty]) => ({ name: ADDONS.find((x) => x.id === aid)?.name || aid, qty })),
      };
    });
    const discount = selectedCoupon ? Math.round((cartTotal * selectedCoupon.value) / 100) : 0;
    const finalTotal = cartTotal - discount + deliveryCost;

    setProfile((prev) => {
      const next = { ...prev, coquitos: prev.coquitos + coquitosForOrder };
      upsertServerProfile({ id: deviceId, coquitos: next.coquitos, redeemed: next.redeemed.length });
      return next;
    });
    insertServerOrder({
      profile_id: deviceId,
      summary: summaryText,
      mode: deliveryMode,
      address: deliveryMode === "delivery" ? address : "",
      notes: notes || "",
      total: finalTotal,
      coquitos: coquitosForOrder,
      eta_minutes: etaMinutes,
      coupon_code: selectedCoupon ? selectedCoupon.code : null,
      coupon_value: selectedCoupon ? selectedCoupon.value : null,
      discount,
      delivery_cost: deliveryCost,
      zone: deliveryMode === "delivery" ? deliveryZone : null,
      details,
    });
    if (selectedCoupon) {
      markCouponUsed(selectedCoupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== selectedCoupon.id));
    }
    setOrderLog((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: new Date().toISOString(),
          summary: summaryText,
          mode: deliveryMode,
          address: deliveryMode === "delivery" ? address : "",
          total: finalTotal,
          etaMinutes,
          couponCode: selectedCoupon ? selectedCoupon.code : null,
          couponValue: selectedCoupon ? selectedCoupon.value : null,
          discount,
          deliveryCost,
          zone: deliveryMode === "delivery" ? deliveryZone : null,
          details,
        },
        ...prev,
      ].slice(0, 50)
    );
    setLastOrder({
      total: cartTotal,
      coquitosEarned: coquitosForOrder,
      mode: deliveryMode,
      etaMinutes,
      discount,
      couponCode: selectedCoupon ? selectedCoupon.code : null,
      couponValue: selectedCoupon ? selectedCoupon.value : null,
      deliveryCost,
      zone: deliveryMode === "delivery" ? deliveryZone : null,
      details,
    });
    setSelectedCoupon(null);
    setCart([]);
    setAddrStreet("");
    setAddrNumber("");
    setAddrFloor("");
    setNotes("");
    setDeliveryZone("cercana");
    setTab("confirm");
  };

  const redeemReward = (rewardId) => {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward || profile.coquitos < reward.cost) return;
    const code = reward.value
      ? `KBJ-${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`
      : null;
    const next = {
      coquitos: profile.coquitos - reward.cost,
      redeemed: [
        { name: reward.name, date: new Date().toISOString(), code, value: reward.value || 0 },
        ...profile.redeemed,
      ].slice(0, 10),
    };
    setProfile(next);
    if (reward.value && code) {
      insertCoupon({ profile_id: deviceId, code, value: reward.value });
      setCoupons((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, profile_id: deviceId, code, value: reward.value, used: false },
      ]);
    }
    insertServerRedemption({ profile_id: deviceId, reward_name: reward.name, reward_cost: reward.cost });
    upsertServerProfile({ id: deviceId, coquitos: next.coquitos, redeemed: next.redeemed.length });
    showToast(`¡Canjeaste ${reward.name}! 🎉`);
  };

  const handleWorkerPhoto = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setDeliveryAuth((prev) => {
        if (!prev) return prev;
        const next = { ...prev, photo: dataUrl };
        upsertServerDelivery({
          id: next.id,
          name: next.name,
          username: next.username,
          phone: next.phone,
          photo: next.photo,
          active: next.active,
        });
        return next;
      });
      showToast("Foto actualizada ✅");
    } catch (e) {
      showToast("No se pudo cargar la foto");
    }
  };

  const handleToggleActive = () => {
    setDeliveryAuth((prev) => {
      if (!prev) return prev;
      const next = { ...prev, active: !prev.active };
      upsertServerDelivery({
        id: next.id,
        name: next.name,
        username: next.username,
        phone: next.phone,
        photo: next.photo,
        active: next.active,
      });
      return next;
    });
  };

  const handleLogin = async (phone, password) => {
    const res = await loginDeliveryWorker(phone, password);
    if (res.data) setDeliveryAuth(res.data);
    return res;
  };

  const handleRegister = async (reg) => {
    const existing = await fetchDeliveryByPhone(reg.phone.trim());
    if (existing) return { error: "phone_taken" };
    const res = await registerDeliveryWorker({
      name: reg.name.trim(),
      username: reg.username.trim() || reg.name.trim(),
      phone: reg.phone.trim(),
      password: reg.password,
      photo: null,
    });
    if (res.data) setDeliveryAuth(res.data);
    return res;
  };

  const handleLogout = () => {
    if (deliveryAuth) {
      upsertServerDelivery({
        id: deliveryAuth.id,
        name: deliveryAuth.name,
        username: deliveryAuth.username,
        phone: deliveryAuth.phone,
        photo: deliveryAuth.photo,
        active: false,
      });
    }
    setDeliveryAuth(null);
    showToast("Sesión cerrada");
  };

  const sendDelayNotice = (msg) => {
    insertServerNotice(msg);
    showToast("Aviso enviado ✅");
  };

  useEffect(() => {
    if (deliveryAuth) {
      upsertServerDelivery({
        id: deliveryAuth.id,
        name: deliveryAuth.name,
        username: deliveryAuth.username,
        phone: deliveryAuth.phone,
        photo: deliveryAuth.photo,
        active: deliveryAuth.active,
      });
    }
  }, [deliveryAuth]);

  const popularFlavors = FLAVORS.filter((f) => f.popular);
  const showBottomNav = tab !== "admin";

  const openAdmin = () => {
    if (adminUnlocked) {
      setTab("admin");
      return;
    }
    setAdminPinError("");
    setShowAdminPin(true);
  };

  const handleAdminPinSubmit = (value) => {
    if (value === ADMIN_PIN) {
      setAdminUnlocked(true);
      setShowAdminPin(false);
      setAdminPinError("");
      setTab("admin");
    } else {
      setAdminPinError("PIN incorrecto, probá de nuevo");
    }
  };
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "linear-gradient(180deg, #8C1626 0%, #2C1810 100%)" }}>
      <div className="w-full flex flex-col relative" style={{ maxWidth: "430px", minHeight: "100vh", background: COLORS.cream, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
        <Header coquitos={profile.coquitos} onPointsClick={() => setTab("rewards")} onInstallClick={handleInstallClick} />
        {showInstallBanner && (
          <InstallBanner onInstallClick={handleInstallClick} onDismiss={() => setBannerDismissed(true)} />
        )}
        {updateAvailable && (
          <div className="px-4 py-2 flex items-center justify-between gap-2" style={{ background: COLORS.green }}>
            <button onClick={() => window.open(updateAvailable.url, "_blank")} className="flex items-center gap-2 flex-1 text-left">
              <Download size={16} color="#fff" />
              <span className="text-xs font-extrabold" style={{ color: "#fff" }}>
                ¡Nueva versión {updateAvailable.version} disponible! Tocá para actualizar
              </span>
            </button>
            <button onClick={() => setUpdateAvailable(null)} className="p-1 flex-shrink-0" aria-label="Cerrar aviso de actualización">
              <X size={14} color="#fff" />
            </button>
          </div>
        )}
        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} />}
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: showBottomNav ? "6.5rem" : "1rem" }}>
          {tab === "home" && (
            <HomeView
              onGoMenu={() => setTab("menu")}
              onGoRewards={() => setTab("rewards")}
              onGoAdmin={openAdmin}
              popularFlavors={popularFlavors}
            />
          )}
          {tab === "menu" && (
            <MenuView
              boxSize={boxSize}
              onSelectBoxSize={handleSelectBoxSize}
              boxFlavors={boxFlavors}
              usedUnits={usedUnits}
              remaining={remaining}
              capacity={currentBox.units}
              currentBox={currentBox}
              onIncFlavor={incFlavor}
              onDecFlavor={decFlavor}
              boxAddons={boxAddons}
              onIncAddon={incAddon}
              onDecAddon={decAddon}
              boxSubtotal={boxSubtotal}
              onAddBoxToCart={addBoxToCart}
            />
          )}
          {tab === "rewards" && <RewardsView profile={profile} onRedeem={redeemReward} />}
          {tab === "cart" && (
            <CartView
              cart={cart}
              onRemoveItem={removeCartItem}
              deliveryMode={deliveryMode}
              setDeliveryMode={setDeliveryMode}
              addrStreet={addrStreet}
              setAddrStreet={setAddrStreet}
              addrNumber={addrNumber}
              setAddrNumber={setAddrNumber}
              addrFloor={addrFloor}
              setAddrFloor={setAddrFloor}
              notes={notes}
              setNotes={setNotes}
              cartTotal={cartTotal}
              coquitosForOrder={coquitosForOrder}
              coupons={coupons}
              selectedCoupon={selectedCoupon}
              onSelectCoupon={setSelectedCoupon}
              discount={selectedCoupon ? Math.round((cartTotal * selectedCoupon.value) / 100) : 0}
              deliveryZone={deliveryZone}
              setDeliveryZone={setDeliveryZone}
              deliveryCost={deliveryCost}
              totalFinal={cartTotal - (selectedCoupon ? Math.round((cartTotal * selectedCoupon.value) / 100) : 0) + deliveryCost}
              locating={locating}
              onGetLocation={handleGetLocation}
              onPlaceOrder={placeOrder}
              onGoMenu={() => setTab("menu")}
            />
          )}
          {tab === "confirm" && <ConfirmView summary={lastOrder} onBackHome={() => setTab("home")} />}
          {tab === "admin" && adminUnlocked && <AdminView orderLog={orderLog} onBack={() => setTab("home")} />}
          {showAdminPin && (
            <PinModal
              title="Panel del dueño"
              error={adminPinError}
              onClose={() => setShowAdminPin(false)}
              onSubmit={handleAdminPinSubmit}
            />
          )}
          {tab === "delivery" && (
            <DeliveryView
              worker={deliveryAuth}
              activeWorkers={activeWorkers}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
              onChangePhoto={handleWorkerPhoto}
              onToggleActive={handleToggleActive}
              onSendDelayNotice={sendDelayNotice}
              onBack={() => setTab("home")}
            />
          )}
        </main>
        {showBottomNav && <BottomNav tab={tab === "confirm" ? "cart" : tab} setTab={setTab} cartCount={cart.length} />}
        <Toast message={toast} />
      </div>
    </div>
  );
}
