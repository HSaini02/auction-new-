"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { auth } from "@/lib/firebase.client";

const schema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  startingBid: z.coerce.number().positive(),
  endTime: z.string().refine(v => !isNaN(Date.parse(v)), "valid datetime"),
});

export default function CreateAuction() {
  const r = useRouter();
  const { user } = useAuth();

  const f = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      startingBid: 1,
      endTime: new Date(Date.now()+86400000).toISOString().slice(0,16),
    },
  });

  const submit = async (v: z.infer<typeof schema>) => {
    if (!user || !auth.currentUser) { alert("Sign in first"); return; }
    const token = await auth.currentUser.getIdToken();

    const res = await fetch("/api/auctions", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({
        title: v.name,
        description: v.description,
        startingPrice: v.startingBid,
        endTime: new Date(v.endTime).toISOString(),
      })
    });

    const raw = await res.text();
    let data:any = {}; try { data = JSON.parse(raw); } catch { alert("Non-JSON: "+raw.slice(0,200)); return; }
    if (!res.ok) { alert(data.error || data.detail || "Failed"); return; }

    alert("Auction created: "+data.id);
    r.push("/");
  };

  const askAI = async () => {
    const title = f.getValues("name");
    if (!title) { alert("Enter item name first"); return; }
    const res = await fetch("/api/gemini", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok || !data.description) { alert(data.error || "AI failed"); return; }
    f.setValue("description", data.description);
  };

  return (
    <main>
      <h2>Create Auction</h2>
      <form onSubmit={f.handleSubmit(submit)} style={{display:"grid",gap:8,maxWidth:520}}>
        <input placeholder="Item name" {...f.register("name")} />
        <button type="button" onClick={askAI}>Generate Description with AI</button>
        <textarea placeholder="Description" rows={4} {...f.register("description")} />
        <input type="number" step="0.01" placeholder="Starting price" {...f.register("startingBid")} />
        <input type="datetime-local" {...f.register("endTime")} />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
