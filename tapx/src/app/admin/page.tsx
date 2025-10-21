"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, doc, getCountFromServer, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function AdminPage() {
  const params = useSearchParams();
  const isAdmin = params.get("admin") === "true" && params.get("key") === process.env.NEXT_PUBLIC_ADMIN_KEY;

  if (!isAdmin) return <div className="p-4">Unauthorized</div>;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const db = getDb();
  const [tab, setTab] = useState<"Stats" | "Settings" | "Approvals">("Stats");

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold">TapX Admin</div>
      <div className="flex gap-2">
        {(["Stats", "Settings", "Approvals"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded border ${t === tab ? "bg-black text-white" : ""}`}>{t}</button>
        ))}
      </div>
      {tab === "Stats" && <AdminStats />}
      {tab === "Settings" && <AdminSettings />}
      {tab === "Approvals" && <AdminApprovals />}
    </div>
  );
}

function AdminStats() {
  const db = getDb();
  const [counts, setCounts] = useState({ users: 0, activeVips: 0, withdrawals: 0 });

  useEffect(() => {
    (async () => {
      const usersSnap = await getCountFromServer(collection(db, "users"));
      const vipSnap = await getDocs(query(collection(db, "users"), where("vipTier", "!=", "Free")));
      const wdSnap = await getCountFromServer(collection(db, "withdrawals"));
      setCounts({ users: usersSnap.data().count, activeVips: vipSnap.size, withdrawals: wdSnap.data().count });
    })();
  }, [db]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(counts).map(([k, v]) => (
        <div key={k} className="p-4 rounded border">
          <div className="text-sm uppercase opacity-60">{k}</div>
          <div className="text-2xl font-bold">{v}</div>
        </div>
      ))}
    </div>
  );
}

function AdminSettings() {
  return (
    <div>
      <div className="opacity-70">Editable settings can be implemented to write to Firestore `settings/app`.</div>
    </div>
  );
}

function AdminApprovals() {
  const db = getDb();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "withdrawals"), where("status", "==", "pending"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setItems(arr);
    });
  }, [db]);

  async function approve(id: string) {
    await updateDoc(doc(db, "withdrawals", id), { status: "paid", processedAt: Date.now() });
    toast.success("Withdrawal processed.");
  }
  async function reject(id: string) {
    await updateDoc(doc(db, "withdrawals", id), { status: "rejected", processedAt: Date.now() });
    toast.error("Withdrawal rejected.");
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Pending Withdrawals</div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((it) => (
          <div key={it.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">₹{it.amount} - {it.upiId}</div>
              <div className="text-xs opacity-70">{it.userId}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(it.id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={() => reject(it.id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
