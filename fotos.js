/* FitDeliMenu · fotos de los productos de la lista de la compra.
   Cada ingrediente apunta a un artículo de Wikipedia ("es:" = Wikipedia en español) y se usa su foto principal
   (Wikimedia Commons, licencias libres). Las direcciones se piden una vez y se guardan en este navegador. */
const FOTO_T = {
 gazpacho:"Gazpacho",
 tomtrit:"Canned tomato",
 atunlata:"es:Atún en conserva",
 lechecoco:"Coconut milk",
 bavena:"Oat milk",
 bsoja:"Soy milk",
 balmendra:"Almond milk",
 bcoco:"Coconut milk",
 semcalabaza:"Pepita",
 coco:"es:Coco rallado",
 edamame:"Edamame",
 tamari:"Soy sauce",
 yogveg:"Plant-based yogurt",
 fideos:"Rice noodles",
 tortarroz:"Rice cake",
 lonchas:"Turkey ham",
 pavopicado:"Ground turkey",
 salmonahu:"Smoked salmon",
 terpicada:"Ground beef",
 lentrojas:"Masoor dal",
 lentcoc:"Lentil",
 quesorall:"Grated cheese",
 qfbatido:"Quark (dairy product)",
 yoggriego:"Strained yogurt",
 pancenteno:"Rye bread",
 tortrigo:"Flour tortilla",
 tormaiz:"Corn tortilla",
 arrozint:"Brown rice",
 basmati:"Basmati",
 aguacate:"Avocado",
 apio:"Celery",
 berenjena:"Eggplant",
 boniato:"Sweet potato",
 patata:"Potato",
 brocoli:"Broccoli",
 coliflor:"Cauliflower",
 calabacin:"Zucchini",
 calabaza:"Pumpkin",
 cebolla:"Onion",
 puerro:"es:Puerro",
 ajo:"Garlic",
 champinon:"Agaricus bisporus",
 setas:"Edible mushroom",
 espinaca:"Spinach",
 kale:"Kale",
 esparrago:"es:Asparagus officinalis",
 judias:"Green bean",
 guisantes:"Pea",
 lechuga:"Lettuce",
 ensalada:"Mesclun",
 rucula:"es:Rúcula",
 pepino:"Cucumber",
 pimiento:"Bell pepper",
 tomate:"Tomato",
 zanahoria:"Carrot",
 jengibre:"Ginger",
 eneldo:"Dill",
 perejil:"Parsley",
 albahaca:"Basil",
 limon:"Lemon",
 lima:"Lime (fruit)",
 platano:"Banana",
 manzana:"Apple",
 pera:"Pear",
 mango:"Mango",
 naranja:"Orange (fruit)",
 mandarina:"Mandarin orange",
 kiwi:"es:Kiwi (fruta)",
 pina:"Pineapple",
 frutosrojos:"es:Frutos rojos",
 pollo:"Chicken fillet",
 pavo:"Turkey meat",
 solomillo:"es:Solomillo",
 ternera:"Beef",
 cerdo:"Pork loin",
 salmon:"Salmon as food",
 merluza:"Merluccius merluccius",
 bacalao:"Cod as food",
 atun:"es:Atún",
 dorada:"Gilt-head bream",
 gamba:"Shrimp and prawn as food",
 sepia:"Squid as food",
 huevo:"Egg as food",
 yogur:"Yogurt",
 kefir:"Kefir",
 requeson:"Cottage cheese",
 feta:"Feta",
 mozzarella:"Mozzarella",
 parmesano:"Parmesan",
 whey:"Whey protein",
 pan:"Whole wheat bread",
 avena:"Rolled oats",
 quinoa:"Quinoa",
 cuscus:"Couscous",
 arroz:"Rice",
 pasta:"Pasta",
 lenteja:"Lentil",
 hummus:"Hummus",
 garbanzo:"es:Garbanzo",
 alubia:"Navy bean",
 tofu:"Tofu",
 tempeh:"Tempeh",
 nueces:"Walnut",
 almendra:"Almond",
 cacahuete:"Peanut butter",
 chia:"Chia seed",
 canamo:"es:Cañamón",
 lino:"es:Linaza",
 sesamo:"Gomasio",
 tahini:"Tahini",
 chocolate:"Dark chocolate",
 aceite:"Olive oil",
 vinagre:"Vinegar",
 miel:"Honey",
 azafran:"Saffron",
 caldo:"Broth",
 canela:"Cinnamon",
 pimenton:"Paprika",
 comino:"Cumin",
 curcuma:"Turmeric",
 curry:"Curry powder",
 oregano:"Oregano",
 romero:"Rosemary",
 vainilla:"Vanilla",
 sal:"Salt and pepper",
 hielo:"es:Cubito de hielo"
};
const FOTO = (() => {
  const KEY = "planfit-fotos-v2";
  let cache = {}; try { cache = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch(e) {}
  let loading = null;
  const url = id => cache[id] || "";
  function fill(root){
    (root || document).querySelectorAll("img[data-foto]").forEach(img => {
      const u = url(img.dataset.foto);
      if(u && img.getAttribute("src") !== u){ img.src = u; img.classList.add("ok"); }
    });
  }
  async function fetchWiki(lang, titles){
    const out = {};
    for(let i = 0; i < titles.length; i += 45){
      const q = titles.slice(i, i + 45).join("|");
      const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=160&redirects=1&titles=${encodeURIComponent(q)}`);
      const j = await res.json(), qq = j.query || {}, back = {};
      (qq.normalized || []).forEach(x => back[x.to] = x.from);
      (qq.redirects || []).forEach(x => back[x.to] = back[x.from] || x.from);
      Object.values(qq.pages || {}).forEach(p => {
        if(!p.thumbnail) return;
        out[p.title] = p.thumbnail.source;
        if(back[p.title]) out[back[p.title]] = p.thumbnail.source;
      });
    }
    return out;
  }
  function load(){
    if(loading) return loading;
    const need = Object.keys(FOTO_T).filter(id => !cache[id]);
    if(!need.length) return loading = Promise.resolve();
    const groups = {};
    need.forEach(id => { const t = FOTO_T[id], m = /^([a-z]{2}):(.+)$/.exec(t), lang = m ? m[1] : "en";
      (groups[lang] = groups[lang] || []).push([id, m ? m[2] : t]); });
    loading = Promise.all(Object.entries(groups).map(([lang, list]) =>
      fetchWiki(lang, [...new Set(list.map(x => x[1]))]).then(found => list.forEach(([id, t]) => { if(found[t]) cache[id] = found[t]; }))
    )).then(() => { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch(e) {} fill(); })
      .catch(() => { loading = null; });
    return loading;
  }
  /* miniatura para la lista; si aún no hay foto, se rellena al llegar */
  function img(id){
    if(!FOTO_T[id]) return `<span class="sthumb none" aria-hidden="true"></span>`;
    const u = url(id);
    return `<img class="sthumb${u ? " ok" : ""}" data-foto="${id}" ${u ? `src="${u}"` : ""} alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.classList.remove('ok');this.removeAttribute('src')">`;
  }
  return { img, load, fill };
})();
