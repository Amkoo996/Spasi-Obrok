export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-6 bg-white rounded-[32px] sm:mt-6 sm:shadow-sm sm:border border-[#eceae0]">
      <h1 className="text-3xl font-black mb-8 text-[#1a1c18] tracking-tight">Pravila i Uslovi Korištenja</h1>
      <div className="prose prose-sm text-[#2d312a] space-y-6">
        <p className="text-base font-medium leading-relaxed">
          <strong className="text-[#4f6d44]">SpasiObrok</strong> je platforma koja operiše kao most i povezuje savjesne kupce sa ugostiteljskim partnerima (restorani, pekare, prodavnice) u zajedničkoj borbi protiv propadanja viška hrane.
        </p>
        <div className="p-4 bg-[#fef3c7]/30 border border-[#fef3c7] rounded-2xl text-[#b45309] text-sm font-medium">
          Bitna napomena: Platforma direktno ne prodaje hranu, već isključivo posreduje u rezervaciji paketa iznenađenja.
        </div>
        
        <h3 className="font-bold text-[#1a1c18] text-xl mt-8 mb-4">Partneri su odgovorni za:</h3>
        <ul className="list-none space-y-3 pl-0">
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> kvalitet, ispravnost i svježinu ponuđene hrane</li>
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> potpunu higijenu prilikom pakiranja namirnica</li>
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> tačnost navedenog radnog vremena za preuzimanje</li>
        </ul>

        <h3 className="font-bold text-[#1a1c18] text-xl mt-8 mb-4">Kupac preuzimanjem rezervacije prihvata da:</h3>
        <ul className="list-none space-y-3 pl-0">
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> se radi o <strong>neprodanoj, ali svježoj robi</strong> iz tog dana</li>
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> tačan <strong>sadržaj paketa može varirati</strong> (paket iznenađenja zavisi od viška tog dana)</li>
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> preuzimanje vrši isključivo lično, unutar navedenog vremenskog okvira</li>
          <li className="flex items-start gap-3"><span className="text-[#4f6d44] font-black">✓</span> bez validnog rezervacijskog koda sa aplikacije preuzimanje paketa <strong>nije moguće</strong></li>
        </ul>

        <div className="bg-[#f0f4ef] p-6 rounded-2xl mt-8">
          <p className="font-bold text-[#1a1c18] text-base mb-2">Plaćanje Obroka</p>
          <p className="text-sm">Plaćanje narudžbi se u trenutnoj fazi sistema vrši <strong>isključivo i direktno partneru </strong> gotovinski ili kartično na licu mjesta pri preuzimanju Vašeg paketa u njihovoj radnji.</p>
        </div>

        <p className="text-xs text-[#6b7264] mt-8 pt-6 border-t border-[#eceae0] leading-relaxed">
          Završne odredbe: Platforma čuva integritet oba subjekta te izričito zadržava puno pravo blokiranja računa, uklanjanja korisnika ili raskidanja ugovora s partnerima u slučaju bilo kakve zloupotrebe pravila sistema (poput višestrukog no-show prekršaja od strane kupca ili narušavanja higijene i kvalitete od strane partnera).
        </p>
      </div>
    </div>
  );
}
