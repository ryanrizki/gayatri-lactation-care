/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreastfeedingChallenge, ServicePackage } from "../types";

export const CHALLENGES_DATA: BreastfeedingChallenge[] = [
  {
    id: "asi-seret",
    title: "ASI Seret / Produksi Sedikit",
    icon: "MilkyWay", // We will render corresponding icons
    description: "Khawatir produksi ASI kurang untuk sang buah hati? Cari tahu penyebab sebenarnya dan solusi medis untuk merangsang produksi ASI.",
    criticalSymptoms: [
      "Pipis bayi kurang dari 6 kali dalam 24 jam setelah bayi berusia 5 hari",
      "Urine bayi berwarna kuning pekat atau merah bata di popok",
      "Bayi sangat tidak tenang atau lesu berlebihan",
      "Berat badan bayi turun lebih dari 10% di minggu pertama"
    ],
    immediateSteps: [
      "Tingkatkan frekuensi menyusui (minimal 8-12 kali dalam 24 jam atau setiap 2 jam).",
      "Lakukan pelekatan kulit-ke-kulit (skin-to-skin contact) sebelum menyusui untuk memicu hormon oksitosin.",
      "Lakukan teknik 'pumping double' atau 'Power Pumping' (memompa dengan pola interval) untuk mengirim stimulasi ekstra ke otak.",
      "Pastikan asupan cairan Mama tercukupi (minum segelas air putih hangat setiap sebelum dan sesudah menyusui)."
    ],
    interactiveDiagnostic: [
      {
        id: "s1",
        question: "Berapa hari usia bayi saat ini?",
        options: [
          { label: "Kurang dari 3 hari (Normal jika ASI masih berupa kolostrum dan sedikit)", score: 1, advice: "Di 3 hari pertama lambung bayi hanya seukuran biji kemiri. Tetap susui sesering mungkin untuk menstimulasi produksi susu." },
          { label: "4 - 14 hari (Fase transisi susu)", score: 2, advice: "Di fase ini pasokan ASI matang perlahan terbentuk. Pastikan bayi menyusu di kedua payudara secara seimbang." },
          { label: "Lebih dari 14 hari (Susu matang/mature milk)", score: 3, advice: "Produksi ASI sekarang mengikuti prinsip supply-by-demand. Sering mengosongkan payudara adalah kunci utama." }
        ]
      },
      {
        id: "s2",
        question: "Berapa kali bayi pipis (urine jernih/kuning muda) dalam 24 jam terakhir?",
        options: [
          { label: "Kurang dari 6 kali sehari", score: 5, advice: "Waspada dehidrasi ringan. Susui bayi lebih sering secara terjadwal maksimal setiap 2 jam sekali tanpa menunggu bayi menangis.", critical: true },
          { label: "6 kali atau lebih sehari", score: 0, advice: "Hebat! Pipis >= 6 kali mengindikasikan hidrasi bayi aman dan bayi menyerap cukup ASI dari Mama." }
        ]
      },
      {
        id: "s3",
        question: "Bagaimana kondisi payudara Mama di antara jadwal menyusui?",
        options: [
          { label: "Terasa kempis, lambat terisi", score: 3, advice: "Gunakan kompres hangat sebelum menyusui dan pijat payudara dengan lembut (pijat laktasi oksitosin) untuk merangsang Let-Down Reflex (LDR)." },
          { label: "Kadang kencang, kadang lembut", score: 1, advice: "Kondisi payudara yang menyesuaikan dengan kebutuhan bayi adalah tanda regulasi suplai yang baik." }
        ]
      }
    ]
  },
  {
    id: "payudara-bengkak",
    title: "Payudara Nyeri, Bengkak, atau Sumbatan",
    icon: "ShieldAlert",
    description: "Payudara terasa keras, merah, mengganjal, atau nyeri saat disentuh? Mari cari tahu cara meredakan bengkak dengan kompres yang tepat.",
    criticalSymptoms: [
      "Mama demam dengan suhu tubuh di atas 38.5°C",
      "Area payudara tampak bengkak merah mengkilap, panas, dan terasa nyeri sekali seperti tertusuk (gejala Mastitis)",
      "Keluar nanah atau darah dari puting susu",
      "Adanya benjolan keras yang tidak kunjung mengecil setelah payudara disusui/dipompa"
    ],
    immediateSteps: [
      "Lakukan teknik pijatan lembut mengarah ke ketiak untuk membantu drainase limfatik (bukan dipijat keras demi melancarkan basi).",
      "Gunakan kompres DINGIN di antara jadwal menyusui untuk meredakan pembengkakan dan meredakan radang.",
      "Gunakan kompres HANGAT sesaat sebelum memompa/menyusui hanya untuk melancarkan Let-Down Reflex.",
      "Susui bayi sesering mungkin mulai dari sisi payudara yang bengkak agar hisapan kuat bayi membantu membuka sumbatan ASI."
    ],
    interactiveDiagnostic: [
      {
        id: "p1",
        question: "Apakah Mama merasakan gejala demam tinggi atau menggigil?",
        options: [
          { label: "Ya, demam tinggi di atas 38°C", score: 5, advice: "Ada indikasi Mastitis (infeksi payudara). Sangat disarankan berkonsultasi kepada dokter laktasi Gayatri untuk resep antibiotik aman.", critical: true },
          { label: "Tidak demam, hanya bengkak lokal", score: 2, advice: "Ini adalah sumbatan saluran ASI (clogged duct). Kompres dingin, terus susui, dan jangan dipijat kencang-kencang." }
        ]
      },
      {
        id: "p2",
        question: "Di mana tepatnya rasa nyeri atau bengkal tersebut?",
        options: [
          { label: "Seluruh payudara keras seperti batu", score: 4, advice: "Engorgement (bengkak merata). Lakukan pijat drainase limfatik arah dari puting menuju ketiak dengan gerakan meluncur sangat ringan." },
          { label: "Ada benjolan keras terlokalisir di satu area", score: 2, advice: "Clogged duct (saluran tersumbat). Ubah posisi menyusui bayi sedemikian rupa sehingga dagu bayi mengarah ke benjolan tersebut." }
        ]
      },
      {
        id: "p3",
        question: "Bagaimana kondisi puting Mama saat ini?",
        options: [
          { label: "Puting lecet, retak, atau berdarah", score: 3, advice: "Lecet menandakan pelekatan kurang pas. Oleskan sisa ASI Mama pada puting setelah menyusu atau gunakan krim lanolin medis murni." },
          { label: "Puting baik-baik saja", score: 0, advice: "Puting sehat memudahkan pengosongan lebih baik. Pertahankan!" }
        ]
      }
    ]
  },
  {
    id: "pelekatan-tidak-pas",
    title: "Pelekatan (Latch-On) Tidak Optimal",
    icon: "Baby",
    description: "Menyusui seharusnya tidak nyeri. Jika puting terasa perih atau lecet, kemungkinan teknik pelekatan bayi kurang dalam. Cek cara memperbaikinya.",
    criticalSymptoms: [
      "Puting lecet parah, berdarah, atau memar melingkar setelah menyusu",
      "Puting tampak pipih seperti ujung lipstick setelah dikeluarkan dari mulut bayi",
      "Terdengar bunyi mendecap ('klik') keras saat bayi menyusu",
      "Bayi sering melepas payudara dan menangis frustrasi"
    ],
    immediateSteps: [
      "Pastikan bayi membuka mulut lebar-lebar sebelum menempelkan ke payudara (rangsang puting ke bibir atas bayi).",
      "Bawa bayi ke payudara, BUKAN payudara yang membungkuk dibawa ke mulut bayi.",
      "Arahkan puting ke bagian langit-langit atas mulut bayi, biarkan sisa dagu menyentuh kulit payudara terlebih dahulu.",
      "Pastikan sebagian besar areola (bagian gelap payudara), terutama areola bagian bawah, masuk ke dalam mulut bayi (asymmetric latch)."
    ],
    interactiveDiagnostic: [
      {
        id: "l1",
        question: "Bagaimana rasanya saat bayi menyusu di payudara?",
        options: [
          { label: "Sakit/nyeri sepanjang sesi menyusui", score: 4, advice: "Lepaskan bayi dengan memasukkan jari kelingking Mama ke sudut mulutnya, lalu ulangi pelekatan dengan menunggunya membuka mulut selebar mungkin.", critical: true },
          { label: "Nyeri hanya di 10 detik pertama (Wajar di minggu awal)", score: 1, advice: "Ini penyesuaian saraf puting. Jika nyeri berkurang setelahnya, lanjutkan posisi tersebut." },
          { label: "Sama sekali tidak nyeri dan nyaman", score: 0, advice: "Sempurna! Pelekatan Mama sudah sangat optimal." }
        ]
      },
      {
        id: "l2",
        question: "Bagaimana penampakan areola payudara saat menyusui?",
        options: [
          { label: "Areola bagian bawah masih terlihat banyak di luar mulut bayi", score: 3, advice: "Gunakan teknik pegangan payudara bentuk 'U' atau 'C' agar areola bawah masuk lebih dulu, membuat pelekatan asimetris (asymmetric latch)." },
          { label: "Hampir seluruh areola bagian bawah masuk ke mulut bayi", score: 0, advice: "Kombinasi pelekatan asimetris ini sangat baik untuk menekan sinus laktiferus dengan rahang bayi." }
        ]
      },
      {
        id: "l3",
        question: "Seperti apa bentuk ujung puting Mama setelah bayi selesai menyusu?",
        options: [
          { label: "Pipih gepeng mirip ujung lipstik baru", score: 3, advice: "Ini pertanda bayi mengulum puting di area depan mulut saja, bukan mengisap areola dalam. Perbaiki sudut sudut pelekatan sedalam mungkin." },
          { label: "Tetap membulat teratur", score: 0, advice: "Sangat baik, saluran ASI tidak tertekan berlebihan di dalam mulut bayi." }
        ]
      }
    ]
  },
  {
    id: "bb-bayi-seret",
    title: "Berat Badan Bayi Seret / Lambat",
    icon: "Activity",
    description: "Berat badan bayi di KMS tidak kunjung meningkat? Cari tahu apakah bayi menyerap ASI dengan baik atau ada indikasi medis fungsional.",
    criticalSymptoms: [
      "Berat badan bayi tidak kunjung kembali ke berat lahir setelah usia 14 hari",
      "Garis pertambahan berat badan bayi memotong dua kurva persentil utama ke bawah di grafik KMS",
      "Bayi tampak selalu lemas, tertidur sepanjang waktu, dan malas menyusu",
      "Pipis bayi sangat sedikit dan pekat jenuh"
    ],
    immediateSteps: [
      "Bangunkan bayi yang mengantuk setiap 2 jam sekali untuk disusui, termasuk pada malam hari (menyusui malam memicu peningkatan prolaktin).",
      "Lakukan teknik kompresi payudara (pijat tekan merayap) saat bayi mengisap lambat untuk menyemprotkan 'hindmilk' yang padat lemak keluar.",
      "Hindari penggunaan empeng atau botol dot terlalu dini yang dapat memicu bingung puting jika bayi masih menyesuaikan teknik latch-on.",
      "Timbang berat badan bayi sebulan sekali pada timbangan yang sama, telanjang atau dengan popok bersih pelindung tipis."
    ],
    interactiveDiagnostic: [
      {
        id: "b1",
        question: "Berapa lama rata-rata durasi bayi menyusu aktif (terdengar gerak menelan)?",
        options: [
          { label: "Kurang dari 10 menit (Bayi terlalu cepat tertidur/ngempis)", score: 3, advice: "Rangsang bayi agar tetap terjaga dengan menggelitik telapak kaki, usap punggung, atau lepas bedongnya saat menyusu." },
          { label: "15 - 30 menit (Cukup aktif menelan)", score: 0, advice: "Durasi yang sangat ideal bagi bayi untuk menyerap foremilk (dahulu) dan hindmilk yang kaya lemak penambah berat badan." },
          { label: "Lebih dari 40 menit tapi bayi terus menerus mengempis dot/puting", score: 2, advice: "Bayi mungkin hanya mengempit tidur-tiduran (comfort sucking). Efektifkan hisapan dengan kompresi payudara." }
        ]
      },
      {
        id: "b2",
        question: "Apakah Mama memberikan zat selain ASI sebelum usia 6 bulan?",
        options: [
          { label: "Ya, air putih tambahan / pisang pencahar dini", score: 4, advice: "Sangat tidak dianjurkan. Lambung bayi sangat kecil, air putih atau makanan padat dini menurunkan jatah minum ASI bernutrisi tinggi dan memicu diare.", critical: true },
          { label: "Hanya ASI Eksklusif murni", score: 0, advice: "Hebat! ASI Eksklusif adalah asupan imun pertahanan terbaik untuk usus pencernaan bayi di 180 hari pertamanya." }
        ]
      }
    ]
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "laktasi_homecare",
    name: "Konsultasi Laktasi Homecare",
    category: "consultation",
    price: 350000,
    description: "Konselor laktasi profesional kami mendatangi rumah Mama untuk membimbing pelekatan, pemijatan payudara bengkak, dan edukasi langsung di kasur yang nyaman.",
    features: [
      "Durasi sesi 90-120 menit tatap muka",
      "Evaluasi anatomi mulut bayi (tongue & lip tie check)",
      "Pijat laktasi stimulasi oksitosin",
      "Demo pelekatan nyaman multi-posisi",
      "Gratis follow-up chat selama 7 hari"
    ],
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "laktasi_klinik",
    name: "Konsultasi Laktasi Klinik",
    category: "consultation",
    price: 250000,
    description: "Kunjungi klinik ramah bayi Gayatri terdekat untuk sesi evaluasi laktasi intensif menggunakan alat bantu ukur berat badan presisi tinggi kami.",
    features: [
      "Durasi sesi 60-90 menit di klinik",
      "Timbangan berat badan bayi presisi pre- & post-feed",
      "Review teknik menyusui dengan bantal menyusui ergonomis klinis",
      "Penanganan putting lecet & payudara bengkak",
      "Rencana terapi menyusui tertulis"
    ],
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "kelas_bekerja",
    name: "Private Class Persiapan Bekerja",
    category: "class",
    price: 400000,
    description: "Kelas privat interaktif khusus bagi Mama menyusui yang akan kembali ngantor atau bekerja demi menyiapkan tabungan ASIP melimpah.",
    features: [
      "Durasi sesi 120 menit (Online/Offline privat)",
      "Panduan kalkulator pumping & manajemen stok ASIP",
      "Tips memilih corong pompa & mesin pompa pas payudara",
      "Teknik sterilisasi & pencairan ASIP beku bebas bakteri",
      "Formulir 'Jadwal Pumping' kustom kantor"
    ],
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
    materials: [
      { title: "Cuplikan: Mengenal Pumping di Kantor", type: "video", preview: true },
      { title: "Video 1 · Setup Pojok ASI di Kantor", type: "video" },
      { title: "Video 2 · Power Pumping Efektif", type: "video" },
      { title: "Modul PDF · Kalkulator & Jadwal Pumping", type: "pdf" },
      { title: "Modul PDF · Sterilisasi & Pencairan ASIP", type: "pdf" }
    ]
  },
  {
    id: "kelas_menyusui",
    name: "Private Class Persiapan Menyusui",
    category: "class",
    price: 300000,
    description: "Dirancang eksklusif untuk ibu hamil trimester ke-3 agar siap menyusui sejak menit pertama inisiasi menyusui dini (IMD) melahirkan.",
    features: [
      "Mitos vs Fakta puting tenggelam & kolostrum sedikit",
      "Gerakan pijat hamil stimulus payudara",
      "Dukungan support system Ayah ASI",
      "Perlengkapan wajib menyusui yang tidak mubazir",
      "E-book panduan menyusui pasca melahirkan"
    ],
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    materials: [
      { title: "Cuplikan: Pelekatan Pertama (IMD)", type: "video", preview: true },
      { title: "Video 1 · Teknik Pelekatan Asimetris", type: "video" },
      { title: "Video 2 · Pijat Stimulasi Payudara", type: "video" },
      { title: "Modul PDF · Checklist Perlengkapan Menyusui", type: "pdf" },
      { title: "E-book · Panduan Menyusui Pasca Melahirkan", type: "pdf" }
    ]
  }
];
