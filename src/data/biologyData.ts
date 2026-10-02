import { BioEntity, QuizQuestion, ProkaryoteStructureDetail, InteractiveTask } from '../types/biology';

export const BIO_ENTITIES: BioEntity[] = [
  {
    id: 'atom',
    name: 'Atom',
    vietnameseName: 'Nguyên tử',
    category: 'atom',
    scaleLabel: '0,1 nm',
    scaleValueMeters: 1e-10,
    scaleLogPosition: -32,
    microscopeType: 'electron',
    microscopeLabel: 'Kính hiển vi điện tử (TEM / STM)',
    summary: 'Đơn vị cơ bản cấu tạo nên mọi vật chất vô cơ và hữu cơ trong tế bào sống.',
    description: 'Nguyên tử là cấp độ vi mô nhỏ nhất. Trong cơ thể sống, 4 nguyên tố chính (C, H, O, N) chiếm khoảng 96% khối lượng cơ thể, cùng các nguyên tố đại lượng và vi lượng khác tạo nên các hợp chất hữu cơ quan trọng.',
    keyFeatures: [
      'Đường kính khoảng 0,1 nm (1 Ångström)',
      'Gồm hạt nhân (proton, neutron) và lớp vỏ electron',
      'Quan sát được qua kính hiển vi quét chui hầm (STM)'
    ],
    dimensions: '~ 0,1 nm (10⁻¹⁰ m)',
    curriculumNotes: 'Sinh học 10 - Bài 3: Các nguyên tố hóa học và nước.',
    modelType: 'atom',
    position3D: [-32, 1.2, 0],
    color: '#c084fc'
  },
  {
    id: 'amino_acid',
    name: 'Amino Acid',
    vietnameseName: 'Amino acid',
    category: 'molecule',
    scaleLabel: '1 nm',
    scaleValueMeters: 1e-9,
    scaleLogPosition: -24,
    microscopeType: 'electron',
    microscopeLabel: 'Kính hiển vi điện tử / Tinh thể học X-ray',
    summary: 'Đơn phân cấu trúc của phân tử protein trong mọi sinh vật.',
    description: 'Amino acid có cấu trúc chung gồm nguyên tử cacbon trung tâm (Cα) liên kết với nhóm amin (-NH₂), nhóm carboxyl (-COOH), một nguyên tử hydro và gốc hydrocacbon R biến đổi. Có 20 loại amino acid phổ biến trong tự nhiên.',
    keyFeatures: [
      'Kích thước khoảng 0,8 - 1 nm',
      'Liên kết với nhau qua liên kết peptit (-CO-NH-)',
      'Xác định cấu trúc bậc một của chuỗi polypeptid'
    ],
    dimensions: '~ 1 nm (10⁻⁹ m)',
    curriculumNotes: 'Sinh học 10 - Bài 5: Các phân tử sinh học trong tế bào (Protein).',
    modelType: 'amino_acid',
    position3D: [-24, 1.8, 0],
    color: '#ef4444'
  },
  {
    id: 'protein',
    name: 'Protein',
    vietnameseName: 'Protein',
    category: 'macromolecule',
    scaleLabel: '10 nm',
    scaleValueMeters: 1e-8,
    scaleLogPosition: -16,
    microscopeType: 'electron',
    microscopeLabel: 'Kính hiển vi điện tử (Cryo-EM) / Nhiễu xạ tia X',
    summary: 'Đại phân tử sinh học đa chức năng: mô hình ruy băng 3D (Cartoon Ribbon) của Albumin huyết thanh người (HSA, PDB: 1E7H).',
    description: 'Mô hình không gian 3D dạng ruy băng (Cartoon ribbon) chuẩn của Albumin huyết thanh người (HSA - PDB: 1E7H). Cấu trúc gồm 67% các chuỗi xoắn alpha (α-helix, dải ruy băng dẹt xoắn ốc màu đỏ), 23% các vòng lặp uốn khúc liên kết (loops/turns, ống màu xanh lá cây) và các phân tử phối tử/axit béo liên kết (chuỗi hạt cầu CPK màu trắng ngọc) nằm sâu trong các túi liên kết kỵ nước.',
    keyFeatures: [
      'Kích thước thực nghiệm: ~ 8 × 8 × 3 nm (thang đo chuẩn 10 nm, 66,5 kDa)',
      'Dạng ruy băng xoắn α màu đỏ cuộn gập thành 3 thùy chính (Domain I, II, III)',
      'Các chuỗi hạt cầu CPK màu trắng mô phỏng các phân tử axit béo (Fatty acids) được vận chuyển',
      'Đảm nhiệm duy trì 80% áp suất thẩm thấu keo trong huyết tương và chuyên chở các chất'
    ],
    dimensions: '~ 8 - 10 nm',
    curriculumNotes: 'Sinh học 10 - Bài 5: Các phân tử sinh học trong tế bào (Cấu trúc bậc 2, bậc 3 & 4 của protein).',
    modelType: 'protein',
    position3D: [-16, 7.8, 0],
    color: '#dc2626'
  },
  {
    id: 'virus',
    name: 'Virus',
    vietnameseName: 'Virus',
    category: 'virus',
    scaleLabel: '100 nm',
    scaleValueMeters: 1e-7,
    scaleLogPosition: -8,
    microscopeType: 'electron',
    microscopeLabel: 'Kính hiển vi điện tử',
    summary: 'Thực thể di truyền chưa có cấu tạo tế bào, ký sinh nội bào bắt buộc.',
    description: 'Virus có kích thước siêu vi thể (20 - 400 nm), chỉ quan sát được dưới kính hiển vi điện tử. Cấu tạo cơ bản gồm lõi axit nucleic (ADN hoặc ARN) và vỏ protein (capsid). Nhiều virus có thêm lớp vỏ ngoài lipid cùng các gai glycoprotein để nhận diện tế bào chủ.',
    keyFeatures: [
      'Kích thước khoảng 80 - 120 nm (ví dụ Coronavirus, Cúm, HIV)',
      'Không thể tự nhân lên bên ngoài tế bào vật chủ',
      'Không có chuyển hóa trao đổi chất độc lập'
    ],
    dimensions: '~ 100 nm (0,1 µm)',
    curriculumNotes: 'Sinh học 10 - Chương 7: Virus và các ứng dụng.',
    modelType: 'virus',
    position3D: [-8, 2.0, 0],
    color: '#10b981'
  },
  {
    id: 'chloroplast',
    name: 'Chloroplast',
    vietnameseName: 'Lục lạp',
    category: 'organelle',
    scaleLabel: '5 µm',
    scaleValueMeters: 5e-6,
    scaleLogPosition: -3.0,
    microscopeType: 'optical',
    microscopeLabel: 'Kính hiển vi quang học & điện tử',
    summary: 'Bào quan quang hợp màng kép: hệ thống hạt Grana xếp chồng, thylakoid cơ chất và chất nền Stroma.',
    description: 'Mô hình không gian 3D cấu tạo lục lạp (Chloroplast) theo chuẩn Sinh học 10. Mặt cắt thể hiện màng kép với lớp vỏ ngoài xanh thẫm, mép cắt màng kép màu xanh nõn chuối viền vàng và khoang chất nền (Stroma). Bên trong là hệ thống các hạt Grana gồm các túi dẹp thylakoid xếp chồng thành từng cột chứa diệp lục, nối với nhau bởi các cầu thylakoid cơ chất (stromal lamellae), cùng ADN vòng kép và ribosome 70S riêng.',
    keyFeatures: [
      'Kích thước dài khoảng 4 - 10 µm, rộng 2 - 4 µm (thang đo 5 µm)',
      'Hệ thống màng kép: màng ngoài, màng trong và mép cắt hai lớp rõ rệt',
      'Các hạt Grana: gồm các túi dẹp thylakoid xếp chồng như cột tiền xu thực hiện pha sáng quang hợp',
      'Màng thylakoid cơ chất (stroma lamellae) liên kết các hạt Grana thành mạng lưới',
      'Chất nền Stroma chứa ADN vòng kép và ribosome 70S (bằng chứng nguồn gốc nội cộng sinh)'
    ],
    dimensions: '~ 5 - 8 µm',
    curriculumNotes: 'Sinh học 10 - Bài 8 & 9: Cấu trúc tế bào nhân thực (Lục lạp & Quang hợp).',
    modelType: 'chloroplast',
    position3D: [-3.0, 7.2, 0],
    color: '#84cc16'
  },
  {
    id: 'bacteria',
    name: 'Bacterium (E. coli)',
    vietnameseName: 'Vi khuẩn',
    category: 'prokaryote',
    scaleLabel: '1 µm',
    scaleValueMeters: 1e-6,
    scaleLogPosition: 2.2,
    microscopeType: 'optical',
    microscopeLabel: 'Kính hiển vi quang học & điện tử',
    summary: 'Tế bào nhân sơ đơn bào điển hình (Prokaryote) với cấu tạo 3 lớp vỏ, ADN vùng nhân và hệ thống lông roi sinh học.',
    description: 'Mô hình không gian 3D cấu tạo tế bào vi khuẩn (nhân sơ / Prokaryote) hoàn chỉnh theo chuẩn Sinh học 10. Mặt cắt 3/4 thể hiện rõ 3 lớp vỏ bọc: Vỏ nhầy (capsule bảo vệ), thành tế bào peptidoglycan và màng sinh chất. Bên trong chứa tế bào chất, các hạt ribosome 70S tổng hợp protein, chuỗi ADN vùng nhân xoắn kép siêu cuộn và vòng plasmid. Phía cực sau có chùm roi (flagella) bơi lội cắm vào thể gốc và toàn thân phủ dày đặc lông nhung (pili/fimbriae).',
    keyFeatures: [
      'Kích thước chuẩn vi khuẩn: ~ 1 - 3 µm (thang đo 1 µm)',
      'Vỏ bọc 3 lớp: Vỏ nhầy ngoài cùng, thành peptidoglycan và màng sinh chất bên trong',
      'Chưa có màng nhân: ADN dạng vòng kép siêu cuộn tự do trong tế bào chất',
      'Chùm roi cực (flagella) xoắn lượn bơi lội và hệ thống lông nhung (pili) bám dính'
    ],
    dimensions: '~ 1 - 3 µm',
    curriculumNotes: 'Sinh học 10 - Bài 7: Tế bào nhân sơ (Cấu tạo và vai trò kích thước nhỏ).',
    modelType: 'bacteria',
    position3D: [2.2, 1.4, 0],
    color: '#06b6d4'
  },
  {
    id: 'animal_cell',
    name: 'Animal Cell',
    vietnameseName: 'Tế bào động vật',
    category: 'eukaryote',
    scaleLabel: '10 µm',
    scaleValueMeters: 1.5e-5,
    scaleLogPosition: 12.0,
    microscopeType: 'optical',
    microscopeLabel: 'Kính hiển vi quang học & điện tử',
    summary: 'Tế bào nhân thực điển hình với màng sinh chất mềm dẻo, nhân hoàn chỉnh và hệ thống nội màng phức tạp.',
    description: 'Mô hình không gian 3D tế bào động vật chuẩn xác theo mẫu Sketchfab (te-bao-ong-vat). Cấu tạo gồm màng sinh chất viền hồng san hô bao quanh tế bào chất màu xanh bạc hà. Đánh số 6 cấu trúc trọng tâm: (1) Dịch nhân, (2) Nhân con hạch nhân, (3) Lưới nội chất hạt đính ribosome hồng, (4) Bộ máy Golgi màu đỏ dưa hấu kèm túi tiết, (5) Ty thể bổ cắt lộ mào cristae cam, (6) Lưới nội chất trơn dạng ống tím, cùng cặp trung tử vàng vuông góc.',
    keyFeatures: [
      'Kích thước khoảng 10 - 25 µm (thang đo chuẩn 10 µm)',
      '① Dịch nhân & ② Nhân con: Chứa vật chất di truyền và tổng hợp tiền ribosome',
      '③ Lưới nội chất hạt: Xếp nếp xanh chàm đính dày đặc các hạt ribosome hồng tổng hợp protein',
      '④ Bộ máy Golgi: Các túi dẹp đỏ uốn cong phân loại, chế biến và đóng gói sản phẩm',
      '⑤ Ty thể: Bào quan tạo ATP với mào cristae màu cam gấp nếp tăng diện tích',
      '⑥ Lưới nội chất trơn: Hệ thống ống tím tổng hợp lipid, chuyển hóa đường và khử độc',
      'Trung thể (Centrosome): Gồm 2 trung tử vàng xếp vuông góc 90° tham gia phân bào'
    ],
    dimensions: '~ 10 - 25 µm',
    curriculumNotes: 'Sinh học 10 - Bài 8 & 9: Cấu trúc tế bào nhân thực (Tế bào động vật).',
    modelType: 'animal_cell',
    position3D: [12.0, 8.0, 0],
    color: '#f43f5e'
  },
  {
    id: 'plant_cell',
    name: 'Plant Cell',
    vietnameseName: 'Tế bào thực vật',
    category: 'eukaryote',
    scaleLabel: '30 µm',
    scaleValueMeters: 3e-5,
    scaleLogPosition: 18.0,
    microscopeType: 'optical',
    microscopeLabel: 'Kính hiển vi quang học & điện tử',
    summary: 'Tế bào nhân thực thành cellulose cứng cáp, không bào trung tâm khổng lồ, lục lạp quang hợp và nhân lệch tâm.',
    description: 'Mô hình không gian 3D tế bào thực vật chuẩn xác theo chương trình Sinh học 10. Cấu tạo đặc trưng bởi thành tế bào xenlulôzơ đa tầng vững chắc có cầu sinh chất kết nối, không bào trung tâm khổng lồ chiếm phần lớn thể tích tế bào tạo áp suất trương nước, đẩy nhân tế bào lệch sát về một góc màng. Đánh số 7 cấu trúc trọng tâm: (1) Thành tế bào & Cầu sinh chất, (2) Không bào trung tâm & Màng tonoplast, (3) Lục lạp với các hạt Grana, (4) Nhân & Hạch nhân lệch tâm, (5) Lưới nội chất RER/SER, (6) Ty thể màng gấp cristae, (7) Bộ máy Golgi (Dictyosome).',
    keyFeatures: [
      'Kích thước khoảng 20 - 50 µm (thang đo chuẩn 30 µm)',
      '① Thành tế bào Xenlulôzơ & Cầu sinh chất (Plasmodesmata): Vách cứng giữ hình dạng tế bào và kênh liên bào',
      '② Không bào trung tâm (Large Central Vacuole): Chiếm tới 60 - 80% thể tích, tích trữ nước và khoáng',
      '③ Lục lạp (Chloroplast): Bào quan quang hợp chứa sắc tố diệp lục, chất nền stroma và hạt grana',
      '④ Nhân tế bào (Nucleus): Bị không bào lớn chèn ép đẩy sát về một góc tế bào, màng kép tím có lỗ nhân',
      '⑤ Lưới nội chất (RER & SER): Hệ thống túi dẹp đính ribosome tổng hợp protein và ống trơn tổng hợp lipid',
      '⑥ Ty thể (Mitochondria): Hô hấp hiếu khí tạo ATP cho các hoạt động sống của thực vật',
      '⑦ Bộ máy Golgi / Dictyosome: Chế biến, đóng gói đại phân tử và tổng hợp vật liệu xây dựng thành tế bào'
    ],
    dimensions: '~ 20 - 50 µm',
    curriculumNotes: 'Sinh học 10 - Bài 8 & 9: So sánh tế bào động vật và thực vật (Sự khác biệt về thành, không bào, lục lạp và trung thể).',
    modelType: 'plant_cell',
    position3D: [18.0, 1.8, 0],
    color: '#16a34a'
  },
  {
    id: 'human_egg',
    name: 'Human Ovum',
    vietnameseName: 'Tế bào trứng người',
    category: 'eukaryote',
    scaleLabel: '100 µm',
    scaleValueMeters: 1.2e-4,
    scaleLogPosition: 26.0,
    microscopeType: 'optical',
    microscopeLabel: 'Kính hiển vi quang học (chạm ngưỡng mắt thường)',
    summary: 'Tế bào lớn nhất trong cơ thể người, có thể vừa đủ nhìn thấy như một chấm nhỏ.',
    description: 'Tế bào trứng người (noãn cầu) có đường kính khoảng 100 - 120 µm. Noãn cầu giàu chất dinh dưỡng, bên ngoài có màng trong suốt (zona pellucida) và lớp tế bào hạt phóng xạ (corona radiata) bảo vệ và dẫn truyền tín hiệu thụ tinh.',
    keyFeatures: [
      'Đường kính khoảng 0,1 - 0,12 mm (100 - 120 µm)',
      'Tế bào đơn lẻ lớn nhất ở người',
      'Được quan sát rõ nét dưới kính hiển vi soi nổi hoặc quang học'
    ],
    dimensions: '~ 100 - 120 µm (0,1 mm)',
    curriculumNotes: 'Sinh học 10 - Bài 12: Giảm phân và hình thành giao tử.',
    modelType: 'human_egg',
    position3D: [26.0, 1.0, 0],
    color: '#e2e8f0'
  },
  {
    id: 'frog_egg',
    name: 'Frog Egg',
    vietnameseName: 'Tế bào trứng ếch',
    category: 'macro',
    scaleLabel: '1 mm',
    scaleValueMeters: 1e-3,
    scaleLogPosition: 34.0,
    microscopeType: 'naked_eye',
    microscopeLabel: 'Mắt thường (Không cần kính hiển vi)',
    summary: 'Tế bào đơn lẻ kích thước lớn cỡ milimet, hoàn toàn quan sát được bằng mắt thường.',
    description: 'Trứng ếch là ví dụ kinh điển trong sinh học phát triển. Tế bào trứng có đường kính khoảng 1 - 2 mm, có màng nhầy keo bao bọc. Trứng phân cực rõ rệt: cực động vật màu xám đen chứa nhân và ít noãn hoàng, cực thực vật màu trắng ngà chứa nhiều noãn hoàng.',
    keyFeatures: [
      'Đường kính từ 1 mm đến 2 mm',
      'Mắt người bình thường có thể nhìn thấy rõ từng quả trứng',
      'Hai nửa phân cực: cực động vật (đen) và cực thực vật (sáng)'
    ],
    dimensions: '~ 1 - 2 mm (1000 - 2000 µm)',
    curriculumNotes: 'Sinh học 10 - Giới hạn kích thước tế bào và khả năng quan sát của mắt người.',
    modelType: 'frog_egg',
    position3D: [34.0, 2.2, 0],
    color: '#1e293b'
  }
];

export const PROKARYOTE_STRUCTURES: ProkaryoteStructureDetail[] = [
  {
    id: 'capsule',
    name: 'Capsule / Glycocalyx',
    vietnameseName: 'Vỏ nhầy',
    location: 'Lớp ngoài cùng bao bọc thành tế bào (ở một số loài vi khuẩn)',
    chemicalComposition: 'Polysaccharide hoặc Polypeptide nhầy',
    functionText: 'Bảo vệ vi khuẩn khỏi sự thực bào của bạch cầu, chống mất nước và hỗ trợ bám dính vào bề mặt cơ chất/tế bào vật chủ.',
    curriculumNotes: 'Sinh học 10 (Kết nối tri thức): Không phải mọi vi khuẩn đều có vỏ nhầy. Vi khuẩn có vỏ nhầy thường có độc lực cao hơn.',
    color: '#38bdf8', // Light sky blue
    defaultVisible: true,
    canExplode: true,
    layerIndex: 0
  },
  {
    id: 'cell_wall',
    name: 'Cell Wall',
    vietnameseName: 'Thành tế bào',
    location: 'Nằm phía ngoài màng sinh chất và phía trong vỏ nhầy',
    chemicalComposition: 'Peptidoglycan (mạng lưới đường amin liên kết peptit)',
    functionText: 'Duy trì hình dạng ổn định của tế bào, chống lại áp suất thẩm thấu nội bào ngăn tế bào không bị vỡ trong môi trường nhược trương.',
    curriculumNotes: 'Sinh học 10: Chia vi khuẩn thành 2 nhóm lớn: Gram dương (Gram+) có thành peptidoglycan dày bắt màu tím; Gram âm (Gram-) có thành mỏng và lớp màng ngoài chứa LPS bắt màu đỏ.',
    color: '#22c55e', // Emerald green
    defaultVisible: true,
    canExplode: true,
    layerIndex: 1
  },
  {
    id: 'plasma_membrane',
    name: 'Plasma Membrane',
    vietnameseName: 'Màng sinh chất',
    location: 'Nằm ngay phía trong thành tế bào, bao bọc khối tế bào chất',
    chemicalComposition: 'Lớp kép phospholipid và các phân tử protein khảm động',
    functionText: 'Kiểm soát chọn lọc sự vận chuyển các chất ra vào tế bào; nơi định vị chuỗi enzyme hô hấp tế bào và quang hợp (ở vi khuẩn quang hợp).',
    curriculumNotes: 'Sinh học 10: Không chứa cholesterol như ở tế bào động vật. Đóng vai trò trao đổi chất và chuyển hóa năng lượng ATP.',
    color: '#eab308', // Amber yellow
    defaultVisible: true,
    canExplode: true,
    layerIndex: 2
  },
  {
    id: 'cytoplasm',
    name: 'Cytoplasm / Cytosol',
    vietnameseName: 'Tế bào chất',
    location: 'Vùng không gian nằm bên trong màng sinh chất',
    chemicalComposition: 'Bào tương (nước, ion vô cơ, hợp chất hữu cơ), các hạt dự trữ và ribosome',
    functionText: 'Là nơi diễn ra hầu hết các phản ứng hóa sinh chuyển hóa vật chất và năng lượng duy trì sự sống của tế bào vi khuẩn.',
    curriculumNotes: 'Sinh học 10: Chưa có hệ thống nội màng, không có khung xương tế bào và không có các bào quan có màng bọc như ty thể, lục lạp, lưới nội chất.',
    color: '#4ade80', // Mint green translucent
    defaultVisible: true,
    canExplode: true,
    layerIndex: 3
  },
  {
    id: 'ribosome',
    name: '70S Ribosome',
    vietnameseName: 'Ribosome 70S',
    location: 'Phân bố tự do với số lượng hàng ngàn hạt rải rác trong tế bào chất',
    chemicalComposition: 'rRNA kết hợp với protein; gồm tiểu phần lớn 50S và tiểu phần nhỏ 30S',
    functionText: 'Là "nhà máy" tổng hợp protein của tế bào thông qua quá trình dịch mã chuỗi thông tin từ mRNA.',
    curriculumNotes: 'Sinh học 10: Ribosome là bào quan duy nhất ở tế bào nhân sơ, là cấu trúc KHÔNG CÓ MÀNG bao bọc. Kích thước 70S nhỏ hơn ribosome 80S của tế bào nhân thực.',
    color: '#f43f5e', // Bright Rose Red
    defaultVisible: true,
    canExplode: false,
    layerIndex: 3
  },
  {
    id: 'nucleoid',
    name: 'Nucleoid / Bacterial Chromosome',
    vietnameseName: 'Vùng nhân (ADN vi khuẩn)',
    location: 'Khu vực trung tâm tế bào chất, không có màng nhân bao bọc',
    chemicalComposition: 'Một phân tử ADN xoắn kép dạng vòng đơn độc duy nhất',
    functionText: 'Chứa toàn bộ thông tin di truyền điều khiển mọi hoạt động sống, sinh trưởng, phát triển và sinh sản của tế bào vi khuẩn.',
    curriculumNotes: 'Sinh học 10: Đặc trưng cốt lõi của tế bào nhân sơ (tiền nhân) là CHƯA CÓ NHÂN HOÀN CHỈNH, ADN không được bao bọc bởi màng nhân và không liên kết với protein histon như ở nhân thực.',
    color: '#a855f7', // Glowing Violet Purple
    defaultVisible: true,
    canExplode: true,
    layerIndex: 4
  },
  {
    id: 'plasmid',
    name: 'Plasmid DNA',
    vietnameseName: 'Plasmid',
    location: 'Nằm độc lập trong tế bào chất (ngoài vùng nhân)',
    chemicalComposition: 'Các phân tử ADN dạng vòng nhỏ kép (vài nghìn cặp bazơ)',
    functionText: 'Mang các gen bổ trợ mang lại lợi thế thích nghi sinh tồn, đặc biệt là gen kháng thuốc kháng sinh; có thể nhân đôi độc lập với ADN vùng nhân.',
    curriculumNotes: 'Sinh học 10: Không phải là vật chất di truyền bắt buộc (vi khuẩn mất plasmid vẫn sống bình thường). Được ứng dụng làm thể truyền trong công nghệ gen tái tổ hợp.',
    color: '#fbbf24', // Golden yellow loop
    defaultVisible: true,
    canExplode: false,
    layerIndex: 3
  },
  {
    id: 'flagellum',
    name: 'Flagellum',
    vietnameseName: 'Roi (Tiên mao)',
    location: 'Nhô ra từ màng sinh chất và thành tế bào ở một hoặc hai cực tế bào',
    chemicalComposition: 'Protein Flagellin hình sợi xoắn',
    functionText: 'Xoay tròn như chân vịt động cơ phản lực, tạo lực đẩy giúp vi khuẩn chuyển động bơi lội và hướng hóa (tìm thức ăn, tránh độc tố).',
    curriculumNotes: 'Sinh học 10: Bộ phận vận động chính của vi khuẩn. Số lượng và vị trí roi thay đổi tùy loài (đơn mao, chùm mao, chu mao).',
    color: '#0284c7', // Cyan Blue
    defaultVisible: true,
    canExplode: false,
    layerIndex: 0
  },
  {
    id: 'pili',
    name: 'Pili / Fimbriae',
    vietnameseName: 'Lông (Pili)',
    location: 'Hàng trăm sợi tơ ngắn mảnh bao phủ khắp bề mặt vỏ tế bào',
    chemicalComposition: 'Protein Pilin hình ống rỗng',
    functionText: 'Giúp vi khuẩn bám chặt vào bề mặt giá thể, niêm mạc tế bào chủ; lông tiếp hợp (sex pili) tham gia chuyển giao plasmid giữa hai vi khuẩn.',
    curriculumNotes: 'Sinh học 10: Ngắn và mảnh hơn nhiều so với roi. Đóng vai trò quan trọng trong việc hình thành màng sinh học (biofilm) và nhiễm khuẩn.',
    color: '#67e8f9', // Cyan Sky
    defaultVisible: true,
    canExplode: false,
    layerIndex: 0
  }
];

export const BACTERIA_ANATOMY_PARTS = PROKARYOTE_STRUCTURES.map(p => ({
  id: p.id,
  name: p.vietnameseName,
  role: p.name,
  description: p.functionText,
  color: p.color
}));

export const STUDENT_INTERACTIVE_TASKS: InteractiveTask[] = [
  // Dạng 1: Tìm cấu trúc trên mô hình 3D
  {
    id: 'task_1',
    type: 'identify_3d',
    title: 'Dạng 1: Nhận diện cấu trúc di truyền',
    question: 'Hãy nhấp chuột trực tiếp vào cấu trúc mang thông tin di truyền chính điều khiển mọi hoạt động sống của tế bào vi khuẩn trên mô hình 3D.',
    targetStructureId: 'nucleoid',
    explanation: 'Chính xác! Vùng nhân (Nucleoid) chứa một phân tử ADN xoắn kép dạng vòng duy nhất, không có màng nhân bao bọc.'
  },
  {
    id: 'task_1b',
    type: 'identify_3d',
    title: 'Dạng 1: Nhận diện bộ phận vận động',
    question: 'Hãy nhấp chuột vào bộ phận giúp vi khuẩn chuyển động bơi lội linh hoạt trong môi trường lỏng.',
    targetStructureId: 'flagellum',
    explanation: 'Chính xác! Roi (Flagellum) cấu tạo từ protein flagellin, xoay tròn tạo lực đẩy giúp tế bào di chuyển hướng hóa.'
  },
  {
    id: 'task_1c',
    type: 'identify_3d',
    title: 'Dạng 1: Nhận diện lớp định hình tế bào',
    question: 'Hãy nhấp chuột vào lớp cấu trúc làm từ peptidoglycan có nhiệm vụ quy định hình dạng và bảo vệ cơ học cho vi khuẩn.',
    targetStructureId: 'cell_wall',
    explanation: 'Chính xác! Thành tế bào (Cell wall) cấu tạo từ Peptidoglycan giúp vi khuẩn không bị vỡ do áp suất thẩm thấu.'
  },

  // Dạng 2: Ghép cấu trúc với chức năng (Kéo thả / Ghép cặp)
  {
    id: 'task_2',
    type: 'match_pairs',
    title: 'Dạng 2: Ghép cấu trúc với chức năng tương ứng',
    question: 'Em hãy ghép từng cấu trúc của tế bào vi khuẩn với chức năng sinh học chính xác của nó:',
    pairs: [
      { id: 'flagellum', structure: 'Roi (Flagellum)', func: 'Giúp tế bào di chuyển và bơi lội' },
      { id: 'ribosome', structure: 'Ribosome 70S', func: 'Nơi tổng hợp protein cho tế bào' },
      { id: 'cell_wall', structure: 'Thành tế bào', func: 'Duy trì hình dạng và bảo vệ cơ học' },
      { id: 'nucleoid', structure: 'Vùng nhân', func: 'Chứa ADN mang thông tin di truyền' },
      { id: 'capsule', structure: 'Vỏ nhầy', func: 'Bảo vệ chống thực bào và hỗ trợ bám dính' },
      { id: 'plasmid', structure: 'Plasmid', func: 'Mang gen kháng thuốc kháng sinh bổ trợ' }
    ],
    explanation: 'Rất tốt! Bạn đã nắm chắc mối liên hệ mật thiết giữa cấu trúc không gian và chức năng sinh học của tế bào nhân sơ theo đúng SGK Sinh học 10.'
  },

  // Dạng 3: Sắp xếp thứ tự tách lớp
  {
    id: 'task_3',
    type: 'sort_layers',
    title: 'Dạng 3: Sắp xếp các lớp từ ngoài vào trong',
    question: 'Em hãy sắp xếp thứ tự đúng của các lớp cấu trúc tế bào nhân sơ theo chiều từ NGOÀI CÙNG vào TRONG CÙNG:',
    layersToSort: [
      { id: 'capsule', name: '1. Vỏ nhầy (Capsule)' },
      { id: 'cell_wall', name: '2. Thành tế bào (Peptidoglycan)' },
      { id: 'plasma_membrane', name: '3. Màng sinh chất (Phospholipid kép)' },
      { id: 'cytoplasm', name: '4. Tế bào chất (Cytoplasm & Ribosome)' },
      { id: 'nucleoid', name: '5. Vùng nhân (ADN xoắn kép dạng vòng)' }
    ],
    correctAnswer: ['capsule', 'cell_wall', 'plasma_membrane', 'cytoplasm', 'nucleoid'],
    explanation: 'Chính xác hoàn toàn! Thứ tự bóc tách chuẩn từ ngoài vào trong: Vỏ nhầy → Thành tế bào → Màng sinh chất → Tế bào chất → Vùng nhân.'
  },

  // Dạng 4: Tình huống thực tiễn
  {
    id: 'task_4',
    type: 'scenario',
    title: 'Dạng 4: Tình huống y sinh học thực tiễn',
    question: 'Kháng sinh nhóm Penicillin có cơ chế ức chế quá trình tổng hợp peptidoglycan. Nếu bệnh nhân bị nhiễm vi khuẩn, tại sao Penicillin lại tiêu diệt được vi khuẩn mà không làm tổn thương tế bào người?',
    options: [
      'Vì nồng độ Penicillin quá thấp nên không ảnh hưởng đến người',
      'Vì tế bào người là tế bào nhân thực hoàn toàn KHÔNG CÓ thành tế bào Peptidoglycan',
      'Vì tế bào người có vỏ nhầy che chắn bảo vệ',
      'Vì gan người phân giải Penicillin tức thời'
    ],
    correctAnswer: 1,
    explanation: 'Chính xác! Tế bào người là tế bào động vật không có thành tế bào peptidoglycan, trong khi vi khuẩn sống sót nhờ thành peptidoglycan chống áp suất thẩm thấu. Khi mất thành, vi khuẩn hút nước và vỡ tung.'
  },
  {
    id: 'task_4b',
    type: 'scenario',
    title: 'Dạng 4: Tình huống vi khuẩn mất roi',
    question: 'Nếu một đột biến làm vi khuẩn bị mất hoàn toàn khả năng tổng hợp roi (flagellum), chức năng nào của tế bào sẽ bị ảnh hưởng trực tiếp?',
    options: [
      'Không thể nhân đôi ADN và phân bào',
      'Không thể tổng hợp protein',
      'Không thể di chuyển chủ động hướng tới nguồn dinh dưỡng',
      'Bị vỡ tung do áp suất thẩm thấu của môi trường'
    ],
    correctAnswer: 2,
    explanation: 'Roi là cơ quan vận động. Mất roi vi khuẩn vẫn sống sót và phân chia được nhưng mất khả năng bơi lội và chuyển động hướng hóa.'
  },

  // Dạng 5: So sánh Nhân sơ & Nhân thực
  {
    id: 'task_5',
    type: 'compare_task',
    title: 'Dạng 5: So sánh Tế bào Nhân sơ & Nhân thực',
    question: 'Cấu trúc nào dưới đây có mặt ở cả tế bào nhân sơ VÀ tế bào nhân thực?',
    options: [
      'Màng nhân bao bọc vật chất di truyền',
      'Ribosome tổng hợp protein',
      'Ty thể sản sinh năng lượng ATP',
      'Lưới nội chất hạt và bộ máy Golgi'
    ],
    correctAnswer: 1,
    explanation: 'Cả tế bào nhân sơ và nhân thực đều có Ribosome (nhân sơ dùng 70S, nhân thực dùng 80S) để dịch mã tổng hợp protein. Các bào quan có màng bọc như màng nhân, ty thể, Golgi chỉ có ở tế bào nhân thực.'
  },

  // Dạng 6: Thử thách ẩn danh
  {
    id: 'task_6',
    type: 'mystery_challenge',
    title: 'Dạng 6: Thử thách cấu trúc bí ẩn',
    question: 'Cấu trúc bí ẩn này là một bào quan duy nhất có mặt trong tế bào vi khuẩn, có kích thước hiển vi 70S và KHÔNG CÓ MÀNG BAO BỌC. Cấu trúc này là gì?',
    options: [
      'Lysosome',
      'Ribosome',
      'Trung thể',
      'Không bào'
    ],
    correctAnswer: 1,
    explanation: 'Đó chính là Ribosome! Ribosome 70S là bào quan không có màng bao bọc duy nhất ở tế bào nhân sơ, thực hiện chức năng tổng hợp protein sống còn.'
  }
];


export const BIOLOGY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Tại sao vi khuẩn (tế bào nhân sơ) lại có kích thước rất nhỏ (khoảng 1 - 3 µm)?',
    options: [
      'Để tránh bị các động vật nguyên sinh ăn thịt',
      'Kích thước nhỏ giúp tỉ lệ S/V lớn, tăng tốc độ trao đổi chất và phân chia nhanh',
      'Vì vi khuẩn thiếu chất dinh dưỡng để phát triển to lớn',
      'Để dễ dàng xuyên qua màng tế bào của mọi sinh vật'
    ],
    correctAnswer: 1,
    explanation: 'Kích thước nhỏ làm cho tỉ lệ diện tích bề mặt trên thể tích (S/V) lớn, giúp vi khuẩn trao đổi chất với môi trường cực nhanh, sinh trưởng và sinh sản rất nhanh.'
  },
  {
    id: 2,
    question: 'Để quan sát được cấu trúc chi tiết của Virus (khoảng 100 nm) hoặc Protein (10 nm), bắt buộc phải dùng công cụ nào?',
    options: [
      'Kính lúp cầm tay độ phóng đại cao',
      'Kính hiển vi quang học có độ phóng đại 1500 lần',
      'Kính hiển vi điện tử (TEM / SEM)',
      'Mắt thường có rọi đèn laser'
    ],
    correctAnswer: 2,
    explanation: 'Giới hạn độ phân giải của kính hiển vi quang học bị giới hạn bởi bước sóng ánh sáng khả kiến (~200 nm). Để quan sát cấu trúc dưới 200 nm như Virus (~100 nm) hay Protein (~10 nm), bắt buộc phải sử dụng kính hiển vi điện tử với chùm electron có bước sóng siêu ngắn.'
  },
  {
    id: 3,
    question: 'Đặc điểm nào dưới đây là đặc trưng cốt lõi của tế bào nhân sơ (Prokaryote) so với tế bào nhân thực (Eukaryote)?',
    options: [
      'Không có màng nhân bao bọc vật chất di truyền và không có hệ thống bào quan có màng bọc',
      'Không có màng sinh chất và không có ADN',
      'Không có ribosome để tổng hợp protein',
      'Không có khả năng di chuyển hay sinh sản'
    ],
    correctAnswer: 0,
    explanation: 'Tế bào nhân sơ (tiền nhân) chưa có màng nhân ngăn cách ADN với tế bào chất (chỉ là vùng nhân), tế bào chất không có hệ thống nội màng và các bào quan có màng bọc (như ty thể, lục lạp, Golgi).'
  },
  {
    id: 4,
    question: 'Thành phần hóa học chính cấu tạo nên thành tế bào của hầu hết các loài vi khuẩn là gì?',
    options: [
      'Cellulose (Xenlulôzơ)',
      'Chitin (Kitin)',
      'Peptidoglycan',
      'Phospholipid và Cholesterol'
    ],
    correctAnswer: 2,
    explanation: 'Thành tế bào vi khuẩn cấu tạo từ peptidoglycan (chuỗi polysaccarit liên kết với các đoạn peptit ngắn). Thành tế bào thực vật là xenlulôzơ, nấm là kitin.'
  },
  {
    id: 5,
    question: 'Cấu trúc nào sau đây của vi khuẩn thường chứa gen mang đặc tính kháng thuốc kháng sinh?',
    options: [
      'Vỏ nhầy (Capsule)',
      'Plasmid ADN',
      'Ribosome 70S',
      'Lông bám (Pili)'
    ],
    correctAnswer: 1,
    explanation: 'Plasmid là các phân tử ADN vòng nhỏ phụ nằm trong tế bào chất, thường mang các gen mang lại lợi thế thích nghi như gen kháng các loại kháng sinh và có thể chuyển giao qua lông tiếp hợp.'
  }
];
