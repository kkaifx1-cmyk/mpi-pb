export interface ModulSection {
  id: string;
  chapterNumber?: number;
  title: string;
  tag: string;
  badge: string;
  iconName: "target" | "cpu" | "layers" | "focus" | "palette" | "sun" | "sparkles";
  summary: string;
  learningObjectives: string[];
  competencyMap?: Array<{
    chapterNumber: number;
    tag: string;
    title: string;
    objective: string;
  }>;
  keyPoints: Array<{
    title: string;
    description: string;
    example?: {
      bad: string;
      good: string;
      explanation: string;
    };
  }>;
  tebakGambarApplication?: {
    title: string;
    description: string;
  };
  tips: string[];
}

export const MODUL_PROMPT_ENGINEERING: ModulSection[] = [
  {
    id: "tujuan-pembelajaran",
    title: "Tujuan Pembelajaran Modul",
    tag: "Tujuan Pembelajaran",
    badge: "Orientasi & Capaian",
    iconName: "target",
    summary:
      "Modul Pembelajaran Interaktif (MPI) ini dirancang untuk membekali peserta didik dengan pemahaman fundamental dan keterampilan praktis Prompt Engineering terapan pada sintesis visual—mulai dari cara kerja model generatif gambar, teknik dekonstruksi formula 3 elemen inti (Input, Persona, Output) untuk merekayasa balik (reverse prompting) gambar target, hingga penyusunan instruksi presisi di meja permainan Tebak Gambar.",
    learningObjectives: [
      "Memahami cara kerja model AI generatif gambar berbasis probabilitas token/ruang laten serta pengaruhnya terhadap variasi hasil visual (mencegah prinsip Garbage In, Garbage Out).",
      "Mendekonstruksi gambar target ke dalam formula 3 elemen inti: Input (subjek, atribut, aksi, latar), Persona (gaya estetika/medium artistik), dan Output (komposisi, pencahayaan, suasana).",
      "Menyusun rekonstruksi prompt visual (reverse prompting) yang presisi, spesifik, dan bebas ambiguitas guna meminimalkan distorsi dan halusinasi visual.",
      "Mengevaluasi kesenjangan visual antara gambar hasil tebakan dengan gambar target asli berdasarkan kesesuaian kata kunci (token match) untuk perbaikan berkelanjutan.",
    ],
    competencyMap: [
      {
        chapterNumber: 1,
        tag: "Pengenalan Prompt",
        title: "Bab 1: Pengenalan Prompt",
        objective:
          "Memahami hakikat prompt visual, probabilitas ruang laten, prinsip GIGO, dan formula 3 elemen inti (Input, Output, Persona).",
      },
      {
        chapterNumber: 2,
        tag: "Prompt Engineering",
        title: "Bab 2: Konsep & Prinsip Prompt Engineering",
        objective:
          "Menerapkan kata kunci deskriptif yang terarah dan batasan visual spesifik guna meminimalkan distorsi gambar.",
      },
      {
        chapterNumber: 3,
        tag: "Input & Konteks",
        title: "Bab 3: Mengelola Input & Konteks Data",
        objective:
          "Menjadikan gambar sasaran sebagai sumber observasi visual tunggal (subjek, aksi, latar) tanpa membuat asumsi fiktif.",
      },
      {
        chapterNumber: 4,
        tag: "Format Output",
        title: "Bab 4: Output Control: Format & Batasan",
        objective:
          "Mengendalikan medium visual, komposisi framing kamera, dan teknik pencahayaan secara terukur.",
      },
      {
        chapterNumber: 5,
        tag: "Persona & Audiens",
        title: "Bab 5: Penerapan Persona & Target Audiens",
        objective:
          "Menetapkan peran estetika seniman/fotografer dan menyelaraskan atmosfer emosional (mood) pada visual.",
      },
      {
        chapterNumber: 6,
        tag: "Ajakan Diskusi",
        title: "Bab 6: Ajakan Diskusi Kolaboratif",
        objective:
          "Menerapkan komunikasi dan penalaran kritis antarrekan satu tim dalam membedah gambar sebelum mengirimkan tebakan prompt.",
      },
    ],
    keyPoints: [
      {
        title: "Profil & Capaian Pembelajaran Lulusan",
        description:
          "Setelah menyelesaikan modul ini, peserta didik mampu mendekonstruksi stimulus visual dan merekonstruksinya menjadi teks instruksi (prompt) terstruktur yang menghasilkan visual berakurasi tinggi di sistem AI gambar.",
      },
      {
        title: "Peta Pembelajaran Terpadu (6 Bab Bertingkat)",
        description:
          "Pembelajaran disusun secara bertahap mulai dari fondasi probabilitas visual (Bab 1-2), observasi input dan kontrol estetika output (Bab 3-4), hingga karakter artistik dan diskusi kolaborasi tim (Bab 5-6).",
      },
      {
        title: "Korelasi Langsung dengan Meja Permainan Tebak Gambar",
        description:
          "Di meja permainan, tim Pembuat (Maker) menggunakan formula Input, Persona, dan Output untuk menyusun prompt stimulus gambar, sedangkan tim Penebak (Guesser) merekayasa balik (reverse prompt) gambar target untuk meraih akurasi kata kunci dan skor maksimal.",
      },
    ],
    tips: [
      "Pelajari setiap bab secara berurutan atau buka kembali bab tertentu saat menghadapi kesulitan di Meja Permainan.",
      "Perhatikan kotak perbandingan 'Prompt Kurang Efektif' vs 'Prompt Ideal' untuk melatih kepekaan analisis instruksimu.",
      "Perhatikan kotak penerapan 'Koneksi ke Tebak Gambar' di setiap bab untuk melihat contoh nyata penggunaannya dalam sintesis visual.",
    ],
  },
  {
    id: "pengenalan-prompt",
    chapterNumber: 1,
    title: "1. Pengenalan Prompt",
    tag: "Pengenalan Prompt",
    badge: "Dasar AI",
    iconName: "cpu",
    summary:
      "Prompt adalah teks instruksi atau pertanyaan awal yang diberikan kepada model kecerdasan buatan (AI) agar menghasilkan respons, analisis, atau penyelesaian tugas tertentu.",
    learningObjectives: [
      "Menjelaskan pengertian prompt sebagai instruksi, pertanyaan, atau informasi yang diberikan kepada AI.",
      "Memahami cara kerja AI dalam memprediksi pola bahasa/token serta prinsip Garbage In, Garbage Out (GIGO).",
      "Menerapkan tiga elemen inti prompt terarah: Input, Output, dan Persona.",
    ],
    keyPoints: [
      {
        title: "Apa Itu Prompt?",
        description:
          "Prompt adalah instruksi, pertanyaan, atau informasi yang diberikan manusia kepada AI untuk menghasilkan respons sesuai dengan tujuan yang diinginkan. Semakin jelas, spesifik, dan relevan prompt yang diberikan, semakin besar peluang AI menghasilkan respons yang sesuai dengan kebutuhan pengguna.",
      },
      {
        title: "AI Memproses Pola Bahasa, Bukan Membaca Pikiran",
        description:
          "AI generatif berbasis bahasa menghasilkan respons dengan memprediksi urutan token berdasarkan pola yang dipelajari dari data pelatihan dan konteks percakapan. AI tidak bisa mengetahui maksud yang belum kamu sampaikan. Jika instruksi ambigu atau informasi yang diberikan kurang lengkap, respons AI bisa meleset, terlalu umum, atau didasarkan pada asumsi yang keliru.\n\nPrinsip Garbage In, Garbage Out (GIGO): kualitas informasi yang diberikan turut memengaruhi kualitas hasil yang diperoleh.",
      },
      {
        title: "Tiga Elemen Inti Sebuah Prompt: Input, Output, Persona",
        description:
          "Prompt yang terarah dapat disusun menggunakan tiga elemen utama:\n\n1. Input: Informasi, data acuan, atau bahan mentah yang diberikan kepada AI untuk diproses.\n2. Output: Bentuk, struktur, batasan panjang, atau format penyajian hasil yang diharapkan (misal tabel, poin ringkas, paragraf).\n3. Persona: Peran ahli, profesi, atau sudut pandang yang diminta untuk digunakan AI dalam menyusun respons (misal guru biologi, konsultan data, sinematografer).\n\nKetiga elemen ini membantu AI memahami informasi yang diberikan, hasil yang diinginkan, dan pendekatan yang sesuai untuk menyelesaikan tugas.",
        example: {
          bad: "Buatkan tugas tentang lingkungan.",
          good: "Bertindaklah sebagai guru Biologi [Persona]. Jelaskan 3 masalah utama sampah plastik di sekolah [Input]. Sajikan dalam format tabel 2 kolom: Masalah dan Solusi [Output].",
          explanation:
            "Dengan menyertakan Persona (guru Biologi), Input (masalah sampah plastik di sekolah), dan Output (tabel 2 kolom), AI memahami peran, materi tugas, dan bentuk penyajian yang diinginkan secara presisi.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Pada sintesis visual, formula 3 elemen ini diterjemahkan menjadi: Persona = gaya seniman / sudut pandang fotografer (misal: fotografer satwa liar National Geographic); Input = subjek dan latar tempat konkret (misal: elang jawa bertengger di pohon beringin); Output = medium dan pencahayaan (misal: foto telephoto 200mm, cahaya senja hangat).",
    },
    tips: [
      "Hindari perintah yang terlalu umum seperti 'tolong jelaskan hal ini' atau 'buat gambar yang bagus'.",
      "Tentukan tujuan akhir yang ingin kamu capai sebelum mulai merangkai kalimat instruksi.",
    ],
  },
  {
    id: "prompt-engineering",
    chapterNumber: 2,
    title: "2. Konsep & Prinsip Prompt Engineering",
    tag: "Prompt Engineering",
    badge: "Metodologi",
    iconName: "layers",
    summary:
      "Prompt Engineering adalah pendekatan terstruktur dalam menyusun, menguji, dan menyempurnakan instruksi agar model AI menghasilkan keluaran yang faktual, terarah, dan minim kesalahan.",
    learningObjectives: [
      "Membedakan interaksi mengobrol biasa dengan metodologi Prompt Engineering yang terstruktur.",
      "Menggunakan kata kerja aksi operasional yang lugas dan tidak menimbulkan multitafsir.",
      "Menerapkan batasan negatif untuk mencegah halusinasi data dan klaim fakta palsu.",
    ],
    keyPoints: [
      {
        title: "Perbedaan Ngobrol Biasa vs. Prompt Engineering",
        description:
          "Ngobrol biasa menggunakan instruksi atau pertanyaan secara spontan, tanpa selalu menjelaskan konteks, batasan, dan hasil yang diharapkan secara terperinci.\n\nPrompt Engineering adalah proses menyusun dan menyempurnakan instruksi secara sistematis dengan mempertimbangkan input, persona, batasan, serta format output agar AI menghasilkan respons yang lebih relevan dan sesuai tujuan.\n\nIntinya: ngobrol biasa berfokus pada menyampaikan pertanyaan, sedangkan Prompt Engineering berfokus pada merancang instruksi untuk mendapatkan hasil yang diinginkan.",
      },
      {
        title: "Gunakan Kata Kerja Aksi yang Spesifik",
        description:
          "Gunakan kata kerja operasional yang jelas untuk mengarahkan AI dalam menyelesaikan tugas, seperti rangkum, bandingkan, klasifikasikan, ekstrak, atau susun berdasarkan urutan tertentu. Hindari instruksi yang terlalu umum atau ambigu agar AI memahami tindakan yang harus dilakukan dan menghasilkan respons sesuai tujuan.",
        example: {
          bad: "Pelajari informasi ini.",
          good: "Rangkum informasi ini menjadi 3 poin utama.",
          explanation:
            "Kata kerja operasional 'Rangkum' dan batasan '3 poin utama' memberikan instruksi tindakan yang terukur dan jelas kepada AI.",
        },
      },
      {
        title: "Mengurangi Risiko Halusinasi dengan Batasan yang Tegas",
        description:
          "Halusinasi adalah kondisi ketika AI menghasilkan informasi yang tidak akurat atau tidak didukung fakta, tetapi disampaikan seolah-olah benar. Untuk mengurangi risikonya, berikan batasan yang jelas, seperti: “Gunakan hanya data yang disediakan. Jangan mengarang informasi. Jika informasi yang dibutuhkan tidak tersedia, nyatakan dengan jujur bahwa data tersebut tidak tersedia.”\n\nIntinya: batasan yang tegas membantu AI menghasilkan respons yang lebih terkontrol dan mengurangi risiko munculnya informasi yang tidak berdasar. Namun, batasan dalam prompt tidak menjamin AI sepenuhnya bebas dari kesalahan.",
        example: {
          bad: "Bahas sejarah komputer.",
          good: "Rangkum perkembangan generasi komputer dari generasi 1 sampai 4. Gunakan hanya data yang disediakan. Jangan mengarang informasi atau menambahkan spekulasi. Sajikan dalam 4 poin singkat.",
          explanation:
            "Batasan yang tegas mengikat fokus AI hanya pada data yang diberikan dan melarang spekulasi di luar fakta.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Pada generator gambar, halusinasi visual sering terjadi ketika prompt terlalu renggang (misal: 'pria di kantor' bisa memunculkan kantor berantakan atau orang berkepala dua). Memberi batasan komposisi spesifik ('close-up potret, latar dinding kaca buram polos') mengunci ruang laten AI agar tidak menambahkan objek aneh.",
    },
    tips: [
      "Urutan prompt yang efektif: Tentukan peran -> Tugas pokok -> Batasan aturan -> Format keluaran.",
      "Jika hasil pertama belum sesuai, perjelas instruksi pada bagian yang kurang tepat daripada mengulang dari nol.",
    ],
  },
  {
    id: "clear-instruction-input",
    chapterNumber: 3,
    title: "3. Mengelola Input dan Konteks Data",
    tag: "Input & Konteks",
    badge: "Konteks & Fakta",
    iconName: "focus",
    summary:
      "Input adalah bahan atau informasi yang diberikan kepada AI untuk diproses, seperti dokumen rujukan, catatan kasus, tabel, atau data mentah. Sertakan sumber yang relevan dan instruksikan AI untuk menjadikannya dasar analisis agar respons tetap sesuai konteks serta tidak menambahkan asumsi yang tidak didukung oleh data.\n\nIntinya: semakin jelas input dan konteks yang diberikan, semakin terarah respons AI terhadap kebutuhan tugas.",
    learningObjectives: [
      "Membedakan secara jelas antara instruksi yang harus dikerjakan AI dengan bahan input yang diproses.",
      "Menjadikan teks masukan (input) sebagai sumber fakta utama dalam analisis.",
      "Mencegah asumsi atau spekulasi baru saat informasi pada input tidak lengkap.",
    ],
    keyPoints: [
      {
        title: "Pisahkan Instruksi dari Bahan Input",
        description:
          "Bedakan dengan jelas antara instruksi yang harus dikerjakan AI dan bahan input yang harus diproses. Gunakan tanda kutip, kurung siku, atau penanda blok teks untuk membatasi bahan input agar AI lebih mudah membedakan perintah dengan informasi yang menjadi sumber tugas.\n\nIntinya: pemisahan instruksi dan bahan input membantu AI memahami tugas serta mengurangi risiko salah menafsirkan informasi.",
        example: {
          bad: "Rangkum pendaftaran santri baru kuota 100 orang biaya 5 juta menjadi 3 poin.",
          good: "Rangkum informasi berikut menjadi 3 poin utama: [Pendaftaran santri baru, kuota 100 orang, biaya Rp5.000.000].",
          explanation:
            "Pemisahan instruksi dan bahan input membantu AI memahami tugas serta mengurangi risiko salah menafsirkan informasi.",
        },
      },
      {
        title: "Jadikan Input sebagai Sumber Fakta Utama",
        description:
          "Saat meminta AI merangkum laporan atau menganalisis studi kasus, sertakan teks atau data sumber yang relevan ke dalam prompt. Instruksikan AI untuk mendasarkan jawabannya pada informasi tersebut dan tidak menambahkan fakta yang tidak tercantum dalam sumber.\n\nIntinya: menyediakan sumber yang jelas membantu AI menghasilkan jawaban yang lebih akurat, relevan, dan dapat ditelusuri kembali ke data input.",
        example: {
          bad: "Rangkum laporan ini dan jelaskan rencana lanjutannya.",
          good: "Gunakan hanya informasi dalam teks yang diberikan: \"[Teks Rapat]\". Jangan menambahkan fakta dari luar sumber. Jika informasi yang dibutuhkan tidak tersedia dalam teks, nyatakan bahwa informasi tersebut tidak disebutkan.",
          explanation:
            "Menyediakan sumber yang jelas membantu AI menghasilkan jawaban yang lebih akurat, relevan, dan dapat ditelusuri kembali ke data input.",
        },
      },
      {
        title: "Cegah Asumsi saat Informasi Tidak Lengkap",
        description:
          "Instruksikan AI untuk tidak mengarang atau menambahkan asumsi ketika informasi yang dibutuhkan tidak tercantum dalam teks input. Minta AI menyatakan secara eksplisit bagian yang belum diketahui atau informasi yang tidak tersedia.\n\nIntinya: AI harus membedakan antara fakta yang tersedia, kesimpulan yang didukung data, dan informasi yang belum diketahui.",
        example: {
          bad: "Sebutkan nama panitia dan rincian anggarannya (padahal data anggaran tidak ada di teks).",
          good: "Jangan membuat asumsi atau menyimpulkan fakta yang tidak didukung oleh teks: \"[Teks Acara]\". Jika informasi yang dibutuhkan tidak tersedia, nyatakan bahwa informasi tersebut belum diketahui.",
          explanation:
            "AI harus membedakan antara fakta yang tersedia, kesimpulan yang didukung data, dan informasi yang belum diketahui.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Saat menebak gambar sasaran, gambar yang kamu lihat adalah 'Input data'-mu. Penebak yang handal hanya menuliskan apa yang benar-benar tampak pada gambar (misal: warna jas, jenis tanaman, arah bayangan). Jangan membuat asumsi yang tidak terlihat di gambar seperti menebak nama tokoh atau merk barang yang tak tampak.",
    },
    tips: [
      "Kamu bertindak sebagai arsitek yang menginstruksikan AI, bukan menulis ringkasannya secara manual.",
      "Hapus bagian teks input yang tidak relevan agar fokus komputasi AI tetap optimal.",
    ],
  },
  {
    id: "output-control",
    chapterNumber: 4,
    title: "4. Output Control: Format dan Batasan Jawaban",
    tag: "Format Output",
    badge: "Format & Struktur",
    iconName: "palette",
    summary:
      "Output Control adalah teknik mengatur bentuk, struktur, dan batasan respons yang dihasilkan AI agar sesuai dengan kebutuhan pengguna. Pengaturan ini dapat mencakup format tabel Markdown, daftar bernomor, jumlah butir yang tepat, batas jumlah kata, hingga gaya bahasa yang digunakan.\n\nContoh instruksi: “Buat rangkuman dalam bentuk tabel dengan 3 kolom: Masalah, Penyebab, dan Solusi. Gunakan maksimal 100 kata dan bahasa yang mudah dipahami siswa SMA.”\n\nIntinya: jangan hanya menentukan apa yang harus dijawab AI, tetapi tentukan juga bagaimana hasilnya harus disajikan.",
    learningObjectives: [
      "Menentukan jumlah butir hasil secara eksplisit dan terukur tanpa frasa ambigu.",
      "Menginstruksikan penyajian data dalam format tabel Markdown dengan spesifikasi kolom yang wajib diisi.",
      "Mengatur batas panjang kalimat atau kata agar respons tetap ringkas, fokus, dan padat.",
    ],
    keyPoints: [
      {
        title: "Tentukan Jumlah Butir Secara Eksplisit",
        description:
          "Sebutkan jumlah hasil yang diinginkan secara pasti agar AI menghasilkan respons sesuai kebutuhan. Gunakan instruksi yang spesifik, seperti “Sajikan tepat 5 ide kegiatan”, daripada instruksi yang tidak terukur, seperti “Berikan beberapa ide”.\n\nIntinya: jumlah yang eksplisit membantu mengontrol kuantitas output, meskipun AI tetap perlu diperiksa untuk memastikan jumlah dan isi hasilnya sesuai instruksi.",
        example: {
          bad: "Berikan beberapa ide konten edukasi.",
          good: "Sajikan tepat 5 ide konten edukasi tentang literasi digital untuk siswa SMA.",
          explanation:
            "Jumlah yang eksplisit membantu mengontrol kuantitas output secara terukur.",
        },
      },
      {
        title: "Gunakan Format Tabel dengan Kolom Spesifik",
        description:
          "Jika membutuhkan perbandingan atau data yang terstruktur, instruksikan AI untuk menyajikan hasil dalam bentuk tabel Markdown dan tentukan kolom yang wajib diisi. Dengan begitu, informasi lebih mudah dibaca, dibandingkan, dan dianalisis.\n\nIntinya: tentukan format dan kolom yang dibutuhkan agar hasil AI lebih terstruktur dan mudah digunakan.",
        example: {
          bad: "Bandingkan pembelajaran daring dan luring.",
          good: "Buat tabel untuk membandingkan pembelajaran daring dan luring dengan kolom: Aspek, Pembelajaran Daring, dan Pembelajaran Luring. Bandingkan minimal 5 aspek.",
          explanation:
            "Format tabel dan penentuan kolom membuat informasi lebih mudah dibaca, dibandingkan, dan dianalisis.",
        },
      },
      {
        title: "Atur Batas Panjang dan Tingkat Keringkasan",
        description:
          "Tentukan batas panjang jawaban agar respons AI tetap ringkas, fokus, dan sesuai kebutuhan. Gunakan instruksi yang terukur, seperti “Maksimal 2 kalimat per poin”, “Tepat 1 paragraf ringkas”, atau “Maksimal 100 kata”.\n\nIntinya: batas panjang membantu mengontrol detail dan keringkasan jawaban AI tanpa menghilangkan informasi penting.",
        example: {
          bad: "Jelaskan manfaat kecerdasan artifisial secara singkat.",
          good: "Jelaskan 3 manfaat kecerdasan artifisial untuk siswa SMA, maksimal 2 kalimat per manfaat.",
          explanation:
            "Batas panjang membantu mengontrol detail dan keringkasan jawaban AI tanpa menghilangkan informasi penting.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Pada sintesis visual, Output Control adalah penentuan medium artistik dan rasio kanvas: apakah disajikan sebagai foto dokumenter 35mm, lukisan minyak impasto, atau render 3D isometrik. Tanpa Output Control, AI bisa memilih gaya secara acak (misal: kamu mengharapkan foto nyata, tetapi AI menghasilkan kartun anime).",
    },
    tips: [
      "Kata kunci efektif: 'Tepat X butir', 'Format tabel markdown dengan kolom [A, B, C]', 'Maksimal N kata'.",
      "Tentukan urutan hierarki jika ada bagian wajib seperti ringkasan di awal dan glosarium di akhir.",
    ],
  },
  {
    id: "persona-audience",
    chapterNumber: 5,
    title: "5. Penerapan Persona dan Target Audiens",
    tag: "Persona & Audiens",
    badge: "Gaya & Karakter",
    iconName: "sun",
    summary:
      "Persona menentukan peran, keahlian, atau sudut pandang yang digunakan AI dalam menyusun respons. Sementara itu, Target Audiens menentukan siapa pembaca yang dituju sehingga AI dapat menyesuaikan pilihan kata, tingkat kerumitan bahasa, kedalaman penjelasan, dan analogi yang digunakan.\n\nContoh instruksi: “Bertindaklah sebagai guru Kecerdasan Artifisial. Jelaskan cara kerja AI kepada siswa SMA menggunakan bahasa sederhana, contoh sehari-hari, dan maksimal 150 kata.”\n\nIntinya: Persona menentukan AI harus berperan sebagai siapa, sedangkan Target Audiens menentukan jawaban ditujukan kepada siapa.",
    learningObjectives: [
      "Mendefinisikan persona AI secara operasional lengkap dengan karakteristik keahlian dan pendekatannya.",
      "Menentukan target audiens agar AI menyesuaikan kosakata, kedalaman materi, dan analogi.",
      "Menyelaraskan nada bicara (Tone of Voice) sesuai situasi dan konteks pembaca sasaran.",
    ],
    keyPoints: [
      {
        title: "Mendefinisikan Persona Secara Operasional",
        description:
          "Jangan hanya menentukan peran AI, seperti “Kamu adalah guru”. Jelaskan juga karakteristik, keahlian, dan pendekatan yang harus digunakan agar respons lebih sesuai dengan kebutuhan.\n\nIntinya: semakin jelas persona yang ditentukan, semakin terarah sudut pandang dan pendekatan AI dalam menyusun respons.",
        example: {
          bad: "Kamu adalah guru.",
          good: "Bertindaklah sebagai guru Informatika SMA yang ramah, komunikatif, dan senang menggunakan analogi sederhana untuk menjelaskan konsep teknis.",
          explanation:
            "Semakin jelas persona yang ditentukan, semakin terarah sudut pandang dan pendekatan AI dalam menyusun respons.",
        },
      },
      {
        title: "Menentukan Target Audiens",
        description:
          "Tentukan siapa yang akan membaca atau menerima hasil dari AI, misalnya siswa kelas 10 SMA, anak usia dini, atau masyarakat umum. Informasi ini membantu AI menyesuaikan pilihan kata, tingkat kerumitan penjelasan, kedalaman materi, dan contoh yang digunakan.\n\nIntinya: persona menentukan peran AI, sedangkan target audiens menentukan siapa yang menjadi sasaran responsnya.",
        example: {
          bad: "Jelaskan konsep kecerdasan artifisial.",
          good: "Jelaskan konsep kecerdasan artifisial kepada siswa kelas 10 SMA menggunakan bahasa sederhana dan contoh dari kehidupan sehari-hari.",
          explanation:
            "Persona menentukan peran AI, sedangkan target audiens menentukan siapa yang menjadi sasaran responsnya.",
        },
      },
      {
        title: "Menyelaraskan Nada Bicara (Tone of Voice)",
        description:
          "Tentukan gaya komunikasi yang ingin digunakan AI agar respons sesuai dengan tujuan dan situasi. Contohnya, kasual dan suportif, formal dan profesional, atau santai seperti teman belajar sebaya.\n\nIntinya: Tone of Voice mengatur bagaimana AI menyampaikan pesan, sehingga respons terasa sesuai dengan konteks dan pembacanya.",
        example: {
          bad: "Jelaskan materi ini dengan gaya bebas.",
          good: "Gunakan nada bicara yang santai, suportif, dan tidak menggurui. Hindari istilah teknis yang tidak perlu.",
          explanation:
            "Tone of Voice mengatur bagaimana AI menyampaikan pesan, sehingga respons terasa sesuai dengan konteks dan pembacanya.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Persona pada prompt gambar menetapkan sudut pandang estetika: 'disusun oleh direktur fotografi sinematik' atau 'gaya pelukis impresionis Claude Monet'. Audiens menentukan nuansa suasana: apakah gambar ditujukan sebagai ilustrasi edukasi anak yang ceria atau foto jurnalistik investigasi yang dramatis.",
    },
    tips: [
      "Awali dengan kalimat: 'Bertindaklah sebagai [Peran] yang memiliki keahlian dalam [Bidang]'.",
      "Hindari instruksi yang bertolak belakang, seperti 'jelaskan sangat detail tapi hanya dalam 1 kalimat'.",
    ],
  },
  {
    id: "prompt-diskusi",
    chapterNumber: 6,
    title: "6. Mengubah Prompt Perintah Menjadi Ajakan Diskusi",
    tag: "Ajakan Diskusi",
    badge: "Kolaboratif",
    iconName: "sparkles",
    summary:
      "Teknik mengubah komunikasi satu arah (perintah pasif) menjadi dialog interaktif dua arah (ajakan diskusi) untuk merangsang pemikiran kritis dan pemecahan masalah bersama.",
    learningObjectives: [
      "Mengubah pola perintah satu arah ('kerjakan untukku') menjadi dialog interaktif dua arah ('bimbing aku').",
      "Menjadikan AI sebagai mitra debat kritis (Socratic partner) untuk menguji kekuatan argumen.",
      "Menerapkan instruksi interaksi bertahap agar AI mengajukan pertanyaan reflektif sebelum memberi kesimpulan.",
    ],
    keyPoints: [
      {
        title: "Dari 'Kerjakan untukku' Menjadi 'Bimbing Aku'",
        description:
          "Prompt perintah satu arah langsung meminta hasil jadi sehingga kita kehilangan proses belajar. Prompt ajakan diskusi meminta AI mengajukan pertanyaan pancingan atau memberikan umpan balik langkah demi langkah.",
      },
      {
        title: "Menjadikan AI Sebagai Mitra Debat (Socratic Partner)",
        description:
          "Minta AI menantang sudut pandangmu, mencari celah argumen, atau mengajukan sudut pandang alternatif untuk menguji ketajaman gagasanmu.",
      },
      {
        title: "Instruksi Interaksi Bertahap",
        description:
          "Minta AI untuk berhenti di setiap akhir respons dengan satu pertanyaan refleksi, serta melarangnya memberikan seluruh kesimpulan sebelum kita memberikan tanggapan balik.",
        example: {
          bad: "Tuliskan esai lengkap tentang dampak kecerdasan buatan bagi masa depan pekerjaan anak muda.",
          good: "Aku sedang menyusun esai tentang tantangan kecerdasan buatan bagi siswa yang baru lulus sekolah. Bertindaklah sebagai mitra diskusi kritis. Pertama, ajukan 2 pertanyaan mendasar untuk membedah sudut pandangku. Jangan langsung menulis draf esainya, tunggu jawabanku sebelum kita lanjut ke argumen berikutnya.",
          explanation:
            "Prompt ini mengubah peran AI dari sekadar pembuat teks otomatis menjadi rekan diskusi aktif yang memandu daya nalar dan eksplorasi ide secara bertahap.",
        },
      },
    ],
    tebakGambarApplication: {
      title: "Penerapan pada Rekonstruksi Prompt Gambar",
      description:
        "Dalam permainan kelompok tebak gambar, metode dialog interaktif ini terjadi secara nyata di antara anggota tim saat sesi diskusi 60 detik: anggota saling bertanya 'Apa subjek utamanya?', 'Bagaimana arah pencahayaannya?', dan menguji draf prompt tebakan sebelum menekan tombol kirim.",
    },
    tips: [
      "Gunakan penutup seperti: 'Ajukan satu pertanyaan yang menantang ide ini', atau 'Uji argumen saya dengan sudut pandang yang berlawanan'.",
      "Manfaatkan pola diskusi bertahap ini saat menyusun rencana presentasi, persiapan debat, atau brainstorming karya inovasi.",
    ],
  },
];
