"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { doc, getDoc, onSnapshot, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getDailyLimitForTier, getMultiplierForTier, getSettings } from "@/lib/settings";
import type { UserDoc } from "@/types";

const tabs = ["Home", "Referral", "Shop", "Withdraw", "Profile"] as const;
type Tab = typeof tabs[number];

export default function UserDashboardPage() {
  const { uid, userDoc, refreshUser } = useAuth();
  const [active, setActive] = useState<Tab>("Home");
  const [settings, setSettings] = useState<any>(null);
  const [user, setUser] = useState<UserDoc | null>(userDoc);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!uid) return;
    const db = getDb();
    const ref = doc(db, "users", uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setUser(snap.data() as UserDoc);
    });
  }, [uid]);

  const multiplier = useMemo(() => (user && settings ? getMultiplierForTier(user.vipTier, settings) : 1), [user, settings]);
  const dailyLimit = useMemo(() => (user && settings ? getDailyLimitForTier(user.vipTier, settings) : 0), [user, settings]);

  async function handleTap() {
    if (!uid || !settings) return;
    const db = getDb();
    const userRef = doc(db, "users", uid);
    try {
      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        const today = new Date().toISOString().slice(0, 10);
        let data: UserDoc;
        if (!snap.exists()) {
          data = {
            userId: uid,
            name: "User",
            balance: 0,
            totalTaps: 0,
            dailyTapCount: 0,
            dailyTapDate: today,
            vipTier: "Free",
            referralCount: 0,
            referralEarnings: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          } as any;
          tx.set(userRef, data);
        } else {
          data = snap.data() as UserDoc;
        }

        if (data.dailyTapDate !== today) {
          data.dailyTapDate = today;
          data.dailyTapCount = 0;
        }

        const limit = getDailyLimitForTier(data.vipTier, settings);
        if (data.dailyTapCount >= limit) {
          return { limited: true, earned: 0, data } as any;
        }

        const value = settings.baseTapValue * getMultiplierForTier(data.vipTier, settings);
        data.balance = parseFloat((data.balance + value).toFixed(3));
        data.totalTaps += 1;
        data.dailyTapCount += 1;
        data.updatedAt = Date.now();
        tx.update(userRef, {
          balance: data.balance,
          totalTaps: data.totalTaps,
          dailyTapCount: data.dailyTapCount,
          dailyTapDate: data.dailyTapDate,
          updatedAt: data.updatedAt,
        });
        return { limited: false, earned: value, data } as any;
      });

      if (result.limited) {
        toast.error("Daily limit reached!");
      } else {
        toast.success(`+₹${result.earned.toFixed(3)} earned!`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {active === "Home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 flex flex-col items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">Balance</div>
                <div className="text-4xl font-extrabold">₹{(user?.balance ?? 0).toFixed(2)}</div>
                <div className="text-sm opacity-70">Daily {user?.dailyTapCount ?? 0} / {dailyLimit}</div>
                <div className="text-sm opacity-70">Multiplier: x{multiplier.toFixed(2)}</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                animate={{ scale: [1, 1.06, 1], boxShadow: ["0 0 0 0 rgba(34,197,94,0.6)", "0 0 0 20px rgba(34,197,94,0)", "0 0 0 0 rgba(34,197,94,0)"] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                onClick={handleTap}
                className="w-52 h-52 rounded-full bg-green-500 text-white text-2xl font-bold grid place-items-center"
              >
                TAP
              </motion.button>
              {/* Coin burst placeholder */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6 }} key={user?.totalTaps} className="text-green-500 font-semibold">
                +₹{settings ? (settings.baseTapValue * multiplier).toFixed(3) : "0.000"}
              </motion.div>
            </motion.div>
          )}
          {active === "Referral" && (
            <motion.div key="ref" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4">
              <ReferralTab />
            </motion.div>
          )}
          {active === "Shop" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4">
              <ShopTab onPurchased={() => toast.success("VIP Activated Successfully!")} />
            </motion.div>
          )}
          {active === "Withdraw" && (
            <motion.div key="wd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4">
              <WithdrawTab />
            </motion.div>
          )}
          {active === "Profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4">
              <ProfileTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <nav className="h-16 grid grid-cols-5 text-sm border-t">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActive(t)} className={`flex items-center justify-center ${t === active ? "text-green-600 font-semibold" : "opacity-70"}`}>
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ReferralTab() {
  const { uid, userDoc } = useAuth();
  const [link, setLink] = useState<string>("");
  const [count, setCount] = useState<number>(userDoc?.referralCount ?? 0);
  const [earnings, setEarnings] = useState<number>(userDoc?.referralEarnings ?? 0);

  useEffect(() => {
    if (!uid) return;
    setLink(`https://t.me/TapX_EarnBot?start=${uid}`);
  }, [uid]);

  useEffect(() => {
    setCount(userDoc?.referralCount ?? 0);
    setEarnings(userDoc?.referralEarnings ?? 0);
  }, [userDoc?.referralCount, userDoc?.referralEarnings]);

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Referral</div>
      <div>Total invites: {count}</div>
      <div>Referral earnings: ₹{earnings.toFixed(2)}</div>
      <div className="flex items-center gap-2">
        <input className="w-full border rounded p-2" readOnly value={link} />
        <button className="px-3 py-2 bg-blue-500 text-white rounded" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied!"); }}>Copy</button>
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-yellow-500">★ ★ ★</motion.div>
    </div>
  );
}

function ShopTab({ onPurchased }: { onPurchased: () => void }) {
  const { uid } = useAuth();

  async function activateSubscription(tier: "VIP1" | "VIP2", days = 30) {
    if (!uid) return;
    const db = getDb();
    const ref = doc(db, "users", uid);
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    await updateDoc(ref, { vipTier: tier, vipExpiry: expiry });
    onPurchased();
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">VIP Shop</div>
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded border">
          <div className="font-semibold">VIP 1</div>
          <div>2.0X multiplier, 5000 daily taps</div>
          <button className="mt-2 px-3 py-2 bg-purple-600 text-white rounded" onClick={() => activateSubscription("VIP1")}>Buy with Stars (75)</button>
        </div>
        <div className="p-4 rounded border">
          <div className="font-semibold">VIP 2</div>
          <div>2.5X multiplier, 10000 daily taps</div>
          <button className="mt-2 px-3 py-2 bg-purple-600 text-white rounded" onClick={() => activateSubscription("VIP2")}>Buy with Stars</button>
        </div>
      </div>
    </div>
  );
}

function WithdrawTab() {
  const { uid, userDoc } = useAuth();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState<number>(0);

  async function submit() {
    if (!uid || !userDoc) return;
    const db = getDb();
    const id = crypto.randomUUID();
    await setDoc(doc(db, "withdrawals", id), {
      userId: uid,
      amount,
      upiId,
      status: "pending",
      createdAt: Date.now(),
    });
    toast.success("Withdrawal request submitted!");
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Withdraw</div>
      <input className="w-full border rounded p-2" placeholder="UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
      <input className="w-full border rounded p-2" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
      <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={submit}>Submit</button>
    </div>
  );
}

function ProfileTab() {
  const { userDoc } = useAuth();
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Profile</div>
      <div>Name: {userDoc?.name}</div>
      <div>VIP: {userDoc?.vipTier}</div>
      <div>Total taps: {userDoc?.totalTaps}</div>
      <div>Total earnings: ₹{(userDoc?.balance ?? 0).toFixed(2)}</div>
    </div>
  );
}
