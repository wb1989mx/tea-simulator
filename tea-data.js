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
        timeUnit: '分钟',
        timeMin: 2,
        timeMax: 8,
        idealTimeRange: [3, 5],
        idealTimeValue: 4,

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
        timeUnit: '分钟',
        timeMin: 10,
        timeMax: 60,
        idealTimeRange: [20, 40],
        idealTimeValue: 30,

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
        timeUnit: '小时',
        timeMin: 4,
        timeMax: 24,
        idealTimeRange: [8, 15],
        idealTimeValue: 12,

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
        timeUnit: '分钟',
        timeMin: 2,
        timeMax: 8,
        idealTimeRange: [3, 5],
        idealTimeValue: 4,

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
        timeUnit: '分钟',
        timeMin: 15,
        timeMax: 90,
        idealTimeRange: [30, 60],
        idealTimeValue: 45,

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
        timeUnit: '分钟',
        timeMin: 2,
        timeMax: 10,
        idealTimeRange: [4, 8],
        idealTimeValue: 6,

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
        timeUnit: '分钟',
        timeMin: 20,
        timeMax: 120,
        idealTimeRange: [40, 80],
        idealTimeValue: 60,

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
        timeUnit: '分钟',
        timeMin: 20,
        timeMax: 90,
        idealTimeRange: [35, 60],
        idealTimeValue: 45,

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
        timeUnit: '分钟',
        timeMin: 3,
        timeMax: 15,
        idealTimeRange: [5, 10],
        idealTimeValue: 8,

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
        timeUnit: '小时',
        timeMin: 12,
        timeMax: 72,
        idealTimeRange: [24, 48],
        idealTimeValue: 36,

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
        timeUnit: '分钟',
        timeMin: 30,
        timeMax: 120,
        idealTimeRange: [45, 75],
        idealTimeValue: 60,

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

// ============================================================

// ============================================================

// ============================================================

// ============================================================

// ============================================================

// ============================================================

// ============================================================

// ============================================================
// ===== 升级数据层 v2（GB/T 30766-2014 七大茶类 + 23 个名优茶参数层）=====
// 数据来源：《六大茶类初加工工艺模拟系统_知识结构升级方案.docx》
// 权威检索（国标/行标/地标/团标） + 独立复核修正，教学用途
// 结构说明：FAMOUS_TEAS 为扁平名优茶参数库；
//   每类 TEA_DATA[id].famousTeas 挂载对应名优茶明细，
//   用于工艺模拟/知识问答/茶叶图鉴的深度展示。
// ============================================================
window.FAMOUS_TEAS = [{
      "id": "biluochun",
      "name": "洞庭（山）碧螺春",
      "category": "green",
      "origin": "江苏苏州·洞庭山",
      "picking": "注：炒制1斤高档洞庭山碧螺春茶约需6.5万个嫩芽【来源：《中国茶叶加工》2022(4)】。",
      "craftChain": "国家标准规定工艺流程： 鲜叶拣剔 → ★高温杀青 → ★热揉成形 → ★搓团显毫 → ★文火干燥 【来源：GB/T 18957-2008 第6.4条】 注：碧螺春传统工艺为\"一锅到底\"，所有工序在同一口炒锅中完成，不设独立摊凉回潮工序（部分工艺在杀青后有短暂摊放）。核心工序为杀青、揉捻、搓团显毫、烘焙四道。",
      "steps": [{
        "name": "鲜叶拣剔与摊放",
        "text": "作用原理： 拣剔保证原料匀净，摊放使鲜叶适度失水、散发青草气，为杀青做准备。"
      }, {
        "name": "高温杀青★",
        "text": "交叉印证：江苏省太湖常绿果树技术推广中心资料记载下锅温度150～180 ℃（高档稍低，低档稍高），投叶量500 g（1市斤），杀青时间3～4 min【来源：江苏省太湖常绿果树技术推广中心】。两者温度差异较大（350 ℃ vs 150～180 ℃），推测为测量位置不同（锅底受热面温度 vs 锅壁/空气温度），实际生产中以师傅经验判断为准。学术论文的350 ℃为锅底实测温度，更具参考价值。 作用原理： 高温迅速钝化多酚氧化酶，制止红变；散发青草气，使叶质柔软便于后续揉捻做形。"
      }, {
        "name": "热揉成形（揉捻）★",
        "text": "作用原理： 揉捻使叶细胞破损，茶汁溢出粘附叶表，增进滋味浓度；同时使茶叶卷曲成条，为搓团显毫定型打基础。碧螺春揉捻在热锅中完成，边揉边炒，与常规绿茶冷揉不同。"
      }, {
        "name": "搓团显毫★",
        "text": "交叉印证：洞庭山碧螺春网资料记载搓团显毫锅温55～60 ℃，时间12～15 min，每搓4～5转解块一次【来源：洞庭山碧螺春网】。温度差异（120～150 ℃ vs 55～60 ℃）同样可能是锅底温度与锅温/叶温的口径差异。学术论文数据为锅底温度，更精准。 作用原理： 搓团是碧螺春\"卷曲如螺\"外形形成的关键工序。通过掌心搓揉使茶条进一步卷曲紧结，同时摩擦促使茸毛显露（碧螺春要求满身披毫，与龙井茶脱毫相反）。"
      }, {
        "name": "文火干燥（烘焙）★",
        "text": "注：国标GB/T 18957-2008规定成品水分≤7.5%，而手工炒制出锅时含水率约8%～8.5%，因此需在干茶中放入专用干燥剂或用烘箱复火烘焙，达到国标含水率要求【来源：《中国茶叶加工》2022(4)】。 作用原理： 低温慢烘使茶叶充分干燥，同时继续显毫、固定形状。由于碧螺春原料细嫩，不宜高温，避免焦毫和香气散失。"
      }, {
        "name": "贮藏保鲜",
        "text": ""
      }],
      "params": ["拣剔标准 | 一芽一叶初展，长度约1.5 cm；剔除无芽叶片、碎叶、霜冻芽、杂质 | 《中国茶叶加工》2022(4) 沈逸君", "摊放厚度 | 5～10 cm | 同上", "摊放时间 | 约4 h | 同上", "摊放环境 | 阴凉干燥，忌过厚过长导致红梗红叶 | 同上", "设备 | 传统炒锅，锅最大直径约60 cm，锅底受热面直径约25 cm | 《中国茶叶加工》2022(4)", "下锅锅温 | 约350 ℃（锅底温度，感观判断：锅底圈内发亮直径约25 cm） | 同上", "投叶量 | 早期600 g/锅，后期700～750 g/锅 | 同上", "杀青时间 | 约5 min（视气候和茶青而定） | 同上", "手法 | 以重复抛撒、捞起捞净为主，抛闷结合；要求杀匀杀透，不粘锅不枯焦 | 同上", "出锅程度 | 茶青芽叶全部转色，青草气消失，茶香显露 | 同上", "设备 | 同一炒锅（不换锅） | 《中国茶叶加工》2022(4)", "锅底温度 | 220～250 ℃ | 同上", "揉捻时间 | 约15 min | 同上", "手法 | 双手向内侧按住茶青贴锅壁旋转揉捻再抖撒，循环往复；按\"先轻后重再轻\"原则 | 同上", "出锅程度 | 茶叶含水率达30%～40%，条索纤细紧结、卷曲呈螺状；锅内温度降至约150 ℃ | 同上", "茶青温度 | 杀青至揉捻阶段茶青温度保持70～80 ℃ | 同上", "设备 | 同一炒锅 | 《中国茶叶加工》2022(4)", "锅底温度 | 120～150 ℃ | 同上", "搓团时间 | 约10 min | 同上", "手法 | 分批将茶叶置于掌心搓团（搓汤圆式），按同一方向搓揉，放入锅中摊放，反复循环；按\"先轻后重再轻\"原则 | 同上", "出锅程度 | 条索纤细紧结、卷曲呈螺、银绿隐翠、毫毛密布（显蜜蜂腿），茶叶放在手里自动散开并有扎手感 | 同上", "茶叶温度 | 搓团至烘焙阶段茶叶温度保持60～70 ℃，不低于50 ℃ | 同上", "设备 | 同一炒锅 | 《中国茶叶加工》2022(4)", "锅面温度 | 约100 ℃ | 同上", "烘焙时间 | 约5 min | 同上", "手法 | 不停轻轻搓团，再轻轻放入锅中摊放；低温轻揉轻翻 | 同上", "出锅程度 | 手略感扎手即可起锅；炒制完成时含水率约8%～8.5% | 同上", "全程炒制时间 | 从杀青到烘焙约35～45 min/锅 | 同上", "贮藏温度 | -3～-1 ℃茶叶冰柜 | 《中国茶叶加工》2022(4)", "目的 | 保持色香味，防止绿茶氧化陈化 | 同上"],
      "quality": "感官品质特征（特级一等，参照GB/T 23776-2018）： 审评要点： 外形重在\"纤细卷曲呈螺、满身披毫、银绿隐翠\"，蜜蜂腿（螺形卷曲带毫）为典型特征 香气以嫩香清鲜为上，花果香为洞庭山茶果间作的地域特色 滋味清鲜甘醇，忌粗老苦涩 冲泡特色：高档碧螺春入水后迅速下沉杯底（上投法冲泡）",
      "grade": ["等级 | 依据标准", "特级一等、特级二等、一级、二级、三级（共5级） | GB/T 18957-2008《地理标志产品 洞庭（山）碧螺春茶》第5.1条"],
      "standards": ["GB/T 18957-2008《地理标志产品 洞庭（山）碧螺春茶》——国家标准化管理委员会，https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=AF9AC4AB905C93C6F7CB42A7AB4EBF88", "GB/T 18957-2008全文PDF——中茶拍，http://www.ctatc.com/attach/201011/26/1290745836359F_Orig.pdf", "沈逸君. 苏州洞庭山碧螺春的制作工艺与要点[J]. 中国茶叶加工, 2022(4): 47-50.——SciOpen，https://www.sciopen.com/local/article_pdf/10.15905/j.cnki.33-1157/ts.2022.04.006.pdf", "洞庭山碧螺春加工工艺流程——江苏省太湖常绿果树技术推广中心，https://jsfruit.szai.edu.cn/info/1021/1027.htm", "苏州市农业农村局——洞庭山碧螺春上市资讯，http://nyncj.suzhou.gov.cn/nlj/tpxw/202603/9c1f5fecad784786a47a379b498893fe.shtml"],
      "processNote": ""
    }, {
      "id": "duyun_maojian",
      "name": "都匀毛尖",
      "category": "green",
      "origin": "贵州黔南·都匀",
      "picking": "珍品/特级：单芽至一芽一叶初展；尊品茶青要求独芽至一芽一叶初展〔来源：DB52/T 995-2015 表1；DB52/T 433-2018 附录A.5.3〕",
      "craftChain": "手工加工工艺流程： 鲜叶 → 茶青分级 → 摊青 → ★杀青 → ★揉捻 → ★做形（搓团） → ★提毫 → ★烘焙足干 → 出锅 → 审评归类 → 拼样官堆装箱 → 入库贮存 【来源：DB52/T 995-2015 第6.2.1条】 机械加工工艺流程： 鲜叶 → 茶青分级 → 摊青 → 杀青 → 冷却摊凉 → 揉捻 → 初烘 → 做形提毫 → 烘焙足干 → 拼样官堆装箱 → 入库贮存 【来源：DB52/T 995-2015 第6.3.1条】 核心工序为杀青、揉捻、做形、提毫、烘焙五道。都匀毛尖传统工艺\"火中取宝，一气呵成\"，所有操作在同一口锅中完成【来源：贵州省人民政府非遗介绍】。",
      "steps": [{
        "name": "摊青",
        "text": "作用原理： 摊青使鲜叶均匀失水，叶质变软，散发青草气，为杀青和做形创造条件。"
      }, {
        "name": "杀青（手工）★",
        "text": "交叉印证：都匀毛尖茶官网记载相同参数：杀青锅温320～370 ℃，投叶量0.5～0.8 kg，杀青时间4～6 min【来源：都匀毛尖茶官网，http://www.dymjc.com.cn/brand.html】。与地方标准完全一致。 作用原理： 高温钝化酶活性，制止红变；散发青草气，使叶质柔软便于揉捻。"
      }, {
        "name": "揉捻（手工）★",
        "text": "作用原理： 揉捻破坏叶细胞，茶汁外溢，增进滋味浓度；使茶叶初步成条，为做形打基础。"
      }, {
        "name": "做形（搓团）★",
        "text": "注：尊品级工艺要求\"揉捻至茶叶达到6成干时转为搓团，搓团至茶条卷曲，含水量达30%时进入提毫\"【来源：DB52/T 433-2018 附录A.6.2】。 作用原理： 做形是都匀毛尖\"卷曲如鱼钩\"外形形成的关键。通过掌心搓团使茶条卷曲紧结。"
      }, {
        "name": "提毫★",
        "text": "注：尊品级要求\"提毫至茶条紧细卷曲、白毫显露时进行烘焙\"【来源：DB52/T 433-2018 附录A.6.2】。都匀毛尖要求\"满披白毫\"，与碧螺春类似，与龙井茶脱毫相反。 作用原理： 通过摩擦使茶条表面茸毛显露，形成\"白毫显露\"的外观特征，同时进一步干燥和定型。"
      }, {
        "name": "烘焙足干★",
        "text": "注：尊品级要求\"烘焙至其含水量达6%时起锅\"【来源：DB52/T 433-2018 附录A.6.2】。 作用原理： 充分干燥至安全含水率，固定品质，便于贮藏。"
      }, {
        "name": "机械加工补充参数",
        "text": ""
      }, {
        "name": "入库贮存",
        "text": ""
      }],
      "params": ["摊青厚度 | 5～15 cm（雨水叶或高含水叶薄摊，晴天中午/下午采的厚摊） | DB52/T 995-2015 第6.2.3条", "室内温度 | ≤25 ℃，防止太阳照射 | 同上", "翻叶 | 每隔约1 h轻翻一次 | 同上", "摊放时间 | 2～6 h | 同上", "摊放程度 | 叶质变软，含水量降至68%～72%，色泽变暗，手握不粘；当天采摘当天加工完毕 | 同上", "设备 | 炒锅 | DB52/T 995-2015 第6.2.4条", "杀青锅温 | 320～370 ℃（手感判断：手背离锅底20 cm，5～10 s感觉有刺热感） | 同上 6.2.4.1", "投叶量 | 0.5～0.8 kg | 同上", "杀青时间 | 4～6 min | 同上 6.2.4.2", "原则 | 老叶嫩杀，嫩叶老杀，多抛少闷，抛闷结合 | 同上", "手法 | 茶青一次性倒入锅内（发出炒芝麻声），迅速翻动使受热均匀；大量水汽冒出后多抛少闷交替 | 同上 6.2.4.3", "出锅程度 | 叶色变暗，叶面无光泽，叶质变软，折而不断，青草气消失，茶香显露 | 同上 6.2.4.4", "设备 | 同一炒锅 | DB52/T 995-2015 第6.2.5条", "锅温 | 150～200 ℃（杀青结束后立即降温） | 同上", "揉捻时间 | 8～10 min | 同上", "原则 | \"轻～重～轻\"交替用力 | 同上", "出锅程度 | 茶叶成条变软，手捏不粘 | 同上", "设备 | 同一炒锅 | DB52/T 995-2015 第6.2.6条", "锅温 | 120～170 ℃ | 同上", "做形时间 | 8～12 min | 同上", "手法 | 搓团：将茶团置于手心滚动，按同一方向搓揉→定型→解块，反复进行，使茶条卷曲 | 同上", "出锅程度 | 茶条卷曲，含水量达20%～40% | 同上", "设备 | 同一炒锅 | DB52/T 995-2015 第6.2.7条", "锅温 | 120～150 ℃ | 同上", "提毫时间 | 8～12 min | 同上", "做形叶含水量 | 20%～40%（进入提毫时） | 同上", "手法 | 双手握住茶团，掌心用力，让茶团相互摩擦显毫 | 同上", "出锅程度 | 茶毫显露，茶条变硬显脆；含水量降至10%～20% | 同上", "设备 | 同一炒锅（手工）；烘焙机或烘干机（机械） | DB52/T 995-2015 第6.2.8条、6.3.9条", "手工锅温 | 100～150 ℃ | 同上 6.2.8", "手工烘焙时间 | 8～15 min | 同上", "手工翻叶 | 每2～3 min翻动一次，动作要轻、翻动彻底 | 同上", "出锅程度（手工） | 手捏成粉，含水量≤6% | 同上", "机械烘焙温度 | 110～120 ℃ | 同上 6.3.9", "机械烘焙厚度 | 4～6 cm | 同上", "出锅程度（机械） | 含水量≤6% | 同上", "机械杀青 | 金属导热杀青机锅壁温度380～450 ℃，时间1～2 min；汽热杀青机蒸汽温度90～100 ℃，热风温度100～180 ℃；出锅含水量58%～62% | DB52/T 995-2015 第6.3.4条", "机械揉捻 | 投叶量装至距揉桶口5～10 cm；时间25～30 min；成条率≥80% | 同上 6.3.6条", "机械初烘 | 风温100～120 ℃，时间10～15 min，叶厚≤5 cm；出锅含水量50%～55% | 同上 6.3.7条", "贮存温度 | 0～5 ℃（专用库房或高温冷库） | DB52/T 995-2015 第6.2.12条", "库房要求 | 干燥、通风、避光、防晒 | 同上", "产品保质期 | 24个月 | DB52/T 433-2018 第8.3条"],
      "quality": "感官品质特征（参照GB/T 23776-2018，DB52/T 433-2018 表1）： 【来源：DB52/T 433-2018 表1】 品质俗称：\"三绿透三黄\"——干茶绿中透黄、汤色绿中透黄、叶底绿中透黄【来源：新华网贵州频道，2022】。 审评要点： 外形重在\"紧细卷曲、满披白毫\"，鱼钩状卷曲为典型特征 香气以嫩香、栗香为上 滋味鲜醇回甘，忌粗淡 汤色嫩黄绿明亮",
      "grade": ["等级 | 外形 | 香气 | 滋味 | 汤色 | 叶底", "尊品 | 紧细卷曲、满披白毫、匀整、嫩绿、净 | 嫩香、栗香 | 鲜醇 | 嫩黄绿明亮 | 嫩绿、鲜活匀整", "珍品 | 紧细较卷、白毫显露、匀整、绿润、净 | 嫩香、栗香、清香 | 鲜爽回甘 | 嫩（浅）黄绿明亮 | 嫩匀、鲜活黄绿明亮", "特级 | 较紧细、弯曲露毫、匀整、绿润、净 | 清香、栗香 | 醇厚 | 黄绿较亮 | 黄绿较亮", "等级 | 依据标准", "尊品、珍品、特级、一级、二级（共5级） | DB52/T 433-2018《都匀毛尖茶》第4.1条", "项目 | 尊品 | 珍品/特级 | 一级/二级", "水分/% ≤ | 6.0 | 6.5 | 7.0", "总灰分/% ≤ | 6.5 | 6.5 | 7.0", "水浸出物/% ≥ | 43.2 | 40.0 | 38.0", "粗纤维/% ≤ | 15.0 | 15.0 | 16.0"],
      "standards": ["DB52/T 433-2018《都匀毛尖茶》——贵州省农业农村厅，https://nynct.guizhou.gov.cn/xwzx/wjzz/201810/W020181023579577827383.pdf", "DB52/T 995-2015《都匀毛尖茶加工技术规程》——贵州省农产品质量安全追溯信息网，http://sy.nynct.guizhou.gov.cn/standard_10007_ny/201912/P020191206391398245903.pdf（注：该标准已于2024-01-02经贵州省市场监督管理局《关于废止〈威宁芜菁甘蓝种子生产技术规程〉等15项贵州省地方标准的公告》废止；其工艺参数仍被现行DB52/T 433-2018《都匀毛尖茶》规范性引用，现行加工技术依据参照DB5227/T 114-2022《地理标志产品 都匀毛尖茶综合标准体系》）", "都匀毛尖茶官网——品牌与工艺介绍，http://www.dymjc.com.cn/brand.html", "贵州省人民政府——非遗贵州·都匀毛尖茶制作技艺，https://www.guizhou.gov.cn/ztzl/wzgz/yzgz_5967100/mlfy/202407/t20240708_85075142.html", "新华网贵州频道——都匀毛尖\"三绿透三黄\"报道，http://gz.news.cn/2022-12/05/c_1129184967.htm", "DB5227/T 114-2022《地理标志产品 都匀毛尖茶 综合标准体系》（2023-01-17发布，2023-05-01实施）——黔南州农业科学研究院，https://qnznky.qiannan.gov.cn/xxgk/zlxz/202312/P020231204454963431739.pdf"],
      "processNote": ""
    }, {
      "id": "huangshan_maofeng",
      "name": "黄山毛峰",
      "category": "green",
      "origin": "安徽黄山",
      "picking": "特级一等以一芽一叶初展为主〔来源：GB/T 19460修订报批稿 表1〕",
      "craftChain": "鲜叶 → 摊青 → ★杀青 → 摊凉回潮 → ★做形（理条或揉捻） → ★毛火（初烘） → 摊凉 → ★足火（复烘） → 干茶 → 整理归类 【来源：GB/T 19460修订报批稿 第7.3.1条】 核心工序为杀青、做形、毛火、足火四道。黄山毛峰为烘青绿茶，干燥以烘焙为主（毛火+足火两次烘焙），不经过炒干。特级二等以下可采用机械生产【来源：GB/T 19460修订报批稿；DB34/236-2002已废止，不再引用】。",
      "steps": [{
        "name": "摊青",
        "text": "作用原理： 摊青使鲜叶均匀失水，叶质变软，散发青草气，为杀青做准备。"
      }, {
        "name": "杀青★",
        "text": "手工杀青： 机械杀青： 作用原理： 高温钝化多酚氧化酶活性，制止酶促氧化；散发青草气，使叶质柔软便于做形。"
      }, {
        "name": "摊凉回潮",
        "text": "作用原理： 使杀青叶降温，茎叶水分均衡分布，便于做形，避免碎断。"
      }, {
        "name": "做形（理条或揉捻）★",
        "text": "手工做形： 机械理条： 机械揉捻： 作用原理： 做形使芽叶稍卷曲成条（黄山毛峰外形为\"雀舌状\"，略卷而非紧卷），轻度破坏叶细胞增进滋味，同时保持芽叶完整、白毫显露。黄山毛峰做形较轻，不追求紧结卷曲，这是与碧螺春、都匀毛尖的重要区别。"
      }, {
        "name": "毛火（初烘）★",
        "text": "手工干燥（炭火烘焙）： 机械干燥： 作用原理： 毛火为初烘，快速蒸发大部分水分，固定外形，发展香气。温度先高后低，避免高温焦边。"
      }, {
        "name": "摊凉（毛火后）",
        "text": "作用原理： 使毛火叶降温，水分均衡分布，便于足火时均匀干燥。"
      }, {
        "name": "足火（复烘）★",
        "text": "手工干燥： 机械干燥： 作用原理： 足火为复烘，低温慢烘使茶叶充分干燥至安全含水率，同时发展香气（黄山毛峰的\"香高持久\"得益于低温慢烘），固定品质。"
      }, {
        "name": "整理归类",
        "text": ""
      }],
      "params": ["方式 | 自然摊青或机械摊青 | GB/T 19460修订报批稿 第7.3.2.1条", "环境温度 | ≤30 ℃ | 同上", "摊青程度 | 鲜叶表面失去光泽，叶质稍柔软，青气减退，含水率68%～72% | 同上", "设备 | 直径约50 cm的桶锅 | GB/T 19460修订报批稿 第7.3.2.2.1条", "锅温 | 130～150 ℃，先高后低 | 同上", "投叶量 | 一芽一叶初展：200～250 g/锅；一芽一叶及以下：500～700 g/锅 | 同上", "翻炒频率 | 50～60 次/min | 同上", "扬叶高度 | 叶子离开灶面约20 cm | 同上", "杀青时间 | 3～4 min | 同上", "出锅程度 | 芽叶质地柔软，表面失去光泽，青气消失，茶香显露 | 同上", "设备 | 滚筒杀青机 | GB/T 19460修订报批稿 第7.3.2.2.2条", "杀青温度 | 240～280 ℃，先高后低 | 同上", "杀青时间 | 2.5～3.0 min | 同上", "出锅程度 | 叶色暗绿，叶质柔软略有黏性，嫩梗折而不断，手握成团松手不易散开，青气散失显露清香，含水率50%～55% | 同上", "操作 | 杀青叶及时摊开散热冷却 | GB/T 19460修订报批稿 第7.3.2.3条", "堆叶厚度 | 5～8 cm | 同上", "回潮时间 | 30～60 min | 同上", "程度 | 手握茶坯不刺手 | 同上", "一芽一叶初展原料 | 杀青适度时继续在锅内抓带几下，轻揉和理条做形 | GB/T 19460修订报批稿 第7.3.2.4.1条", "一芽一叶及以下原料 | 起锅后摊开散热，轻揉2～5 min，使之稍卷曲成条 | 同上", "揉捻要求 | 速度慢，压力轻，边揉边抖，保持芽叶完整，白毫显露，色泽绿润 | 同上", "设备 | 多槽式往复理条机或阶梯式多槽理条机 | GB/T 19460修订报批稿 第7.3.2.4.2条", "温度 | 120～150 ℃ | 同上", "投叶量 | 往复理条机每条小槽60～100 g | 同上", "理条时间 | 3～8 min | 同上", "程度 | 芽叶稍收拢，茶坯略干不黏 | 同上", "装叶量 | 比揉桶上沿低3～5 cm | GB/T 19460修订报批稿 第7.3.2.4.3条", "加压原则 | \"轻、重、轻\"，嫩叶\"轻压短揉\" | 同上", "揉捻时间 | 15～30 min（按原料老嫩及机型确定） | 同上", "成条率 | ≥80% | 同上", "设备 | 4只烘笼，炭火烘焙 | GB/T 19460修订报批稿 第7.3.2.5.1条", "烘顶温度 | 第1只（明炭火）：90～95 ℃；第2只：80～85 ℃；第3只：70～75 ℃；第4只：60～65 ℃（依次下降） | 同上", "操作 | 边烘边翻，按顺序移动烘顶 | 同上", "每笼停留时间 | 3～4 min | 同上", "翻叶要求 | 翻叶要勤、摊叶要匀、操作要轻、火温要稳 | 同上", "出锅程度 | 茶叶含水率15%～20% | 同上", "温度 | 100～120 ℃ | GB/T 19460修订报批稿 第7.3.2.5.2条", "摊叶厚度 | 2～3 cm | 同上", "时间 | 8～12 min | 同上", "出锅程度 | 手握茶坯有较强刺手感，含水率20%～25% | 同上", "操作 | 毛火叶及时摊开散热冷却 | GB/T 19460修订报批稿 第7.3.2.6条", "堆叶厚度 | 5～8 cm | 同上", "摊凉时间 | 30～60 min | 同上", "操作 | 将8～10只烘笼的毛火叶合并成一笼进行足火 | GB/T 19460修订报批稿 第7.3.2.7.1条", "烘顶温度 | 60～65 ℃，低温慢烘 | 同上", "出锅程度 | 茶梗手折即断，茶条手碾成粉末，含水率≤6.5% | 同上", "方式 | \"低温慢烘\" | GB/T 19460修订报批稿 第7.3.2.7.2条", "温度 | 70～90 ℃ | 同上", "出锅程度 | 茶梗手折即断，茶条手碾成粉末，含水率≤6.5% | 同上", "操作 | 干茶经风选机或色选机精选除杂，按产品质量要求整理分级归类 | GB/T 19460修订报批稿 第7.3.2.8条"],
      "quality": "感官品质特征（参照GB/T 23776-2018，GB/T 19460修订报批稿 表2）： 【来源：GB/T 19460修订报批稿 表2】 审评要点： 外形重在\"芽头肥壮、形似雀舌、嫩绿泛象牙色\"，金黄片（鱼叶）为高档特征 香气以嫩香馥郁、清香高长为上，\"香高持久\"是黄山毛峰标志性特征 滋味甘鲜、鲜醇回甘，\"耐冲泡\"为特点 叶底芽头肥壮、嫩匀亮 作为烘青绿茶，黄山毛峰香气较炒青绿茶更清高，滋味更醇和",
      "grade": ["产品级别 | 鲜叶质量", "特级一等 | 一芽一叶初展为主", "特级二等 | 一芽一叶为主", "特级三等 | 一芽二叶初展为主", "一级 | 一芽二叶为主", "二级 | 一芽二叶和一芽三叶初展", "级别 | 外形 | 香气 | 汤色 | 滋味 | 叶底", "特级一等 | 芽头肥壮，匀齐，形似雀舌，毫显，嫩绿泛象牙色，有金黄片 | 嫩香馥郁持久 | 嫩绿清澈明亮 | 甘鲜 | 芽头肥壮，嫩匀亮", "特级二等 | 芽头较肥壮，匀齐，毫显，绿润 | 清香高长 | 浅绿明亮 | 鲜醇 | 芽头较肥壮，嫩绿匀亮", "特级三等 | 芽叶较肥壮，匀有毫，条微卷，绿润 | 清香持久 | 嫩黄绿明亮 | 醇厚鲜爽 | 芽叶柔软，嫩黄绿匀亮", "一级 | 条微卷，较匀整，隐毫，绿较润 | 清香较高 | 浅黄绿亮 | 醇厚较爽 | 黄绿较匀亮", "二级 | 条略卷，尚匀整，绿尚润 | 清香 | 黄绿亮 | 醇厚 | 黄绿尚匀亮", "等级 | 依据标准", "特级一等、特级二等、特级三等、一级、二级（共5级） | GB/T 19460-2008《地理标志产品 黄山毛峰茶》（修订报批稿第5.1条）", "项目 | 指标（所有等级）", "水分/% | ≤6.5", "粉末/% | ≤0.5", "总灰分/% | ≤6.5", "水浸出物/% | ≥37.0", "茶多酚/% | ≥14.0", "儿茶素/% | ≥8.5", "游离氨基酸总量/% | ≥3.0", "粗纤维/% | ≤14.0", "水溶性灰分（占总灰分）/% | ≥45.0"],
      "standards": ["GB/T 19460-2008《地理标志产品 黄山毛峰茶》（现行）——国家标准化管理委员会，https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=74D2547878A48B143A55D6C3722B6DA7", "GB/T 19460修订报批稿《地理标志产品质量要求 黄山毛峰茶》（GB/T 19460-202X，2025年12月公示）——国家市场监督管理总局，https://www.samr.gov.cn:8020/cms_files/filemanager/1647978232/attach/202512/923a0cd9d7d94449a18e1a8bf1ecf660.pdf", "DB34/236-2002《黄山毛峰茶》（安徽省地方标准，已于2024-04-25废止；现行执行GB/T 19460-2008）——安徽省茶业协会，http://www.aticoc.com/cybz/info.aspx?itemid=159", "黄山市人民代表大会常务委员会公告——黄山毛峰保护条例，http://www.ahhsrd.gov.cn/cwhgg/cwhhy/9211098.html", "黄山市人民政府——黄山毛峰定义与产区，https://www.huangshan.gov.cn/site/tpl/4564?contentId=9082896&platformCode=huangshan_ex9_4"],
      "processNote": ""
    }, {
      "id": "xihu_longjing",
      "name": "西湖龙井",
      "category": "green",
      "origin": "浙江杭州·西湖产区",
      "picking": "特级以一芽一叶初展为主，芽长于叶；等级降低则叶片比例增高〔来源：GB/T 18650-2008；龙井茶国家标准样品（2024）〕",
      "craftChain": "手工炒制工艺流程（传统）： 鲜叶摊放 → ★青锅（杀青+初步做形） → 摊凉回潮 → 青锅叶分筛 → ★辉锅（充分干燥+定型做形） → 干茶分筛 → 挺长头 → 复筛分类归堆 → 收灰与贮藏 【来源：DB33/T 239-2023《龙井茶加工技术规程》（2023-10-10发布，2023-11-10实施，代替DB33/T 239-2012）】 机制工艺流程（特级至二级鲜叶）： 鲜叶摊放 → 青锅 → 摊凉回潮 → 理条整形 → 二青固形 → 摊凉回潮 → 辉锅 → 干茶分筛 → 筛面复辉 → 复筛分类归堆 → 收灰与贮藏 注：核心工序为青锅和辉锅。青锅完成杀青与初步做形，辉锅完成最终定型与干燥。龙井茶无独立揉捻工序，做形在青锅和辉锅中以抓、抖、搭、拓、捺、推、扣、压、甩、磨十大手法完成。",
      "steps": [{
        "name": "鲜叶摊放",
        "text": "作用原理： 摊放使鲜叶适度失水，叶质变软便于炒制；同时散发青草气，促进内含物质轻度转化，提升香气鲜爽度。"
      }, {
        "name": "青锅（手工）★",
        "text": "作用原理： 青锅是杀青与初步做形的合并工序。高温钝化多酚氧化酶活性，制止酶促氧化；同时通过十大手法使芽叶初步压扁成条，为辉锅定型打基础。 交叉印证：学术文献记载高档龙井手工青锅投叶量0.20～0.25 kg，投叶锅温约300 ℃（实测锅壁温度，与机显温度口径不同）【来源：《中国茶叶》\"高档龙井茶手工炒制工艺参数的探索\"】。两者温度口径不同（机显vs锅壁实测），使用时需注意区分。"
      }, {
        "name": "摊凉回潮",
        "text": "作用原理： 使青锅叶各部位水分均衡，茎叶回软，避免辉锅时碎断，便于后续做形。"
      }, {
        "name": "青锅叶分筛",
        "text": ""
      }, {
        "name": "辉锅（手工）★",
        "text": "作用原理： 辉锅是龙井茶定型和干燥的关键工序。通过\"轻-重-轻\"的用力节奏与锅温配合，使茶叶进一步压扁、光滑、挺直，同时脱去茸毛（龙井茶要求光滑少毫），并充分干燥至安全含水率。 交叉印证：多份资料记载辉锅锅温60～80 ℃起始，提温至80～90 ℃脱毫，再降至50 ℃左右出锅；高级茶辉锅时间15～20 min，投叶量250～300 g【来源：智汇三农；中国茶叶网；国家现代农业产业技术体系四川创新团队】。与浙江省地方标准 DB33/T 239-2023 的温度（起始90 ℃）略有差异，可能因锅温测量位置（锅壁/锅底/机显）和原料等级不同所致。"
      }, {
        "name": "机械加工关键参数（补充）",
        "text": ""
      }, {
        "name": "收灰与贮藏",
        "text": ""
      }],
      "params": ["摊放方式 | 室内自然摊放为主，可辅以鼓风、空调室或专用摊青设备 | 龙井茶加工技术规程（DB33/T 239-2023）6.2.1", "摊放厚度 | 二级以上鲜叶：≤30 mm（每平方米约1 kg）；三、四级鲜叶：40～50 mm | 同上 6.2.2", "摊放时间 | 一般6 h～12 h；晴天短些，阴雨天长些；嫩叶长摊，低档叶短摊 | 同上 6.2.3", "翻叶次数 | 二级至四级鲜叶轻翻1～2次；二级以上尽量少翻 | 同上 6.2.4", "摊放程度 | 叶面萎缩，叶质由硬变软，叶色由鲜绿转暗绿，清香显露，含水率降至70±2% | 同上 6.2.5", "设备 | 传统炒锅（电锅或柴锅），炒茶专用油脂润滑锅面 | 龙井茶加工技术规程（DB33/T 239-2023）6.3", "下锅锅温 | 特级鲜叶：150～170 ℃；一级至二级：170～190 ℃；三级至四级：180～200 ℃（机械温度计显示，锅温从高到低） | 同上 6.3.1", "投叶量 | 特级：100～150 g/锅；一级至二级：150～200 g/锅；三级至四级：250～300 g/锅 | 同上 6.3.2", "全程时间 | 12 min～14 min | 同上 6.3.3", "手法阶段 | 先轻抓轻抖（约3 min）→ 降温减抖，加搭、拓、甩（6～7 min）→ 加快速度再炒3～4 min至有干燥感起锅 | 同上 6.3.3", "出锅程度 | 芽叶初具扁平、挺直、软润、色绿一致，含水率降至约40% | 同上 6.3.4", "操作 | 青锅叶出锅后及时摊凉散热，适当并堆，必要时覆盖清洁棉布 | 龙井茶加工技术规程（DB33/T 239-2023）6.4", "回潮时间 | 1 h～2 h | 同上 6.4.3", "程度 | 芽、茎、叶各部位水分重新分布均匀回软 | 同上 6.4.2", "操作 | 用不同孔径茶筛分成2～3档，簸去片末；高档叶可不分筛 | 龙井茶加工技术规程（DB33/T 239-2023）6.5", "目的 | 筛面、中筛、筛底叶分别辉锅，保证成形均匀 | 同上", "设备 | 同青锅炒锅 | 龙井茶加工技术规程（DB33/T 239-2023）6.6", "锅温控制 | 起始约90 ℃ → 中间65～75 ℃ → 出锅前约75 ℃ | 同上 6.6.1", "投叶量 | 特级至二级：200～250 g青锅叶/锅（约4锅青锅叶合1锅辉锅）；三级至四级：250～300 g | 同上 6.6.2", "全程时间 | 15 min～20 min | 同上 6.6.4", "手法阶段 | 轻抓轻抖轻搭理条（3～8 min）→ 拓、抓、捺、扣做形（5～6 min）→ 茸毛显露时略提温减力，抓、挺、磨脱毫定型（约5 min） | 同上 6.6.3", "出锅程度 | 干茶含水率≤6.5%，茶毛脱净，茶叶一折就断 | 同上 6.6.5", "机械青锅 | 长板式扁形茶炒制机 | 下锅温度240～200 ℃（机显）；投叶量特级80～120 g/锅，一级至二级120～150 g/锅；全程4～5 min；出锅含水率约30% | 龙井茶加工技术规程（DB33/T 239-2023）7.1.3", "理条整形 | 扁茶脱毫磨光机 | 锅温60 ℃（机显）；投叶量2.5 kg/槽，4槽约10 kg；往复频率126次/min；时间20 min；含水率约23% | 同上 7.1.5", "二青固形 | 长板式扁形茶炒制机 | 下锅温度170～180 ℃；投叶量40～50 g/锅；时间2～3 min；含水率10%～12% | 同上 7.1.6", "机械辉锅 | 八角滚筒辉锅机 | 筒壁温度80～90 ℃；投叶量2～4 kg；转速7～8 r/min；时间20～30 min；含水率≤6.5% | 同上 7.1.8", "收灰比例 | 茶叶:生石灰 = 5:1，用纸或白布隔开，时间10～15天 | 龙井茶加工技术规程（DB33/T 239-2023）附录", "贮藏温度 | 低温专用冷库，≤5 ℃ | 同上"],
      "quality": "感官品质特征（参照GB/T 23776-2018五因子审评）： 审评要点： 外形重在\"扁平光滑挺直\"，糙米色（嫩黄）为高档特征，忌深绿暗条 香气以嫩香、栗香为上，兰花香为珍稀品种特征 滋味重在鲜醇甘爽，忌苦涩、熟闷 叶底成朵、嫩绿明亮为佳",
      "grade": ["因子 | 特级品质描述 | 来源", "外形 | 扁平光滑、挺直尖削；嫩绿匀润；匀整重实；匀净 | GB/T 18650-2008 表2", "汤色 | 嫩绿明亮、清澈 | 同上", "香气 | 嫩香持久（或栗香、兰花香） | 同上；行业共识", "滋味 | 鲜醇甘爽 | 同上", "叶底 | 芽叶细嫩成朵，匀齐，嫩绿明亮 | 同上", "等级 | 依据标准", "特级、一级、二级、三级、四级、五级（共6级） | GB/T 18650-2008《地理标志产品 龙井茶》第6.1条"],
      "standards": ["GB/T 18650-2008《地理标志产品 龙井茶》——国家标准化管理委员会，https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=96D0A5A54BBC305315CDCB3B1E0D90E6", "GB/T 18650-2008全文PDF——杭州市临安区人民政府，https://www.linan.gov.cn/picture/old/P020160920548078373029.pdf", "《龙井茶加工技术规程》（DB33/T 239-2023）——浙江省市场监督管理局，https://oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/gjbzh-oss/localFile/2023-02-23/d4332b747df4be42024f22ae57c67408.pdf", "T/XHLJ 001-2021《西湖龙井茶》——杭州市西湖龙井茶管理协会，https://www.xhlj.org.cn/upload/fck/20211209161522_969.pdf", "农业农村部农产品质量安全中心科普——龙井茶品种介绍，http://www.aqsc.agri.cn/kpzc/kpxc/201804/t20180411_324059.htm", "杭州西湖风景名胜区管委会——西湖龙井开采资讯，https://westlake.hangzhou.gov.cn/art/2024/3/21/art_1639430_59046408.html", "《高档龙井茶手工炒制工艺参数的探索》——《中国茶叶》，中国农业科学院农业信息研究所，https://www.agrijournal.com.cn/article/detail/0BC13523-64E9-4C8F-9DEF-B15CF3DBAE1A"],
      "processNote": ""
    }, {
      "id": "mengding_huangya",
      "name": "蒙顶黄芽",
      "category": "yellow",
      "origin": "四川雅安·蒙顶山",
      "picking": "品种：蒙山群体种及其选育品种。 嫩度/采摘标准：特级黄芽采单芽，鲜叶分级标准为单芽占重量98%（个数96%），一芽一叶初展占重量2%（个数3%~4%）〔来源：GB/T 18665-2008 附录B 表B.1〕。一级黄芽采一芽一叶初展（形如鸦雀嘴）〔来源：智汇三农·蒙顶黄芽词条〕。 采摘时间：每年春分前后开采，当茶园蓬面上有3%~5%芽梢符合采摘标准时开采〔来源：GB/T 18665-2008 附录B.1；茶七网〕。 鲜叶等级：按 GB/T 18665-2008 附录B 分为特级（单芽）等，要求芽叶匀齐肥壮，不带鱼叶、鳞片、茶蒂。",
      "craftChain": "鲜叶摊放 → 杀青 → 摊凉 → 炒二青 → 包黄★ → 炒三青 → 堆黄★ → 四炒 → 干燥提毫 → 烘干 → 整理 → 拼配 → 烘焙提香 → 定量装箱入库 〔来源：GB/T 18665-2008 6.4.1〕 核心工序标注：包黄★、堆黄★（闷黄的两种形式，与炒制交替进行，形成\"三炒三闷\"的独特工艺）。",
      "steps": [],
      "params": ["鲜叶摊放 | 室内自然摊放 | 摊放约6h（间接鼓风2~3h）〔来源：食品工业科技2020〕 | 散发表面水分和青草气，促进鲜叶内含物质轻度转化", "杀青 | 口径约50cm平锅（电热或干柴供热），或理条机 | 传统锅温120~130℃（涂白蜡润滑，蜡烟散尽后投叶），每锅投嫩芽120~150g，历时4~5min，至含水率55%~60%出锅〔来源：华人佛教网；顺企网；智汇三农〕；机械理条机杀青温度(180±10)℃，叶温(80±10)℃，用时5min，至含水率约55%〔来源：食品工业科技2020〕 | 高温钝化多酚氧化酶活性，蒸发水分，散发青草气，为闷黄奠定基础。杀青温度略低于绿茶（绿茶杀青通常锅温180~200℃以上）", "摊凉 | 簸箕或竹匾 | 出锅后迅速摊凉，使叶温下降，水分重新分布 | 防止余热导致叶色变黄不均，便于后续做形", "炒二青 | 平锅 | 锅温约75℃左右，约3~4min〔来源：蒙顶黄芽主要成分含量及组分分析，2014〕 | 继续散失水分，初步做形", "初包（包黄）★ | 白布或原色草纸包裹，每包0.8~1.6kg，放置制茶灶上保温 | 包内叶温保持约55℃，闷黄60~180min（即1~3h），每30min开包翻动一次，待叶温降至35℃左右、叶色黄绿为适度〔来源：蒙顶黄芽主要成分含量及组分分析，2014〕；另有资料记载初包含水量60%~65%，温度45~50℃，时间60min，减重率控制在10%以内〔来源：新浪·雅安黄茶〕 | 核心工序。利用湿热作用使叶绿素降解、多酚类物质非酶性氧化，形成黄茶\"黄汤黄叶\"的品质特征", "炒三青（复炒） | 平锅 | 锅温约75℃，3~4min〔来源：蒙顶黄芽主要成分含量及组分分析，2014〕；另有资料锅温120℃，时间约3min，减重率10%~15%〔来源：新浪·雅安黄茶〕 | 散失包黄后茶叶表面水分，终止前期闷黄反应，便于二次闷黄", "复包/堆黄★ | 草纸包裹或堆放 | 复包含水量35%~50%，温度待核实，闷黄时间约30~40min（均匀黄变）〔来源：抖音·学茶要略；新浪·雅安黄茶〕；传统工艺中堆黄为将炒三青叶堆积，利用余热继续黄变 | 核心工序。二次闷黄使黄变更均匀充分，形成蒙顶黄芽特有的甜香和醇厚滋味", "四炒 | 平锅 | 锅温待核实，炒至茶坯基本定型 | 整形定形，进一步散失水分", "干燥提毫 | 烘笼或烘干机 | 温度待核实，烘至含水率约5%左右〔来源：抖音·黄茶制作工艺〕 | 固定外形，促进白毫显露，发展香气", "烘干/烘焙提香 | 烘焙机 | 温度待核实，足火至含水率≤6.5%（芽型黄茶国标要求）〔来源：GB/T 21726-2018 表2〕 | 充分干燥，便于贮藏，提升香气"],
      "quality": "依据 GB/T 18665-2008 表1及 GB/T 21726-2018： 感官审评要点（参照 GB/T 23776-2018）：外形重点看扁平挺直度、嫩黄油润度和全芽披毫程度；内质重点审评甜香馥郁度、杏黄明亮汤色和鲜爽甘醇滋味，叶底要求全芽黄亮鲜活。蒙顶黄芽氨基酸含量远高于同等级绿茶，苦涩极低〔来源：GB/T 18665-2008 表1；抖音·学茶要略〕。",
      "grade": [],
      "standards": ["1 国家标准 GB/T 18665-2008（含XG1-2025修改单）《地理标志产品 蒙山茶》 国家质检总局/国标委 https://www.samr.gov.cn", "2 国家标准 GB/T 21726-2018《黄茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/xxfw39/cpjgzyxx/cy/cyxgbz/4646904/2022102809573014258.pdf", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 核心期刊 《蒙顶黄芽不同加工工序中色泽变化与品质相关性研究》 食品工业科技，2020 http://www.spgykj.com/cn/article/doi/10.13386/j.issn1002-0306.2020100194", "5 核心期刊 《蒙顶黄芽主要成分含量及组分分析》 2014 —", "6 权威机构 智汇三农·蒙顶黄芽词条 中国农业科学院 https://www.pwsannong.com"],
      "processNote": "闷黄参数汇总：蒙顶黄芽采用\"包黄+堆黄\"两次闷黄，初包温度45~55℃、时间1~3h、含水率60%~65%；复包温度约35~50℃、时间30~60min、含水率35%~50%。全程手工低温慢制，工艺繁复。 传统手工工艺参数（文献交叉验证）：杀青——平锅锅温100℃涂蜡、130℃开杀（约120~130℃），投叶量120~150g/锅，历时4~5min，出锅含水率55%~60%〔来源：智汇三农·蒙顶黄芽词条；中国茶文化网〕；初包（初包黄）——出叶后待叶温降至55℃左右，用白布或原草纸包裹（每包0.8~1.6kg），在制茶灶上保温60~180min，每30min开包翻动，叶温降至35℃左右、叶色黄绿为适度〔来源：《蒙顶黄芽主要成分含量及组分分析》2014〕；复炒——锅温约70~80℃（约75℃），炒至含水率降至45%左右出锅〔来源：行业资料〕。机制工艺参考：滚筒杀青机280℃、复锅（二炒）130℃、烘干80℃〔来源：《闷黄新工艺对蒙顶黄芽品质及香气的影响》，食品工业科技，2021〕。注：锅温为平锅锅壁温度，机制为机显/筒壁温度，两种口径不可混用。"
    }, {
      "id": "wanxi_huangda",
      "name": "皖西黄大茶",
      "category": "yellow",
      "origin": "安徽六安·金寨/霍山",
      "picking": "品种：皖西当地群体种及适制中小叶种。 嫩度/采摘标准：一芽三叶至多叶，不带病叶、杂质〔来源：DB34/T 皖西黄茶加工技术规程 表1〕。传统霍山黄大茶采摘标准为一芽四、五叶，甚至更粗老，俗称\"大叶茶\"〔来源：信阳师范学院学报2025〕。 采摘时间：一般在谷雨前后开采，春茶为主〔来源：待核实，行业惯例〕。 鲜叶等级：按 DB34/T 表1，黄大茶鲜叶质量要求为\"一芽三叶至多叶，不带病叶、杂质\"。",
      "craftChain": "传统制法（生锅—二青锅—熟锅三连锅）： 鲜叶摊放 → 杀青（生锅） → 做形（二青锅→熟锅） → 初烘 → 闷黄★（堆闷） → 拉小火 → 拉老火（足烘） 鲜叶摊放 → 杀青（滚筒） → 揉捻 → 解块 → 初烘（毛火） → 闷黄★（堆闷） → 复滚（拉小火） → 足烘（拉老火） 〔来源：DB34/T《皖西黄茶加工技术规程》6.3〕 核心工序：闷黄★（初烘后趁热大堆堆闷5~7天）。黄大茶的闷黄是所有黄茶中时间最长、堆温最高的。",
      "steps": [],
      "params": ["鲜叶摊放 | 室内竹匾摊放 | 薄摊散发青草气和表面水分，待芽叶发出清香即可；机械制法摊至含水率72%~74%〔来源：DB34/T 6.3.2.1〕 | 散发表面水，促进轻度转化", "杀青（生锅） | 普通二型锅，三锅相连炒茶灶，锅倾斜25°~30°，竹丝炒把 | 锅温180~200℃，投叶量250~500g，炒约3~5min，叶质柔软、叶色暗绿即扫入二青锅〔来源：DB34/T 6.3.1.2〕 | 钝化酶活性，蒸发水分。黄大茶杀青温度较高（因原料粗老），但仍略低于同级绿茶", "做形（二青锅） | 同上 | 锅温150~170℃，炒法与生锅基本相同，起揉条作用；炒至茶叶成团时松把抖散团块，待皱叠成条、茶汁溢出有粘手感，扫入熟锅〔来源：DB34/T 6.3.1.3〕 | 初步揉捻成条，破坏叶细胞", "做形（熟锅） | 同上 | 锅温130~150℃，旋转搓揉，使叶子吞吐于竹丝炒把间（谓之\"钻把子\"），炒至条索紧结、发出茶香、含水率45%~55%出锅〔来源：DB34/T 6.3.1.3〕 | 进一步紧条，做形定型", "初烘 | 烘笼烘焙 | 温度110~120℃，每隔2~3min翻烘一次，烘至七八成干、有刺手感、折之梗皮连，含水率30%~40%为适度〔来源：DB34/T 6.3.1.4〕 | 快速散失水分，为闷黄创造适宜含水率条件", "闷黄（堆闷）★ | 烘房内大堆堆放 | 初烘叶趁热堆闷，堆放厚度95~105cm，在烘房内堆闷5~7天，至叶色变黄为适度〔来源：DB34/T 6.3.1.5〕；另有资料记载堆积时间一般为5~7天〔来源：智汇三农·黄大茶〕 | 核心工序。长时间大堆高温高湿闷黄，使叶绿素大量降解、多酚类深度氧化，形成黄大茶特有的黄褐色泽、锅巴香和醇和滋味。闷黄时间为黄茶中最长", "拉小火 | 烘笼 | 温度130~140℃左右，每烘投叶量10kg，隔5~7min翻拌一次，烘至九成干，下烘摊晾3~5h〔来源：DB34/T 6.3.1.6〕；另有资料拉小火温度100~110℃，每烘9.8~10.2kg，30min〔来源：专利CN107258937A〕 | 进一步干燥，促进香气转化", "拉老火（足烘） | 栎炭明火高温烘焙 | 温度150~160℃，每烘投叶量12.5kg，时间约40~60min，勤翻、匀翻、轻翻；烘至足干，茶梗折之即断、手捻成末、梗心起泡呈菊花状、金黄色、梗有光泽、发出浓烈高火香、茶叶上霜、含水率≤6%为适度〔来源：DB34/T 6.3.1.6〕；机械法拉老火温度190~210℃〔来源：DB34/T 6.3.2.8〕 | 黄大茶标志性工序。高温明火快烘形成独特的\"锅巴香\"（高火香）和\"上霜\"外观，趁热踩篓包装"],
      "quality": "依据 GB/T 21726-2018 表1（多叶型）及行业资料： 感官审评要点（参照 GB/T 23776-2018）：黄大茶审评重点在于\"锅巴香\"的纯正度和持久性、汤色深黄明亮度、滋味醇和浓厚感。外形允许有茎梗，梗心呈菊花状、金黄色、有光泽为拉老火到位的标志。冲泡后茶汤有明显的焦香（类似炒米香/锅巴香），是区别于其他黄茶的核心特征〔来源：GB/T 21726-2018；抖音百科·霍山黄大茶〕。",
      "grade": [],
      "standards": ["1 国家标准 GB/T 21726-2018《黄茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/xxfw39/cpjgzyxx/cy/cyxgbz/4646904/2022102809573014258.pdf", "2 地方标准 DB34/T 2891-2017《皖西黄茶加工技术规程》（现行） 安徽农业大学/安徽省抱儿钟秀茶业 https://www.luan.gov.cn", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 核心期刊 《黄大茶加工过程中理化成分动态变化研究》 信阳师范学院学报(自然科学版)，2025 http://journal.xynu.edu.cn/article/doi/10.3969/j.issn.2097-583X.2025.04.001", "5 权威机构 智汇三农·黄大茶词条 中国农业科学院 https://www.pwsannong.com/c/2016-04-13/546116.shtml", "6 专利文献 CN107258937A 一种小火黄大茶的制作工艺 国家知识产权局 https://www.patenthub.cn"],
      "processNote": "传统制法参数（依据 DB34/T《皖西黄茶加工技术规程》6.3.1）： 机械制法补充参数：滚筒杀青温度290~310℃，至含水率55%~60%；揉捻采用55/65型揉捻机，轻-重-轻原则，成条率75%~80%；初烘（毛火）温度180℃，至含水率30%~40%〔来源：DB34/T 6.3.2〕。"
    }, {
      "id": "wenzhou_huangtang",
      "name": "温州黄汤（平阳黄汤）",
      "category": "yellow",
      "origin": "浙江温州·平阳",
      "picking": "品种：平阳特早茶、平阳本地群体种等。 嫩度/采摘标准：按 DB330326/T 02.02-2022 表1，鲜叶分四级： 特级：单芽至一芽一叶初展，芽叶匀齐健壮 一级：一芽一叶至一芽二叶初展，以一芽一叶为主 二级：一芽二叶至一芽三叶初展，以一芽二叶为主 三级：一芽三叶至一芽多叶和对夹叶 传统温州黄汤采摘标准为细嫩多毫的一芽一叶或一芽二叶初展〔来源：茶百科·温州黄汤；天下民宿〕。 采摘时间：每年清明前开采〔来源：茶百科·温州黄汤〕。 鲜叶等级：特级至三级，分级摊放、分级付制〔来源：DB330326/T 02.02-2022 4.2〕。",
      "craftChain": "鲜叶摊放 → 杀青 → 做形（揉捻） → 闷黄★（三闷三烘：一闷→一烘→二闷→二烘→三闷） → 干燥（三烘） → 毛茶整理 → 拼配匀堆 〔来源：DB330326/T 02.02-2022 5.2、5.3〕 核心工序：闷黄★，采用\"闷烘结合、三闷三烘\"的独特工艺，闷黄与烘焙交替进行。",
      "steps": [],
      "params": ["鲜叶摊放 | 室内自然摊放或摊青设备 | 摊放厚度3~5cm，时间6~15h（最多不超过20h），待叶质变软、叶色转暗绿、清香显露、含水率降至65%~70%为适度〔来源：DB330326/T 02.02-2022 5.3.1〕；另有研究采用摊青15~20h〔来源：中国食品学报2024〕 | 散发表面水分和青草气，促进内含物质转化", "杀青 | 平锅手工或小型滚筒/汽热杀青机 | 手工杀青用口径60cm光滑平锅，投叶量每锅0.2~0.25kg；机械杀青用直径30cm小型滚筒。杀青至叶质变软、叶色转暗、略卷成条、折梗不断、清香显露、含水率20%~40%为适度〔来源：DB330326/T 02.02-2022 5.3.2；全国地理标志网〕。研究参数：杀青温度230℃〔来源：中国食品学报2024〕；专利参数240~260℃，4~5min，失重率40%~50%〔来源：专利CN105145913A〕 | 钝化酶活性，蒸发水分。黄小茶杀青温度略低于绿茶", "做形（揉捻） | 手工或揉捻机 | 特级和一级鲜叶不揉，二级和三级鲜叶轻揉。手工揉捻1~2min；机揉投叶量以揉桶九成满为度，时间1~1.5min，加压以轻压为原则，二级基本上不加压〔来源：DB330326/T 02.02-2022 5.3.3〕。研究参数：揉捻15min〔来源：中国食品学报2024〕 | 高档料保持芽叶完整，低档料轻度揉捻成条", "一闷★ | 闷黄机、烘笼等加温加湿设备 | 温度40~50℃，湿度65%~75%，闷黄时间2~3h，以叶色呈绿中带黄、清香气开始显露为适度〔来源：DB330326/T 02.02-2022 5.3.4.1〕。传统工艺：揉捻叶堆放竹篮框内，上盖白湿布，厚度30~40cm，车间温度25~28℃，相对湿度65%~75%，闷黄5~6h〔来源：全国地理标志网；抖音百科〕 | 核心工序第一段。湿热作用下叶绿素开始降解，多酚类轻度氧化", "一烘 | 烘焙机 | 温度60~80℃，均匀薄摊厚度2~3cm，时间10~12min，初烘至含水率15%~20%，手握感仍柔软、茶香显露为宜〔来源：DB330326/T 02.02-2022 5.3.4.2〕 | 散失水分，终止一闷反应，为二闷做准备", "二闷★ | 闷黄设备 | 温度40~45℃，湿度75%~80%，时间3~4h，待叶色微黄、黄汤特殊闷香味渐显为止〔来源：DB330326/T 02.02-2022 5.3.4.3〕 | 核心工序第二段。继续黄变，发展平阳黄汤特有的闷香味（玉米香）", "二烘 | 烘焙机 | 温度80℃，薄摊厚度3~4cm，时间10~12min，复烘至含水率10%~15%，手握稍有触手感、特殊香气显露为宜〔来源：DB330326/T 02.02-2022 5.3.4.4〕 | 进一步干燥", "三闷★ | 闷黄设备 | 温度35~40℃，湿度80%~85%，闷黄时间4~5h，待叶色呈黄色、闷香味显露为止〔来源：DB330326/T 02.02-2022 5.3.4.5〕。研究参数：闷黄温度35℃，复闷20~24h至八成干〔来源：中国食品学报2024〕；学位论文优化工艺为温度40℃、湿度90%、时间10h〔来源：万方学位论文〕 | 核心工序第三段。最终完成黄变，形成\"三黄\"品质特征", "干燥（三烘） | 烘焙机 | 温度100℃，摊叶厚度4~5cm，时间30~40min，烘至茶叶含水率≤6.5%〔来源：DB330326/T 02.02-2022 5.3.5〕。研究参数：干燥温度60℃〔来源：中国食品学报2024〕 | 足干固定品质，便于贮藏"],
      "quality": "依据 GB/T 21726-2018 表1（芽叶型）及平阳黄汤地方标准： 感官审评要点（参照 GB/T 23776-2018）：平阳黄汤以\"三黄\"（外形黄、汤色黄、叶底黄）为核心品质特征，审评重点在于玉米香（或称\"玉米熟香\"）的纯正度、杏黄明亮汤色和醇厚回甘滋味。特级品要求芽叶匀齐、黄青油润〔来源：DB330326/T 02.02-2022；中国食品学报2024〕。",
      "grade": [],
      "standards": ["1 地方规范 DB330326/T 02.02-2022《平阳黄汤茶 第2部分：加工技术规程》 平阳县农业农村局/中华全国供销合作总社杭州茶叶研究所 https://oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn", "2 国家标准 GB/T 21726-2018《黄茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/xxfw39/cpjgzyxx/cy/cyxgbz/4646904/2022102809573014258.pdf", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 核心期刊 《不同闷黄时间对平阳黄汤滋味成分和品质的影响》 中国食品学报，2024 http://zgspxb.cnjournals.org/html/2024/6/20240626.html", "5 学位论文 《平阳黄汤闷黄工艺及适制性研究》 万方数据 https://d.wanfangdata.com.cn", "6 权威机构 全国地理标志原产地特产信息网·平阳黄汤茶 — https://www.sinogi.cn"],
      "processNote": "依据 DB330326/T 02.02-2022《平阳黄汤茶 第2部分：加工技术规程》5.3： 闷黄参数汇总：平阳黄汤采用\"三闷三烘\"工艺，闷黄温度逐段降低（50℃→45℃→40℃），湿度逐段升高（75%→80%→85%），时间逐段延长（3h→4h→5h），总闷黄时间约9~12h（地方标准），传统/研究工艺可达20~24h。这是黄小茶中闷黄工艺最复杂的代表。"
    }, {
      "id": "baihao_yinzhen",
      "name": "白毫银针",
      "category": "white",
      "origin": "福建·福鼎/政和",
      "picking": "品种：大白茶（福鼎大白/大毫、政和大白、福安大白）或水仙品种。 嫩度/采摘标准：单芽（肥壮单芽），或从一芽一叶初展新梢上剥取的芽头（俗称\"抽针\"）〔来源：GB/T 32743-2016 6.1；GB/T 22291-2017 3.1〕。政和白茶标准要求\"宜采用政和大白茶、福安大白茶等茶树春季新梢上的肥壮单芽\"〔来源：GB/T 22109-2026 政和白茶〕。 采摘时间：春茶，一般春分至清明期间开采，以头春芽头品质最佳〔来源：行业惯例，待核实具体日期〕。 鲜叶等级：按 GB/T 22291-2017，白毫银针成品分特级、一级两个等级〔来源：GB/T 22291-2017 表1〕。",
      "craftChain": "鲜叶 → 萎凋★（自然萎凋/加温萎凋/复式萎凋） → 干燥 → 拣剔 → 成品 〔来源：GB/T 32743-2016 5.1；GB/T 22291-2017 1〕 核心工序：萎凋★。白茶不炒不揉，萎凋是形成白毫银针品质的唯一核心工序，历时最长、控制最难。",
      "steps": [],
      "params": ["鲜叶验收摊放 | 竹筛/萎凋帘 | 进厂后分级摊放，晴天叶与雨露水叶分开、上午叶与下午叶分开、不同嫩度/品种分开。环境清洁、阴凉、通风、避阳光直射，及时加工不积压〔来源：GB/T 32743-2016 6.2〕 | 保证鲜叶新鲜度，防止发热变红", "萎凋★ | 竹筛（水筛）/萎凋帘/萎凋槽 | 摊叶量：竹筛上约0.1~0.13g/cm²；萎凋竹帘上厚度2~3cm（约0.06~0.08g/cm²）；萎凋槽厚度20~25cm〔来源：GB/T 32743-2016 6.3.1〕<br>温度：自然萎凋春茶15~25℃，夏秋茶25~35℃；加温萎凋室内温度25~35℃〔来源：GB/T 32743-2016 6.3.2〕。传统室内自然萎凋春茶室温18~25℃，相对湿度70%~80%〔来源：润元昌·白茶萎凋〕<br>时间：自然萎凋约36~50h；加温萎凋和复式萎凋约30~40h〔来源：GB/T 32743-2016 6.3.3〕。传统工艺可达48~72h〔来源：网易·2026白茶工艺流程〕<br>萎凋程度：萎凋叶含水率≤20%为适度，可及时干燥〔来源：GB/T 32743-2016 6.3.4〕 | 核心工序。长时间缓慢失水，使鲜叶发生轻度酶促氧化（多酚类轻度氧化、氨基酸转化、芳香物质形成），形成白茶\"满披白毫、毫香显著、清甜醇爽\"的品质特征。不炒不揉，最大程度保留芽叶形态和内含物质", "干燥 | 烘干机/烘笼/炭焙 | 干燥温度应平稳，避免波动；干燥次数为2~3次，温度≤100℃〔来源：GB/T 32743-2016 6.4.2〕。复烘（精制干燥）温度80~85℃，时间10~15min，至含水率5%~6%〔来源：GB/T 32743-2016 8.4〕 | 终止酶促氧化，固定品质，充分干燥便于贮藏。白毫银针干燥温度低于其他白茶，防止芽头焦碎", "拣剔 | 手工/色选机 | 剔除焦芽、红芽、暗红芽、黑芽、碎芽及非茶类夹杂物〔来源：GB/T 32743-2016 8.1.2〕 | 保证成品匀净度，白毫银针要求全芽匀齐"],
      "quality": "依据 GB/T 22291-2017 表1： 感官审评要点（参照 GB/T 23776-2018）：白毫银针审评重点在于芽针肥壮度、茸毛厚度、银灰白光泽度，内质重点审评毫香显露度、清鲜醇爽滋味和浅杏黄清澈汤色。叶底要求肥壮软嫩明亮。白毫银针富含氨基酸（尤以茶氨酸突出），滋味鲜甜〔来源：GB/T 22291-2017 表1；中国茶叶百科〕。",
      "grade": ["项目 | 特级 | 一级", "外形（条索） | 芽针肥壮、茸毛厚 | 芽针秀长、茸毛略薄", "整碎 | 匀齐 | 较匀齐", "净度 | 洁净 | 洁净", "色泽 | 银灰白富有光泽 | 银灰白", "香气 | 清纯、毫香显露 | 清纯、毫香显", "滋味 | 清鲜醇爽、毫味足 | 鲜醇爽、毫味显", "汤色 | 浅杏黄、清澈明亮 | 杏黄、清澈明亮", "叶底 | 肥壮、软嫩、明亮 | 嫩匀明亮"],
      "standards": ["1 国家标准 GB/T 22291-2017《白茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/fileDir/resource/cms/article/4576890/4646904/2022102809573040617.pdf", "2 国家标准 GB/T 32743-2016《白茶加工技术规范》 全国茶叶标准化技术委员会 https://www.co-tea.com/mtsc/uploads/About/2025082909385109092fc.pdf", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 国家标准 GB/T 22109-2026《地理标志产品质量要求 政和白茶》（2026-03-31发布，2027-04-01实施） 全国茶叶标准化技术委员会 https://www.samr.gov.cn", "5 团体标准 T/FDSCX 002-2024《福鼎白茶》 福鼎市茶业协会 http://m.bzfxw.com", "6 权威机构 中国茶叶百科·白茶加工与审评 — https://www.3ctea.com"],
      "processNote": "依据 GB/T 32743-2016《白茶加工技术规范》6.3、6.4： 萎凋方式说明（GB/T 32743-2016 3.2~3.4）： - 自然萎凋：日光与无日光交替进行（传统\"日晒+室内静置\"复式萎凋的一种表述） - 加温萎凋：控制室内温度进行萎凋 - 复式萎凋：自然萎凋与暖风萎凋交替进行 白毫银针以室内自然萎凋品质最佳，日晒萎凋需避免强光直射导致芽头发红。"
    }, {
      "id": "baimudan",
      "name": "白牡丹",
      "category": "white",
      "origin": "福建·福鼎/政和",
      "picking": "品种：大白茶或水仙品种。 嫩度/采摘标准：一芽一叶至一芽二叶（以一芽一二叶为主），要求芽叶肥嫩、芽及叶背满披白毫〔来源：GB/T 22291-2017 3.2；GB/T 32743-2016 6.1；网易·白茶产区〕。福鼎团体标准允许一芽三叶初展〔来源：T/FDSCX 002-2024 4.1.2〕。 采摘时间：春茶，清明前后开采〔来源：行业惯例，待核实〕。 鲜叶等级：按 GB/T 22291-2017，白牡丹成品分特级、一级、二级、三级四个等级〔来源：GB/T 22291-2017 表2〕。",
      "craftChain": "鲜叶 → 萎凋★（自然萎凋/加温萎凋/复式萎凋） → 干燥 → 拣剔 → 成品 〔来源：GB/T 32743-2016 5.1〕 核心工序：萎凋★。工艺流程与白毫银针基本一致，但因原料含叶片，萎凋和干燥参数略有差异。",
      "steps": [],
      "params": ["鲜叶验收摊放 | 竹筛/萎凋帘 | 同白毫银针，分级摊放，雨露水叶/上下午叶/不同嫩度品种分开〔来源：GB/T 32743-2016 6.2〕 | 保证鲜叶新鲜度", "萎凋★ | 竹筛/萎凋帘/萎凋槽 | 摊叶量：竹筛0.1~0.13g/cm²；萎凋帘厚度2~3cm；萎凋槽20~25cm〔来源：GB/T 32743-2016 6.3.1〕。生产中萎凋初期摊叶厚度通常2~3cm，后期\"并筛\"增加厚度以调节酶促反应〔来源：茶叶学报2026·萎凋工艺对白茶品质影响〕<br>温度：自然萎凋春茶15~25℃，夏秋茶25~35℃；加温萎凋25~35℃〔来源：GB/T 32743-2016 6.3.2〕<br>时间：自然萎凋36~50h；加温/复式萎凋30~40h〔来源：GB/T 32743-2016 6.3.3〕<br>萎凋程度：含水率≤20%〔来源：GB/T 32743-2016 6.3.4〕。传统全萎凋至含水率13%左右（九五干）品质最好〔来源：茶七网·贡眉〕 | 核心工序。白牡丹因含叶片，萎凋过程中叶片失水快于芽头，需注意\"走水还阳\"（翻筛/并筛）使芽叶失水均匀。萎凋中多酚类轻度氧化，形成灰绿润色泽和清甜醇爽滋味", "干燥 | 烘干机/烘笼 | 干燥2~3次，温度≤100℃〔来源：GB/T 32743-2016 6.4.2〕。复烘温度90~110℃，时间10~15min，至含水率5%~6%〔来源：GB/T 32743-2016 8.4〕 | 固定品质，充分干燥", "拣剔 | 手工/色选机 | 高档白牡丹剔除蜡叶、黄叶、红叶、梗、粗老叶及非茶夹杂物；中档剔除蜡叶、黄叶、粗老叶、梗；低档剔除梗及非茶夹杂物〔来源：GB/T 32743-2016 8.1.3〕 | 保证成品匀净度"],
      "quality": "依据 GB/T 22291-2017 表2： 感官审评要点（参照 GB/T 23776-2018）：白牡丹审评重点在于毫心肥壮度、叶张嫩度、灰绿润色泽，内质重点审评鲜嫩纯爽毫香、清甜醇爽滋味和黄（橙黄）清澈汤色。特级白牡丹要求\"毫心多肥壮、叶背多茸毛、灰绿润\"，芽叶连枝、叶缘垂卷〔来源：GB/T 22291-2017 表2；全国地理标志网·政和白茶〕。",
      "grade": ["项目 | 特级 | 一级 | 二级 | 三级", "条索 | 毫心多肥壮、叶背多茸毛 | 毫心较显、尚壮、叶张嫩 | 毫心尚显、叶张尚嫩 | 叶缘略卷、有平展叶、破张叶", "整碎 | 匀整 | 尚匀整 | 尚匀 | 匀", "净度 | 洁净 | 较洁净 | 含少量黄绿片 | 稍夹黄片腊片", "色泽 | 灰绿润 | 灰绿尚润 | 尚灰绿 | 灰绿稍暗", "香气 | 鲜嫩、纯爽毫香显 | 尚鲜嫩、纯爽有毫香 | 浓纯、略有毫香 | 尚浓纯", "滋味 | 清甜醇爽毫味足 | 较清甜、醇爽 | 尚清甜、醇厚 | 尚厚", "汤色 | 黄、清澈 | 尚黄、清澈 | 橙黄 | 尚橙黄", "叶底 | 芽心多，叶张肥嫩明亮 | 芽心较多、叶张嫩尚明 | 有芽心、叶张尚嫩稍有红张 | 叶张尚软有破张、红张稍多"],
      "standards": ["1 国家标准 GB/T 22291-2017《白茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/fileDir/resource/cms/article/4576890/4646904/2022102809573040617.pdf", "2 国家标准 GB/T 32743-2016《白茶加工技术规范》 全国茶叶标准化技术委员会 https://www.co-tea.com/mtsc/uploads/About/2025082909385109092fc.pdf", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 核心期刊 《萎凋工艺对白茶品质影响的研究进展》 茶叶学报，2026 http://cyxb.fjnyxb.cn", "5 团体标准 T/FDSCX 002-2024《福鼎白茶》 福鼎市茶业协会 http://m.bzfxw.com"],
      "processNote": "依据 GB/T 32743-2016《白茶加工技术规范》： 白牡丹干燥后成品含水率应为8%~9%〔来源：GB/T 32743-2016 6.4.3〕。"
    }, {
      "id": "gongmei_shoumei",
      "name": "贡眉/寿眉",
      "category": "white",
      "origin": "福建·建阳/政和/福鼎",
      "picking": "品种：贡眉用群体种（菜茶）；寿眉用大白茶、水仙或群体种。 嫩度/采摘标准： 贡眉：群体种嫩梢，以一芽二叶至一芽三叶为主〔来源：GB/T 32743-2016 6.1；福建日报〕。传统贡眉采一芽二叶或三叶〔来源：茶七网·贡眉〕 寿眉：一芽三、四叶及较嫩的对夹叶或叶片，春、秋季均可采制〔来源：GB/T 22109-2026 政和白茶；GB/T 32743-2016 6.1〕 采摘时间：春茶（贡眉），春、秋茶（寿眉）〔来源：GB/T 22109-2026 政和白茶〕。 鲜叶等级：按 GB/T 22291-2017，贡眉分特级、一级、二级、三级；寿眉分一级、二级〔来源：GB/T 22291-2017 表3、表4〕。",
      "craftChain": "鲜叶 → 萎凋★（自然萎凋/加温萎凋/复式萎凋） → 干燥 → 拣剔 → 成品 〔来源：GB/T 32743-2016 5.1〕 核心工序：萎凋★。贡眉/寿眉因原料较粗老，萎凋时间和干燥温度与白毫银针、白牡丹略有差异。",
      "steps": [],
      "params": ["鲜叶验收摊放 | 竹筛/萎凋帘 | 同其他白茶，分级摊放〔来源：GB/T 32743-2016 6.2〕 | 保证鲜叶新鲜度", "萎凋★ | 竹筛/萎凋帘/萎凋槽 | 摊叶量：竹筛0.1~0.13g/cm²；萎凋帘2~3cm；萎凋槽20~25cm〔来源：GB/T 32743-2016 6.3.1〕<br>温度：自然萎凋春茶15~25℃，夏秋茶25~35℃；加温萎凋25~35℃〔来源：GB/T 32743-2016 6.3.2〕<br>时间：自然萎凋36~50h；加温/复式萎凋30~40h〔来源：GB/T 32743-2016 6.3.3〕。传统全萎凋：至含水率约22%（八成干）时两筛并一筛，继续萎凋10余小时至含水率约13%（九五干）〔来源：茶七网·贡眉〕<br>萎凋程度：含水率≤20%〔来源：GB/T 32743-2016 6.3.4〕 | 核心工序。贡眉/寿眉原料较粗老，叶片厚、梗长，萎凋需更长时间使梗叶水分均匀散发。群体种（菜茶）内含物质丰富，萎凋后形成独特的山野气韵和醇厚滋味", "干燥 | 烘干机/烘笼 | 干燥2~3次，温度≤100℃〔来源：GB/T 32743-2016 6.4.2〕。复烘温度110~130℃（贡眉和寿眉），时间10~15min，至含水率5%~6%〔来源：GB/T 32743-2016 8.4〕 | 固定品质。贡眉/寿眉干燥温度高于白毫银针和白牡丹，因原料粗老需更高温度促进香气转化和充分干燥", "拣剔 | 手工/色选机 | 高档贡眉剔除蜡叶、黄叶、红叶、粗老叶及非茶夹杂物；中档剔除蜡叶、黄叶及非茶夹杂物；低档贡眉和寿眉剔除非茶夹杂物〔来源：GB/T 32743-2016 8.1.4〕 | 保证成品匀净度"],
      "quality": "贡眉依据 GB/T 22291-2017 表3： 寿眉依据 GB/T 22291-2017 表4： 感官审评要点（参照 GB/T 23776-2018）： 贡眉：重点审评叶态卷度、毫心显露度、灰绿或墨绿色泽，内质重点审评鲜嫩有毫香、清甜醇爽滋味和橙黄汤色。贡眉因用群体种（菜茶），香气更显花果香/山野香，滋味醇厚有层次感〔来源：GB/T 22291-2017 表3；福建日报〕。 寿眉：重点审评叶态紧卷度、尚灰绿色泽，内质重点审评纯正香气、醇厚尚爽滋味和尚橙黄汤色。寿眉因原料较粗老、含梗，茶汤醇厚甜滑，耐泡度高，适合煮饮，是\"一年茶、三年药、七年宝\"的主力产品〔来源：GB/T 22291-2017 表4；行业共识〕。",
      "grade": ["项目 | 特级 | 一级 | 二级 | 三级", "条索 | 叶态卷、有毫心 | 叶态尚卷、毫尖尚显 | 叶态略卷稍展、有破张 | 叶张平展、破张多", "整碎 | 匀整 | 较匀 | 尚匀 | 欠匀", "净度 | 洁净 | 较洁净 | 夹黄片铁板片少量腊片 | 含鱼叶蜡片较多", "色泽 | 灰绿或墨绿 | 尚灰绿 | 灰绿稍暗、夹红 | 灰黄夹红稍葳", "香气 | 鲜嫩，有毫香 | 鲜纯、有嫩香 | 浓纯 | 浓、稍粗", "滋味 | 清甜醇爽 | 醇厚尚爽 | 浓厚 | 厚、稍粗", "汤色 | 橙黄 | 尚橙黄 | 深黄 | 深黄微红", "叶底 | 有芽尖、叶张嫩亮 | 稍有芽尖、叶张软尚亮 | 叶张较粗、稍摊、有红张 | 叶张粗杂、红张多"],
      "standards": ["1 国家标准 GB/T 22291-2017《白茶》 全国茶叶标准化技术委员会 http://www.customs.gov.cn/spj/fileDir/resource/cms/article/4576890/4646904/2022102809573040617.pdf", "2 国家标准 GB/T 32743-2016《白茶加工技术规范》 全国茶叶标准化技术委员会 https://www.co-tea.com/mtsc/uploads/About/2025082909385109092fc.pdf", "3 国家标准 GB/T 30766-2014《茶叶分类》 全国茶叶标准化技术委员会 —", "4 国家标准 GB/T 22109-2026《地理标志产品质量要求 政和白茶》（2026-03-31发布，2027-04-01实施） 全国茶叶标准化技术委员会 https://www.samr.gov.cn", "5 权威媒体 福建日报·福鼎白茶：绿雪灵芽 古法天成 福建日报 https://www.fjdaily.com", "6 权威机构 茶七网·贡眉词条 — http://m.tea7.com/baike/317.htm"],
      "processNote": "依据 GB/T 32743-2016《白茶加工技术规范》： 贡眉/寿眉干燥后成品含水率应为8%~9%〔来源：GB/T 32743-2016 6.4.3〕。寿眉因原料含梗，复烘温度最高（110~130℃），有利于发展醇厚香气和甜醇滋味。"
    }, {
      "id": "dianhong",
      "name": "滇红工夫",
      "category": "red",
      "origin": "云南·凤庆/临沧",
      "picking": "工夫红茶以一芽二叶、一芽三叶为主；高档产品（如经典58）采用一芽一叶初展至半开展；金芽/金针类采用单芽或一芽一叶〔来源：云南滇红集团；行业资料〕",
      "craftChain": "初制工艺：鲜叶 → 萎凋 → 揉捻 → ★发酵 → 干燥（毛火+足火） → 毛茶 精制工艺：毛茶 → 筛分 → 切轧 → 风选 → 拣剔 → 补火 → 拼配 → 匀堆 → 成品 来源：GB/T 13738.2-2017通用框架；云南滇红集团\"把五关\"工艺（鲜叶为基础、萎凋是前提、揉捻是关键、发酵为中心、干燥是保证）。",
      "steps": [{
        "name": "萎凋",
        "text": "注：滇红萎凋偏重（减重率30%～35%），这是大叶种工夫红茶的工艺特点。来源：古夫古茶制茶工艺百科（gufugu.com）。"
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "★发酵（核心工序）",
        "text": "滇红集团\"发酵为中心\"理念：发酵始于揉捻，揉捻为发酵创造条件；发酵室采用智能控温控湿系统。来源：云南滇红集团（dianhong.com）。"
      }, {
        "name": "干燥",
        "text": "毛火（初烘）： 足火（复烘/足干）： 注：DB53/T 1351-2025《工夫红茶加工技术规程》中的精确干燥参数待核实获取标准全文。上述参数来自行业权威媒体与企业技术资料。 作用原理：毛火高温快速钝化酶活性、终止发酵，蒸发大部分水分；足火低温慢烘进一步干燥并发展香气（焦糖香、甜香），固定品质。"
      }],
      "params": ["方式 | 萎凋槽热风萎凋为主（\"凤\"牌滇红标准工艺），也可自然萎凋（室内/日光） | 云南滇红集团（dianhong.com）", "萎凋温度 | 热风温度控制在35℃以下，春季鼓热风，夏季鼓凉风 | 专利CN201710681568（滇红工夫茶制备方法）", "摊叶厚度 | 萎凋槽均匀薄摊，厚薄一致（具体厚度待核实，行业参考8～20cm） | 云南滇红集团；行业通用", "翻叶 | 萎凋过程中翻叶1～2次，雨水叶增加1～2次；翻拌时停风，动作轻 | 专利CN201710681568", "萎凋时间 | 自然萎凋18～24h（传统）；萎凋槽热风萎凋约4～8h（待核实精确值） | 抖音滇红工艺视频（参考）；行业通用", "萎凋适度标志 | 叶面光泽消失，叶色暗绿，叶质柔软，手握成团松手不易散开，主脉嫩梗不易折断，青臭气消失透清香 | 专利CN201710681568", "萎凋叶含水量 | 60%～64%（或以鲜叶失重30%～35%为准） | 专利CN201710681568；昌宁红茶地理标志资料（58%～62%）", "作用原理 | 大叶种芽叶肥硕含水量高，需偏重萎凋；失水使叶质柔软便于揉捻，散发青草气，激活酶活性 | 制茶学通用原理", "设备 | 揉捻机（55型/65型等） | 行业通用", "揉捻时间 | 60～90min（嫩叶40min，中等嫩度60min，老叶90min） | 中州期刊联盟《滇红茶制作技艺综述》2024；豆丁网红茶加工工艺", "加压原则 | \"轻—重—轻\"：开始轻压初步成条，逐渐重压破坏细胞，最后松压整理条索 | 中州期刊联盟2024；行业通用", "揉捻环境 | 室温18～22℃，相对湿度65%～75%（参考） | 搜狐网2020-05-06滇红工夫茶制作", "细胞破碎率 | 80%以上（滇红要求揉捻充分，部分工艺达85%以上） | 搜狐网2020-05-06；古夫古茶制茶百科", "揉捻适度标志 | 叶细胞充分破损，茶汁外溢粘手，条索紧结，成条率90%以上 | 行业通用；ESGREEN滇红产品说明", "解块 | 揉捻后及时解块分筛（6CJF-45型解块机），解散茶团保证发酵均匀 | 豆丁网2026祁门红末茶报告（通用设备参考）", "作用原理 | 大叶种叶质肥厚，需充分揉捻破坏细胞，使茶多酚与多酚氧化酶充分接触；揉捻不足会导致发酵困难、滋味淡薄、叶底花青；揉捻过度则茶条断碎、香气低 | 中州期刊联盟2024", "设备/方式 | 专用发酵室/发酵箱，揉捻叶均匀摊放 | 云南滇红集团；搜狐网2020", "发酵温度 | 24～28℃（昌宁红茶地标：25～28℃） | 搜狐网2020-05-06；昌宁红茶地理标志资料", "相对湿度 | 80%～90%以上 | 昌宁红茶地理标志资料；行业通用", "摊叶厚度 | 1.5～3cm（参考） | 搜狐网2020-05-06", "发酵时间 | 3～6h（春季5～6h，气温高时缩短） | 行业通用；滇红集团资料", "发酵适度标志 | 青草气消失，泛出果香，叶肉对光透视呈红黄色（铜红色），花果香显露 | 昌宁红茶地理标志资料；制茶学通用", "叶温控制 | 不超过30℃（行业经验，标准未明确） | 行业通用", "作用原理 | 多酚类酶促氧化生成茶黄素、茶红素，形成红汤红叶；大叶种茶多酚含量高（一般>30%），发酵偏重，茶红素比例高，汤色红浓、滋味浓强 | 云南滇红集团技术资料；制茶学通用", "方式 | 热风干燥（烘干机） | 搜狐网2020-05-06", "进口温度 | 115～130℃，120℃左右最佳 | 搜狐网2020-05-06", "时间 | 5～7min | 搜狐网2020-05-06", "烘至含水量 | 约30%（七成干） | 搜狐网2020-05-06", "下机处理 | 立即摊凉，使水分重新分布（回潮） | 搜狐网2020-05-06", "温度 | 100～110℃（低温慢烘原则） | 豆丁网《滇红工夫茶品质特征及加工技术》；行业通用", "烘至含水量 | 6%～7% | ESGREEN滇红产品说明；行业通用", "提香 | 部分产品采用多功能提香机，80～90℃烘干提香 | 豆丁网滇红工夫茶加工技术"],
      "quality": "感官审评要点（参照GB/T 23776）： 外形：条索肥壮紧结度、金毫显露度、色泽乌润度 内质：香气重点评浓度、纯度、香型（花蜜香/焦糖香）；滋味重点评浓强度、鲜爽度、收敛性、回甘；汤色评红浓明亮度与金圈；叶底评肥厚嫩匀度。 滇红与祁红的核心区别：滇红\"浓、强、鲜\"，祁红\"香、甜、醇\"。",
      "grade": ["标准 | 等级设置", "GB/T 13738.2-2017（通用国标） | 工夫红茶分特级、一级、二级、三级、四级、五级、六级共6个等级", "DB53/T 1351-2025（云南省地方标准，2025-04-08实施） | 待核实（标准全文未获取，该标准首次系统规范云南工夫红茶全流程技术要点，新增做形工艺）", "行业惯例 | 滇红工夫常分特级、一级、二级、三级、四级、五级（部分企业分至六级），实物标准样每三年更换一次"],
      "standards": ["1 《红茶 第2部分：工夫红茶》 GB/T 13738.2-2017（2018-05-01实施，代替GB/T 13738.2-2008） 国家市场监督管理总局/国家标准化管理委员会 http://www.customs.gov.cn/spj/xxfw39/cpjgzyxx/cy/cyxgbz/4646904/2022102809572422237.pdf", "2 《工夫红茶加工技术规程》 DB53/T 1351-2025（2025-04-08实施） 云南省市场监督管理局（云南农业大学牵头制定） https://www.cfsn.cn/zcwk/detail/2163/7700.html", "3 《茶叶分类》 GB/T 30766-2014 国家标准化管理委员会 —", "4 云南滇红集团工艺技术资料 2018～2025 云南滇红集团股份有限公司 http://www.dianhong.com", "5 《人类非物质文化遗产代表作\"滇红茶制作技艺\"完整体系综述》 2024-10 中州期刊联盟 https://www.zzqklm.com/w/hxlw/34648.html", "6 云南省地方标准发布公告（云市监公告〔2025〕3号） 2025-01 云南省市场监督管理局 —"],
      "processNote": "毛火（初烘）： 足火（复烘/足干）： 注：DB53/T 1351-2025《工夫红茶加工技术规程》中的精确干燥参数待核实获取标准全文。上述参数来自行业权威媒体与企业技术资料。 作用原理：毛火高温快速钝化酶活性、终止发酵，蒸发大部分水分；足火低温慢烘进一步干燥并发展香气（焦糖香、甜香），固定品质。"
    }, {
      "id": "jinjunmei",
      "name": "金骏眉",
      "category": "red",
      "origin": "福建武夷山·桐木关",
      "picking": "单芽（芽头），采自武夷山桐木关正山小种原产地高山茶树；2005年6月创制，突破正山小种传统松烟熏制工艺，开创单芽级高端红茶新品类。",
      "craftChain": "鲜叶（单芽） → 室内自然萎凋（+适度轻摇） → 轻柔手工揉捻（玻璃板上推揉） → 恒温恒湿轻发酵 → 过红锅（部分工艺保留） → 低温分段炭火慢烘（竹笼木炭文火） → 成品",
      "steps": [{
        "name": "室内自然萎凋",
        "text": "单芽薄摊，室内自然萎凋并适度轻摇，使水分均匀散失、香气前体物质转化。"
      }, {
        "name": "轻柔手工揉捻",
        "text": "玻璃板上手工推揉，力度轻柔，芽头完整不碎，茶汁适度外溢。"
      }, {
        "name": "恒温恒湿轻发酵",
        "text": "控制温湿度进行轻发酵，形成金骏眉花果蜜香复合香气的物质基础。"
      }, {
        "name": "过红锅",
        "text": "部分工艺保留过红锅工序，钝化酶活性、固定品质。"
      }, {
        "name": "低温分段炭火慢烘",
        "text": "竹笼木炭文火低温分段烘焙，干燥提香，形成醇厚甘甜的高山韵。"
      }],
      "params": [],
      "quality": "外形：芽头匀整、金毫显露；汤色：金黄透亮带金圈；香气：花果香与蜜糖香复合，具高山韵；滋味：甘甜醇厚、水中带香；叶底：芽头肥壮、鲜活明亮。",
      "grade": [],
      "standards": ["金骏眉目前无独立国家标准，市场上存在桐木关金骏眉（原产地）与外山金骏眉之分", "产品质量可参照GB/T 13738.2-2017《红茶 第2部分：工夫红茶》框架及企业标准执行", "来源：骏德茶业官网；中新网福建2021-05-01；中国新闻网2025-04-20；光明网2025-04-20"],
      "processNote": "金骏眉为2005年创制的高端单芽红茶，与正山小种同源于武夷山桐木关，区别在于不经过松烟熏制，以单芽原料和轻柔工艺形成清雅花果蜜香。"
    }, {
      "id": "qimen_hongcha",
      "name": "祁门红茶（祁门工夫）",
      "category": "red",
      "origin": "安徽·祁门",
      "picking": "礼茶：一芽一叶初展为主；特茗：一芽一叶为主；特级：一芽一叶、一芽二叶为主〔来源：DB34/T 1086-2026 附录C表C.1〕",
      "craftChain": "初制工艺：鲜叶 → 萎凋 → 揉捻 → ★发酵 → 干燥（毛火+足火） → 毛茶 精制工艺：毛茶 → 筛制（圆筛+抖筛） → 切细 → 风选 → 拣剔 → 补火 → 拼配 → 匀堆 → 成品 来源：DB34/T 1086-2026附录D.1.1。核心工序★为发酵。",
      "steps": [{
        "name": "萎凋",
        "text": "补充：传统手工萎凋也可采用室内加温萎凋，温度32～36℃，历时160～180min，轻翻12～15次（来源：专利CN101455247B，仅供参考）。"
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "★发酵（核心工序）",
        "text": "注：DB34/T 1086-2026规定的发酵温度（30～33℃）高于行业通用参考值（24～28℃），这是祁门红茶产区工艺特点。教学中应说明标准值与通用参考值的差异。"
      }, {
        "name": "干燥",
        "text": "毛火（初烘）： 足火（复烘）： 补充参考：传统工艺毛火进烘温度105～115℃，时间12～16min，含水量18～25%；足火90～95℃（来源：专利CN101455247B）。澎湃新闻报道的自动链板烘干机参数：复烘90～100℃，12～15min；足烘70～80℃，15～20min，含水率6%～7%（来源：澎湃新闻2021-07-20）。以上为设备进风温度，与DB34/T 1086-2026的\"叶温\"口径不同，教学时须区分。 作用原理：高温钝化酶活性，终止发酵；蒸发水分至安全含水量，固定品质；足火阶段热化学变化促进\"蜜糖香\"和\"甜醇味\"形成。"
      }, {
        "name": "精制（补火工序）",
        "text": "传统补火：将筛拣好的茶叶装袋（每袋约2.5kg），置烘笼上用炭火烘焙，每隔3～4min提起振荡一次，烘至褐灰色为适度（来源：网易新闻2023-01-10，传统工艺参考）。"
      }],
      "params": ["方式 | 自然萎凋（竹帘摊放，室内或日光）或热风萎凋（萎凋槽/串联萎凋机） | DB34/T 1086-2026附录D.3.1", "自然萎凋摊叶厚度 | 2～3cm，中间适当翻拌 | DB34/T 1086-2026附录D.3.1.1", "热风萎凋进风温度 | 32℃～35℃，温度先高后低 | DB34/T 1086-2026附录D.3.1.2", "热风萎凋摊叶厚度 | 8～20cm | DB34/T 1086-2026附录D.3.1.2", "热风萎凋时间 | 4～6h；每1h停风翻叶1次，翻叶上下均匀抖散 | DB34/T 1086-2026附录D.3.1.2", "雨水叶/露水叶处理 | 薄摊，先用冷风吹干叶面水，再加温萎凋 | DB34/T 1086-2026附录D.3.1.2", "萎凋适度标志 | 叶色转暗，叶质柔软，手紧握成团、松手慢慢散开，嫩茎折而不断，透出清香 | DB34/T 1086-2026附录D.3.1.3", "萎凋叶含水量 | 58%～60% | DB34/T 1086-2026附录D.3.1.3", "作用原理 | 蒸发部分水分，使叶质柔软便于揉捻成条；散发青草气，促进内含物质轻度转化，为发酵奠定基础 | 制茶学通用原理", "设备 | 90/65/55/35型揉捻机，或自动揉捻机组 | DB34/T 1086-2026附录D.3.2", "投叶量 | 视机型而定，以自然装满揉桶为宜，不应紧压；65型机组单机投叶45～55kg（萎凋叶计） | DB34/T 1086-2026附录D.3.2.1、D.3.2.2", "揉捻时间 | 单机70～90min；自动机组70～80min | DB34/T 1086-2026附录D.3.2.1、D.3.2.2", "加压方式 | 分两次揉捻：第一次贴叶空揉35～45min；第二次加压揉捻，加压10min→松压5min，重复2～3次。自动机组：空揉30min→一次加压20min（桶盖下压15cm）→二次加压20min（下压20cm）→松压5～10min | DB34/T 1086-2026附录D.3.2", "揉捻环境 | 室温20～24℃，相对湿度75%～80%（参考工艺） | 专利CN104814180（参考）", "揉捻适度标志 | 芽叶紧卷成条，无松散折叠，手紧握有茶汁外溢，松手茶团不松散 | DB34/T 1086-2026附录D.3.2.3", "成条率 | 85%左右 | DB34/T 1086-2026附录D.3.2.3", "细胞破碎率 | 80%以上（高香工艺可达90%以上） | 专利CN104814180（参考）；行业通用要求", "作用原理 | 破坏叶细胞结构，使茶汁溢出，茶多酚与多酚氧化酶充分接触，为发酵创造条件；同时塑造紧细条索 | 制茶学通用原理", "设备/方式 | 发酵室（发酵盒摊放）或自动发酵机 | DB34/T 1086-2026附录D.3.3", "发酵室环境温度 | 30℃～33℃ | DB34/T 1086-2026附录D.3.3.1", "自动发酵机温度 | 28℃～30℃ | DB34/T 1086-2026附录D.3.3.2", "相对湿度 | ≥90% | DB34/T 1086-2026附录D.3.3.1、D.3.3.2", "摊叶厚度 | 发酵室8～20cm；自动发酵机8～10cm，保持通气 | DB34/T 1086-2026附录D.3.3", "发酵时间 | 3～5h | DB34/T 1086-2026附录D.3.3.1、D.3.3.2", "发酵适度标志 | 叶色转为铜红色，青草气消失，花果香显现 | DB34/T 1086-2026附录D.3.3.3", "叶温控制 | 待核实（标准未明确叶温上限，行业经验不超过30℃） | —", "作用原理 | 以多酚类化合物为主体的酶促氧化反应：茶多酚氧化聚合生成茶黄素、茶红素等有色物质，形成红汤红叶；同时香气前体物质转化，形成\"祁门香\"（似花似果似蜜） | 制茶学通用原理；滇红集团技术资料", "叶温 | 80℃～90℃ | DB34/T 1086-2026附录D.3.5.1", "摊叶厚度 | 2～3cm | DB34/T 1086-2026附录D.3.5.1", "烘至含水量 | 20%～25% | DB34/T 1086-2026附录D.3.5.1", "程度 | 叶条基本干硬，嫩茎稍软 | DB34/T 1086-2026附录D.3.5.1", "下机处理 | 及时摊凉，回潮40～60min | DB34/T 1086-2026附录D.3.5.1", "叶温 | 50℃～70℃ | DB34/T 1086-2026附录D.3.5.2", "摊叶厚度 | 4～5cm | DB34/T 1086-2026附录D.3.5.2", "烘至含水量 | 7%以下 | DB34/T 1086-2026附录D.3.5.2"],
      "quality": "感官审评要点（参照GB/T 23776《茶叶感官审评方法》）： 外形审评：条索紧细度、匀整度、色泽乌润度、净度 内质审评：香气重点辨别\"祁门香\"的纯正度与持久性（似花似果似蜜的复合香型），忌青草气、烟焦气、粗老气；滋味重点评鲜醇度、甜醇度、收敛性；汤色评红艳明亮度；叶底评嫩度、红匀亮度。",
      "grade": ["标准 | 等级设置", "DB34/T 1086-2026（最新地方标准） | 祁门工夫红茶分礼茶、特茗、特级、一级、二级、三级、四级、五级共8个等级；祁红香螺、祁红毛峰、祁红金针各分特级、一级、二级3个等级", "GH/T 1178-2019（行业标准） | 分礼茶、特茗、特级、一级、二级、三级、四级共7个等级", "GB/T 13738.2-2017（通用国标） | 工夫红茶分特级、一级、二级、三级、四级、五级、六级共6个等级（通用框架，各名茶可在此基础上细化）"],
      "standards": ["1 《地理标志产品质量要求 祁门红茶》 DB34/T 1086-2026（2026-07-03实施，代替DB34/T 1086-2009） 安徽省市场监督管理局 https://dbba.sacinfo.org.cn/portal/download/41a3b54011275adb890256801380d517bc5581dcc3834103b1bd265b226da7c2", "2 《祁门工夫红茶》 GH/T 1178-2019（2020-03-01实施） 中华全国供销合作总社 https://www.spc.org.cn/online/d7aa8bfec9e11023452b19f835d4baf4.html", "3 《红茶 第2部分：工夫红茶》 GB/T 13738.2-2017（2018-05-01实施） 国家市场监督管理总局/国家标准化管理委员会 https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=F2CDFECF142B0D72646601C746F5B84B", "4 《茶叶分类》 GB/T 30766-2014 国家标准化管理委员会 —", "5 《茶叶感官审评方法》 GB/T 23776-2018《茶叶感官审评方法》（2018-02-06发布，2018-06-01实施，现行，代替GB/T 23776-2009） 国家标准化管理委员会 —", "6 安徽省市场监督管理局标准发布公告 2026-06-03 安徽省市场监督管理局 https://amr.ah.gov.cn/xwdt/gsgg/150560701.html"],
      "processNote": "传统补火：将筛拣好的茶叶装袋（每袋约2.5kg），置烘笼上用炭火烘焙，每隔3～4min提起振荡一次，烘至褐灰色为适度（来源：网易新闻2023-01-10，传统工艺参考）。"
    }, {
      "id": "zhenshan_xiaozhong",
      "name": "正山小种",
      "category": "red",
      "origin": "福建武夷山·桐木关",
      "picking": "传统正山小种采一芽二、三叶（半开面3～4叶），以中等嫩度为主；传统烟熏工艺专用原料〔来源：智汇三农2016；产区传统工艺资料〕",
      "craftChain": "传统初制工艺：鲜叶 → 萎凋（青楼加温/日光，熏松烟） → 揉捻 → ★发酵 → 过红锅（高温制止发酵） → 复揉 → 熏焙（青楼马尾松明火烟熏干燥） → 毛茶 精制工艺：毛茶 → 筛分 → 拣剔 → 复焙 → 匀堆 → 成品 来源：GB/T 13738.3-2012第1章（萎凋熏松烟、干燥熏松烟）；正山堂茶业工艺资料；武夷山奇苑茶业工艺资料。核心工序★为发酵，特色工序为过红锅、复揉、熏焙。",
      "steps": [{
        "name": "萎凋",
        "text": ""
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "★发酵（核心工序）",
        "text": ""
      }, {
        "name": "过红锅（正山小种特有工序）",
        "text": "这是正山小种区别于其他红茶的关键工序——其他红茶直接由发酵进入干燥，正山小种插入过红锅快速终止发酵，再复揉、熏焙。"
      }, {
        "name": "复揉",
        "text": ""
      }, {
        "name": "熏焙（松烟香来源，正山小种核心特色工序）",
        "text": "青楼三层结构：一层烘干室（熏焙），二三层萎凋。松烟从底层上升，贯穿全楼。来源：三联生活周刊2026。"
      }, {
        "name": "精制与复焙",
        "text": ""
      }],
      "params": ["方式 | 日光萎凋（晴天）或青楼加温萎凋（雨天为主，桐木关雨水多晴天少）；青楼为三层全木结构，二三层铺竹席摊茶青，底层为熏焙间 | 正山堂茶业（lapsang.cn）；三联生活周刊2026", "青楼萎凋温度 | 前期≤30℃，后期≤40℃（\"前期低温，后期高温\"） | 三联中读2026（梁骏德口述）", "萎凋时间 | 晴天3～4h，雨天7～8h | 三联中读2026", "翻青 | 每30～40min扫拢重新摊晾1次，雨天翻动次数增多 | 三联中读2026", "萎凋适度标志 | 叶子从鲜绿色变为暗绿色，抓一把使劲捏听不到响声，叶脉不断；100斤鲜叶失水约40斤（即减重约40%） | 三联中读2026（梁骏德经验）", "松烟熏萎凋 | 青楼底层马尾松燃烧，松烟上升渗透二三层茶青，萎凋即开始吸附松烟 | GB/T 13738.3-2012第1章；正山堂茶业", "作用原理 | 加温失水使叶质柔软；松烟中的松脂芳香物在萎凋阶段即开始附着，为松烟香奠定基础 | 制茶学通用原理", "设备 | 揉捻机（传统为手工/水车带动木质揉捻机） | 三联中读2026", "投叶量 | 约75斤/机（参考） | 抖音武夷红茶制作视频2023", "揉捻时间 | 20～30min（机器揉捻）；传统60～90min（中间解块一次） | 凤凰网2018正山小种初制加工；智汇三农2016", "加压方式 | 空压3～5min → 轻压5min → 重压5～10min → 轻压5min → 空压3～5min；或\"先轻压慢揉，再重压快揉，最后松压慢揉\" | 凤凰网2018；武夷山奇苑茶业", "揉后处理 | 揉团静置定型10～15min，再进入发酵 | 武夷山奇苑茶业", "细胞破碎率 | 待核实（正山小种传统工艺未明确量化，行业通用要求80%以上） | —", "作用原理 | 破坏细胞，茶汁溢出，为发酵创造条件；塑造紧结圆直条索 | 制茶学通用原理", "方式 | 热发酵：揉捻叶置于竹篓内压紧，上盖湿布（防止表面失水变干），室内自然发酵 | 正山堂茶业（lapsang.cn）；三联中读2026", "发酵温度 | 茶堆温度30～40℃（自身酶促氧化放热） | 全国地理标志原产地特产网\"武夷红茶\"", "发酵时间 | 气温高时6～7h，气温低时8h左右；春季约5～6h | 三联中读2026；智汇三农2016", "发酵适度标志 | 茶胚呈红褐色（古铜色），带有清香味/花果香，青草气消失 | 正山堂茶业；全国地理标志原产地特产网", "湿布遮盖 | 防止表面茶叶水分流失成为死叶，保证发酵均匀 | 三联中读2026", "作用原理 | 多酚酶促氧化生成茶黄素、茶红素；菜茶品种香气前体物质转化，配合后续松烟形成桂圆干香 | 制茶学通用原理", "设备 | 平锅/铁锅（传统柴火加热） | 武夷山奇苑茶业；抖音百科", "锅温 | 180～260℃（常用200℃左右；部分资料220～260℃） | 武夷山奇苑茶业（200℃）；LAPSANGSTORE（180℃）；全国地理标志特产网（220～260℃）", "投叶量 | 1～2kg/次（1.5～2kg） | 武夷山奇苑茶业；抖音百科", "翻炒时间 | 1～3min（短时高温，迅速翻抖炒） | 武夷山奇苑茶业（2～3min）；抖音百科（1～2min）；什么值得买（约90秒）", "适度标志 | 发酵叶烫手变软，青草气散失、清香显露，无青味 | 抖音百科；全国地理标志特产网", "作用原理 | 高温迅速钝化多酚氧化酶活性，终止发酵；进一步散发青臭气，消除茶汤涩感，增进香气醇顺度，增加绵甜回甘；保留部分花香物质 | 武夷山奇苑茶业；央广网2025（梁骏德介绍）", "注意事项 | 短时高温，不能炒过头；\"过红锅\"技艺曾一度失传，后经非遗传承人恢复 | 央广网2025-04-20", "时机 | 过红锅后趁热立即复揉 | 武夷山奇苑茶业", "时间 | 5～6min | 武夷山奇苑茶业；智汇三农2016", "作用 | 使茶条进一步紧结，改进外形；挤出更多茶汁吸附表面，提高吸烟量和茶汤浓度 | 武夷山奇苑茶业", "设备 | 青楼底层熏焙间，复揉叶抖散摊在竹席/水筛上 | 正山堂茶业；茶七网", "燃料 | 桐木关本地油性马尾松（松柴片），必须使用马尾松，燃烧时释放松脂芳香物 | 什么值得买2026；正山堂茶业", "摊叶量 | 每筛4～5斤，叶层厚约5cm | 茶七网（tea7.com）", "熏焙时间 | 8～12h（传统8～10h） | 茶七网；什么值得买2026；武夷山奇苑茶业（8～10h）", "火力控制 | 初期温度高，促进水分快速蒸发；焙至八成干时压小火焰，利用松柴燃烧不充分产生的浓松烟，让湿坯尽量吸收；力求火力均匀，避免老火 | 武夷山奇苑茶业；茶七网", "熏焙过程 | 熏干过程中不用翻叶摊晾，茶叶手捻成粉末即完成 | 茶七网", "干燥程度 | 含水量待核实（行业通用≤7%） | —", "松柴摆放 | 纯松柴片按\"T\"\"川\"字形摆放（传统经验） | 智汇三农2016", "作用原理 | 马尾松明火燃烧产生的松烟（含松脂、松节油等芳香成分）穿透茶叶，均匀附着于茶条内外，形成独特的松烟香；同时完成干燥。松烟香与桂圆干香融合，是正山小种的灵魂 | GB/T 13738.3-2012第1章；行业公认"],
      "quality": "感官审评要点（参照GB/T 23776）： 外形：条索壮实紧结度、色泽乌润度、净度 内质：香气重点辨别松烟香的纯正度（纯、幽为佳，不能刺鼻呛人）与桂圆干香的融合度；滋味重点评桂圆汤味、醇厚回甘、高山韵；汤色评橙红明亮度；叶底评古铜色匀齐度。 陈化特性：正山小种陈放1～2年后松烟味渐转干果香，口感更圆润，具备陈化价值（来源：什么值得买2026）。",
      "grade": ["项目 | 正山小种特征（GB/T 13738.3-2012表1，特级） | 来源", "外形 | 壮实紧结，匀齐，净，色泽乌黑油润 | GB/T 13738.3-2012表1", "汤色 | 橙红明亮 | GB/T 13738.3-2012表1", "香气 | 纯正高长，似桂圆干香或松烟香明显 | GB/T 13738.3-2012表1", "滋味 | 醇厚回甘，显高山韵，似桂圆汤味明显 | GB/T 13738.3-2012表1", "叶底 | 尚嫩较软有皱褶，古铜色匀齐 | GB/T 13738.3-2012表1", "标准 | 等级设置", "GB/T 13738.3-2012（现行国标） | 正山小种分特级、一级、二级、三级共4个等级；烟小种分特级、一级、二级、三级、四级共5个等级", "实物标准样 | 每种产品每一等级均设实物标准样，每三年更换一次"],
      "standards": ["1 《红茶 第3部分：小种红茶》 GB/T 13738.3-2012（2013-07-01实施，现行） 国家质量监督检验检疫总局/国家标准化管理委员会 http://www.customs.gov.cn/spj/fileDir/resource/cms/article/4576890/4646904/2022102809572561072.pdf", "2 《茶叶分类》 GB/T 30766-2014 国家标准化管理委员会 —", "3 正山堂茶业红茶工艺资料 2018～2026 福建武夷山国家级自然保护区正山茶业有限公司 http://www.lapsang.cn/Mobile/ShowInfos.Asp?ID=11", "4 正山小种红茶采制技术 2016～2026 武夷山奇苑茶业有限公司 http://www.wuyishantea.com/chayiechangping/zsxz/002.htm", "5 《正山小种：\"熏\"出来的传奇》 2026 三联中读（梁骏德口述） http://ny.slzhongdu.com/h5/article/detail?artId=241", "6 《非遗技艺传承人以匠心守护传统制茶之魂》 2025-04-20 央广网 https://www.cnr.cn/fj/jdt/20250420/t20250420_527141783.shtml", "7 全国茶叶标准化技术委员会国家标准体系框架表 2026 全国茶叶标准化技术委员会（SAC/TC 339） https://tc339.co-tea.com/cbw/cykjb"],
      "processNote": ""
    }, {
      "id": "dongfang_meiren",
      "name": "东方美人茶",
      "category": "oolong",
      "origin": "台湾·新竹/苗栗（大陆·福建大田等）",
      "picking": "手工采摘一芽一叶或一芽二叶的幼嫩茶青或小对夹叶，要求芽叶细嫩〔来源：《\"美人茶\"研究进展》第1.1.3节〕",
      "craftChain": "初制工艺（《\"美人茶\"研究进展》第1.1.3节）： 鲜叶采摘 → 晒青（萎凋） → 摊凉 → ★做青（轻摇+晾青交替5–6次） → 杀青 → 回湿（回润/回软，二度发酵） → 揉捻（或包揉） → 干燥（初干+足干） → 毛茶 精制工艺（行业通用）： 毛茶 → 拣剔 → 烘焙 → 摊凉 → 包装 → 成品茶 东方美人茶特色工艺节点： 小绿叶蝉叮咬：鲜叶原料的必要前提，是形成蜜香熟果味的物质基础 重萎凋、重发酵：夏季制作温度高失水快，发酵度达60%–70%，为乌龙茶中最高 轻摇青：摇青力度轻，但次数多（5–6次），最后一次摇青后发酵明显较重 回湿（回润/回软）：杀青后以湿布包裹，置入竹篓或铁桶内静置回润，进行\"二度发酵\"——东方美人茶独有的特色工序 不包揉或轻揉：因杀青后茶叶含水量低，可用包揉代替揉捻以减少碎茶率；不进行铁观音式的反复包揉塑形 白毫显露、五色相间：干茶呈白、绿、红、黄、褐五色相间，故称\"五色茶\"",
      "steps": [{
        "name": "晒青（萎凋）",
        "text": ""
      }, {
        "name": "摊凉（晾青）",
        "text": ""
      }, {
        "name": "★做青（轻摇+晾青交替）",
        "text": "做青（摇青+晾青交替）参数（文献交叉推算）：做青总历时约8~15h。传统手工水筛摇青3~5次、每次1~2min、摊晾约120min，末次摇青后长摊晾540min以促进重发酵〔来源：《东方美人茶加工工艺及适制品种试验初报》〕；机制做青参考：摇青4~5次、历时12s/16s/45s/150s递增、每次摊青回水约2h〔来源：授权发明专利CN114504035B〕，或摇青机转速6~10r/min、末次20~50min〔来源：2024大田美人茶斗茶赛工艺报道〕。发酵度60%~70%（台湾茶业改良场公布60%，新竹、苗栗传统工艺可达75%~85%）。注：传统工艺做青总历时无标准统一值，本区间为文献推算，实际依“看青做青”灵活掌握。"
      }, {
        "name": "杀青",
        "text": ""
      }, {
        "name": "回湿（回润/回软，二度发酵）——东方美人茶独有特色工序",
        "text": ""
      }, {
        "name": "揉捻（或包揉）",
        "text": ""
      }, {
        "name": "干燥",
        "text": ""
      }],
      "params": ["方式 | 薄摊于竹席上，在弱光下晒青 | 《\"美人茶\"研究进展》第1.1.3节", "时间参考 | 阳光下曝晒20–30 min，期间翻动2–3次 | 抖音视频·东方美人茶传统制作工艺（行业经验）", "程度 | 至叶面失去光泽，呈萎软态 | 《\"美人茶\"研究进展》第1.1.3节", "通用参考 | 日光萎凋时间15 min–60 min，失水率10%–15% | GB/T 35863-2018 第6.2.2条", "作用原理 | 蒸发水分，软化叶片，促进酶活性增强；夏季温度高失水快，为重发酵奠定基础 | 行业通用原理", "操作 | 晒青后移入室内阴凉处摊凉散热 | 抖音视频·东方美人茶传统制作工艺", "作用原理 | 使梗叶水分重新分布平衡，叶片恢复弹性（\"还阳\"） | 行业通用原理", "组成 | 摇青与晾青交替进行，促进茶青走水还阳 | 《\"美人茶\"研究进展》第1.1.3节", "摇青次数 | 5–6次（手工摇青要有耐心） | 抖音视频·教你制作东方美人茶（行业经验）", "浪青参考 | 手工轻揉翻动叶片促进氧化，重复3–4次，每次间隔30 min，直至叶缘微红、散发果香 | 抖音视频·东方美人茶传统制作工艺", "做青适度 | 叶色黄褐，失去光泽，青气消散，花香显露，叶缘红边明显 | 《\"美人茶\"研究进展》第1.1.3节", "发酵程度 | 60%–70%（乌龙茶中最高，接近红茶发酵度） | 同上", "堆闷发酵 | 最后一次摇青后堆闷发酵进一步促进多酚氧化 | 抖音视频·教你制作东方美人茶", "作用原理 | 摇青使叶缘细胞受损，多酚类化合物发生酶促氧化反应；梗和叶脉的水分及可溶性内含物向叶片输送，促进香气物质转化及形成；重发酵使东方美人兼具乌龙茶花果香与红茶蜜甜香 | 《\"美人茶\"研究进展》第1.1.3节、1.2.3节", "时机 | 发酵程度达到60%–70%后进行 | 《\"美人茶\"研究进展》第1.1.3节", "锅温 | 260℃–300℃ | 同上", "投叶量 | 每锅4–5 kg | 同上", "时间 | 5 min左右 | 同上", "程度 | 叶色转暗，手捏有刺手感，青草气消失，锅内有\"沙沙\"声，含水量约45% | 同上", "操作要求 | 将茶青迅速投入锅中，快速提高叶温，钝化酶的活性 | 同上", "作用原理 | 高温钝化酶活性，终止发酵，固定做青形成的蜜香熟果味品质 | 行业通用原理", "操作 | 杀青后将茶青覆上湿布进行回湿；或以布包裹，置入竹篓或铁桶内静置回润 | 《\"美人茶\"研究进展》第1.1.3节；抖音百科·东方美人茶", "别名 | 回软、二度发酵 | 同上", "程度 | 直到茶条充分柔软 | 抖音视频·教你制作东方美人茶", "作用原理 | 杀青后茶叶含水量低，回湿使茶叶重新吸收水分软化，便于后续揉捻；同时在湿热条件下进行\"二度发酵\"，进一步褪去刺激性物质，苦涩渐消，变得甜醇明澈 | 三联生活周刊；行业通用原理", "独特性 | 此为东方美人茶区别于其他乌龙茶的关键特色工序 | 抖音百科·东方美人茶；湖南日报", "方式 | 因杀青后茶叶含水量低，可用包揉方式代替揉捻以减少碎茶率 | 《\"美人茶\"研究进展》第1.1.3节", "操作 | 将回潮后的茶青放入布袋中扎紧，放入揉捻机揉捻 | 同上", "时间 | 8–10 min | 同上", "程度 | 至茶叶成条形螺旋状，然后松揉出桶，筛去碎末 | 同上", "不包揉塑形 | 不进行铁观音式的反复速包+平板包揉，保持自然卷曲形态 | 行业通用（东方美人特色）", "作用原理 | 使茶叶卷曲成形，破坏叶细胞使茶汁外溢，增进茶汤浓度 | 行业通用原理", "初干 | 高温快烘，温度110℃–120℃，烘15 min，含水量控制在15%左右 | 《\"美人茶\"研究进展》第1.1.3节", "足干 | 文火慢烘，温度70℃–80℃，烘90–120 min | 同上", "最终含水率 | 5%以下 | 同上", "作用原理 | 破坏残余酶活性，固定成茶品质；使低沸点不良成分散发，增加高沸点芳香物质含量，促进蜜香熟果味品质形成 | 同上"],
      "quality": "感官品质特征 蝉害程度与品质对应关系（官发松，2006，引自《\"美人茶\"研究进展》）： 特征香气物质基础： 茶小绿叶蝉刺吸后诱导茶树释放大量挥发性萜类物质 2,6-二甲基-3,7-辛二烯-2,6-二醇：台湾被害芽梢中高达21.3%–22.3%，远高于正常芽梢（0.6%–0.7%）（陈宗懋研究） 水杨酸甲酯（28.72%）、芳樟醇及其氧化物、苯乙醇、橙花叔醇等含量高，兼具乌龙茶与红茶香气特征 3,7-二甲基-1,5,7-辛三烯-3-醇：构成大吉岭红茶麝香葡萄味的组分 感官审评要点：按GB/T 23776执行（台湾地区参照CNS 179:2021）。核心审评因子为： 蜜香熟果味的浓郁度与持久度——东方美人最核心的品质特征 白毫显露度与五色相间的外形——干茶白、绿、红、黄、褐五色相间的完整度 汤色的琥珀色橙红明亮度 滋味的醇厚甘滑与甜润度——无苦涩感 叶底的完整度与红边显现",
      "grade": ["蝉害等级 | 为害程度 | 品质风味", "一级 | 70% | 熟果香、蜜糖香（最佳）", "二级 | 50% | 熟果香、蜜香较显", "三级 | 20%以下 | 滋味圆柔"],
      "standards": ["1 \"美人茶\"研究进展（核心学术文献） 茶叶学报，2020, 59(2): 95-99 马园园、廖敏、庄明珠、金珊（福建农林大学园艺学院） http://cyxb.fjnyxb.cn/cn/article/pdf/preview/141.pdf", "2 乌龙茶 第1部分：基本要求 GB/T 30357.1-2013 国家标准化管理委员会 https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=EBD75EE788E705C2450E7D9239BBD366", "3 乌龙茶加工技术规范 GB/T 35863-2018 中华全国供销合作总社 https://www.co-tea.com/mtsc/uploads/About//20220818214501223cfb4.pdf", "4 茶叶分类 GB/T 30766-2014 国家标准化管理委员会 待核实", "5 东方美人茶（椪风茶）加工技术 茶叶科学技术，2006(4): 50 官发松 待核实（引自《\"美人茶\"研究进展》参考文献[11]）", "6 4个茶树品种加工东方美人茶的品质分析 茶叶学报，2018, 59(4): 215-217 官发松 待核实（引自《\"美人茶\"研究进展》参考文献[6]）", "7 台湾东方美人茶产地证明标章制度 待核实 台湾农业委员会/台湾茶协会 待核实"],
      "processNote": ""
    }, {
      "id": "fenghuang_dancong",
      "name": "凤凰单丛",
      "category": "oolong",
      "origin": "广东潮州·凤凰山",
      "picking": "新梢形成驻芽，顶叶第一片叶达小开面至中开面时采摘（对夹形成3～5天），采一梢2～4叶；春冬茶以中开面为适度，秋茶以小开面为适度〔来源：DB4451/T 1-2021 附录C〕",
      "craftChain": "初制工艺（DB4451/T 1-2021 第7.2.1条）： 晒青 → 凉青 → ★做青（浪菜：碰青+摇青+静置交替≥4次） → 杀青（炒茶） → 揉捻 → 干燥 → 毛茶 精制工艺（DB4451/T 1-2021 第7.3.1条）： 毛茶归堆 → 拣剔筛末 → 拼堆（分级） → 烘焙（提香） → 摊凉 → 包装 → 成品茶 凤凰单丛特色：单株采摘、单株制作（\"单丛\"即单株采制之意），不同香型单株分别加工后再按香型归堆拼配。",
      "steps": [{
        "name": "晒青（萎凋）",
        "text": ""
      }, {
        "name": "凉青",
        "text": ""
      }, {
        "name": "★做青（浪菜）",
        "text": ""
      }, {
        "name": "杀青（炒茶）",
        "text": ""
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "干燥（初制）",
        "text": ""
      }, {
        "name": "精制烘焙（提香）",
        "text": ""
      }],
      "params": ["失水率 | 10%–15% | DB4451/T 1-2021 第7.2.2条", "通用参考 | 日光萎凋时间15 min–60 min，摊叶厚约2 cm–4 cm | GB/T 35863-2018 第6.2.2条", "作用原理 | 蒸发水分，软化叶片，促进酶活性增强，为做青奠定基础 | 行业通用原理", "操作要求 | 晒青后鲜叶温度降至室温，水分得以平衡，叶片呈紧张状态 | DB4451/T 1-2021 第7.2.3条", "作用原理 | 使梗叶水分重新分布，叶片恢复弹性（\"还阳\"），为碰青做准备 | 行业通用原理", "组成 | 由碰青、摇青和静置三个过程往返交替进行 | DB4451/T 1-2021 第7.2.4条", "次数 | 不低于4次 | 同上", "做青室温湿度 | 广东乌龙茶晾青间适宜温度22℃–25℃，湿度不高于80% | GB/T 35863-2018 第6.3.1条", "摇青特点 | 广东乌龙茶适当重摇，摇青一般4次–5次，历时10 h–12 h | GB/T 35863-2018 第6.3.1条", "碰青手法 | 双手轻轻碰动叶片，让叶片边缘摩擦，破坏细胞壁，促进发酵；摇的力量比铁观音轻，但次数多 | 行业经验（凤凰单丛特色）", "做青适度 | 青气退尽、花香浓郁、红边显现、叶缘背卷、叶色黄绿 | 行业通用（参考铁观音做青适度指标）", "作用原理 | 通过碰青和摇青使叶缘细胞破损，多酚类物质酶促氧化，形成\"绿叶红镶边\"及丰富的花香果香；静置使梗脉水分向叶片输送，促进香气物质转化 | DB4451/T 1-2021 第7.2.4条；行业通用原理", "原则 | 高温快速，杀熟、杀透、杀匀 | DB4451/T 1-2021 第7.2.5条", "温度参考 | 广东乌龙茶杀青适宜温度180℃–260℃，时间控制在10 min内 | GB/T 35863-2018 第6.4.2条", "行业参考 | 约220℃高温炒制7–9 min | 抖音百科·凤凰单丛茶（行业经验）", "作用原理 | 高温终止酶促氧化，固定做青形成的色香味品质 | 行业通用原理", "要求 | 条索成形紧结 | DB4451/T 1-2021 第7.2.6条", "叶细胞破碎率 | 宜在50%–60% | 同上", "作用原理 | 使茶叶卷曲成紧结条索状，挤出茶汁附着于叶表，增加茶汤浓度和滋味醇厚度 | 行业通用原理", "烘焙次数 | 二次以上 | DB4451/T 1-2021 第7.2.7条", "茶胚失水率 | 宜在90%–94% | 同上", "通用参考 | 烘干温度85℃–120℃，烘0.5 h–3 h，含水量达5%–6% | GB/T 35863-2018 第6.6条", "次数 | 两次以上 | DB4451/T 1-2021 第7.3.5条", "含水率 | 4%–5% | 同上", "方式 | 炭火（荔枝木、龙眼木等果木炭）或电烘箱低温慢烘 | 行业经验（凤凰单丛特色）", "焙火程度 | 分轻火、中火、足火、老火，不同火候对应不同香气、茶汤与口感表现 | 行业通用分类", "作用原理 | 彻底去除水分，固定品质，进一步发展香气，使茶叶易于保存 | 行业通用原理"],
      "quality": "感官等级要求（DB4451/T 1-2021 表1，节选特级） 十大香型体系（DB4451/T 1-2021 第3.1条列举；行业通用分类口诀\"三兰两桂，姜杏夜茉黄\"）： 注：\"鸭屎香\"（银花香）为市场知名香型，但不属于传统十大香型分类体系。 感官审评要点：按GB/T 23776执行。核心审评因子为\"丛韵\"与\"蜜韵\"——天然花香的清高细锐与持久度、滋味的鲜爽回甘与花香味融合度、汤色的金黄清澈度。单株采制使各香型特征鲜明，审评时需注意香型的纯正度与典型性。",
      "grade": ["项目 | 特级", "外形 | 紧结壮直，匀整，褐润有光", "香气 | 天然花香、清高细锐、持久", "滋味 | 鲜爽回甘，有鲜明花香味，特殊韵味", "汤色 | 金黄清澈明亮", "叶底 | 淡黄红边，软柔鲜亮"],
      "standards": ["1 地理标志产品 凤凰单丛（枞）茶 DB4451/T 1-2021（2021-04-08发布实施） 潮州市市场监督管理局 https://www.chaozhou.gov.cn/attachment/0/528/528562/3842479.pdf", "2 地理标志产品 凤凰单丛（枞）茶（旧版省标） DB44/T 820-2010 广东省质量技术监督局 https://sps.gdtbt.org.cn/upload/2019/note_attachfiles/19368/attachfiles/DB44T820-2010.pdf", "3 凤凰单丛（枞）茶质量分级 T/CZTTBZ 001-2021 潮州市茶叶行业协会 https://www.chaozhou.gov.cn/cznyncj/attachment/0/528/528566/3842480.pdf", "4 乌龙茶加工技术规范 GB/T 35863-2018 中华全国供销合作总社 https://www.co-tea.com/mtsc/uploads/About//20220818214501223cfb4.pdf", "5 茶叶分类 GB/T 30766-2014 国家标准化管理委员会 https://openstd.samr.gov.cn/bzgk/std/showGb?type=online&hcno=1FF5A0EB54D6C8ADF201F54F53BA32DC&request_locale=zh"],
      "processNote": ""
    }, {
      "id": "tieguanyin",
      "name": "铁观音",
      "category": "oolong",
      "origin": "福建·安溪",
      "picking": "新梢形成驻芽后，顶叶小开面至中开面采摘，标准芽叶为1芽2～4叶含嫩梢及幼嫩对夹叶；春秋茶采顶叶小开面2～4分成熟〔来源：GB/T 19598-2025 附录C〕",
      "craftChain": "初制工艺（GB/T 19598-2025 第7.4.1.1条）： 茶青 → 萎凋(晒青) → 晾青 → ★做青(摇青+晾青交替3–5遍) → 杀青 → 揉捻 → 初烘 → 初包揉 → 复烘 → 复包揉 → 烘干 → 毛茶 清香型精制工艺（GB/T 19598-2025 第7.4.2.1条）： 毛茶 → 验收 → 拣剔 → 归堆 → 筛分 → 风选 → 拣杂 → 号茶拼配 → 匀堆 → (文火)烘干 → 包装 → 成品茶 浓香型精制工艺（GB/T 19598-2025 第7.4.2.2条）： 毛茶 → 验收 → 拣剔 → 归堆 → 筛分 → 风选 → 拣杂 → 号茶拼配 → 匀堆 → 烘焙 → 摊凉 → 匀堆 → 包装 → 成品茶 陈香型精制工艺（GB/T 19598-2025 第7.4.2.3条，2025版新增）： 毛茶 → 验收 → 拣剔 → 归堆 → 筛分 → 风选 → 拣杂 → 号茶拼配 → 匀堆 → 烘(焙)足干 → 摊凉 → 匀堆 → 贮存(≥5年) → 包装 → 成品茶",
      "steps": [{
        "name": "萎凋（晒青）",
        "text": ""
      }, {
        "name": "晾青",
        "text": ""
      }, {
        "name": "★做青（摇青+晾青交替）",
        "text": ""
      }, {
        "name": "杀青",
        "text": ""
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "初烘",
        "text": ""
      }, {
        "name": "初包揉",
        "text": ""
      }, {
        "name": "复烘",
        "text": ""
      }, {
        "name": "复包揉",
        "text": ""
      }, {
        "name": "烘干（初制）",
        "text": ""
      }, {
        "name": "精制烘焙（浓香型特色）",
        "text": ""
      }],
      "params": ["方式 | 自然萎凋、日光萎凋或热风萎凋 | GB/T 19598-2025 第7.4.1.2.1条", "自然萎凋 | 时间3 h–6 h，失水率5%–15% | 同上", "日光萎凋 | 时间15 min–60 min，失水率5%–15% | 同上", "热风萎凋 | 叶面温度不超过30℃，时间1 h–2 h，失水率10%–25%；适用于阴雨天 | 同上", "作用原理 | 蒸发部分水分，使叶细胞浓缩，酶活性增强，为做青阶段多酚类物质氧化奠定基础 | GB/T 35863-2018 第6.2条", "时间 | 0.5 h–1.0 h | GB/T 19598-2025 第7.4.1.2.2条", "失水率 | 1%–2% | 同上", "操作 | 萎凋后及时均匀摊开散热，再进行摇青；摇青后茶青摊青静置即晾青 | 同上", "作用原理 | 使梗叶水分重新分布平衡，叶片由软转硬（俗称\"还阳\"），恢复细胞膨压 | 行业通用原理（参考GB/T 35863-2018）", "摇青次数 | 3遍–5遍（晾青和摇青合称做青） | GB/T 19598-2025 第7.4.1.2.3条", "做青总历时 | 10 h–16 h | 同上", "做青室温湿度 | 闽南乌龙茶晾青间适宜温度18℃–23℃，湿度65%–75% | GB/T 35863-2018 第6.3.1条", "摇青原则 | 摇青转数由少到多，摇后摊置历时由短到长，摊叶厚度由薄到厚；第二、三次摇青须摇到青味浓强、鲜叶硬挺（\"还阳\"）；第四、五次视青叶色、香变化灵活掌握 | 抖音百科·铁观音初制茶（行业经验总结）", "做青适度指标 | 叶色转为暗黄绿色，叶面略有皱纹，叶梗柔软稍有弹性，青气消失，散发清香，间有水果甜香 | GB/T 35863-2018 第6.3.2条", "作用原理 | 利用外力摩擦和振动擦破茶青叶缘细胞壁，使多酚类物质在酶作用下缓慢氧化，形成\"绿叶红镶边\"特征及乌龙茶特有香气；同时促进梗脉水分和可溶性内含物向叶片输送 | GB/T 35863-2018 第6.3条；行业通用原理", "温度 | 260℃–300℃ | GB/T 19598-2025 第7.4.1.2.4条", "减重率 | 30%–40% | 同上", "通用参考 | 闽南乌龙茶杀青适宜温度220℃–280℃，时间控制在10 min内，杀青后含水量40%–60% | GB/T 35863-2018 第6.4.2条", "操作要求 | 杀青后应及时揉捻 | GB/T 19598-2025 第7.4.1.2.4条", "作用原理 | 高温钝化多酚氧化酶活性，终止酶促发酵，固定做青阶段形成的色香味品质；同时蒸发水分使青叶软化，便于揉捻塑形 | GB/T 35863-2018 第6.4条", "原则 | \"热揉、少量、逐渐加压、快速、短时\" | GB/T 19598-2025 第7.4.1.2.5条", "时间 | 2 min–3 min | 同上", "成条要求 | 卷曲率达90%以上 | 同上", "作用原理 | 初步使杀青叶卷曲成条，破坏叶细胞使茶汁外溢，增进茶汤浓度 | 行业通用原理", "原则 | \"适当高温、薄摊快速\" | GB/T 19598-2025 第7.4.1.2.6条", "温度 | 90℃–120℃ | 同上", "厚度 | 不超过5 cm | 同上", "时间 | 10 min–12 min | 同上", "程度 | 至茶叶不粘手，约6成干时下烘进行初包揉 | 同上", "操作 | 通过束包、解块、翻动、过筛初步塑形 | GB/T 19598-2025 第7.4.1.2.7条", "反复次数 | 3遍–5遍 | 同上", "设备 | 速包机+平板机配合（行业通用设备） | 行业通用（铁观音特色工序）", "作用原理 | 铁观音特色塑形工序，通过反复包挤压使茶叶形成紧结圆实的颗粒状外形 | GB/T 35863-2018 第3.6条（包揉定义）", "温度 | 80℃–85℃ | GB/T 19598-2025 第7.4.1.2.8条", "时间 | 10 min–15 min | 同上", "程度 | 烘至茶条有刺手感，约7成干时下烘 | 同上", "作用 | 巩固初步塑形 | 同上", "操作 | 再次通过束包、解块、翻动、过筛最终定形 | GB/T 19598-2025 第7.4.1.2.9条", "反复次数 | 3遍–5遍 | 同上", "原则 | \"低温慢烘\" | GB/T 19598-2025 第7.4.1.2.10条", "温度 | 60℃–90℃ | 同上", "程度 | 烘至茶梗手折即断，含水率低于7% | 同上", "方式 | 炭焙或电焙等 | GB/T 19598-2025 第7.4.2.2.2条", "温度 | 90℃–150℃ | 同上", "原则 | 根据毛茶差异灵活掌握 | 同上", "清香型烘干 | 文火烘干，温度60℃–90℃，含水率低于7% | GB/T 19598-2025 第7.4.2.1.2条", "陈香型烘足干 | 温度70℃–140℃，含水率宜低于6%，贮存≥5年 | GB/T 19598-2025 第7.4.2.3.2条"],
      "quality": "",
      "grade": ["项目 | 特级 | 一级 | 二级 | 三级", "条索 | 肥壮、紧结 | 壮实、紧结 | 卷曲、较紧结 | 卷曲、尚紧结", "色泽 | 油润、砂绿明显 | 较油润、砂绿较明显 | 尚油润、砂绿尚明显 | 乌绿、稍带黄", "香气 | 高香 | 清高、持久 | 清香 | 清纯", "滋味 | 鲜醇甘爽、音韵明显 | 较鲜醇甘爽、音韵较明显 | 尚鲜醇爽口、音韵尚明显 | 醇和回甘、稍有音韵", "汤色 | 金黄、明亮 | 金黄、明亮 | 金黄、尚明亮 | 金黄", "叶底 | 肥厚、软亮、匀整、余香高长，有红点或红边 | 软亮、较匀整、余香较长，有红点或红边 | 较软亮、较匀整、有余香，有红点或红边 | 稍软亮、尚匀整", "项目 | 特级", "条索 | 肥壮、紧结", "色泽 | 乌润或乌润有砂绿", "香气 | 浓郁、持久", "滋味 | 醇厚、甘爽、音韵明显", "汤色 | 金黄或深金黄、清澈", "叶底 | 肥厚、软亮、匀整、红边明、有余香", "产品类型 | 等级划分 | 依据标准", "清香型 | 特级、一级、二级、三级（共4级） | GB/T 19598-2025 表1", "浓香型 | 特级、一级、二级、三级、四级（共5级） | GB/T 19598-2025 表2", "陈香型 | 特级、一级、二级、三级（共4级） | GB/T 19598-2025 表3", "通用乌龙茶产品等级 | 按GB/T 30357.2-2013《乌龙茶 第2部分：铁观音》执行 | GB/T 30357.2-2013"],
      "standards": ["1 地理标志产品质量要求 安溪铁观音 GB/T 19598-2025（2025-02-28发布，2025-09-01实施，代替GB/T 19598-2006） 国家市场监督管理总局/国家标准化管理委员会 https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7B5F15D64E84BFFD59AFF1EC1E0C4AFE", "2 乌龙茶 第2部分：铁观音 GB/T 30357.2-2013（含第1号修改单2016） 国家标准化管理委员会 https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=9EE7AF384DEAA63007FF82EAD6E5A73C", "3 乌龙茶加工技术规范 GB/T 35863-2018 中华全国供销合作总社 https://www.co-tea.com/mtsc/uploads/About//20220818214501223cfb4.pdf", "4 茶叶分类 GB/T 30766-2014 国家标准化管理委员会 待核实（标准全文公开系统）", "5 茶叶感官审评方法 GB/T 23776 国家标准化管理委员会 —"],
      "processNote": ""
    }, {
      "id": "wuyi_yancha",
      "name": "武夷岩茶",
      "category": "oolong",
      "origin": "福建·武夷山",
      "picking": "开面采，小开面至中开面为佳，采两叶至四叶嫩梢〔来源：GB/T 18745-2026 附录C〕",
      "craftChain": "初制工艺（GB/T 18745-2026 第7.3.1.1条）： 茶青 → 萎凋（晒青/加温萎凋） → ★做青（摇青+静置交替） → 杀青 → 揉捻 → 烘干（走水焙+凉索+复烘） → 毛茶 精制工艺（GB/T 18745-2026 第7.3.2.1条）： 毛茶 → 归堆、定级 → 拣剔、风选 → 烘焙（轻火/中火/足火） → 摊凉 → 拼配、匀堆 → 包装 → 成品茶 武夷岩茶特色工艺节点： 走水焙（初烘/毛火）：高温快速烘干至六成干，薄摊晾索6–7小时使茶梗水分散发 凉索：走水焙后摊放6–7小时，使茶梗水分向叶片转移 复焙（足火）：高温复烘至足干 炖火：精制阶段低温久烘，温度由高到低，发展岩韵 \"看青做青、看天做青\"：根据鲜叶状态和天气条件灵活调整做青参数",
      "steps": [{
        "name": "萎凋",
        "text": ""
      }, {
        "name": "★做青",
        "text": ""
      }, {
        "name": "杀青",
        "text": ""
      }, {
        "name": "揉捻",
        "text": ""
      }, {
        "name": "烘干（初制，含走水焙）",
        "text": ""
      }, {
        "name": "精制烘焙（含炖火）",
        "text": ""
      }],
      "params": ["方式 | 日光萎凋（晒青）或热风萎凋（加温萎凋） | GB/T 18745-2026 第7.3.1.2.1条", "温度 | 35℃–39℃ | 同上", "程度 | 茶青失去水分变软，青叶表面失去部分光泽 | 同上", "晒青失水率参考 | 约15%左右（水分蒸发掉15%为适度），原则\"宁轻勿过\" | 抖音百科·武夷岩茶制作技艺（行业经验）", "室内萎凋参考 | 摊放通风良好处，厚度以不动叠为宜，时间约3–5小时 | 行业经验", "两晒两晾 | 传统工艺可采用\"两晒两晾\"方式，促进萎凋均匀 | 人民艺术馆·武夷岩茶制作技艺（行业传统）", "作用原理 | 蒸发水分，软化叶片，促进酶活性增强和内含物质转化，是形成岩茶香味的基础 | 行业通用原理", "组成 | 多次摇青和静置氧化交替进行 | GB/T 18745-2026 第7.3.1.2.2条", "摇青方式 | 手工或机械 | 同上", "氧化程度 | 形成约\"三红七绿\"的半氧化状态（绿叶红镶边） | 同上", "做青室温湿度 | 闽北乌龙茶晾青间适宜温度22℃–25℃，湿度不高于80% | GB/T 35863-2018 第6.3.1条", "摇青次数/历时 | 闽北乌龙茶摇青一般4次–5次，历时10 h–12 h | GB/T 35863-2018 第6.3.1条", "机械化参考 | 做青历时7–9 h（高香型机械化生产） | 农技服务期刊（行业参考）", "摇青转速参考 | 约20 r/min，摇青时间逐次增加（如第2摇30s→第6摇15min） | 食品工业科技期刊（实验参考）", "做青原则 | \"看青做青、看天做青\"——根据鲜叶品种、气候气温、萎凋程度等灵活调整碰青与静置时长 | 行业通用（武夷岩茶核心原则）", "气味变化 | 青气→清香→花香→果香 | 中国茶叶流通协会（行业经验总结）", "走水现象 | 萎凋后茶青水分从茶梗脉向叶片输送，青叶由柔软无光泽转化到叶挺泛暗光呈\"还阳\"状态 | 同上", "做青适度 | 叶色暗黄绿，叶面略有皱纹，叶梗柔软稍有弹性，青气消失，散发清香间有水果甜香；叶缘红边明显 | GB/T 35863-2018 第6.3.2条；行业通用", "作用原理 | 摇青使茶青碰撞摩擦，叶缘破损，经静置氧化后破损部位红变；促进多酚类物质酶促氧化，生成茶黄素、茶红素，形成花果香和\"绿叶红镶边\"特征 | GB/T 18745-2026 第7.3.1.2.2条；行业通用原理", "温度 | 220℃–300℃ | GB/T 18745-2026 第7.3.1.2.3条", "通用参考 | 闽北乌龙茶杀青适宜温度220℃–280℃，时间控制在10 min内，杀青后含水量40%–60% | GB/T 35863-2018 第6.4.2条", "行业参考 | 240–260℃，\"扬闷结合，以闷为主\"，要求杀熟、杀匀、杀透 | 今日头条·武夷岩茶解析（行业经验）", "机械化参考 | 双锅连续炒制，锅温280–300℃ | 什么值得买·武夷岩茶新国标（行业参考）", "操作要求 | 将青叶炒熟炒透，同时散失青臭气、失去部分水分 | GB/T 18745-2026 第7.3.1.2.3条", "作用原理 | 高温终止青叶继续氧化，固定做青形成的品质；挥发低沸点青臭气，使高沸点花果香显露 | 行业通用原理", "方式 | 趁热手工揉捻或投入揉捻机揉捻 | GB/T 18745-2026 第7.3.1.2.4条", "压力 | 从轻到重，中间松压1次–2次 | 同上", "程度 | 揉出茶汁、揉成条索 | 同上", "双炒双揉 | 传统工艺采用双炒双揉（两次炒青与揉捻），塑造优美条索并促进内含物渗出 | 什么值得买·武夷岩茶新国标（行业参考）", "时间参考 | 约10 min | 食品工业科技期刊（实验参考）", "作用原理 | 使茶叶卷曲成条，破坏叶细胞使茶汁外溢，增进茶汤浓度和醇厚度 | 行业通用原理", "次数 | 分2次–3次进行烘干 | GB/T 18745-2026 第7.3.1.2.5条", "第一次烘干（走水焙/毛火） | 温度110℃–150℃，及时烘干，烘至有刺手感即可凉索 | 同上", "凉索 | 走水焙后薄摊晾索6–7小时，使茶梗水分散发 | 中国茶叶流通协会（行业经验）", "第二次/第三次烘干 | 温度100℃–140℃，烘至足干，形成毛茶 | GB/T 18745-2026 第7.3.1.2.5条", "走水焙温度参考 | 约130℃，烘至六成干 | 中国茶叶流通协会（行业经验）", "复焙温度参考 | 约160℃（高温复焙） | 同上", "程度 | 凉至室温后装袋入库 | GB/T 18745-2026 第7.3.1.2.5条", "作用原理 | 走水焙快速蒸发表面水分，固定条索；凉索使梗脉水分向叶片转移再分布；复烘彻底干燥，发展香气 | 行业通用原理", "轻火茶 | 烘焙时间4 h–8 h，温度100℃–120℃ | GB/T 18745-2026 第7.3.2.2.3条", "中火茶 | 烘焙时间6 h–10 h，温度120℃–130℃ | 同上", "足火茶 | 烘焙时间8 h–12 h以上，温度130℃–150℃ | 同上", "复焙次数 | 一次未烘焙到位可焙第2次、第3次，直到符合要求 | 同上", "闽北烘焙通用参考 | 温度70℃–160℃，含水率低于5%即可下机 | GB/T 35863-2018 第7.8条", "炖火（低温久烘） | 传统精制工艺，温度由高到低，低温久烘，发展岩韵；复焙温度约100℃左右，每笼约0.75 kg，焙至20 min后翻茶 | 人民艺术馆·武夷岩茶制作技艺（行业传统）", "作用原理 | 通过控制温度和时间发展不同火功风格，促进内含物质进一步转化，形成\"岩骨花香\"的岩韵品质 | 行业通用原理"],
      "quality": "大红袍产品感官品质（GB/T 18745-2026 表1，节选特级） 肉桂产品感官品质（GB/T 18745-2026 表3，节选特级） 水仙产品感官品质（GB/T 18745-2026 表4，节选特级） 各品种风格特征： 大红袍：拼配茶，香幽水厚韵足，均衡协调，岩韵显著 肉桂：香气浓郁持久，桂皮香/乳香/蜜桃香，滋味醇厚甘爽，\"香不过肉桂\" 水仙：兰花香浓郁鲜锐，滋味浓爽，叶底肥厚，\"醇不过水仙\"；老丛水仙具\"丛味\"（苔藓味/木质味） 名丛：各单株独特品质，如白鸡冠、铁罗汉、水金龟、半天妖（四大名丛） 奇种：有性群体种，香气清高幽长，滋味清醇甘爽 感官审评要点：按GB/T 23776执行。核心审评因子为\"岩韵\"（岩骨花香）——香气的锐度/幽远度与持久度、滋味的醇厚度与回甘、汤色的清澈明亮度、叶底的软亮匀齐与红边。正岩产区茶品岩韵显著，洲茶/外山岩韵较弱。",
      "grade": ["项目 | 特级", "条索 | 紧结、壮实、稍扭曲", "色泽 | 带宝色或油润", "香气 | 锐、浓长或幽、清远", "滋味 | 岩韵明显、醇厚、回味甘爽", "汤色 | 清澈、明亮，呈深橙黄色", "叶底 | 软亮匀齐、红边或带朱砂色", "项目 | 特级", "条索 | 紧结、重实", "色泽 | 青褐、油润", "香气 | 浓郁持久，似有乳香或蜜桃香或桂皮香", "滋味 | 醇厚甘爽，岩韵明显", "汤色 | 金黄、清澈、明亮", "叶底 | 软亮、匀齐、红边明显", "项目 | 特级", "条索 | 壮结", "色泽 | 青褐或铁青褐、油润", "香气 | 浓郁鲜锐、特征明显（兰花香）", "滋味 | 浓爽鲜锐、品种特征显、岩韵明显", "汤色 | 金黄、清澈、明亮", "叶底 | 肥厚软亮、匀齐、红边明显", "产品类型 | 等级划分 | 依据标准", "大红袍 | 特级、一级、二级（共3级） | GB/T 18745-2026 表1", "名丛 | 不分等级（单一品质要求） | GB/T 18745-2026 表2", "肉桂 | 特级、一级、二级（共3级） | GB/T 18745-2026 表3", "水仙 | 特级、一级、二级（共3级） | GB/T 18745-2026 表4", "奇种 | 特级、一级、二级（共3级） | GB/T 18745-2026 表5", "乌龙茶通用产品 | 按GB/T 30357系列各部分执行 | GB/T 30357.4-2015水仙、GB/T 30357.5-2015肉桂、GB/T 30357.8-大红袍（制定中）"],
      "standards": ["1 地理标志产品质量要求 武夷岩茶 GB/T 18745-2026（2026-03-31发布，2027-04-01实施，代替GB/T 18745-2006） 国家市场监督管理总局/国家标准化管理委员会 https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D780C8D3A7E05397BE0A0AB82A", "2 地理标志产品 武夷岩茶（现行版） GB/T 18745-2006（2006-07-18发布，2006-12-01实施，2025-09-05复审） 国家标准化管理委员会 https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D780C8D3A7E05397BE0A0AB82A", "3 乌龙茶 第4部分：水仙 GB/T 30357.4-2015 国家标准化管理委员会 https://www.co-tea.com/mtsc/uploads/About//20220915141848868970b.pdf", "4 乌龙茶加工技术规范 GB/T 35863-2018 中华全国供销合作总社 https://www.co-tea.com/mtsc/uploads/About//20220818214501223cfb4.pdf", "5 茶叶分类 GB/T 30766-2014 国家标准化管理委员会 待核实", "6 武夷岩茶制作技艺（国家级非物质文化遗产） 2006年第一批国家级非遗 国务院/文化和旅游部 待核实（非遗名录公开系统）"],
      "processNote": ""
    }, {
      "id": "anhua_heicha",
      "name": "安化黑茶",
      "category": "dark",
      "origin": "湖南·安化",
      "picking": "安化黑茶采成熟原料，等级划分如下 [DB43/T 659.1—2021, 表 1]： 天尖以一级黑毛茶为主，贡尖以二级黑毛茶为主，生尖以三、四级黑毛茶为主 [全国地理标志原产地特产信息网]",
      "craftChain": "黑毛茶初制：摊青 → 杀青 → 初揉 → ★渥堆 → 复揉 → 干燥（七星灶松柴明火烘焙） 成品茶精制（以茯砖茶为例）：毛茶筛拼 → 汽蒸 → 渥堆（汽蒸后渥堆）→ 称茶蒸压 → ★发花（冠突散囊菌培养）→ 干燥 → 包装 千两茶（花卷茶）：筛分 → 蒸茶 → 装篓 → 绞扎 → 踩制 → 晾晒（日晒夜露）→ 成品",
      "steps": [{
        "name": "摊青",
        "text": "设备/方式：贮青设备或竹匾摊放，鲜叶不与地面直接接触 关键参数：特级、一级鲜叶摊放厚度 8–10 cm，时间 4–6 h；二级鲜叶摊放厚度 20–25 cm，时间 2–4 h；三级鲜叶或立夏后可不经摊青直接杀青 [DB43/T 659.1—2021, 5.4.1] 作用原理：散失部分水分，使叶质柔软，利于杀青均匀；轻度酶促氧化减轻粗青气"
      }, {
        "name": "杀青",
        "text": "设备：滚筒杀青机（机械）或口径 80–90 cm 炒茶斜锅（手工，特级鲜叶） 关键参数： 洒水灌浆：除雨水叶、露水叶和幼嫩芽叶外，按鲜叶重量 10% 左右洒水（10 kg 鲜叶加 1 kg 清水），边洒边翻拌，以水不往下滴为度 [DB43/T 659.1—2021, 5.4.2.1] 锅温/筒温：280–320 ℃（投叶时），杀青后期降至 120–160 ℃（手工）；滚筒杀青机筒内离投叶端 20 cm 处内壁温度 280 ℃ 左右开始投叶 [DB43/T 659.1—2021, 5.4.2.2/5.4.2.3] 投叶量：手工每锅 4–5 kg；机械依鲜叶老嫩与水分含量调节 杀青程度：鲜叶色泽转暗绿，柔软带粘性，青草气消除，清香散发，嫩茎不易折断 [DB43/T 659.1—2021, 5.4.2.4] 作用原理：高温钝化多酚氧化酶活性，制止酶促氧化；蒸发水分使叶质柔软；因鲜叶粗老、含水量低，需洒水灌浆并采用高温杀青"
      }, {
        "name": "初揉",
        "text": "设备：揉捻机 关键参数： 趁热揉捻，杀青叶出锅即装揉捻机 装叶量：特级、一级自然装满揉桶；二级增加 10% 投叶量；三级增加 20% 加压原则：\"轻—重—轻\"，采用\"轻压、短时\" 揉捻时间：特级、一级 15–18 min；二、三级 10–12 min [DB43/T 659.1—2021, 5.4.3] 揉捻适度：特级、一级基本成条；二级 4、5 等条索基本卷折成条；二级 6 等、三级 7 等大部分成\"泥鳅条\"状；三级 8、9 等起褶皱，茶汁溢出，细胞破损率 15%–30% [DB43/T 659.1—2021, 5.4.3.4]"
      }, {
        "name": "★渥堆（核心工序）",
        "text": "设备/场所：室内发酵室，干净地面，避免阳光直射，有温措施 关键参数 [DB43/T 659.1—2021, 5.4.4]： 环境条件：室温 25–35 ℃，空气相对湿度 85% 左右 特级、一级原料：初揉后解散团块，堆厚度 15–25 cm，适当筑紧，上盖湿棉布保温保湿；渥堆中视堆温适时翻堆 1–2 次 二、三级原料：初揉后茶坯不经解块，立即堆积，适当筑紧，堆高约 1 m，加盖湿棉布；叶温 45 ℃ 左右，当堆温超过 50 ℃ 时进行翻堆，防止茶叶渥坏 渥堆时间：春季 16–22 h，夏、秋季 12–18 h，气温较低时需外界加温 渥堆适度标志：茶坯表面出现水珠，叶色由暗绿变为黄褐，带有酒糟气或酸辣气味，手伸入茶堆感觉发热，茶团粘性变小，一打即散 [DB43/T 659.1—2021, 5.4.4.5] 作用原理：在微生物（黑曲霉、根霉、酵母菌等）分泌胞外酶、湿热作用及氧化作用综合驱动下，茶多酚发生非酶性氧化与转化，叶绿素降解，茶黄素/茶红素/茶褐素比例变化，消除粗涩味，形成黄褐叶色与醇厚滋味 成品茶汽蒸渥堆（DB43/T 659.2—2021）：汽蒸后茶坯渥堆，堆高 0.8–1 m，叶温 40–50 ℃；一级黑毛茶原料堆积 3–4 h，二、三级黑毛茶原料堆积 5–6 h；待叶色转黄、汤色转红、滋味醇和无粗涩味时开堆散热"
      }, {
        "name": "复揉",
        "text": "设备：揉捻机 关键参数：渥堆适度茶坯经解块后复揉，装叶量自然满桶，时间 6–8 min；遵循\"轻压、短时、慢揉\"原则，压力较初揉稍小 [DB43/T 659.1—2021, 5.4.5] 作用：进一步紧结条索，使渥堆后松散的茶坯重新卷紧"
      }, {
        "name": "干燥（七星灶松柴明火烘焙）",
        "text": "方式一：七星灶烘焙（传统） [DB43/T 659.1—2021, 5.4.6.2] 灶口燃烧松柴，松柴横架保持火力均匀，通过匀温坡使火温均匀扩散到灶面焙帘 焙帘温度≥70 ℃ 时开始撒第一层茶坯，厚度 2–3 cm 待第一层烘至六、七成干时再撒第二层，撒叶稍薄，逐层加到 5–7 层，总厚度不超过焙框高度 待最上层达七八成干时，用特制铁叉将已干底层翻到上面，未干上层翻至下面 继续烘焙至各层干燥适度，下焙置于晒垫摊晾至室温，装袋入库 方式二：自动烘干机烘干：温度 130–180 ℃，根据设备吞吐量和茶叶嫩度调节 [DB43/T 659.1—2021, 5.4.6.3] 方式三：晒—烘干燥：晒垫摊叶厚度 2–3 cm，时间 5–8 h，中途翻动 2–3 次，晒至含水量 20%–30%；再转自动烘干机 110–120 ℃，摊叶 2–4 cm，10–15 min [DB43/T 659.1—2021, 5.4.6.5] 干燥程度：茶梗易折断，手捏茶叶可成粉末，干茶色泽油黑；特级毛茶含水量约 8%，一级约 9%，二、三级约 10% [DB43/T 659.1—2021, 5.4.6.6] 作用原理：七星灶松柴明火烘焙形成独特松烟香（松脂香气渗入茶坯），同时分层累加湿坯长时一次干燥使茶叶内含物质进一步转化；干燥温度不宜过高，以保留微生物活性利于后续陈化"
      }, {
        "name": "千两茶踩制（花卷茶特有）",
        "text": "工艺流程：筛分 → 蒸茶 → 装篓 → 绞扎 → 踩制 → 晾晒 关键参数 [DB43/T 659.2—2021；行业资料]： 蒸茶：蒸汽温度 98–102 ℃，蒸汽压力 0.4–0.7 MPa，时间 2–4 min，待茶坯蒸软后提出布包 装篓：将蒸软茶坯装入楠竹篾篓（花格篾篓） 绞扎与踩制：人工或机械绞扎篾篓，同时用脚踩压使茶体紧实，形成圆柱形 晾晒：日晒夜露约 49 天（传统），利用昼夜温差与自然条件促进后发酵与干燥 [待核实：49 天为行业传统说法，标准中未明确规定具体天数] 成品规格：千两茶净重约 36.25 kg（老秤 1000 两），柱高约 1.5–1.6 m"
      }, {
        "name": "茯砖茶\"发花\"（冠突散囊菌培养）",
        "text": "工艺流程：毛茶筛拼 → 汽蒸 → 渥堆 → 称茶蒸压 → 退砖 → ★发花 → 干燥 → 包装 发花关键参数 [DB43/T 659.2—2021；T/HNTI 067—2024《茯砖茶智能发花及干燥技术规程》；行业资料]： 蒸压成型后茶砖进入烘房，侧立排列在烘架上，砖间距约 2 cm 发花期：室温保持 28 ℃ 左右（28–32 ℃），相对湿度 80% 左右（75%–85%），时间约 12–15 天 干燥期：发花完成后进入干燥阶段，约 5–7 天，逐步升温排湿 发花过程需定期检查，控制温湿度与通气，促使冠突散囊菌（*Eurotium cristatum*，俗称\"金花\"）在砖内繁殖形成金黄色子囊果 作用原理：冠突散囊菌在适宜温湿度下生长繁殖，分泌多种酶类（纤维素酶、蛋白酶等），催化茶叶内含物质转化，形成茯砖茶特有的菌花香与醇厚滋味；\"金花\"茂盛度是茯砖茶品质的重要标志"
      }],
      "params": ["摊青 | 特级/一级鲜叶摊放厚度 8~10cm，时间 4~6h；二级 20~25cm、2~4h | DB43/T 659.1-2021, 5.4.1", "杀青 | 锅温/筒温 280~320℃（投叶时），杀青后期降至 120~160℃；滚筒杀青机筒内壁温度约 280℃ 投叶 | DB43/T 659.1-2021, 5.4.2", "初揉（揉捻） | 复揉装叶量自然满桶，时间 6~8min，遵循\"轻压、短时、慢揉\" | DB43/T 659.1-2021, 5.4.5", "渥堆 | 特级/一级原料堆厚 15~25cm，盖湿棉布保温保湿，堆温高时翻堆 1~2 次；春季 16~22h、夏秋季 12~18h | DB43/T 659.1-2021, 5.4.4", "汽蒸渥堆 | 堆高 0.8~1m，叶温 40~50℃，一级原料堆积 3~4h、二三级 5~6h | DB43/T 659.2-2021", "干燥 | 七星灶松柴明火烘焙；或晒垫摊叶 2~3cm 晒 5~8h 至含水 20~30%，再转烘干机 110~120℃ 10~15min | DB43/T 659.1-2021, 5.4.6"],
      "quality": "感官审评要点：依据 GB/T 23776—2018《茶叶感官审评方法》；黑茶审评注重汤色红浓度、香气纯度（无霉味、酸味等异味）、滋味醇厚度与回甘；茯砖茶需重点审评\"金花\"茂盛度与菌花香；千两茶需审评陈香与陈韵",
      "grade": ["级别 | 等级 | 原料要求", "特级 | — | 谷雨前后一芽一、二叶为主，比例≥90%", "一级 | 1–3 等 | 谷雨至芒种，一芽二、三叶为主，比例≥85%", "二级 | 4–6 等 | 谷雨至小满，一芽三叶至一芽三、四叶及对夹叶为主，带嫩茎，比例≥80%", "三级 | 7–9 等 | 芒种后，一芽三、四叶至一芽四、五叶及对夹叶为主，有嫩梗，比例≥75%–80%"],
      "standards": ["1 GB/T 30766《茶叶分类》 2014 国家标准化管理委员会 https://img.antpedia.com/standard/files/pdfs_ora/CN-GB/c99/GB_T%2030766-2014_9507.pdf", "2 GB/T 32743《黑茶加工技术规范》 2016 国家标准化管理委员会 待核实（全国标准信息公共服务平台）", "3 DB43/T 659.1《地理标志产品 安化黑茶加工技术规程 第1部分：黑毛茶加工》 2021 湖南省市场监督管理局 https://aimg8.dlssyht.cn/u/2132522/ueditor/file/1067/2132522/1711330796704099.pdf", "4 DB43/T 659.2《地理标志产品 安化黑茶加工技术规程 第2部分：成品茶加工》 2021 湖南省市场监督管理局 https://dbba.sacinfo.org.cn/portal/download/2ddced411717667a54fda7f4a26837330241f31d32a23345d62a97bdcc45896a", "5 GB/T 32719.2《黑茶 第2部分：花卷茶》 2016 国家标准化管理委员会 待核实", "6 T/HNTI 067《茯砖茶智能发花及干燥技术规程》 2024 湖南省标准化协会 http://m.bzfxw.com/TB/1055216.html", "7 全国地理标志原产地特产信息网——安化黑茶 — 全国地理标志原产地特产信息网 https://www.sinogi.cn/wap/index.php/product/zxshow/id/1279/nid/226"],
      "processNote": "工艺流程：毛茶筛拼 → 汽蒸 → 渥堆 → 称茶蒸压 → 退砖 → ★发花 → 干燥 → 包装 发花关键参数 [DB43/T 659.2—2021；T/HNTI 067—2024《茯砖茶智能发花及干燥技术规程》；行业资料]： 蒸压成型后茶砖进入烘房，侧立排列在烘架上，砖间距约 2 cm 发花期：室温保持 28 ℃ 左右（28–32 ℃），相对湿度 80% 左右（75%–85%），时间约 12–15 天 干燥期：发花完成后进入干燥阶段，约 5–7 天，逐步升温排湿 发花过程需定期检查，控制温湿度与通气，促使冠突散囊菌（*Eurotium cristatum*，俗称\"金花\"）在砖内繁殖形成金黄色子囊果 作用原理：冠突散囊菌在适宜温湿度下生长繁殖，分泌多种酶类（纤维素酶、蛋白酶等），催化茶叶内含物质转化，形成茯砖茶特有的菌花香与醇厚滋味；\"金花\"茂盛度是茯砖茶品质的重要标志"
    }, {
      "id": "liubao_cha",
      "name": "六堡茶",
      "category": "dark",
      "origin": "广西·梧州",
      "picking": "采摘标准：一芽一叶至一芽三、四叶及同等嫩度对夹叶 [全国地理标志原产地特产信息网/六堡茶] 鲜叶要求：芽、叶、嫩茎新鲜、匀净，无污染和无非茶类夹杂物（参照黑茶基本要求 GB/T 32719.1） 毛茶要求：经初制工艺（杀青→初揉→堆闷→复揉→干燥）制成六堡茶毛茶，作为精制加工原料",
      "craftChain": "初制（毛茶加工） [GB/T 32719.4—2016, 3.1]：鲜叶 → 杀青 → 初揉 → 堆闷 → 复揉 → 干燥 → 六堡茶毛茶 精制（成品加工） [GB/T 32719.4—2016, 3.1]：毛茶 → 筛选 → 拼配 → 汽蒸（或不汽蒸）→ ★渥堆 → 汽蒸 → 压制成型（或不压制成型）→ ★陈化 → 成品包装",
      "steps": [{
        "name": "杀青",
        "text": "设备：滚筒杀青机（主流）或锅式杀青机 关键参数：杀青温度较高（因鲜叶原料偏成熟），锅温/筒温约 260–320 ℃（待核实：GB/T 32719.4 未明确杀青温度，此为黑茶类通用参数范围） 杀青程度：叶质柔软，叶色转为暗绿色，青草气味基本消失 [全国地理标志原产地特产信息网] 作用原理：高温钝化多酚氧化酶，蒸发水分，为后续揉捻做准备"
      }, {
        "name": "初揉",
        "text": "设备：揉捻机 方式：趁温揉捻至成条索 [全国地理标志原产地特产信息网] 关键参数：加压\"轻—重—轻\"，时间约 15–25 min（待核实：标准未明确规定，参照黑茶类揉捻通用参数） 作用：使叶片卷紧成条，破坏叶细胞，茶汁溢出，为后续堆闷/渥堆提供物质基础"
      }, {
        "name": "堆闷（初制阶段发酵）",
        "text": "设备/场所：洁净室内地面，避免阳光直射 关键参数 [T/GXAS 310—2022《地理标志农产品 广西六堡茶加工技术规程》, 8.2.1.4；全国地理标志原产地特产信息网]： 初揉结束后进行筑堆堆闷 当堆温达到 55 ℃ 时，及时进行翻堆散热 当堆温降到 30 ℃ 时再收拢筑堆，继续堆闷直到适度为止 一般堆高 33–50 cm（传统小堆）[中国茶文化网] 堆闷时间视具体情况而定，一般 10–15 h（传统小堆）[中国茶文化网]；现代冷水渥堆工艺可长达 2–3 个月 [搜狐/六堡茶现代工艺] 堆闷适度标志：叶色变为深黄带褐色，茶坯出现粘汁，苦涩味减轻 [中国茶文化网] 作用原理：利用揉捻叶自身水分与余热，在微生物和湿热作用下进行轻度发酵，为后续渥堆/陈化奠定基础 传统工艺与现代工艺的区别：传统工艺六堡茶初制后不经渥堆，直接干燥后入仓陈化，依靠长期自然陈化形成\"红、浓、陈、醇\"品质；现代工艺（国家标准工艺）在精制阶段增加冷水渥堆工序，发酵周期约 2–3 个月，快速形成六堡茶特征品质 [搜狐/六堡茶现代工艺解读]"
      }, {
        "name": "复揉",
        "text": "设备：揉捻机 方式：堆闷后再次揉紧成条索 [全国地理标志原产地特产信息网] 关键参数：时间较初揉短，约 6–10 min（待核实），轻压慢揉 作用：使堆闷后松散的茶坯重新卷紧，条索更紧结"
      }, {
        "name": "干燥（初制）",
        "text": "方式：日光晒干或炭火慢烘（传统），或烘干机干燥（现代） 关键参数：干燥至茶叶含水量达标（散茶≤12%，参照 GB/T 32719.4 理化指标）[GB/T 32719.4—2016, 表 2] 传统工艺：优先选择日光晒干，利用自然阳光缓慢干燥，保留天然山野气息 [今日头条/六堡茶传统工艺] 作用：终止发酵，固定品质，便于贮存"
      }, {
        "name": "★渥堆（精制阶段，现代工艺核心）",
        "text": "设备/场所：发酵专用车间或发酵罐（箱），洁净地面 关键参数： 团体标准 T/GARIRPA（梧州六堡茶品质茶园特色产品认证技术规范）：渥堆时间应为 45 天以上，待叶色变为红褐或黑褐，发出醇香，即为渥堆适度；可在条件适宜的发酵专用罐（箱）内进行 团体标准 T/GXDSL 103—2025《六堡茶加工技术规程（精制茶）》：堆高宜为 1.0–1.2 m，堆温控制在 45–55 ℃，相对湿度 85%–90%，每隔 3–5 天翻堆一次，总发酵时间 15–20 天；定期检测 pH（4.5–5.5）、茶多酚含量（每日下降 0.3%–0.5%）（注：T/GXDSL 103—2025截至2026-09仍为征求意见稿、尚未正式发布〔来源：全国团体标准信息平台 www.ttbz.org.cn〕；六堡茶现行加工技术规程为T/GXAS 310-2022《地理标志农产品 广西六堡茶加工技术规程》，工艺参数可优先参照。） 《桂青种六堡茶加工技术规程》编制说明：堆高 80 cm（100 cm），相对湿度 80%（90%），堆温宜为 50 ℃/55 ℃；春季 40–50 天、夏季 30–40 天、冬季 60–70 天；每 2–3 天翻堆 1 次，待叶色变褐、发出醇香即可 现代冷水渥堆：整个渥堆时间约 2–3 个月，期间根据天气变化、温湿度变化观察茶叶外观、色泽、紧结度等变化，控制翻堆 [搜狐/六堡茶现代工艺] 作用原理：在微生物（黑曲霉、根霉、酵母菌为主，还有少量青霉、木霉）大量繁殖，分泌胞外酶催化茶多酚氧化；湿热条件促使儿茶素氧化聚合、叶绿素降解、氨基酸转化，形成六堡茶\"红、浓、陈、醇\"的独特品质，部分优质六堡茶产生\"槟榔香\"等特殊香型"
      }, {
        "name": "汽蒸与压制成型",
        "text": "汽蒸：蒸汽温度约 100 ℃，使茶叶软化，便于压制成型（待核实：GB/T 32719.4 未明确汽蒸参数，参照紧压茶通用参数） 压制成型：可压制成竹箩装紧压茶（传统六堡茶以竹箩盛装，每箩 20–40 kg 不等）、砖茶、饼茶、沱茶、圆柱茶等 [GB/T 32719.4—2016, 3.3] 不压制成型：散茶直接进入陈化工序"
      }, {
        "name": "★陈化（六堡茶标志性工序）",
        "text": "设备/场所：清洁、阴凉、通风、无异杂味的陈化仓（茶窖） 关键参数 [《广西复合六堡茶加工技术规程》编制说明；行业资料]： 陈化前晾置：待茶叶温度降至室温，含水量降至 18% 以下 陈化环境：相对湿度 70%–75%，温度 25–28 ℃ 陈化时间：不少于 180 天（团体标准规定）；传统六堡茶陈化可达数月至数年，甚至十年以上 陈化方式：传统竹箩装六堡茶入窖陈化，利用梧州地区温暖湿润气候条件自然陈化 陈化适度标志：汤色红浓明亮，陈香纯正（部分显槟榔香），滋味醇厚爽滑，无堆味、无青涩味 作用原理：在长期适宜温湿度条件下，茶叶内含物质继续发生缓慢的非酶性氧化、微生物转化与络合反应，茶多酚进一步氧化降解，咖啡碱与茶多酚络合，可溶性糖与氨基酸发生美拉德反应等，使汤色更红浓、滋味更醇和、陈香更显著，形成六堡茶\"越陈越佳\"的品质特点"
      }],
      "params": ["杀青 | 锅温/筒温 280~320℃（投叶时） | GB/T 32719.4-2016 未量化，参照黑茶通用参数", "堆闷 | 传统小堆 10~15h，堆温降至 30℃ 时收拢筑堆续闷；现代冷水渥堆工艺可长达 2~3 个月 | 中国茶文化网/行业资料", "汽蒸 | 蒸汽温度 98~102℃，蒸汽压力 0.4~0.7MPa，时间 2~4min | 紧压茶通用参数（GB/T 32719.4 未量化）", "渥堆（精制） | 渥堆堆温 40~50℃，堆积 3~6h，叶色转黄、汤色转红、无粗涩味时开堆 | 参照 DB43/T 659.2-2021 汽蒸渥堆"],
      "quality": "依据 GB/T 32719.4—2016 表 1（六堡茶散茶感官品质）[GB/T 32719.4—2016, 5.2.1]： 六堡茶紧压茶：外形形状端正匀称、松紧适度、厚薄均匀、表面平整；色泽、净度、香气、滋味、汤色、叶底等感官品质应符合表 1 中对应等级的规定 [GB/T 32719.4—2016, 5.2.2] 品质风格总结：六堡茶以\"红、浓、陈、醇\"四字为品质核心，优质六堡茶可呈现\"槟榔香\"（六堡茶独特香型，类似槟榔干果的香气）、松烟香、药香等复合香气；滋味醇厚爽滑，回甘生津，汤色深红明亮 感官审评要点：依据 GB/T 23776—2018《茶叶感官审评方法》；六堡茶审评注重汤色深红浓度、陈香纯度（无霉味、酸味、馊味）、滋味醇厚度与爽滑度；槟榔香是六堡茶高档品质的重要标志；叶底以黑褐、柔软、明亮为好",
      "grade": ["项目 | 特级 | 一级 | 二级 | 三级 | 四级 | 五级 | 六级", "条索 | 紧细 | 紧结 | 尚紧结 | 粗实紧卷 | 粗实 | 粗松 | 粗老", "色泽 | 黑褐黑油润 | 黑褐黑油润 | 黑褐黑尚油润 | 黑褐黑尚油润 | 黑褐黑尚油润 | 黑褐黑 | 黑褐黑", "香气 | 陈香纯正 | 陈香纯正 | 陈香纯正 | 陈香纯正 | 陈香纯正 | 陈香纯正 | 陈香尚纯正", "滋味 | 陈醇厚 | 陈尚醇厚 | 陈浓醇 | 陈尚浓醇 | 陈醇正 | 陈尚醇正 | 陈尚醇", "汤色 | 深红明亮 | 深红明亮 | 尚深红明亮 | 红明亮 | 红明亮 | 尚红尚明亮 | 尚红尚亮", "叶底 | 褐黑褐细嫩柔软明亮 | 褐黑褐尚细嫩柔软明亮 | 褐黑褐嫩柔软明亮 | 褐黑褐尚柔软明亮 | 褐黑褐稍硬明亮 | 褐黑褐稍硬明亮 | 褐黑褐稍硬尚亮"],
      "standards": ["1 GB/T 32719.4《黑茶 第4部分：六堡茶》 2016 国家标准化管理委员会 http://www.wuzhou.gov.cn/ztjj_1/wzslbccylyzwgkzt/lbcbz/lbcdfbz/W020220623440191515984.pdf", "2 GB/T 32719.1《黑茶 第1部分：基本要求》 2016 国家标准化管理委员会 待核实", "3 T/GXAS 310《地理标志农产品 广西六堡茶加工技术规程》 2022 广西标准化协会 https://guangxibiaoxie.com/uploads/20220610/c9eb42c5b722f9e164b530337a590310.pdf", "4 T/GXDSL 103《六堡茶加工技术规程（精制茶）》 2025 全国团体标准信息平台 https://www.ttbz.org.cn/upload/file/20250925/6389439452545002741493192.pdf", "5 梧州六堡茶品质茶园特色产品认证技术规范 2025 全国团体标准信息平台 https://www.ttbz.org.cn/upload/file/20251111/6389845761603212847796736.pdf", "6 全国地理标志原产地特产信息网——广西六堡茶 — 全国地理标志原产地特产信息网 https://www.sinogi.cn/wap/index.php/product/gg/id/8984", "7 六堡茶传统工艺与现代工艺的具体要求及异同 2026 今日头条/喝旧藏新 http://m.toutiao.com/group/7627765716422230562/"],
      "processNote": "设备/场所：清洁、阴凉、通风、无异杂味的陈化仓（茶窖） 关键参数 [《广西复合六堡茶加工技术规程》编制说明；行业资料]： 陈化前晾置：待茶叶温度降至室温，含水量降至 18% 以下 陈化环境：相对湿度 70%–75%，温度 25–28 ℃ 陈化时间：不少于 180 天（团体标准规定）；传统六堡茶陈化可达数月至数年，甚至十年以上 陈化方式：传统竹箩装六堡茶入窖陈化，利用梧州地区温暖湿润气候条件自然陈化 陈化适度标志：汤色红浓明亮，陈香纯正（部分显槟榔香），滋味醇厚爽滑，无堆味、无青涩味 作用原理：在长期适宜温湿度条件下，茶叶内含物质继续发生缓慢的非酶性氧化、微生物转化与络合反应，茶多酚进一步氧化降解，咖啡碱与茶多酚络合，可溶性糖与氨基酸发生美拉德反应等，使汤色更红浓、滋味更醇和、陈香更显著，形成六堡茶\"越陈越佳\"的品质特点"
    }, {
      "id": "puer_shucha",
      "name": "普洱熟茶",
      "category": "dark",
      "origin": "云南·西双版纳/普洱/临沧",
      "picking": "鲜叶采摘标准 [GB/T 22111—2008, 表 1]： 熟茶渥堆原料：通常以三级至五级晒青毛茶（一芽三、四叶及同等嫩度对夹叶）为主体，粗老原料内含物质丰富、耐发酵，适合渥堆；特级、一级原料多用于高档熟茶或拼配提毫 [行业共识，待核实：标准未明确规定渥堆用原料等级] 晒青毛茶工艺：鲜叶堆放 → 杀青 → 揉捻 → 解块 → 日光干燥 → 包装 [GB/T 22111—2008, 6.5.1]；日光干燥（晒青）是普洱茶区别于其他绿茶的关键，保留了微生物活性与酶类，为后续渥堆/陈化提供物质基础",
      "craftChain": "晒青毛茶（原料）：鲜叶摊放 → 杀青 → 揉捻 → 解块 → 日光干燥（晒青） 普洱熟茶散茶 [GB/T 22111—2008, 6.5.3]：晒青茶 → ★后发酵（渥堆）→ 干燥 → 晾晒 → 包装 普洱熟茶紧压茶 [GB/T 22111—2008, 6.5.4]：普洱茶（熟茶）散茶 → 蒸压成型 → 干燥 → 包装 （或：晒青茶精制 → 蒸压成型 → 干燥 → 后发酵 → 普洱茶（熟茶）紧压茶 → 包装）",
      "steps": [{
        "name": "晒青毛茶制备（熟茶原料基础）",
        "text": "杀青：锅温 200–280 ℃（待核实：GB/T 22111 未明确杀青温度，此为云南茶区传统/通用参数），投叶量依锅型而定，杀青至叶质柔软、青草气消失 揉捻：趁热揉捻，成条率要求高 日光干燥：将揉捻叶薄摊于晒垫/篾笆上，利用日光自然干燥，干燥至含水量约 10%–12%（待核实）；晒青工艺保留茶叶中微生物与酶活性，是普洱茶后续转化的物质基础"
      }, {
        "name": "★渥堆（后发酵，核心工序）",
        "text": "渥堆是普洱熟茶品质形成的决定性工序。GB/T 22111—2008 将\"后发酵\"定义为\"云南大叶种晒青茶或普洱茶（生茶）在特定环境条件下，经微生物、酶、湿热、氧化等综合作用，其内含物质发生一系列转化，而形成普洱茶（熟茶）独有品质特征的过程\" [GB/T 22111—2008, 4.3]。 说明：GB/T 22111—2008 未对渥堆具体参数（堆温、堆高、含水量、翻堆次数、周期）做量化规定，以下参数来源于核心期刊研究、专利文献及行业权威资料，已标注来源。 原料准备：晒青毛茶按等级、产区分堆，通常将粗老原料（三至五级）作为渥堆主体 潮水（洒水增湿）： 通过均匀洒水提高茶堆含水量，创造发酵条件 适宜含水量约 30%–35% [抖音百科/行业资料；什么值得买社区：一吨茶洒水 100–150 kg] 洒水需均匀、细致、覆盖全面，避免局部过湿导致腐烂 建堆（筑堆）： 将潮水后的茶叶堆成梯形大堆，堆高通常 0.5–1.5 m（大堆可达 1 m 以上）[抖音百科；行业资料] 覆盖发酵布（麻布/编织袋）保温保湿，创造高温高湿的\"发酵仓\"环境 大堆发酵通常每堆数吨至数十吨 堆温控制： 发酵过程中茶堆温度一般控制在 40–65 ℃ [抖音百科] 最佳堆温 50–55 ℃（距茶堆表面 50 cm 处测温）[搜狐/行业资料] 温度低于 45 ℃ 达不到理想发酵效果；高于 65 ℃ 出现\"烧心\"——叶底不展开、滋味淡薄、汤色发暗；超过 68 ℃ 则\"烧堆\"，品质严重受损 [搜狐；今日头条] 学术研究实测数据：传统大堆发酵一翻时（第 6 天）堆芯温度 57.6 ℃，二翻时堆芯温度 58.8 ℃ [《茶叶科学》2022 年研究论文，普洱茶立体小罐发酵加工工艺技术的应用研究] 翻堆： 翻堆频率：通常每 5–10 天翻堆一次，或每 7 天一次 [抖音百科；搜狐] 翻堆总次数：4–8 次（一、二级嫩茶翻堆 7–8 次，五、六级粗老茶翻 4–5 次）[爱普茶网/普洱杂志；什么值得买社区]；专利文献记载 3–5 次 [X技术/专利 CN200910094090] 翻堆目的：①平衡茶堆内外温度，避免堆心过高烧茶；②补充氧气，调节菌群活性；③散发多余湿气和杂味，防止闷坏；④解散团块，将里外干湿不同茶坯拌匀，使发酵一致 翻堆操作：先将上层和四周面层茶翻开另堆，再摆放在新翻堆茶的中层，使各层都有机会在上层得到充分生长（与供氧有关），有利于发酵均匀 [爱普茶网] 渥堆周期： 总周期约 30–60 天（大堆发酵通常 45–60 天；小堆/离地堆可缩短至 25–40 天）[什么值得买社区；抖音百科；今日头条] 专利文献记载 35–40 天 [X技术/专利 CN200910094090] 发酵周期受季节、环境温湿度、原料老嫩、堆大小等因素影响 出堆（渥堆适度标志）： 茶叶色泽由青褐变为红褐色，白毫变为金黄色 闻之有醇厚陈香，无青味、无堆味（或堆味轻微） 取样审评：汤色红浓，滋味醇厚顺滑，无苦涩味或苦涩味极轻 出堆后进行干燥、晾晒，终止发酵 作用原理：渥堆过程中，黑曲霉、根霉、酵母菌、乳酸菌等微生物大量繁殖，分泌多酚氧化酶、纤维素酶、蛋白酶、果胶酶等胞外酶；在酶促作用、湿热作用（高温高湿）和氧化作用综合驱动下，茶多酚（尤其是儿茶素）发生氧化聚合生成茶黄素、茶红素、茶褐素；叶绿素降解脱镁；蛋白质水解为氨基酸；淀粉/果胶水解为可溶性糖；咖啡碱含量略有变化；最终形成普洱熟茶红浓汤色、醇厚顺滑滋味、独特陈香的品质特征"
      }, {
        "name": "干燥与晾晒",
        "text": "出堆后将渥堆茶摊开晾晒或烘干，使含水量降至安全标准（≤12%，待核实：GB/T 22111 理化指标中水分要求） 干燥方式可采用日光晾晒或烘干机低温干燥，温度不宜过高以保留陈香风格"
      }, {
        "name": "蒸压成型（紧压熟茶）",
        "text": "参见本文件\"紧压茶\"章节，蒸汽温度 90–100 ℃ 以上，蒸制 10–20 s，压力依模具而定，干燥温度≤65 ℃"
      }],
      "params": ["杀青 | 锅温 200~280℃，杀至叶质柔软、青草气消失 | GB/T 22111-2008 未量化，云南茶区传统/通用参数", "渥堆（后发酵） | 茶堆温度 40~65℃；低于 45℃ 效果差，高于 65℃ 易\"烧心\"，超 68℃ 严重受损 | GB/T 22111-2008 后发酵定义 + 行业资料", "渥堆（洒水） | 洒水量约 100~150kg/吨茶，茶坯适宜含水量 30%~35% | 行业资料", "干燥 | 日光干燥（晒青）至含水量 10%~12%，保留微生物与酶活性，为后发酵提供物质基础 | GB/T 22111-2008, 6.5.1"],
      "quality": "依据 GB/T 22111—2008 表（普洱茶熟茶散茶感官品质）[GB/T 22111—2008, 6.6.1.2.2]： 紧压熟茶：外形色泽红褐，形状端正匀称、松紧适度、不起层脱面；内质汤色红浓明亮，香气独特陈香，滋味醇厚回甘，叶底红褐 [GB/T 22111—2008, 6.6.1.2.3.2] 感官审评要点 [GB/T 22111—2008, 附录 C]： 散茶外形审评侧重条索和色泽；内质审评侧重香气和滋味 称样 5.0 g，250 mL 标准审评杯，沸水冲泡 5 min 汤色：红浓明亮、红亮剔透为好；深暗、浑浊为差 香气：馥郁/浓郁为好；纯正为正常；带酸味为差；异味、杂味为劣质茶 滋味：顺滑、浓厚、回甘、生津为好；醇和回甘为正常；酸味、苦味重、涩味重为差 叶底：柔软、肥嫩、红褐、有光泽、匀齐为好；色泽花杂、暗淡、碳化或如泥状为差",
      "grade": ["级别 | 芽叶比例", "特级 | 一芽一叶占 70% 以上，一芽二叶占 30% 以下", "一级 | 一芽二叶占 70% 以上，同等嫩度其他芽叶占 30% 以下", "二级 | 一芽二、三叶占 60% 以上，同等嫩度其他芽叶占 40% 以下", "三级 | 一芽二、三叶占 50% 以上，同等嫩度其他芽叶占 50% 以下", "四级 | 一芽三、四叶占 70% 以上，同等嫩度其他芽叶占 30% 以下", "五级 | 一芽三、四叶占 50% 以上，同等嫩度其他芽叶占 50% 以下", "项目 | 特级 | 一级 | 三级 | 五级 | 七级 | 九级", "条索 | 紧细 | 紧结 | 尚紧结 | 紧实 | 尚紧实 | 粗松", "色泽 | 红褐润显毫 | 红褐润较显毫 | 褐润尚显毫 | 褐尚润 | 褐欠润 | 褐稍花", "香气 | 陈香浓郁 | 陈香浓厚 | 陈香浓纯 | 陈香尚浓 | 陈香纯正 | 陈香平和", "滋味 | 浓醇甘爽 | 浓醇回甘 | 醇厚回甘 | 浓厚回甘 | 醇和回甘 | 纯正回甘", "汤色 | 红艳明亮 | 红浓明亮 | 红浓明亮 | 深红明亮 | 褐红尚浓 | 褐红尚浓", "叶底 | 红褐柔嫩 | 红褐较嫩 | 红褐尚嫩 | 红褐欠嫩 | 红褐粗实 | 红褐粗松"],
      "standards": ["1 GB/T 22111《地理标志产品 普洱茶》 2008（现行有效，2025 复审继续有效） 国家质量监督检验检疫总局 http://www.ctatc.com/attach/201011/26/1290744986765F_Orig.pdf", "2 GB/T 30766《茶叶分类》 2014 国家标准化管理委员会 https://img.antpedia.com/standard/files/pdfs_ora/CN-GB/c99/GB_T%2030766-2014_9507.pdf", "3 普洱茶立体小罐发酵加工工艺技术的应用研究 2022 《茶叶科学》编辑部 https://www.tea-science.com/CN/article/downloadArticleFile.do?attachType=PDF&id=2366", "4 普洱市人民政府对政协提案的答复函（普洱茶分类说明） 2024 普洱市人民政府 https://www.puershi.gov.cn/info/16771/1679312.htm", "5 普洱杂志：微生物发酵与普洱茶的生产 — 爱普茶网 https://m.ipucha.com/show-24-13784.html", "6 专利：一种普洱熟茶的生产方法（CN200910094090） — 国家知识产权局 https://www.xjishu.com/zhuanli/02/200910094090.html/"],
      "processNote": "参见本文件\"紧压茶\"章节，蒸汽温度 90–100 ℃ 以上，蒸制 10–20 s，压力依模具而定，干燥温度≤65 ℃"
    }, {
      "id": "daipao_cha",
      "name": "袋泡茶",
      "category": "reprocessed",
      "origin": "全国（工业化生产）",
      "picking": "原料茶要求 [GB/T 24690—2018；行业资料]： 以红茶、绿茶、乌龙茶、花茶等基本茶类或再加工茶的碎茶/片茶为原料 原料应符合对应茶类产品标准（如红茶符合 GB/T 13738，绿茶符合 GB/T 14456，茉莉花茶符合 GB/T 22292） 原料含水率应低于 5%（行业通用要求，利于长期保存和快速冲泡）[原创力文档/袋泡茶加工] 原料需经检验，无霉变、无异味、无非茶类夹杂物 滤袋材料要求 [GB/T 24690—2018, 5.1]： 滤袋应符合相关食品安全国家标准中食品接触材料及制品的要求，清洁、无毒、无异味，不影响茶叶品质 滤纸应符合 GB 4806.1（食品接触材料及制品通用安全要求）和 GB 4806.8（食品接触用纸和纸板材料及制品）的规定 包装滤纸还应符合 GB/T 25436、GB/T 2812 的规定 [云南省卫生健康委员会/红茶企业标准引用] 辅助材料要求 [GB/T 24690—2018, 5.1]： 提线应固定，不脱落、不断裂；固定提线用胶粘剂应无毒、无害 若使用钉子封口，钉子应符合 GB 4806.9（食品接触用金属材料及制品）的规定，固定不脱落 若使用吊牌，吊牌用纸应符合 GB 4806.8 的规定，印刷油墨应符合相关食品安全国家标准",
      "craftChain": "[GB/T 24690—2018；国家市场监督管理总局茶叶生产许可审查细则；行业资料] 原料茶（红茶/绿茶/乌龙茶/花茶碎茶）→ 检验验收 → 筛分（分筛）→ 风选\n→ 切茶/粉碎（如需）→ 拼配（按配方比例混合）→ 干燥（复火，控制水分）\n→ ★袋泡包装（自动袋泡茶包装机：制袋→计量充填→封口→切袋→连提线/吊牌）\n→ 装盒/装罐 → 检验 → 装箱 → 成品",
      "steps": [{
        "name": "原料检验与验收",
        "text": "方式：按批次对原料茶进行感官品质、水分、粉末碎茶、净含量、标签等检验 要求：原料应符合对应茶类标准，无劣变、无异味、无污染 作用：确保原料品质合格，为成品质量奠定基础"
      }, {
        "name": "筛分与风选",
        "text": "设备：平面圆筛机、风选机 方式：将原料茶按颗粒大小分级，去除茶粉、茶灰和轻质杂物 关键参数：袋泡茶原料通常控制在一定目数范围内（如 10–60 目，待核实：不同产品有差异），颗粒过细则冲泡时易从滤袋渗出导致茶汤浑浊，过粗则浸出慢、滋味淡 作用：保证原料颗粒均匀，冲泡时浸出速度一致，茶汤清澈"
      }, {
        "name": "切茶/粉碎",
        "text": "设备：切茶机/粉碎机（齿辊式切茶机、锤式粉碎机等） 方式：对较大颗粒的原料茶进行切细或粉碎，使其达到袋泡茶所需的颗粒规格 关键参数：粉碎程度通常控制在 20–40 目（代用茶常见参数，纯茶叶袋泡茶可能不同）[健之源/代用茶加工]；茶叶原料含水率 2%–5% 时粉碎效果最佳，过高易发霉结块，过低产生过多粉尘 [chineseherbalslices.com] 作用：使原料颗粒大小均一，增加冲泡时与水的接触面积，加快内含物质浸出"
      }, {
        "name": "拼配",
        "text": "设备：拼配机/匀堆机 方式：按产品配方将不同等级、不同产区、不同茶类的原料按比例混合均匀 作用：保证产品风味稳定一致，通过拼配协调香气、滋味、汤色等品质因子"
      }, {
        "name": "干燥（复火）",
        "text": "设备：烘干机/烘焙机 方式：对拼配后的原料进行低温干燥，控制水分 关键参数：原料含水率应低于 5% [原创力文档/袋泡茶加工]；干燥温度不宜过高，防止香气散失 作用：将原料水分控制在安全范围，防止袋泡茶在保质期内霉变，同时保证冲泡时茶叶能快速吸水浸出"
      }, {
        "name": "★袋泡包装（核心工序）",
        "text": "设备：自动袋泡茶包装机（立式/卧式，单室/双室/三角包） 工艺流程：过滤材料卷筒→成型器制袋→计量充填（茶叶落入袋中）→封口（热封/超声封）→切袋→连接提线/吊牌→输出成品袋 关键参数： 净含量：一般每袋 1.5–2.5 g（常见 2 g/袋），部分产品 3 g/袋 [原创力文档/袋泡茶加工；gikaglobalfarma.co.id]；计量误差需控制在国家标准允许范围内（参照 JJF 1070 定量包装商品净含量计量检验规则） 包装速度：全自动袋泡茶包装机通常 80–200 袋/分钟（待核实：依设备型号而定） 封口要求：封口严密，产品不得散漏 [GB/T 24690—2018 相关；广西卫健委企业标准] 滤袋形态：冲泡后滤袋外形完整，茶叶不渗漏 [我要测网/袋泡茶检测] 作用原理：将定量茶叶密封于过滤材料袋中，冲泡时水透过滤袋进入茶袋，茶叶内含物质溶出到茶汤中，茶渣留在袋内，实现便捷冲泡"
      }, {
        "name": "装盒/装罐与检验",
        "text": "方式：将袋泡茶按规定数量（如 20 袋/盒、25 袋/盒、100 袋/罐）装入外包装盒/罐 检验：出厂检验项目包括感官品质、水分、粉末碎茶、净含量、标签等 [GB/T 34779—2017, 8.4 类似要求；袋泡茶行业通用] 包装：符合 GH/T 1070-2011《茶叶包装通则》"
      }],
      "params": ["切碎 | 茶叶切碎至适宜粒度（多为 0.5~1.5mm），便于滤袋浸出 | GB/T 24690-2018（粒度行业通用）", "干燥 | 成品水分含量≤7%，滤袋包装防潮 | GB/T 24690-2018"],
      "quality": "感官审评要点 [GB/T 24690—2018；GB/T 23776—2018]： 袋泡茶审评需将茶袋放入审评杯，沸水冲泡规定时间（通常 3–5 min）后审评 重点审评：滤袋完整性（冲泡后不破裂、不漏茶）、茶汤清澈度（无过多茶粉渗出导致浑浊）、香气纯度、滋味浓度与鲜爽度 袋泡茶因原料为碎茶，浸出速度快，冲泡时间较条茶短，需注意避免浸泡过久导致苦涩味重 理化指标：水分、总灰分、粉末碎茶含量、水浸出物等应符合 GB/T 24690—2018 规定（具体数值待核实标准原文表格）",
      "grade": [],
      "standards": ["1 GB/T 24690《袋泡茶》 2018 国家标准化管理委员会 https://pdf.0ppt.com/61/11/31/61113176.pdf", "2 GB/T 30766《茶叶分类》 2014 国家标准化管理委员会 https://img.antpedia.com/standard/files/pdfs_ora/CN-GB/c99/GB_T%2030766-2014_9507.pdf", "3 GB/T 23776《茶叶感官审评方法》 2018 国家标准化管理委员会 待核实（全国标准信息公共服务平台）", "4 茶叶及其相关制品生产许可审查细则 2020 国家市场监督管理总局 https://www.samr.gov.cn/spscs/tzgg/art/2023/art_aa36a9e6363c46709bf4f9ae96c242b3.html", "5 袋泡茶加工（教学课件） 2017 原创力文档 https://m.book118.com/html/2017/0209/89698374.shtm", "6 GB/T 24690-2018 袋泡茶标准解读 2026 分析测试百科网 https://www.antpedia.com/standard/1114100836-10.html"],
      "processNote": "方式：将袋泡茶按规定数量（如 20 袋/盒、25 袋/盒、100 袋/罐）装入外包装盒/罐 检验：出厂检验项目包括感官品质、水分、粉末碎茶、净含量、标签等 [GB/T 34779—2017, 8.4 类似要求；袋泡茶行业通用] 包装：符合 GH/T 1070-2011《茶叶包装通则》"
    }, {
      "id": "jinya_cha",
      "name": "紧压茶",
      "category": "reprocessed",
      "origin": "云南/湖南/湖北等地",
      "picking": "原料茶要求： 以基本茶类成品茶或毛茶为原料，原料应符合对应产品标准（如普洱茶应符合 GB/T 22111，白茶应符合 GB/T 22291） 原料经筛分、风选、拣剔，去除非茶类夹杂物，按等级/筛号拼配 紧压前通常需潮水回潮，使茶叶含水量达 15%–18%（普洱茶紧压）[行业资料/掌阅/普洱茶文化] 盖茶与里茶：高档紧压茶（如普洱饼茶）常分\"盖茶\"（洒面茶，用较细嫩原料铺在表面）和\"里茶\"（芯茶，用主体原料填充内部），按比例分别称取待蒸 [行业资料]",
      "craftChain": "[GB/T 30766—2014, 4.7.2；云南省地方标准/紧压茶；国家市场监督管理总局茶叶生产许可审查细则] 原料茶 → 筛分 → 风选 → 拣剔 → 拼配（盖茶/里茶）→ 潮水回潮 → 称茶\n→ ★汽蒸（蒸软）→ 装袋/装模 → ★压制成型 → 冷却定型 → 退模/退砖\n→ 干燥 → 包装 → 成品",
      "steps": [{
        "name": "原料处理（筛分、拼配）",
        "text": "设备：平面圆筛机、风选机、拣梗机、色选机 方式：将原料茶按大小、轻重分级，去除茶梗、黄片、非茶类夹杂物；按产品配方拼配不同等级、不同产区的原料 作用：保证产品品质稳定一致，外形匀整"
      }, {
        "name": "潮水回潮",
        "text": "方式：对干燥原料茶均匀洒水或喷雾回潮 关键参数：使茶叶含水量达 15%–18% [行业资料/普洱茶文化与世界茶源]；部分工艺不单独潮水，直接通过汽蒸增湿 作用：增加茶叶含水量，使叶片柔软，蒸压时不易破碎，便于成型"
      }, {
        "name": "称茶",
        "text": "方式：按产品规格准确称量，如七子饼茶每饼 357 g（或 200 g、250 g、500 g 等），砖茶 250 g/500 g/1000 g，沱茶 50 g/100 g/250 g 盖茶与里茶分别称量"
      }, {
        "name": "★汽蒸（蒸软，核心工序）",
        "text": "设备：蒸汽发生机 + 蒸茶桶（立式静态蒸茶桶）或连续蒸茶机 关键参数（不同茶类/不同来源）： 蒸茶时茶坯用布袋装好放入蒸桶内 防止蒸得过久（造成干燥困难）或蒸气不透面（造成脱面掉边影响品质）[云南企业标准] 蒸茶适度标志：待蒸汽冒出茶面，茶叶变软，果胶汁溢于茶条表面时即可压制 [今日头条/普洱茶压制工艺] 作用原理：高温蒸汽使茶叶快速受热软化，叶片弹性减弱，果胶物质溢出增加粘性，便于压制成型；同时蒸汽具有短暂的湿热作用，促进茶叶内含物质轻微转化"
      }, {
        "name": "★压制成型（核心工序）",
        "text": "设备： 传统：石磨/石板人工压制（普洱饼茶传统工艺）、木模/铁模压制 现代：液压机/压力机（30–50 吨液压机）、气动压茶机、自动压茶生产线 关键参数： 白茶紧压 [GH/T 1242-2019 相关参数]：压力 30–50 KN，保压时间待核实（标准片段未完整显示） 普洱茶饼：将蒸软茶叶装入特制布袋（揉饼袋），手工揉成圆饼状，放入模具后用液压机压制成型；10 吨液压机常用 [专利文献] 砖茶：将蒸软茶叶装入砖模，刮平、加盖、压紧，冷却后退砖 沱茶：装入碗臼形模具压制 松紧度控制：坯料与茶饼体积比约 2.5–3:1（专利文献参数）[X技术/专利 CN201210023701] 作用原理：在外力作用下，软化后的茶叶颗粒紧密排列，果胶物质将茶粒粘结在一起，冷却后形成固定形状；压制松紧度影响后续干燥效率和后期陈化速度——压得过紧不利于干燥和后期转化，过松则易松散掉边"
      }, {
        "name": "冷却定型与退模",
        "text": "方式：压制后保持模具中冷却定型，待茶体温度下降、形状固定后退模/退砖 关键参数：砖温由 80 ℃ 左右下降到 50 ℃ 左右（约历时 80 min）时可用退砖机退砖 [行业资料/山珍博味馆] 作用：使茶体在模具中充分冷却定型，防止退模后变形、松散"
      }, {
        "name": "干燥",
        "text": "设备：烘房/干燥室（低温慢干）、烘干机 关键参数： 黑砖/花砖茶：干燥温度≤65 ℃ [全国地理标志原产地特产信息网/安化黑茶] 普洱茶紧压茶：通常采用低温干燥（40–60 ℃），干燥时间数天至十数天，使含水量降至≤13%（紧压茶）[待核实：不同企业标准有差异] 茯砖茶：发花后干燥期 5–7 天（见安化黑茶章节） 干燥方式：烘房内茶饼侧立排列在烘架上，保持间距，通风排湿 作用原理：紧压茶茶体紧实，水分不易散发，需低温长时间缓慢干燥，防止外干内湿导致霉变；干燥温度过高会破坏茶叶香气和内含物质"
      }, {
        "name": "包装",
        "text": "干燥后检验合格，按产品规格进行包装（棉纸包饼、笋叶扎筒、礼盒等） 包装符合 GH/T 1070-2011《茶叶包装通则》"
      }],
      "params": ["蒸汽温度 | 98–102 ℃ | ≥90 ℃ | 100–120 ℃ | 100–121 ℃", "蒸汽压力 | 0.4–0.7 MPa | ≥0.4 MPa | — | 0.2–0.3 MPa（分气缸气压）", "蒸制时间 | 2–4 min | 沱茶/饼茶/砖茶 10–15 s（工艺茶 15–20 s） | 白毫银针 15–20 s，白牡丹/贡眉 10–15 s，寿眉 20–35 s | 常压 2–3 min（大堆），5–10 s（小甑）", "蒸茶 | 蒸汽温度 98~102℃，蒸汽压力 0.4~0.7MPa，时间 2~4min | 紧压茶通用参数", "压制成型 | 压制压力 KN 20~60（理想 30~50），模具定型，压制后摊晾 | GB/T 9833 系列 + 行业参数", "干燥 | 干燥温度≤65℃（低温慢烘），成品含水率≤12% | 紧压茶通用参数"],
      "quality": "以普洱茶紧压茶为代表： 感官审评要点 [GB/T 22111—2008, 附录 B/C]： 外形审评：形状是否端正、是否起层落面、边缘是否圆滑/棱角分明、厚薄是否一致、松紧度是否适中、洒面是否均匀 内质审评：将部分审评样解散混合均匀后称样 5 g，250 mL 标准杯沸水冲泡 5 min；评汤色、香气、滋味、叶底，以香气、滋味为主",
      "grade": [],
      "standards": ["1 GB/T 30766《茶叶分类》 2014 国家标准化管理委员会 https://img.antpedia.com/standard/files/pdfs_ora/CN-GB/c99/GB_T%2030766-2014_9507.pdf", "2 GB/T 22111《地理标志产品 普洱茶》 2008 国家质量监督检验检疫总局 http://www.ctatc.com/attach/201011/26/1290744986765F_Orig.pdf", "3 DB43/T 659.2《地理标志产品 安化黑茶加工技术规程 第2部分：成品茶加工》 2021 湖南省市场监督管理局 https://dbba.sacinfo.org.cn/portal/download/2ddced411717667a54fda7f4a26837330241f31d32a23345d62a97bdcc45896a", "4 紧压茶（云南省食品安全地方标准） — 云南省卫生健康委员会 http://ynswsjkw.yn.gov.cn/uploadfile/s57/2024/0229/20240229042044683.pdf", "5 普洱茶 Q/QFX 0011 S-2022（企业标准，含蒸压参数） 2022 云南省卫生健康委员会备案 http://ynswsjkw.yn.gov.cn/uploadfile/s57/2023/0301/20230301114533302.pdf", "6 茶叶及其相关制品生产许可审查细则 2020 国家市场监督管理总局 https://www.samr.gov.cn/spscs/tzgg/art/2023/art_aa36a9e6363c46709bf4f9ae96c242b3.html", "7 专利：一种金花普洱生茶茶饼或茶砖的制作工艺（含蒸压参数） — 国家知识产权局 https://www.xjishu.com/zhuanli/02/201611038347.html/"],
      "processNote": "干燥后检验合格，按产品规格进行包装（棉纸包饼、笋叶扎筒、礼盒等） 包装符合 GH/T 1070-2011《茶叶包装通则》"
    }, {
      "id": "moli_huacha",
      "name": "茉莉花茶",
      "category": "reprocessed",
      "origin": "广西·横县/福建·福州",
      "picking": "茶坯要求 [GB/T 34779—2017, 3.1/4.1]： 经精制工艺加工成一定规格的、可进行窨制工艺的烘青或炒青（含半烘炒）绿茶 茶坯应符合 GB/T 14456.1《绿茶 第 1 部分：基本要求》的规定 窨花前茶坯宜先经过干燥处理，烘焙温度 100–110 ℃，水分含量 4%–5%，烘焙后摊凉冷却，待茶叶堆温不高于室温 3 ℃ 时才可付窨 [GB/T 34779—2017, 7.2] 茉莉鲜花要求 [GB/T 34779—2017, 4.2]： 应成熟、饱满、洁白，含苞欲放，无劣变、无污染 通常在下午采收（花蕾饱满，当晚开放吐香） 白兰鲜花（打底用） [GB/T 34779—2017, 4.3]：应成熟、花瓣未开张、新鲜，无劣变、无污染；每 100 kg 茶坯总配花量≤1.5 kg [GB/T 34779—2017, 7.4.1]",
      "craftChain": "[GB/T 34779—2017, 第 6 章工艺流程] 茶坯加工 → 茶坯处理（复火干燥）\n              ↘\n鲜花养护 → 拌和窨花 → ★通花散热 → 收堆续窨 → 起花 → 烘焙 → 冷却 →（提花）→ 匀堆装箱\n              ↑___________________________________________________|\n                              转窨（重复窨次） 一个完整窨次 = 窨花 → 通花 → 收堆续窨 → 起花 → 烘焙 高档茉莉花茶可经多窨次（三窨一提至六窨一提或以上），最后一次提花后不经烘焙直接匀堆装箱",
      "steps": [{
        "name": "茶坯处理（复火干燥）",
        "text": "设备：烘干机/烘焙机 关键参数 [GB/T 34779—2017, 7.2]： 烘焙温度 100–110 ℃ 烘焙后茶坯水分含量 4%–5% 烘焙后及时摊凉冷却，待茶叶堆温不高于室温 3 ℃ 时才可付窨 作用原理：茶坯干燥至低水分（4%–5%），增强茶叶孔隙的吸附能力，为窨制时吸附花香创造条件；同时去除茶坯中陈味、潮气，提升茶香纯净度"
      }, {
        "name": "鲜花养护",
        "text": "设备/方式：通气箩筐或网状袋装运，进厂后薄摊于洁净地面或竹匾上 关键参数 [GB/T 34779—2017, 7.3]： 进厂后立即薄摊、通气散热，待花温降至近室温时收堆升温 摊放散热和收堆升温交替进行，结合适当翻动，促进茉莉花开放吐香 夏季气温高以\"摊\"为主，摊花厚度 10 cm 左右 气温低以\"堆\"为主，堆高 30–40 cm，堆温达到 38–40 ℃ 时再耙开薄摊降温 反复摊、堆 3–5 次 付窨标准：当鲜花开放率在 60% 以上、开放度（花瓣张开角度）50°–60° 时筛花，剔除青蕾、花蒂；待开放率 80% 以上、开放度达到 90°（花蕾开放呈虎爪状）即可付窨 作用原理：茉莉花属\"气质花\"，香气随花朵开放而释放（萜烯醇类、乙酸芳樟酯等芳香物质在开花过程中酶促合成释放）；通过摊堆交替控制花温，促进花蕾均匀开放，使吐香集中、香气鲜灵"
      }, {
        "name": "拌和窨花（窨堆）",
        "text": "设备/方式：人工或拌和机，将茶坯和鲜花分层相间摊放并快速均匀拌和 关键参数 [GB/T 34779—2017, 7.4.3]： 拌和应在 1 h 之内完成 窨堆高 25–40 cm：头窨窨堆宜高，二、三窨窨堆宜低；气温高时窨堆宜低，气温低时窨堆宜高 窨堆宽 120–150 cm 最后用预留茶坯盖面（盖面层 0.5–1 cm 厚），使鲜花不外露以减少香气损失 [GB/T 34779—2017, 3.12] 配花量（每 100 kg 茶坯所配净花量） [GB/T 34779—2017, 附录 B 表 B.1]： GB/T 22292—2017 附录 A 同样规定了各级别配花量，特种茶类（六窨一提或以上）每 50 kg 茶坯用花 270 单位（即 135 kg/50kg = 270%）以上，与 GB/T 34779 附录 B 一致 [GB/T 22292—2017, 附录 A] 作用原理：茶坯（低水分、多孔性）与茉莉鲜花（开放吐香）分层拌和，鲜花释放的芳香物质被茶坯吸附；窨堆保持适当高度与宽度，形成微气候（温度逐步升高、湿度增大），促进鲜花持续吐香和茶坯吸附"
      }, {
        "name": "★通花散热",
        "text": "设备/方式：人工或机械将窨堆耙开散热，开纵横沟反复 2–3 次 关键参数 [GB/T 34779—2017, 7.5, 表 1]： 摊凉厚度 10 cm 左右 散热时间 0.5–1.0 h 通花应快速、通透、通匀 作用原理：窨堆中鲜花呼吸放热，堆温升高至 45 ℃ 左右，如不及时散热会导致鲜花\"烧死\"（香气劣变、产生闷味）、茶坯高温劣变；通花使堆温降至室温，补充氧气，促进鲜花恢复活力继续吐香，同时散发二氧化碳和杂气"
      }, {
        "name": "收堆续窨",
        "text": "设备/方式：通花摊凉后收拢茶坯继续窨制 关键参数 [GB/T 34779—2017, 7.6]： 当通花摊凉堆温接近室温（不高于室温 3 ℃）时收堆 堆高 20–30 cm 续窨时间 5–6 h 作用原理：通花散热后鲜花恢复吐香能力，收堆后继续窨制，使茶坯充分吸附花香"
      }, {
        "name": "起花",
        "text": "设备：筛分机（起花机），将花渣与湿坯分开 关键参数 [GB/T 34779—2017, 7.7, 表 2]： 起花标志：花已呈萎凋状，色泽由白转微黄，鲜花香气微弱 起花应适时、快速、筛净，在 3 h 之内完成 高档茶先起，中低档茶后起；多窨次茶先起，头窨后起 作用原理：窨制达到预定时间后，鲜花香气已基本释放完毕，花渣如继续留在茶中会产生闷味、花渣味，影响品质；起花将花渣筛除，保留吸附了花香的湿坯"
      }, {
        "name": "烘焙（转窨前干燥）",
        "text": "设备：烘干机 关键参数 [GB/T 34779—2017, 7.9]： 起花后湿坯应及时烘焙，待烘湿坯应薄摊，不可闷堆 烘干温度 90–110 ℃，头窨高，逐窨降低 摊叶厚度 2–3 cm 在烘时间 10 min 左右 水分控制： 烘后待转窨的：含水量 5%–6%（每次烘后比窨前略高） 待提花的：含水率 6.5%–7% 烘装（不提花直接成品）的：含水率≤8.5% 烘干后茶叶应摊凉，温度接近室温方可转窨或提花 作用原理：湿坯含水率高达 11%–16%，需及时干燥至安全水分，防止霉变和香气劣变；烘焙温度逐窨降低以减少花香散失；干燥至低水分恢复茶坯吸附能力，为下一窨次做准备"
      }, {
        "name": "提花（最后一次窨制，不经烘焙）",
        "text": "设备/方式：同拌和窨花 关键参数 [GB/T 34779—2017, 7.10]： 选择晴天午后采收、朵大洁白、饱满成熟的优质茉莉鲜花 鲜花开放度达到 95° 左右 配花量：每 100 kg 茶坯配茉莉鲜花 5–10 kg（上表中提花用花 6–8 kg） 堆高 20–30 cm 窨制时间 6–8 h 起花后花茶含水率控制在 8.5% 以下 提花后不经烘焙，应及时匀堆装箱 作用原理：提花用少量优质鲜花最后窨制一次，目的是提高茉莉花茶香气的鲜灵度（即花香的清新、鲜活感）；因不经烘焙，鲜花的鲜灵香气得以最大程度保留，与前几窨烘焙后保留的浓郁花香形成\"浓而不烈、鲜而不淡\"的复合香气"
      }, {
        "name": "匀堆装箱",
        "text": "成箱前抽样试拼小样，全面检验合格后按比例匀堆装箱 匀堆要求均匀，上下品质一致 包装符合 GH/T 1070-2011《茶叶包装通则》"
      }],
      "params": ["茶坯复火 | 烘焙温度 100~110℃，茶坯水分含量 4%~5%，摊凉至堆温不高于室温 3℃ 付窨 | GB/T 34779-2017, 7.2", "拌和窨花 | 茶坯与茉莉鲜花按比例拌和窨制，鲜花吐香、茶坯吸香，通花散热控制堆温 | GB/T 34779-2017", "烘焙干燥 | 烘焙温度 80~100℃，窨后烘干固定香气，成品水分含量≤6.5% | GB/T 34779-2017"],
      "quality": "感官审评要点：依据 GB/T 23776—2018；茉莉花茶审评核心是香气——评花香的鲜灵度、浓度、纯度和持久性，要求\"鲜、灵、浓、久\"，不得有青味、闷味、花渣味、烟焦味等异味；其次评滋味的鲜醇度与茶味花香协调度；高档茶要求\"见茶不见花\"（茶中不保留花干或仅少量），香气鲜灵持久",
      "grade": ["级别 | 窨次 | 合计用花量(kg) | 一窨 | 二窨 | 三窨 | 四窨 | 五窨 | 六窨 | 提花", "大白毫 | 六窨一提 | 270 | 65 | 50 | 48 | 40 | 34 | 30 | 6", "毛尖 | 六窨一提 | 240 | 60 | 45 | 38 | 32 | 30 | 29 | 6", "毛峰 | 六窨一提 | 220 | 50 | 40 | 36 | 30 | 30 | 28 | 6", "银毫 | 六窨一提 | 200 | 45 | 40 | 30 | 30 | 25 | 24 | 6", "春毫 | 五窨一提 | 150 | 40 | 32 | 28 | 24 | 20 | — | 6", "香毫 | 四窨一提 | 130 | 40 | 32 | 28 | 24 | — | — | 6", "特级 | 四窨一提 | 120 | 38 | 30 | 26 | 20 | — | — | 6", "一级 | 三窨一提 | 100 | 38 | 30 | 26 | — | — | — | 6", "二级 | 二窨一提 | 70 | 36 | 26 | — | — | — | — | 8", "三级 | 一压一窨一提 | 50 | 42 | — | — | — | — | — | 8"],
      "standards": ["1 GB/T 22292《茉莉花茶》 2017 国家标准化管理委员会 http://jckspj.customs.gov.cn/spj/fileDir/resource/cms/article/4576890/4646904/2022102809573080473.pdf", "2 GB/T 34779《茉莉花茶加工技术规范》 2017 国家标准化管理委员会 https://www.co-tea.com/mtsc/uploads/About/202208182145306997717.pdf", "3 GB/T 30766《茶叶分类》 2014 国家标准化管理委员会 https://img.antpedia.com/standard/files/pdfs_ora/CN-GB/c99/GB_T%2030766-2014_9507.pdf", "4 窨制工艺对茉莉花茶主要滋味物质及风味品质的影响 2023 《中国食品学报》 http://zgspxb.cnjournals.org/zgspxb/article/html/20241221"],
      "processNote": "成箱前抽样试拼小样，全面检验合格后按比例匀堆装箱 匀堆要求均匀，上下品质一致 包装符合 GH/T 1070-2011《茶叶包装通则》"
    }];

(function () {
  var FT = window.FAMOUS_TEAS;
  var byCat = {};
  FT.forEach(function (t) {
    (byCat[t.category] = byCat[t.category] || []).push(t);
  });
  Object.keys(byCat).forEach(function (c) {
    var tea = window.TEA_DATA[c];
    if (!tea) return;
    tea.famousTeas = byCat[c];
    tea.representative = byCat[c].map(function (t) {
      return { name: t.name, origin: t.origin || '' };
    });
  });
  // 第 7 类：再加工茶
  if (!window.TEA_DATA.reprocessed) {
    window.TEA_DATA.reprocessed = 
  {
    id: 'reprocessed',
    name: '再加工茶',
    nameShort: '再',
    ferment: '依品类而定',
    fermentLevel: 0,
    color: '#8A6F4D',
    colorLight: '#A98F6A',
    tagline: '以茶为本，窨香塑形',
    description: '再加工茶是以六大基本茶类（茶坯）为原料，经再加工制成的茶类，GB/T 30766-2014《茶叶分类》单列为第七大类。代表产品：茉莉花茶（窨花再加工）、紧压茶（蒸压成型）、袋泡茶（粉碎包装）。',
    coreProcess: '窨制/压制',
    idealPicking: 'one_bud_two_leaves',
    pickingTenderRange: [1, 4],
    suitableShaiqingMethods: [],
    bestShaiqingMethod: null,
    suitableGanzaoMethods: ['honggan'],
    bestGanzaoMethod: 'honggan',
    steps: [
      {
        id: 'chabei',
        name: '茶坯复火',
        description: '选用合格茶坯（多为烘青绿茶坯，亦可用红茶、乌龙茶或黑茶散茶），复火干燥至含水率4%~5%，使茶坯充分吸香。',
        paramType: 'temperature',
        paramName: '复火温度',
        paramUnit: '℃',
        paramMin: 60,
        paramMax: 150,
        idealRange: [90, 110],
        idealValue: 100,
        timeUnit: '分钟',
        timeMin: 15,
        timeMax: 90,
        idealTimeRange: [30, 60],
        idealTimeValue: 45,
        hint: '茶坯含水率降至4%~5%为窨制最佳状态，过低易碎、过高吸香差。',
        effects: {
          tooLow: { text: '复火不足，茶坯含水率高，吸香能力弱，窨制效果差。', quality: -20 },
          tooHigh: { text: '复火过度，茶坯焦变，产生焦味，破坏茶坯品质。', quality: -25 },
          perfect: { text: '茶坯充分干燥，孔隙打开，为吸香做好准备。', quality: 0 }
        }
      },
      {
        id: 'yinhua',
        name: '拌和窨花',
        description: '鲜花与茶坯按比例拌和堆窨，利用鲜花吐香与茶坯吸香，堆温控制在35~45℃，历时8~12h。',
        paramType: 'time',
        paramName: '窨制时间',
        paramUnit: '小时',
        paramMin: 4,
        paramMax: 16,
        idealRange: [8, 12],
        idealValue: 10,
        hint: '窨制期间需注意堆温，过高要及时通花散热。',
        effects: {
          tooLow: { text: '窨制时间不足，茶坯吸香不够，香气淡薄。', quality: -20 },
          tooHigh: { text: '窨制过久，茶坯闷味重，香气闷浊不鲜灵。', quality: -18 },
          perfect: { text: '茶引花香，花增茶味，窨制恰到好处。', quality: 0 }
        }
      },
      {
        id: 'tonghua',
        name: '通花散热',
        description: '当堆温升至40℃以上时开堆翻拌散热，防止鲜花闷热变质，促使香气均匀渗透。',
        paramType: 'time',
        paramName: '通花摊晾时间',
        paramUnit: '分钟',
        paramMin: 10,
        paramMax: 90,
        idealRange: [30, 60],
        idealValue: 45,
        hint: '通花及时可保香气鲜灵，是高档花茶的关键环节。',
        effects: {
          tooLow: { text: '通花不足，堆温过高，鲜花闷熟，香气低闷。', quality: -22 },
          tooHigh: { text: '通花过久，堆温过低，窨制进程停滞，香气单薄。', quality: -12 },
          perfect: { text: '散热适度，堆温回落，鲜花活力与茶坯吸香达到平衡。', quality: 0 }
        }
      },
      {
        id: 'hongbei',
        name: '烘焙干燥',
        description: '窨制完成后烘干茶坯，固定香气、降低含水率（成品≤6.5%），便于贮存。',
        paramType: 'temperature',
        methodType: 'ganzao',
        paramName: '烘焙温度',
        paramUnit: '℃',
        paramMin: 60,
        paramMax: 150,
        idealRange: [80, 100],
        idealValue: 90,
        timeUnit: '分钟',
        timeMin: 20,
        timeMax: 90,
        idealTimeRange: [30, 60],
        idealTimeValue: 45,
        hint: '先高后低分段烘焙，含水率降至6.5%以下。',
        effects: {
          tooLow: { text: '烘焙不足，含水率偏高，香气易散失，茶易霉变。', quality: -20 },
          tooHigh: { text: '温度过高，花香被烘焙味掩盖，鲜灵度尽失。', quality: -25 },
          perfect: { text: '茶香花香水乳交融，鲜灵持久，成品耐贮存。', quality: 0 }
        }
      }
    ],
    appearance: '因品类而异：茉莉花茶条索紧秀匀整、显露毫尖；紧压茶砖形/饼形端正、松紧适度；袋泡茶滤袋完整、无漏茶末',
    soupColor: '依茶坯与再加工方式而定（茉莉花茶黄绿明亮；普洱紧压茶红浓明亮）',
    taste: '花香茶味融合（花茶），或陈醇顺滑（陈化紧压茶）',
    aroma: '窨花茶香气鲜灵持久；紧压茶陈香/菌花香纯正',
    leafBase: '依茶坯等级与窨制次数而定',
    tips: '再加工茶的核心是“茶引花香”与“塑形提质”：茉莉花茶窨次越多等级越高（特级常达6~7窨），紧压茶重在蒸压与干燥均匀。'
  }
;
  }
  var rt = window.TEA_DATA.reprocessed;
  if (rt) {
    rt.famousTeas = byCat.reprocessed || [];
    rt.representative = (byCat.reprocessed || []).map(function (t) {
      return { name: t.name, origin: t.origin || '' };
    });
  }
  // 成就条件扩展：全茶类成就升级为 7 类
  var A = window.ACHIEVEMENTS;
  if (A) {
    var IDS7 = ['green', 'white', 'yellow', 'oolong', 'red', 'dark', 'reprocessed'];
    A.forEach(function (a) {
      if (a.id === 'all_teas') {
        a.name = '七艺皆通';
        a.desc = '完成七大茶类各至少一次制作';
        a.condition = function (p) {
          return IDS7.every(function (id) { return (p.teaBrewCount[id] || 0) >= 1; });
        };
      }
      if (a.id === 'tea_master') {
        a.name = '制茶宗师';
        a.desc = '七大茶类全部达到特级';
        a.condition = function (p) {
          return IDS7.every(function (id) { return (p.teaProgress[id] || 0) >= 95; });
        };
      }
    });
  }
})();
