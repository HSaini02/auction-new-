"use client";
import { useEffect, useState } from "react";
type Auction = { id: string; title: string; startingPrice: number; endTime: string };

export default function Home() {
  const [items,setItems] = useState<Auction[]>([]);
  const [err,setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auctions");
        const txt = await res.text();
        const data = JSON.parse(txt);
        if (!res.ok) throw new Error(data.error || data.detail || "Failed");
        setItems(data.items || []);
      } catch (e:any) { setErr(e.message); }
    })();
  }, []);

  if (err) return <p style={{color:"crimson"}}>{err}</p>;

  return (
    <main>
      <h2>Auctions</h2>
      {items.length === 0 ? <p>No auctions yet.</p> :
        <ul>
          {items.map(a => (
            <li key={a.id}>
              <strong>{a.title}</strong> — ${a.startingPrice} — ends {new Date(a.endTime).toLocaleString()}
            </li>
          ))}
        </ul>}
    </main>
  );
}
