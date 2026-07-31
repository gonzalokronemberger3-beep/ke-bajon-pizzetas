import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ijamysuzjckplqbsvscv.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqYW15c3V6amNrcGxxYnN2c2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTA0NDcsImV4cCI6MjEwMTA4NjQ0N30.1KWrJzhR77Cjug1UYwXeFiQvekgE21slC5fjMDOZvvg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const DEVICE_KEY = "kebajon-device-id";

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return "device-" + Date.now();
  }
}

export async function fetchServerProfile(deviceId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, coquitos, redeemed")
    .eq("id", deviceId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function upsertServerProfile(profile) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: profile.id, coquitos: profile.coquitos, redeemed: profile.redeemed },
      { onConflict: "id" }
    );
  if (error) console.warn("supabase upsert profile:", error.message);
}

export async function insertServerOrder(order) {
  const { data, error } = await supabase.from("orders").insert([order]).select("id");
  if (error) {
    console.warn("supabase insert order:", error.message);
    return null;
  }
  return data?.[0]?.id ?? null;
}

export async function fetchServerOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return data;
}

export async function insertServerRedemption(redemption) {
  const { error } = await supabase.from("redemptions").insert([redemption]);
  if (error) console.warn("supabase insert redemption:", error.message);
}

export async function fetchServerDelivery(deviceId) {
  const { data, error } = await supabase
    .from("delivery")
    .select("id, username, photo, active")
    .eq("id", deviceId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function upsertServerDelivery(delivery) {
  const { error } = await supabase.from("delivery").upsert(delivery, { onConflict: "id" });
  if (error) console.warn("supabase upsert delivery:", error.message);
}

export async function insertServerNotice(message) {
  const { error } = await supabase.from("delivery_notices").insert([{ message }]);
  if (error) console.warn("supabase insert notice:", error.message);
}

/* ----------------------- Repartidores ----------------------- */

export async function fetchDeliveryWorkers() {
  const { data, error } = await supabase
    .from("delivery")
    .select("id, name, username, photo, active, phone")
    .eq("active", true)
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn("supabase fetch delivery workers:", error.message);
    return [];
  }
  return data;
}

export async function fetchDeliveryByPhone(phone) {
  const { data, error } = await supabase
    .from("delivery")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function registerDeliveryWorker(worker) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data, error } = await supabase
    .from("delivery")
    .insert([{ id, active: false, updated_at: new Date().toISOString(), ...worker }])
    .select("id, name, username, photo, active, phone")
    .single();
  if (error) return { error: error.message };
  return { data };
}

export async function loginDeliveryWorker(phone, password) {
  const { data, error } = await supabase
    .from("delivery")
    .select("id, name, username, photo, active, phone")
    .eq("phone", phone)
    .eq("password", password)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "invalid" };
  return { data };
}

/* ----------------------- Cupones de descuento ----------------------- */

export async function insertCoupon(coupon) {
  const { error } = await supabase.from("coupons").insert([coupon]);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function fetchCoupons(profileId) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.warn("supabase fetch coupons:", error.message);
    return [];
  }
  return data;
}

export async function markCouponUsed(couponId) {
  const { error } = await supabase
    .from("coupons")
    .update({ used: true })
    .eq("id", couponId);
  if (error) console.warn("supabase mark coupon used:", error.message);
}
