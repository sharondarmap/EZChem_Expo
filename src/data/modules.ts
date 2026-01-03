export type Module = {
  key: string
  title: string
  description: string
  simulationUrl: string
  videoUrl: string
  pdf: any
}

export const MODULES: Module[] = [
  {
    key: "atom",
    title: "Atom",
    description: "Memahami dasar-dasar atom dan molekul",
    simulationUrl:
      "https://www.labxchange.org/topic/chemistry-middle-the-atom",
    videoUrl: "https://youtu.be/HQmSM0X3U8g",
    pdf: require("../../assets/images/pdf/modul-kimia-atom.pdf"),
  },
  {
    key: "ikatan",
    title: "Ikatan Kimia",
    description: "Memahami berbagai jenis ikatan kimia",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:b2cd0ddb-06d8-4e98-8092-7f739ddaff9e",
    videoUrl:
      "https://youtube.com/playlist?list=PLAKmNBIaTKUeo44Ez523OVmXMAbQQby62",
    pdf: require("../../assets/images/pdf/modul-kimia-ikatan.pdf"),
  },
  {
    key: "periodik",
    title: "Sistem Periodik Unsur",
    description: "Mengenal struktur atom dan sistem periodik unsur.",
    simulationUrl:
      "https://www.labxchange.org/topic/chemistry-high-periodic-table",
    videoUrl: "https://youtu.be/yoBF5eNQlCc",
    pdf: require("../../assets/images/pdf/modul-kimia-periodik.pdf"),
  },
  {
    key: "persamaan",
    title: "Persamaan Kimia",
    description: "Mempelajari konsep molekul, mol, dan bagaimana menyeimbangkan persamaan kimia.",
    simulationUrl:
      "https://www.labxchange.org/topic/chemistry-middle-chemical-reactions",
    videoUrl: "https://youtu.be/MuGG4rVmA7E",
    pdf: require("../../assets/images/pdf/modul-kimia-persamaan.pdf"),
  },
  {
    key: "stoikiometri",
    title: "Stoikiometri",
    description: "Menghitung perbandingan zat dalam reaksi kimia.",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:35d5f88c-b419-4229-ae5f-156defaff820",
    videoUrl: "https://youtu.be/TCXiEtgFh5s",
    pdf: require("../../assets/images/pdf/modul-kimia-stoikiometri.pdf"),
  },
  {
    key: "gas",
    title: "Gas",
    description: "Memahami sifat-sifat gas dan hukum-hukum yang mengaturnya.",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:1f255415-8ff3-426c-a8ce-67ed82e4cd6e",
    videoUrl: "https://youtu.be/U_nknq-zHRI",
    pdf: require("../../assets/images/pdf/modul-kimia-gas.pdf"),
  },
  {
    key: "material",
    title: "Molekul dan Material",
    description: "Memahami hubungan antara struktur molekul dan sifat material.",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:dcac15e7-3352-444b-be81-21c79ed90686",
    videoUrl: "https://youtu.be/sA7DoBlEI2k",
    pdf: require("../../assets/images/pdf/modul-kimia-material.pdf"),
  },
  {
    key: "termokimia",
    title: "Termokimia",
    description: "Mempelajari perubahan energi dalam reaksi kimia.",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:635b966f-3e45-492a-b51f-a2836bc1889b",
    videoUrl:
      "https://youtube.com/playlist?list=PL2PAgVsFqpcCOUvvOV1frvPP47nxsaHtB",
    pdf: require("../../assets/images/pdf/modul-kimia-termokimia.pdf"),
  },
  {
    key: "elektrokimia",
    title: "Elektrokimia",
    description: "Memahami reaksi redoks dan sel elektrokimia.",
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:b5ead353-ffc4-4505-b899-5181e42cc52b",
    videoUrl: "https://youtu.be/SeJGDSPftdU",
    pdf: require("../../assets/images/pdf/modul-kimia-elektrokimia.pdf"),
  },
  {
    key: "termodinamika",
    title: "Termodinamika",
    description: "Menganalisis faktor-faktor yang mempengaruhi perubahan energi dalam reaksi.",
    simulationUrl:
      "https://phet.colorado.edu/in/simulations/reversible-reactions",
    videoUrl: "https://youtu.be/m3N3uHLniic",
    pdf: require("../../assets/images/pdf/modul-kimia-termodinamika.pdf"),
  },
  {
    key: "kesetimbangan",
    title: "Kesetimbangan Kimia",
    description: "Mempelajari kondisi kesetimbangan dan pergeserannya.",   
    simulationUrl:
      "https://www.labxchange.org/library/pathway/lx-pathway:0eeeecfb-60ae-4dfb-8e93-7b68725f4be9",
    videoUrl: "https://youtu.be/iyxnS2UJ3JM",
    pdf: require("../../assets/images/pdf/modul-kimia-kesetimbangan.pdf"),
  },
]
