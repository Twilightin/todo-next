// app/api/champion/route.js (App Router)
export async function GET(req) {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/15.23.1/data/en_US/champion/{}.json`
  );
  const data = await res.json();
  
  return Response.json(data.data.Aatrox.name);
}

// Then fetch from your component:
// fetch('/api/champion')