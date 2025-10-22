import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Scheduled function to expire VIPs daily
export const expireVip = functions.pubsub.schedule("every 24 hours").onRun(async () => {
  const now = Date.now();
  const snap = await db.collection("users").where("vipExpiry", "<=", now).get();
  const batch = db.batch();
  snap.forEach((docRef) => {
    batch.update(docRef.ref, { vipTier: "Free", vipExpiry: admin.firestore.FieldValue.delete() });
  });
  if (!snap.empty) await batch.commit();
});

// Callable: activate subscription for a user
export const activateSubscription = functions.https.onCall(async (data, context) => {
  const { userId, tier, durationDays } = data as { userId: string; tier: "VIP1" | "VIP2"; durationDays?: number };
  if (!userId || !tier) throw new functions.https.HttpsError("invalid-argument", "Missing params");
  const days = durationDays ?? 30;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  await db.collection("users").doc(userId).update({ vipTier: tier, vipExpiry: expiry });
  return { success: true, vipExpiry: expiry };
});

// Trigger: credit referral bonus when referred user hits 100 taps for first time
export const onUserUpdate = functions.firestore.document("users/{userId}").onUpdate(async (change, context) => {
  const before = change.before.data();
  const after = change.after.data();
  if (!after) return;

  if (!after.referrerId) return;
  // When crossing 100 total taps and not credited yet
  const crossed = (before.totalTaps || 0) < 100 && (after.totalTaps || 0) >= 100;
  if (!crossed) return;

  const settingsSnap = await db.collection("settings").doc("app").get();
  const referralBonus = (settingsSnap.exists ? settingsSnap.data()?.referralBonus : 1) ?? 1;

  const referrerRef = db.collection("users").doc(after.referrerId);
  await db.runTransaction(async (tx) => {
    const referrer = await tx.get(referrerRef);
    const curr = (referrer.data()?.referralEarnings || 0) as number;
    tx.update(referrerRef, { referralEarnings: parseFloat((curr + referralBonus).toFixed(2)) });
  });
});
