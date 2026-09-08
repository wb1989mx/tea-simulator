// 六大茶类数据
// 采摘标准（嫩度从高到低 0-5）
const PICKING_STANDARDS = [
  { id: 'single_bud', name: '单芽', tenderLevel: 0, desc: '仅采饱满芽头，最细嫩' },
  { id: 'one_bud_one_leaf', name: '一芽一叶初展', tenderLevel: 1, desc: '芽头带一片初展小叶，细嫩' },
  { id: 'one_bud_two_leaves', name: '一芽二三叶', tenderLevel: 2, desc: '芽头带2-3片叶，较嫩' },
  { id: 'kai_mian', name: '开面采（一芽三四叶）', tenderLevel: 3, desc: '新梢成熟，顶叶开展如面，较成熟' },
  { id: 'one_bud_four_leaves', name: '一芽四五叶', tenderLevel: 4, desc: '成熟新梢，叶片较多' },
  { id: 'coarse', name: '粗老原料', tenderLevel: 5, desc: '成熟枝梢，叶质粗老' }
];

// 杀青方式
const SHAQING_METHODS = {
  chaoqing: {
    id: 'chaoqing',
    name: '炒青',
    desc: '锅炒杀青，高温快杀，香气高锐，是最常见的杀青方式。龙井、碧螺春等名优绿茶多用。',
    tempOffset: 1.0,
    baseSuitability: 0.9,
    aromaType: '栗香豆香'
  },
  zhengqing: {
    id: 'zhengqing',
    name: '蒸青',
    desc: '蒸汽杀青，温度均匀，色泽翠绿鲜亮，但香气偏青草气。恩施玉露、日式煎茶使用。',
    tempOffset: 0.85,
    baseSuitability: 0.7,
    aromaType: '清香鲜爽'
  },
  hongqing: {
    id: 'hongqing',
    name: '烘青',
    desc: '热风烘焙杀青，温度温和，香气清鲜，外形完整。黄山毛峰、太平猴魁等使用。',
    tempOffset: 0.9,
    baseSuitability: 0.85,
    aromaType: '清香高雅'
  },
  shaiqing: {
    id: 'shaiqing',
    name: '晒青',
    desc: '利用日光杀青，温度低、时间长，保留较多活性物质，是普洱茶等黑茶原料的传统杀青方式。',
    tempOffset: 0.65,
    baseSuitability: 0.6,
    aromaType: '日晒香'
  }
};

// 干燥方式
const GANZAO_METHODS = {
  honggan: {
    id: 'honggan',
    name: '烘干',
    desc: '热风烘干，速度快，温度可控，最常用的干燥方式。',
    tempOffset: 1.0,
    aromaBonus: 0
  },
  shaigan: {
    id: 'shaigan',
    name: '晒干',
    desc: '日光晒干，温度低、保留活性物质，适合后发酵茶和白茶。',
    tempOffset: 0.6,
    aromaBonus: -5
  },
  chaogan: {
    id: 'chaogan',
    name: '炒干',
    desc: '锅炒干燥，香气高锐，外形紧结，炒青绿茶常用。',
    tempOffset: 1.1,
    aromaBonus: 5
  }
};

// 根据原料嫩度计算后续工序参数的偏移
function calcStepAdjustments(tenderDelta) {
  return {
    weidiao: { timeScale: 1 + tenderDelta * 0.15, tempScale: 1 + tenderDelta * 0.05 },
    shaqing: { tempScale: 1 + tenderDelta * 0.08, timeScale: 1 + tenderDelta * 0.1 },
    rounian: { timeScale: 1 + tenderDelta * 0.12 },
    menhuang: { timeScale: 1 - tenderDelta * 0.08 },
    zuoqing: { countScale: 1 + tenderDelta * 0.1 },
    fajiao: { timeScale: 1 - tenderDelta * 0.05 },
    wodui: { timeScale: 1 + tenderDelta * 0.08, tempScale: 1 + tenderDelta * 0.05 },
    ganzao: { tempScale: 1 + tenderDelta * 0.06, timeScale: 1 + tenderDelta * 0.1 }
  };
}

window.TEA_DATA = {
  green: {
    id: 'green',
    name: '绿茶',
    nameShort: '绿',
    ferment: '不发酵',
    fermentLevel: 0,
    color: '#5A8F5A',
    colorLight: '#7BA05B',
    tagline: '清汤绿叶，鲜爽甘醇',
    description: '绿茶是不发酵茶，通过高温杀青钝化酶的活性，保留鲜叶中的绿色和天然物质，形成"清汤绿叶"的品质特征。',
    coreProcess: '杀青',
    idealPicking: 'one_bud_two_leaves',
    pickingTenderRange: [0, 2],
    suitableShaiqingMethods: ['chaoqing', 'zhengqing', 'hongqing', 'shaiqing'],
    bestShaiqingMethod: 'chaoqing',
    suitableGanzaoMethods: ['honggan', 'chaogan', 'shaigan'],
    bestGanzaoMethod: 'chaogan',
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '绿茶讲究嫩采，名优绿茶多在清明前后采摘一芽一叶或一芽二叶初展，芽叶匀净，大小一致。采摘时机和嫩度直接决定绿茶的最终品质。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '绿茶贵在鲜嫩，明前茶最为珍贵。'
      },
      {
        id: 'shaqing',
        name: '杀青',
        isCore: true,
        description: '利用高温破坏鲜叶中酶的活性，制止茶多酚氧化，固定绿色，同时散失部分水分使叶质变软，便于揉捻。',
        paramType: 'temperature',
        methodType: 'shaqing',
        paramName: '杀青锅温',
        paramUnit: '℃',
        paramMin: 120,
        paramMax: 320,
        idealRange: [200, 260],
        idealValue: 230,
        hint: '锅炒杀青温度约200-260℃，先高后低。',
        effects: {
          tooLow: { text: '温度过低，酶活性未被完全破坏，茶叶会变红变味，形成"红梗红叶"。', quality: -30 },
          tooHigh: { text: '温度过高，叶表焦糊，产生焦烟味，影响茶叶品质。', quality: -25 },
          perfect: { text: '恰到好处！酶活性被精准钝化，叶绿素保留完好，为清汤绿叶奠定基础。', quality: 0 }
        }
      },
      {
        id: 'rounian',
        name: '揉捻',
        description: '通过外力使叶细胞破碎，茶汁溢出，茶叶卷紧成条，缩小体形，便于冲泡，同时增进茶汤浓度。',
        paramType: 'time',
        paramName: '揉捻时间',
        paramUnit: '分钟',
        paramMin: 5,
        paramMax: 60,
        idealRange: [20, 40],
        idealValue: 30,
        hint: '嫩叶轻压短揉，老叶重压长揉。',
        effects: {
          tooLow: { text: '揉捻不足，茶条松散，茶汁析出少，茶汤滋味淡薄。', quality: -15 },
          tooHigh: { text: '揉捻过度，茶叶破碎严重，外形不整，茶汤浑浊。', quality: -20 },
          perfect: { text: '揉捻适度，茶条紧结，细胞破碎率恰当，滋味醇厚有形。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '进一步去除水分，固定形状，发展香气，防止霉变，便于贮存。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '干燥温度',
        paramUnit: '℃',
        paramMin: 60,
        paramMax: 180,
        idealRange: [90, 120],
        idealValue: 105,
        hint: '毛火高温快速，足火低温慢烘。',
        effects: {
          tooLow: { text: '干燥不足，含水量偏高，易发霉变质，不耐贮存。', quality: -20 },
          tooHigh: { text: '温度过高，茶叶外干内湿或焦糊，香气散失。', quality: -15 },
          perfect: { text: '干燥得当，水分含量适中，干茶翠绿油润，香高味醇。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '西湖龙井', origin: '浙江杭州' },
      { name: '黄山毛峰', origin: '安徽黄山' },
      { name: '碧螺春', origin: '江苏苏州' },
      { name: '信阳毛尖', origin: '河南信阳' },
      { name: '太平猴魁', origin: '安徽黄山' },
      { name: '六安瓜片', origin: '安徽六安' }
    ],
    appearance: '条索紧结、色泽翠绿油润、白毫显露',
    soupColor: '汤色嫩绿明亮、清澈见底',
    taste: '鲜爽甘醇、回味悠长、豆香栗香',
    aroma: '清香高长、栗香豆香',
    leafBase: '嫩绿明亮、匀齐完整',
    tips: '绿茶贵在"鲜"，越新越好。冲泡水温不宜过高，约80-85℃为佳，高档绿茶建议用玻璃杯冲泡，可观形赏色。'
  },
  
  white: {
    id: 'white',
    name: '白茶',
    nameShort: '白',
    ferment: '微发酵',
    fermentLevel: 10,
    color: '#B8A878',
    colorLight: '#D4C9A8',
    tagline: '芽叶完整，白毫显露，汤色杏黄',
    description: '白茶是微发酵茶，萎凋是核心工序，不炒不揉，让鲜叶自然萎凋干燥，最大程度保留茶叶的天然形态和营养。',
    coreProcess: '萎凋',
    idealPicking: 'one_bud_one_leaf',
    pickingTenderRange: [0, 3],
    suitableGanzaoMethods: ['shaigan', 'honggan'],
    bestGanzaoMethod: 'shaigan',
    suitableShaiqingMethods: [],
    bestShaiqingMethod: null,
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '白茶按等级采摘不同嫩度的鲜叶：白毫银针采单芽，白牡丹采一芽一二叶，贡眉寿眉采一芽三四叶。采摘时需小心保护芽叶上的白毫，避免损伤。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '白茶等级不同，采摘标准差异大。以白牡丹级一芽一二叶为基准最经典。'
      },
      {
        id: 'weidiao',
        name: '萎凋',
        isCore: true,
        description: '鲜叶均匀摊放，使其自然失水、叶质萎软的过程。白茶的萎凋时间最长，是形成白毫银针、白牡丹等品质特征的关键。',
        paramType: 'time',
        paramName: '萎凋时间',
        paramUnit: '小时',
        paramMin: 10,
        paramMax: 80,
        idealRange: [36, 60],
        idealValue: 48,
        hint: '白茶萎凋时间最长，需自然萎凋48小时左右，视温湿度而定。',
        effects: {
          tooLow: { text: '萎凋不足，青气重，滋味青涩，未形成白茶特有风味。', quality: -25 },
          tooHigh: { text: '萎凋过度，叶片变黑，发酵过重，失去白茶清鲜特点。', quality: -20 },
          perfect: { text: '萎凋恰到好处！白毫显露，芽叶完整，杏黄汤色的基础已奠定。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '进一步去除水分，固定品质，防止霉变，便于贮存。白茶干燥温度较低，以保持毫香。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '干燥温度',
        paramUnit: '℃',
        paramMin: 40,
        paramMax: 120,
        idealRange: [60, 80],
        idealValue: 70,
        hint: '低温慢烘，保护白毫和香气。',
        effects: {
          tooLow: { text: '干燥不充分，含水量高，易变质。', quality: -20 },
          tooHigh: { text: '温度过高，白毫受损，毫香散失，色泽变暗。', quality: -25 },
          perfect: { text: '低温慢烘得法，白毫银白似雪，毫香蜜韵尽显。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '白毫银针', origin: '福建福鼎' },
      { name: '白牡丹', origin: '福建政和' },
      { name: '贡眉', origin: '福建建阳' },
      { name: '寿眉', origin: '福建福鼎' },
      { name: '月光白', origin: '云南普洱' },
      { name: '安吉白茶', origin: '浙江安吉（实为绿茶）' }
    ],
    appearance: '芽叶完整、白毫密布、色泽银灰白绿',
    soupColor: '汤色杏黄明亮、清澈通透',
    taste: '清鲜醇爽、毫香显著、回甘持久',
    aroma: '毫香蜜韵、清鲜花香',
    leafBase: '芽叶完整、嫩绿软亮',
    tips: '白茶素有"一年茶、三年药、七年宝"之说，越陈越香。新白茶鲜爽，老白茶醇厚。可用盖碗或紫砂壶冲泡。'
  },
  
  yellow: {
    id: 'yellow',
    name: '黄茶',
    nameShort: '黄',
    ferment: '轻发酵',
    fermentLevel: 20,
    color: '#C9A23B',
    colorLight: '#DBBA5C',
    tagline: '黄汤黄叶，甘醇鲜爽',
    description: '黄茶是轻发酵茶，闷黄是关键工序。利用湿热作用使茶叶变黄，形成"黄汤黄叶"的独特品质。',
    coreProcess: '闷黄',
    idealPicking: 'one_bud_one_leaf',
    pickingTenderRange: [0, 2],
    suitableShaiqingMethods: ['chaoqing', 'zhengqing'],
    bestShaiqingMethod: 'chaoqing',
    suitableGanzaoMethods: ['honggan', 'chaogan'],
    bestGanzaoMethod: 'honggan',
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '黄茶采摘细嫩，多采一芽一叶至一芽二叶，芽叶肥壮、匀齐。以君山银针为代表的黄芽茶则全部采单芽。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '黄茶采细嫩芽叶，君山银针等黄芽茶只采饱满单芽。'
      },
      {
        id: 'shaqing',
        name: '杀青',
        description: '与绿茶杀青类似，但温度稍低，为后续闷黄保留必要的活性物质。',
        paramType: 'temperature',
        methodType: 'shaqing',
        paramName: '杀青锅温',
        paramUnit: '℃',
        paramMin: 120,
        paramMax: 280,
        idealRange: [180, 220],
        idealValue: 200,
        hint: '黄茶杀青温度略低于绿茶。',
        effects: {
          tooLow: { text: '杀青不足，酶活性保留过多，闷黄时过度发酵。', quality: -20 },
          tooHigh: { text: '温度过高，焦糊味，且影响闷黄效果。', quality: -15 },
          perfect: { text: '杀青适度，为闷黄工序打好基础。', quality: 0 }
        }
      },
      {
        id: 'rounian',
        name: '揉捻',
        description: '使茶条紧结，细胞破碎，茶汁溢出，为闷黄创造条件。',
        paramType: 'time',
        paramName: '揉捻时间',
        paramUnit: '分钟',
        paramMin: 5,
        paramMax: 45,
        idealRange: [15, 30],
        idealValue: 20,
        hint: '黄茶揉捻宜轻不宜重。',
        effects: {
          tooLow: { text: '揉捻过轻，茶汁少，闷黄不均匀。', quality: -15 },
          tooHigh: { text: '揉捻过重，茶叶破碎，外形不整。', quality: -15 },
          perfect: { text: '揉捻适度，条索紧结，闷黄效果更佳。', quality: 0 }
        }
      },
      {
        id: 'menhuang',
        name: '闷黄',
        isCore: true,
        description: '将杀青揉捻后的茶叶趁热堆积，用湿布或纸包裹，利用湿热作用使茶多酚发生非酶促氧化，形成黄色。这是黄茶独有的关键工序。',
        paramType: 'time',
        paramName: '闷黄时间',
        paramUnit: '小时',
        paramMin: 2,
        paramMax: 48,
        idealRange: [12, 24],
        idealValue: 18,
        hint: '闷黄是黄茶品质的关键，需控制好温湿度与时间。',
        effects: {
          tooLow: { text: '闷黄不足，黄变不充分，偏绿茶品质，"黄叶黄汤"特征不明显。', quality: -25 },
          tooHigh: { text: '闷黄过度，色泽暗黄，滋味沉闷，失去鲜爽感。', quality: -25 },
          perfect: { text: '闷黄恰到好处！"黄汤黄叶"的独特品质已形成，甘醇鲜爽。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '去除多余水分，固定黄茶品质，便于贮存。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '干燥温度',
        paramUnit: '℃',
        paramMin: 60,
        paramMax: 160,
        idealRange: [80, 110],
        idealValue: 95,
        hint: '干燥温度适中，固定黄茶品质。',
        effects: {
          tooLow: { text: '干燥不足，易受潮变质。', quality: -15 },
          tooHigh: { text: '温度过高，色泽枯暗，香气散失。', quality: -15 },
          perfect: { text: '干燥得当，黄茶品质稳定，汤色杏黄明亮。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '君山银针', origin: '湖南岳阳' },
      { name: '蒙顶黄芽', origin: '四川雅安' },
      { name: '霍山黄芽', origin: '安徽霍山' },
      { name: '温州黄汤', origin: '浙江温州' },
      { name: '广东大叶青', origin: '广东肇庆' },
      { name: '沩山毛尖', origin: '湖南宁乡' }
    ],
    appearance: '芽叶肥壮、色泽金黄、毫尖显露',
    soupColor: '汤色杏黄明亮、清澈通透',
    taste: '甘醇鲜爽、回甘明显、香气清悦',
    aroma: '清悦甘甜、栗香嫩香',
    leafBase: '黄亮匀齐、肥嫩柔软',
    tips: '黄茶产量稀少，是六大茶类中产量最小的。它介于绿茶与白茶之间，既有绿茶的鲜爽，又有更醇和的口感。肠胃较弱者可优先选择黄茶。'
  },
  
  oolong: {
    id: 'oolong',
    name: '青茶/乌龙茶',
    nameShort: '青',
    ferment: '半发酵',
    fermentLevel: 50,
    color: '#B5693C',
    colorLight: '#CD895A',
    tagline: '绿叶红镶边，花果飘香',
    description: '乌龙茶是半发酵茶，做青是品质形成的关键工序。通过摇青与晾青交替进行，使叶缘细胞破损氧化，形成"绿叶红镶边"的独特外观和丰富的花果香。',
    coreProcess: '做青',
    idealPicking: 'kai_mian',
    pickingTenderRange: [2, 4],
    suitableShaiqingMethods: ['chaoqing', 'shaiqing'],
    bestShaiqingMethod: 'chaoqing',
    suitableGanzaoMethods: ['honggan', 'chaogan'],
    bestGanzaoMethod: 'honggan',
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '乌龙茶讲究"开面采"，即新梢长到3-5叶、顶叶展开如面时采摘。成熟新梢叶片较厚、内含物丰富，有利于做青时形成"绿叶红镶边"和花果香。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '乌龙茶必须采成熟新梢，嫩叶做不出好茶。采一芽三四叶的开面叶最佳。'
      },
      {
        id: 'shaiqing',
        name: '萎凋（晒青）',
        description: '鲜叶置日光下或加温萎凋槽中，散失部分水分，使叶质柔软，为做青做准备。',
        paramType: 'time',
        paramName: '晒青时间',
        paramUnit: '分钟',
        paramMin: 10,
        paramMax: 120,
        idealRange: [30, 60],
        idealValue: 45,
        hint: '晒青需适度，以叶色转暗、叶质萎软为度。',
        effects: {
          tooLow: { text: '晒青不足，鲜叶含水量高，做青时易损伤。', quality: -15 },
          tooHigh: { text: '晒青过度，失水过多，做青难以进行，影响香气。', quality: -20 },
          perfect: { text: '晒青适度，叶质柔软有韧性，为做青创造良好条件。', quality: 0 }
        }
      },
      {
        id: 'zuoqing',
        name: '做青（摇青+晾青）',
        isCore: true,
        description: '摇青使叶缘相互摩擦破损，晾青使破损处氧化。摇青与晾青交替进行多次，是乌龙茶"绿叶红镶边"和花果香形成的关键。',
        paramType: 'shakeCount',
        paramName: '摇青次数',
        paramUnit: '次',
        paramMin: 1,
        paramMax: 8,
        idealRange: [3, 5],
        idealValue: 4,
        hint: '传统做青需摇青3-5次，每次后晾青，看青做青。',
        effects: {
          tooLow: { text: '摇青次数不足，叶缘氧化不够，"红镶边"不明显，花果香淡薄。', quality: -25 },
          tooHigh: { text: '摇青过度，氧化过度，红边过宽，汤色偏深，失去乌龙茶特色。', quality: -25 },
          perfect: { text: '做青恰到好处！"绿叶红镶边"完美呈现，花果香馥郁悠长。', quality: 0 }
        }
      },
      {
        id: 'shaqing',
        name: '杀青',
        description: '高温杀青，制止酶促氧化，固定做青形成的品质，同时去除青臭气，发展茶香。',
        paramType: 'temperature',
        methodType: 'shaqing',
        paramName: '杀青温度',
        paramUnit: '℃',
        paramMin: 150,
        paramMax: 320,
        idealRange: [220, 280],
        idealValue: 250,
        hint: '乌龙茶杀青温度高，"高温短时"，迅速钝化酶活性。',
        effects: {
          tooLow: { text: '杀青不足，酶未完全钝化，继续发酵影响品质。', quality: -20 },
          tooHigh: { text: '温度过高，外焦内不熟，产生焦味。', quality: -20 },
          perfect: { text: '高温杀青精准，酶活性即刻终止，品质完美定格。', quality: 0 }
        }
      },
      {
        id: 'rounian',
        name: '揉捻',
        description: '使茶叶卷紧成条，塑造外形，同时挤出茶汁增进滋味。乌龙茶揉捻较绿茶更重。',
        paramType: 'time',
        paramName: '揉捻时间',
        paramUnit: '分钟',
        paramMin: 10,
        paramMax: 90,
        idealRange: [30, 60],
        idealValue: 45,
        hint: '乌龙茶揉捻需热揉、重压、长时间，使条索紧结。',
        effects: {
          tooLow: { text: '揉捻不足，条索松散，滋味淡薄。', quality: -15 },
          tooHigh: { text: '揉捻过度，茶条过紧，冲泡时不易舒展。', quality: -15 },
          perfect: { text: '揉捻适度，条索紧结壮实，滋味醇厚有骨。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '去除水分，固定品质。乌龙茶干燥有"毛火"和"足火"两道，足火可发展焙火香。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '毛火温度',
        paramUnit: '℃',
        paramMin: 80,
        paramMax: 180,
        idealRange: [110, 140],
        idealValue: 125,
        hint: '高温毛火快速去水，低温足火慢焙出香。',
        effects: {
          tooLow: { text: '干燥不足，水分高，不耐贮存。', quality: -15 },
          tooHigh: { text: '温度过高，焦糊味，品质受损。', quality: -20 },
          perfect: { text: '干燥得当，干茶乌润有光，香气馥郁。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '铁观音', origin: '福建安溪' },
      { name: '大红袍', origin: '福建武夷山' },
      { name: '凤凰单丛', origin: '广东潮州' },
      { name: '冻顶乌龙', origin: '台湾南投' },
      { name: '东方美人', origin: '台湾新竹' },
      { name: '武夷水仙', origin: '福建武夷山' }
    ],
    appearance: '条索紧结、色泽砂绿乌润、绿叶红镶边',
    soupColor: '汤色金黄橙黄、清澈明亮',
    taste: '醇厚甘爽、花果香馥郁、七泡有余香',
    aroma: '花果香馥郁、兰花香',
    leafBase: '绿叶红镶边、软亮匀整',
    tips: '乌龙茶冲泡讲究功夫茶，用小壶小杯，水温100℃，第一泡约30秒出汤，逐泡延长时间。品饮时先闻香再尝味，感受层次变化。'
  },
  
  red: {
    id: 'red',
    name: '红茶',
    nameShort: '红',
    ferment: '全发酵',
    fermentLevel: 85,
    color: '#A63832',
    colorLight: '#C25A52',
    tagline: '红汤红叶，甜醇馥郁',
    description: '红茶是全发酵茶，发酵是核心工序。茶多酚在酶的作用下充分氧化，形成"红汤红叶"和甜醇的滋味。',
    coreProcess: '发酵',
    idealPicking: 'one_bud_two_leaves',
    pickingTenderRange: [1, 3],
    suitableShaiqingMethods: [],
    bestShaiqingMethod: null,
    suitableGanzaoMethods: ['honggan', 'chaogan'],
    bestGanzaoMethod: 'honggan',
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '红茶采摘以一芽二三叶为主，鲜叶需有一定成熟度，芽叶完整，大小均匀。过嫩的鲜叶发酵后滋味淡薄，过老则茶汤粗涩。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '红茶采一芽二三叶最合适，过嫩滋味薄，过老茶汤粗。'
      },
      {
        id: 'weidiao',
        name: '萎凋',
        description: '鲜叶摊放，散失水分，使叶质柔软，增强酶活性，为揉捻和发酵做准备。',
        paramType: 'time',
        paramName: '萎凋时间',
        paramUnit: '小时',
        paramMin: 2,
        paramMax: 20,
        idealRange: [6, 12],
        idealValue: 8,
        hint: '萎凋适度：手握叶成团，松手不易散开。',
        effects: {
          tooLow: { text: '萎凋不足，叶质硬脆，揉捻易破碎。', quality: -15 },
          tooHigh: { text: '萎凋过度，鲜叶失水过多，发酵不充分。', quality: -15 },
          perfect: { text: '萎凋适度，叶质柔软，酶活性充分激发。', quality: 0 }
        }
      },
      {
        id: 'rounian',
        name: '揉捻',
        description: '破坏叶细胞，茶汁溢出卷紧成条。红茶揉捻重而充分，使茶汁充分附着于叶表。',
        paramType: 'time',
        paramName: '揉捻时间',
        paramUnit: '分钟',
        paramMin: 15,
        paramMax: 90,
        idealRange: [40, 70],
        idealValue: 55,
        hint: '红茶揉捻要充分，细胞破碎率达80%以上。',
        effects: {
          tooLow: { text: '揉捻不足，细胞破碎率低，发酵不充分，汤色浅淡。', quality: -20 },
          tooHigh: { text: '揉捻过度，茶条过碎，茶汤浑浊。', quality: -15 },
          perfect: { text: '揉捻充分，茶汁丰盈，发酵基础扎实。', quality: 0 }
        }
      },
      {
        id: 'fajiao',
        name: '发酵',
        isCore: true,
        description: '揉捻后的茶叶在适宜温湿度下，茶多酚发生酶促氧化聚合，形成茶黄素、茶红素等物质，呈现红叶红汤。这是红茶品质形成的关键工序。',
        paramType: 'time',
        paramName: '发酵时间',
        paramUnit: '小时',
        paramMin: 1,
        paramMax: 12,
        idealRange: [3, 6],
        idealValue: 4,
        hint: '发酵是红茶品质关键，需控制温度24-28℃、湿度90%以上。',
        effects: {
          tooLow: { text: '发酵不足，茶汤青涩，叶底红中带青，"红汤红叶"特征不明显。', quality: -30 },
          tooHigh: { text: '发酵过度，茶汤暗浊，滋味酸馊，香气低闷。', quality: -30 },
          perfect: { text: '发酵恰到好处！"红汤红叶"完美呈现，甜醇馥郁。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '高温干燥钝化酶活性，终止发酵，固定品质。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '干燥温度',
        paramUnit: '℃',
        paramMin: 70,
        paramMax: 180,
        idealRange: [100, 130],
        idealValue: 115,
        hint: '高温快烘，迅速终止发酵。',
        effects: {
          tooLow: { text: '干燥过慢，继续氧化发酵，品质下降。', quality: -20 },
          tooHigh: { text: '温度过高，外焦内湿，产生焦味。', quality: -15 },
          perfect: { text: '干燥及时，品质完美定格，干茶乌润有光。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '正山小种', origin: '福建武夷山' },
      { name: '祁门红茶', origin: '安徽祁门' },
      { name: '滇红', origin: '云南凤庆' },
      { name: '金骏眉', origin: '福建武夷山' },
      { name: '宜红', origin: '湖北宜昌' },
      { name: '英德红茶', origin: '广东英德' }
    ],
    appearance: '条索紧细、色泽乌润、金毫显露',
    soupColor: '汤色红艳明亮、金圈明显',
    taste: '甜醇浓郁、香高味鲜、回甘持久',
    aroma: '蜜香甜香、花果香馥郁',
    leafBase: '红亮匀整、柔软鲜活',
    tips: '红茶性温，适合秋冬饮用。可清饮，也可调饮加奶加糖。冲泡水温90-95℃，第一泡约3-5分钟。优质红茶茶汤冷却后会出现"冷后浑"现象，是品质好的标志。'
  },
  
  dark: {
    id: 'dark',
    name: '黑茶',
    nameShort: '黑',
    ferment: '后发酵',
    fermentLevel: 100,
    color: '#5C3A21',
    colorLight: '#7A5236',
    tagline: '陈醇绵滑，越陈越香',
    description: '黑茶是后发酵茶，渥堆是核心工序。利用微生物的作用使茶叶发生后发酵，汤色橙黄透亮，滋味陈醇。黑茶可长期存放，越陈越香。',
    coreProcess: '渥堆',
    idealPicking: 'one_bud_four_leaves',
    pickingTenderRange: [3, 5],
    suitableShaiqingMethods: ['chaoqing', 'shaiqing'],
    bestShaiqingMethod: 'shaiqing',
    suitableGanzaoMethods: ['shaigan', 'honggan'],
    bestGanzaoMethod: 'shaigan',
    steps: [
      {
        id: 'caizhai',
        name: '采摘',
        description: '黑茶采摘较成熟的原料，一般采一芽四五叶或更粗老的新梢。成熟叶片内含物丰富，为渥堆后发酵提供充足的物质基础。',
        paramType: 'picking',
        options: PICKING_STANDARDS,
        hint: '黑茶用成熟原料，越粗老越适合渥堆后发酵。嫩原料做不出好黑茶。'
      },
      {
        id: 'shaqing',
        name: '杀青',
        description: '黑茶鲜叶粗老，杀青温度高、投叶量多，以破坏酶活性、去除青气。',
        paramType: 'temperature',
        methodType: 'shaqing',
        paramName: '杀青温度',
        paramUnit: '℃',
        paramMin: 180,
        paramMax: 360,
        idealRange: [240, 300],
        idealValue: 270,
        hint: '黑茶鲜叶粗老，需高温杀青。',
        effects: {
          tooLow: { text: '杀青不足，青气重，影响渥堆品质。', quality: -15 },
          tooHigh: { text: '温度过高，焦糊严重，黑茶风味受损。', quality: -15 },
          perfect: { text: '高温杀青彻底，去除青气，为渥堆打好基础。', quality: 0 }
        }
      },
      {
        id: 'rounian',
        name: '揉捻',
        description: '粗老鲜叶揉捻时间长、压力重，使茶条紧结，茶汁溢出。',
        paramType: 'time',
        paramName: '揉捻时间',
        paramUnit: '分钟',
        paramMin: 20,
        paramMax: 100,
        idealRange: [45, 75],
        idealValue: 60,
        hint: '黑茶鲜叶粗老，揉捻需重压长时间。',
        effects: {
          tooLow: { text: '揉捻不足，茶条松散，渥堆不均匀。', quality: -15 },
          tooHigh: { text: '揉捻过度，茶叶过碎，影响外形。', quality: -15 },
          perfect: { text: '揉捻充分，茶条紧结，渥堆效果更佳。', quality: 0 }
        }
      },
      {
        id: 'wodui',
        name: '渥堆',
        isCore: true,
        description: '将揉捻后的茶叶堆积成堆，在湿热和微生物作用下发生后发酵。这是黑茶品质形成的关键工序，也是区别于其他茶类的核心。',
        paramType: 'wodui',
        paramName: '渥堆温度',
        paramUnit: '℃',
        paramMin: 30,
        paramMax: 80,
        idealRange: [45, 60],
        idealValue: 52,
        hint: '渥堆需控制堆温在45-60℃，过高"烧心"，过低发酵慢。',
        effects: {
          tooLow: { text: '堆温过低，微生物活性不足，后发酵不充分，茶汤青涩。', quality: -25 },
          tooHigh: { text: '堆温过高，"烧心"发黑，产生馊味酸败，品质严重下降。', quality: -30 },
          perfect: { text: '渥堆恰到好处！微生物作用充分，陈醇绵滑的品质已奠定。', quality: 0 }
        }
      },
      {
        id: 'ganzao',
        name: '干燥',
        description: '去除多余水分，固定品质，便于压制成饼或砖。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '干燥温度',
        paramUnit: '℃',
        paramMin: 60,
        paramMax: 160,
        idealRange: [80, 110],
        idealValue: 95,
        hint: '黑茶干燥温度适中，保留微生物活性以便后期转化。',
        effects: {
          tooLow: { text: '干燥不足，含水量高，易发霉。', quality: -20 },
          tooHigh: { text: '温度过高，杀灭微生物，不利于后期陈化。', quality: -20 },
          perfect: { text: '干燥得当，保留活性，为后期越陈越香留下空间。', quality: 0 }
        }
      }
    ],
    representative: [
      { name: '普洱熟茶', origin: '云南普洱' },
      { name: '安化黑茶', origin: '湖南安化' },
      { name: '六堡茶', origin: '广西梧州' },
      { name: '雅安藏茶', origin: '四川雅安' },
      { name: '茯砖茶', origin: '陕西咸阳' },
      { name: '千两茶', origin: '湖南安化' }
    ],
    appearance: '条索粗壮、色泽黑褐油润',
    soupColor: '汤色橙黄至红浓、明亮通透',
    taste: '陈醇绵滑、醇厚甘润、越陈越香',
    aroma: '陈香药香、醇正绵密',
    leafBase: '褐黄油润、柔软舒展',
    tips: '黑茶是后发酵茶，可以长期存放并持续转化。储存需通风、干燥、无异味。冲泡时建议先"洗茶"一遍，用100℃沸水，可煮饮，也可调饮加奶。'
  }
};

window.PICKING_STANDARDS = PICKING_STANDARDS;
window.SHAQING_METHODS = SHAQING_METHODS;
window.GANZAO_METHODS = GANZAO_METHODS;
window.calcStepAdjustments = calcStepAdjustments;

// 题目库
window.QUIZ_QUESTIONS = [
  {
    question: '六大茶类中，属于不发酵茶的是哪一种？',
    options: ['绿茶', '白茶', '红茶', '黑茶'],
    answer: 0,
    explanation: '绿茶是不发酵茶，通过高温杀青钝化酶的活性，保留鲜叶中的绿色和天然物质，形成"清汤绿叶"的品质特征。'
  },
  {
    question: '白茶的核心工序是什么？',
    options: ['杀青', '萎凋', '揉捻', '渥堆'],
    answer: 1,
    explanation: '萎凋是白茶的核心工序。白茶不炒不揉，通过长时间自然萎凋形成"白毫显露、芽叶完整"的独特品质。'
  },
  {
    question: '黄茶独有的关键工序是什么？',
    options: ['杀青', '揉捻', '闷黄', '干燥'],
    answer: 2,
    explanation: '闷黄是黄茶独有的关键工序。将茶叶闷堆，利用湿热作用使茶多酚非酶促氧化变黄，形成"黄汤黄叶"。'
  },
  {
    question: '乌龙茶品质形成的关键工序是什么？',
    options: ['晒青', '做青', '杀青', '干燥'],
    answer: 1,
    explanation: '做青是乌龙茶品质的关键。摇青与晾青交替进行，使叶缘细胞破损氧化，形成"绿叶红镶边"和花果香。'
  },
  {
    question: '红茶的核心工序是什么？',
    options: ['萎凋', '揉捻', '发酵', '干燥'],
    answer: 2,
    explanation: '发酵是红茶的核心工序。茶多酚在酶的作用下充分氧化，形成茶黄素、茶红素等物质，呈现"红汤红叶"。'
  },
  {
    question: '黑茶的核心工序是什么？',
    options: ['杀青', '揉捻', '渥堆', '干燥'],
    answer: 2,
    explanation: '渥堆是黑茶的核心工序。在湿热和微生物作用下茶叶发生后发酵，形成黑茶独特的陈醇品质。'
  },
  {
    question: '"绿叶红镶边"形容的是哪类茶的特征？',
    options: ['绿茶', '黄茶', '乌龙茶', '红茶'],
    answer: 2,
    explanation: '"绿叶红镶边"是乌龙茶的典型特征。做青过程中叶缘细胞破损氧化变红，而叶片中部保持绿色。'
  },
  {
    question: '"红汤红叶"形容的是哪类茶的特征？',
    options: ['白茶', '黄茶', '红茶', '黑茶'],
    answer: 2,
    explanation: '"红汤红叶"是红茶的典型特征。全发酵使茶多酚充分氧化，形成红色的茶黄素和茶红素。'
  },
  {
    question: '"清汤绿叶"形容的是哪类茶的特征？',
    options: ['绿茶', '白茶', '黄茶', '乌龙茶'],
    answer: 0,
    explanation: '"清汤绿叶"是绿茶的典型特征。不发酵工艺最大程度保留了叶绿素和天然物质。'
  },
  {
    question: '杀青的主要作用是什么？',
    options: ['使茶叶变红', '钝化酶活性', '增加香气', '使茶叶紧结'],
    answer: 1,
    explanation: '杀青的主要作用是利用高温破坏鲜叶中酶的活性，制止茶多酚氧化，从而固定茶叶的绿色和天然成分。'
  },
  {
    question: '揉捻的主要作用是什么？',
    options: ['去除水分', '卷紧茶条、析出茶汁', '发展香气', '改变颜色'],
    answer: 1,
    explanation: '揉捻通过外力使叶细胞破碎、茶汁溢出，同时茶叶卷紧成条，缩小体形便于冲泡，增进茶汤浓度。'
  },
  {
    question: '下列哪种茶属于白茶？',
    options: ['西湖龙井', '白毫银针', '铁观音', '祁门红茶'],
    answer: 1,
    explanation: '白毫银针是白茶的代表，产自福建福鼎，全部由芽头制成，白毫密布，形似银针。'
  },
  {
    question: '普洱茶属于哪一类茶？',
    options: ['绿茶', '乌龙茶', '红茶', '黑茶'],
    answer: 3,
    explanation: '普洱茶（熟茶）属于黑茶类，是后发酵茶，经过渥堆工艺制成，越陈越香。'
  },
  {
    question: '铁观音属于哪一类茶？',
    options: ['绿茶', '白茶', '乌龙茶', '红茶'],
    answer: 2,
    explanation: '铁观音是乌龙茶的代表，产自福建安溪，属于半发酵茶，具有"观音韵"和兰花香。'
  },
  {
    question: '下列茶类中，发酵程度最高的是？',
    options: ['绿茶', '白茶', '红茶', '黑茶'],
    answer: 3,
    explanation: '黑茶是后发酵茶，发酵程度最高，且在存放过程中持续发酵转化。'
  },
  {
    question: '下列茶类中，发酵程度最低的是？',
    options: ['绿茶', '黄茶', '乌龙茶', '红茶'],
    answer: 0,
    explanation: '绿茶是不发酵茶，发酵程度为0，通过杀青直接终止发酵。'
  },
  {
    question: '"一年茶、三年药、七年宝"形容的是哪类茶？',
    options: ['绿茶', '白茶', '红茶', '黑茶'],
    answer: 1,
    explanation: '这句俗语形容的是白茶。白茶可以长期存放，随着时间推移，品质逐渐转化，药用价值也随之提高。'
  },
  {
    question: '君山银针属于哪一类茶？',
    options: ['绿茶', '白茶', '黄茶', '乌龙茶'],
    answer: 2,
    explanation: '君山银针是黄茶的代表，产自湖南岳阳君山岛，芽头肥壮，满披茸毛，汤色杏黄明亮。'
  },
  {
    question: '正山小种属于哪一类茶？',
    options: ['绿茶', '乌龙茶', '红茶', '黑茶'],
    answer: 2,
    explanation: '正山小种是红茶的代表，产自福建武夷山桐木关，是世界上最早的红茶，有松烟香和桂圆香。'
  },
  {
    question: '做青工序中，摇青和晾青的关系是？',
    options: ['只摇青一次', '只晾青一次', '摇青与晾青交替多次', '先晾青后摇青一次'],
    answer: 2,
    explanation: '做青是摇青与晾青交替进行多次的过程。摇青使叶缘摩擦破损，晾青使破损处氧化，反复交替形成品质。'
  },
  {
    question: '黑茶渥堆主要依靠什么作用？',
    options: ['酶促氧化', '微生物作用', '热作用', '光作用'],
    answer: 1,
    explanation: '黑茶渥堆主要依靠微生物的作用。在适宜的温湿度条件下，微生物大量繁殖，分泌酶类促进茶叶成分转化。'
  },
  {
    question: '萎凋的目的不包括以下哪项？',
    options: ['散失水分，叶质变软', '增强酶活性', '去除青臭气', '使茶叶变黄'],
    answer: 3,
    explanation: '使茶叶变黄是闷黄或发酵的作用，不是萎凋的目的。萎凋主要是失水、叶质变软、增强酶活性、去除青气。'
  },
  {
    question: '关于干燥的作用，以下哪项是错误的？',
    options: ['去除水分便于储存', '固定茶叶品质', '发展茶叶香气', '增加发酵程度'],
    answer: 3,
    explanation: '干燥的作用是去除水分、固定品质、发展香气。干燥会钝化酶活性，终止发酵，不会增加发酵程度。'
  },
  {
    question: '六大茶类按发酵程度从低到高排列正确的是？',
    options: [
      '绿茶→白茶→黄茶→乌龙茶→红茶→黑茶',
      '绿茶→黄茶→白茶→乌龙茶→红茶→黑茶',
      '白茶→绿茶→黄茶→红茶→乌龙茶→黑茶',
      '绿茶→白茶→乌龙茶→黄茶→红茶→黑茶'
    ],
    answer: 0,
    explanation: '按发酵程度从低到高：绿茶（不发酵）→白茶（微发酵）→黄茶（轻发酵）→乌龙茶（半发酵）→红茶（全发酵）→黑茶（后发酵）。'
  },
  {
    question: '以下哪种茶素有"七泡有余香"之美誉？',
    options: ['西湖龙井', '铁观音', '正山小种', '白毫银针'],
    answer: 1,
    explanation: '铁观音等乌龙茶因内含物质丰富、制作工艺精湛，耐泡度高，素有"七泡有余香"之说。'
  },
  {
    question: '冷后浑（cream down）现象通常出现在哪类茶中？',
    options: ['绿茶', '白茶', '红茶', '黄茶'],
    answer: 2,
    explanation: '冷后浑是优质红茶的特征。茶汤冷却后出现浑浊，是茶黄素、茶红素与咖啡碱络合的结果，说明红茶品质优良。'
  },
  {
    question: '以下哪道工序是所有六大茶类共有的？',
    options: ['杀青', '萎凋', '揉捻', '干燥'],
    answer: 3,
    explanation: '干燥是六大茶类共有的最后工序，用于去除多余水分，固定品质，便于贮存运输。'
  },
  {
    question: '以下哪种茶类不经杀青工序？',
    options: ['绿茶', '白茶', '黄茶', '乌龙茶'],
    answer: 1,
    explanation: '白茶不杀青、不揉捻，仅经萎凋和干燥两道工序，最大程度保留茶叶的天然形态和活性。'
  },
  {
    question: '安化黑茶产自哪个省？',
    options: ['云南', '湖南', '四川', '广西'],
    answer: 1,
    explanation: '安化黑茶产自湖南省益阳市安化县，是中国黑茶的重要产区，千两茶、茯砖茶等是其代表产品。'
  },
  {
    question: '祁门红茶以什么香气闻名？',
    options: ['豆香', '花果香', '祁门香', '松烟香'],
    answer: 2,
    explanation: '祁门红茶以独特的"祁门香"闻名世界，似花似果似蜜，是世界三大高香红茶之一。'
  },
  {
    question: '乌龙茶（青茶）的采摘特点是？',
    options: ['采单芽', '采一芽一叶初展', '开面采，采成熟新梢', '采粗老原料'],
    answer: 2,
    explanation: '乌龙茶讲究"开面采"，即新梢长到3-5叶、顶叶展开时采摘。成熟新梢内含物丰富，利于做青形成花果香。'
  },
  {
    question: '下列哪种杀青方式是用蒸汽杀青的？',
    options: ['炒青', '蒸青', '烘青', '晒青'],
    answer: 1,
    explanation: '蒸青是利用蒸汽杀青，温度均匀，色泽翠绿鲜亮。代表茶有恩施玉露、日式煎茶等。'
  },
  {
    question: '名优绿茶（如龙井）最常用的杀青方式是？',
    options: ['炒青', '蒸青', '烘青', '晒青'],
    answer: 0,
    explanation: '炒青是锅炒高温杀青，香气高锐，滋味醇厚，是名优绿茶最常用的杀青方式。龙井、碧螺春等均为炒青绿茶。'
  },
  {
    question: '白茶最典型的干燥方式是？',
    options: ['烘干', '晒干', '炒干', '冻干'],
    answer: 1,
    explanation: '白茶传统工艺以日光晒干（晾晒）为主，低温慢干，最大程度保留白毫和毫香，也利于后期转化。'
  },
  {
    question: '关于"原料决定工艺"，以下说法正确的是？',
    options: [
      '原料越嫩越好，所有茶都该采单芽',
      '原料越老越好，做出来的茶越耐泡',
      '不同茶类需要不同嫩度的原料，工艺参数也要相应调整',
      '原料嫩度对工艺没有影响'
    ],
    answer: 2,
    explanation: '不同茶类对原料嫩度有不同要求。原料偏老时，萎凋时间、揉捻程度、杀青温度等工艺参数都要相应调整，体现"看茶做茶"的原则。'
  }
];

// 成就定义
window.ACHIEVEMENTS = [
  {
    id: 'first_brew',
    name: '初出茅庐',
    desc: '完成第一杯茶的制作',
    icon: '🍵',
    condition: (progress) => progress.totalBrews >= 1
  },
  {
    id: 'green_master',
    name: '绿茶能手',
    desc: '绿茶达到一级及以上',
    icon: '🌿',
    condition: (progress) => (progress.teaProgress.green || 0) >= 80
  },
  {
    id: 'white_master',
    name: '白茶雅士',
    desc: '白茶达到一级及以上',
    icon: '⚪',
    condition: (progress) => (progress.teaProgress.white || 0) >= 80
  },
  {
    id: 'yellow_master',
    name: '黄茶匠人',
    desc: '黄茶达到一级及以上',
    icon: '🌟',
    condition: (progress) => (progress.teaProgress.yellow || 0) >= 80
  },
  {
    id: 'oolong_master',
    name: '乌龙高手',
    desc: '乌龙茶达到一级及以上',
    icon: '🫖',
    condition: (progress) => (progress.teaProgress.oolong || 0) >= 80
  },
  {
    id: 'red_master',
    name: '红茶名家',
    desc: '红茶达到一级及以上',
    icon: '❤️',
    condition: (progress) => (progress.teaProgress.red || 0) >= 80
  },
  {
    id: 'dark_master',
    name: '黑茶行家',
    desc: '黑茶达到一级及以上',
    icon: '🟤',
    condition: (progress) => (progress.teaProgress.dark || 0) >= 80
  },
  {
    id: 'all_teas',
    name: '六艺皆通',
    desc: '完成六大茶类各至少一次制作',
    icon: '🎯',
    condition: (progress) => {
      const ids = ['green', 'white', 'yellow', 'oolong', 'red', 'dark'];
      return ids.every(id => (progress.teaBrewCount[id] || 0) >= 1);
    }
  },
  {
    id: 'quiz_beginner',
    name: '茶学新秀',
    desc: '答题累计正确10题',
    icon: '📚',
    condition: (progress) => progress.quizCorrect >= 10
  },
  {
    id: 'quiz_expert',
    name: '茶学博士',
    desc: '答题累计正确30题',
    icon: '🎓',
    condition: (progress) => progress.quizCorrect >= 30
  },
  {
    id: 'perfect_brew',
    name: '完美工艺',
    desc: '任一茶类达到特级品质',
    icon: '🏆',
    condition: (progress) => Object.values(progress.teaProgress || {}).some(v => v >= 95)
  },
  {
    id: 'tea_master',
    name: '制茶宗师',
    desc: '六大茶类全部达到特级',
    icon: '👑',
    condition: (progress) => {
      const ids = ['green', 'white', 'yellow', 'oolong', 'red', 'dark'];
      return ids.every(id => (progress.teaProgress[id] || 0) >= 95);
    }
  }
];
