// ═══════════════════════════════════════════
//  用户系统 · 多用户数据与切换
// ═══════════════════════════════════════════

const PRETIP_GUIDE_TIERS = [
  {
    id: 'ai-free',
    name: 'AI导游',
    price: '免费',
    badge: '多款分身可选',
    image: 'assets/images/pretrip/guide-tier-ai.jpg',
    highlights: '全部免费 · 知识库全覆盖 · 可查看详情后自选',
    witty: ''
  },
  {
    id: 'human-remote',
    name: '著名AI导游数字分身',
    price: '¥35 起/天',
    originalPrice: '',
    badge: '明星导游复刻',
    image: 'assets/images/pretrip/guide-tier-human.jpg',
    avatar: 'assets/guides/wangjianguo.jpg',
    highlights: '35–60 元/天 · 名导风格深度复刻 · 可查看详情后自选',
    witty: ''
  }
];

const PRETIP_HUMAN_GUIDE = {
  id: 'chen-remote',
  name: '陈大嘴',
  avatar: 'assets/guides/chen-remote.jpg',
  price: '¥30/天',
  originalPrice: '',
  tags: ['金牌导游', '诙谐灵魂', '远程视频'],
  pitchByUser: {
    zhang: {
      witty: '「这楼比我家装修还讲究，就是没电梯」',
      bio: '前景区金牌讲解，现转远程带团。专讲建筑结构、摄影机位和华侨冷知识，说话像脱口秀，但知识点一个不落。'
    },
    lin: {
      witty: '「乐乐，这碉楼比城堡还结实，土匪来了都得排队」',
      bio: '十年亲子导览经验，远程视频也能带娃做任务卡。把碉楼讲成冒险地图，妈妈省心，孩子玩得停不下来。'
    }
  }
};

const USER_DB = {
  zhang: {
    id: 'zhang',
    name: '张先生',
    avatarLabel: '张',
    // ── 行前：深圳出发 · 个人 · 2天1夜 ──
    pretrip: {
      agentName: '旅行专属定制师',
      script: [
        { type: 'ai', content: '你好呀～我是你的旅行专属定制师！🙋‍♂️<br><br>从路线规划、门票预订、交通住宿到行李清单，我都能帮你安排得妥妥当当的！<br><br>先告诉我，你想去哪里旅行呢？' },

        { type: 'user', content: '我想去开平碉楼' },
        { type: 'ai', content: '好嘞！开平碉楼可是广东唯一的世界文化遗产，碉楼群 scattered 在稻田和村落之间，特别有电影感～🎬<br><br>给你快速划重点：<br>· <b>瑞石楼</b>——「开平第一楼」，9 层高，中西合璧的巅峰之作<br>· <b>立园</b>——华侨谢维立的私家花园，既有苏州园林的雅致，又有西洋喷泉的浪漫<br>· <b>赤坎古镇</b>——烟火气十足的骑楼老街，晚上灯光一亮超有氛围<br><br>作为你的旅行专属定制师，接下来我会一步步带你完成 <b>7 项出行准备</b>，确保你的旅程顺畅又省心～<br><br>咱们先从「住哪里」开始好不好？' },
        { type: 'card', subtype: 'checklist' },

        { type: 'user', content: '好呀' },
        { type: 'ai', content: '太棒了！先确认下这次出行的人数和日期，这样我可以帮你挑更合适的房型和班次～' },

        { type: 'user', content: '一个人，周六早上出发，周日晚上回来，住一晚' },
        { type: 'ai', content: '收到！一个人出行最大的优势就是灵活度高，我可以帮你排一个「建筑深度 + 摄影黄金时段」的节奏。<br><br>开平适合独行客的住宿有两类：<br><br>1. <b>古镇骑楼改造民宿</b>——晚上下楼就能逛夜市、拍夜景，人文氛围拉满<br>2. <b>景区附近设计酒店</b>——早上开窗就是碉楼+稻田，适合早起拍日出<br><br>你更倾向哪种 vibe？' },

        { type: 'user', content: '想住离景区近一点的，方便早起拍照' },
        { type: 'ai', content: '明白！那我重点给你看这家——' },
        { type: 'card', subtype: 'hotel' },
        { type: 'ai', content: '推荐 <b>赤坎侨小馆酒店</b>（上面第二家）。百年骑楼改造，花砖地板 + 百叶木窗，本身就是一座活着的建筑标本。离自力村碉楼群车程 15 分钟，周六一早 6:30 出发就能赶上日出前的「蓝调时刻」。<br><br>需要我帮你锁定一间吗？' },

        { type: 'user', content: '就这家吧' },
        { type: 'ai', content: '好眼光！✨ 我帮你锁定 <b>赤坎侨小馆酒店，周六晚</b>（大床房，含早），保留 15 分钟。<br><br>订单号稍后一起汇总到行程卡里。<br><br>接下来咱们看「怎么去」～<br><br>你从哪里出发呀？高铁、飞机还是自驾？我可以直接帮你查实时班次。' },

        { type: 'user', content: '从深圳出发，高铁方便吗？' },
        { type: 'ai', content: '超方便！深圳北 → 开平南，每天 <b>6 趟车次</b>，我帮你看了周六早上的：' },
        { type: 'card', subtype: 'train' },
        { type: 'ai', content: '建议你搭 <b>G6048</b>，周六 07:15 出发，09:10 抵达开平南，到酒店放完行李刚好 10:00 前赶到自力村，光线最柔和。<br><br>返程周日推荐 <b>G6047</b>（18:05 开平南 → 20:42 深圳北），时间充裕还能在赤坎古镇吃完晚饭再走。<br><br>需要我把这两趟车加入行程吗？' },

        { type: 'user', content: '加入吧' },
        { type: 'ai', content: '搞定！🚄 <b>往返高铁已标记</b>。<br><br>接下来是「门票」，这个我熟，帮你省点钱～<br><br>开平碉楼的景点比较分散，我给你拆一下：<br><br><b>必去核心区</b>（世界遗产地）：<br>· 自力村碉楼群（¥78）——最经典的碉楼聚落，摄影首选<br>· 立园（¥100）——中西合璧园林，细节控天堂<br>· 马降龙碉楼群（¥60）——竹林掩映，光影绝了<br><br><b>我的省钱建议：</b><br>平台有「碉楼联票」，上面三个点 + 锦江里打包只要 <b>¥220</b>，比单买省 ¥68。而且联票 2 日内有效，你可以分两天慢慢逛，不用赶。<br><br>另外赤坎古镇目前是 <b>免费</b> 的，晚上去逛最舒服～<br><br>需要我帮你订这套联票吗？' },

        { type: 'user', content: '订联票吧' },
        { type: 'ai', content: '好嘞！<b>开平碉楼联票 ×1 份，¥220，已加入购物车</b>。<br><br>提醒一下：立园和自力村都需要<b>分时段预约</b>，我建议约周六上午 9:00-11:00 去自力村（光线好、人少），周日下午去立园（傍晚园林光影最迷人）。<br><br>时段我帮你标在后面的行程里了。<br><br>下一个超实用的——「景区人流预测」，帮你避开旅行团大军！' },
        { type: 'card', subtype: 'crowd' },
        { type: 'ai', content: '按这个节奏，你的行程我会排成「早鸟 + 傍晚」模式，拍照不排队，体验感拉满～<br><br>接下来我帮你把每天的路线串起来！' },

        { type: 'user', content: '好，看看路线' },
        { type: 'ai', content: '基于你「周六早到、周日晚返程」的时间，我排了一个 <b>2 天 1 夜建筑摄影深度版</b> 路线，节奏紧凑但不赶：' },
        { type: 'card', subtype: 'route' },
        { type: 'ai', content: '对了，这次行程支持「组团同路」——同一条路线，每位旅伴都能收到专属定制讲解。试听一下你的专属版本：' },
        { type: 'card', subtype: 'group' },
        { type: 'ai', content: '这个节奏你觉得 OK 吗？有想调整的地方随时说，比如周六傍晚想多留一小时在锦江里拍夕阳，或者周日中午想回酒店休息？' },

        { type: 'user', content: '挺好的，就按这个来' },
        { type: 'ai', content: '收到！路线已锁定～<br><br>接下来给你列「行李清单」，然后结合天气给你些穿衣提醒。<br><br>开平 5-6 月的天气我帮你查了：白天 28-32°C，闷热多雨，而且碉楼景区很多都是露天步行+楼梯 climb，我按独行摄影场景给你列：<br><br><b>🎒 摄影行李清单</b><br><br><b>穿搭：</b>轻薄透气长袖 ×2、速干长裤 ×1、舒适防滑运动鞋、遮阳帽 + 墨镜<br><b>实用：</b>便携雨伞/雨衣、充电宝 ×2、双肩摄影包<br><b>摄影专属：</b>广角镜头（碉楼仰拍必备）、ND 滤镜（白天慢门拍云）、三脚架（夜景/长曝光）<br><b>应急包：</b>创可贴、碘伏棉签、驱蚊液<br><br>有缺什么我可以提醒你到酒店后附近哪里买～' },

        { type: 'user', content: '没问题，继续' },
        { type: 'ai', content: '这两天天气超适合摄影出行👇<br><br>周六 <b>25-31°C 晴朗少云</b>，阳光充足但不算毒辣，碉楼天台的视野会特别通透；周日 <b>24-30°C 多云微风</b>，体感凉爽舒适，傍晚在古镇散步正合适。记得带好防晒和雨伞，随时准备应对一场南方的阵雨～' },
        { type: 'card', subtype: 'weather' },
        { type: 'ai', content: '行程都安排得差不多了～最后一步，先选择你的行中导游服务类型，全程带领讲解：' },
        { type: 'card', subtype: 'guide-tier' },
        { type: 'user', content: '就选这个吧' },
        { type: 'ai', content: '好～接下来为你推荐几位匹配度超高的 AI 导游分身，在景区实地带你深度逛碉楼：', _branch: 'ai' },
        { type: 'card', subtype: 'guide', _branch: 'ai' },
        { type: 'user', content: '就选TA吧', _branch: 'ai' },
        { type: 'ai', content: '好的！已为你锁定 <b>{name}</b>。{name} 是 {tag}，{brief}。出发当天会提前在景区入口等你，有任何想调整的节奏随时沟通～<br><br>另外，你的 <b>高铁票、酒店、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你，包含所有确认号、地址、联系人，可以一键分享给家人。<br><br>还有什么不放心的吗？比如想加购一份旅行意外险？', _branch: 'ai' },
        { type: 'ai', content: '搞定！已为你预约 <b>陈大嘴</b> 老师——高级真人远程导游，<b>¥128/天</b>（原价 ¥298，比景区讲解省一半）。他会在景区入口用视频连线等你，专讲建筑结构和摄影机位，说话⋯⋯嗯，挺有意思的——「这楼比我家装修还讲究，就是没电梯」。<br><br>另外，你的 <b>高铁票、酒店、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你。<br><br>还有什么不放心的吗？比如想加购一份旅行意外险？', _branch: 'human' },

        { type: 'user', content: '没有了，谢谢' },
        { type: 'ai', content: '不客气呀～祝你在开平拍出满意的照片，碉楼的夕阳和天台的晚风都在等你！🌾<br><br>有任何突发状况，随时回来找我，24h 在线～<br><br>你的专属行程卡已生成！👇' },
        { type: 'card', subtype: 'itinerary' },
        { type: 'scroll-hint', content: '— 对话结束 · 24h 定制师在线支持 —' }
      ],
      // 顶部 Checklist 状态映射（相对于 script 索引）
      checklistMap: {
        show: 5,
        active0: 5, done0: 13,
        active1: 13, done1: 19,
        active2: 19, done2: 23,
        active3: 23, done3: 31,
        active4: 31, done4: 37
      },
      guideTier: null,
      guideTiers: PRETIP_GUIDE_TIERS.map(function(t) {
        if (t.id === 'human-remote') return Object.assign({}, t, { witty: PRETIP_HUMAN_GUIDE.pitchByUser.zhang.witty });
        return t;
      }),
      humanGuide: PRETIP_HUMAN_GUIDE,
      groupTour: {
        title: '组团同路 · 你的专属讲解',
        subtitle: '同一条路，不同旅伴听到不同故事',
        sharedRouteImage: 'assets/images/pretrip/group-tour-shared.jpg',
        stops: [
          { id: 'zili', name: '自力村碉楼群', sharedNote: '世界遗产核心聚落 · 全员同站', personalizedText: '自力村十五座碉楼，我建议你站在铭石楼东侧拍仰角——青砖和白云的对比度，上午九点前最干净。', audio: 'assets/audios/pretrip/zhang/zili.mp3' },
          { id: 'ligarden', name: '立园', sharedNote: '中西合璧园林 · 全员同站', personalizedText: '立园水池空着不是没完工，是主人故意留的「虚」。下午三点来，亭子倒影会刚好落在驳岸线上。', audio: 'assets/audios/pretrip/zhang/ligarden.mp3' },
          { id: 'maganglong', name: '马降龙碉楼群', sharedNote: '竹林秘境 · 全员同站', personalizedText: '马降龙竹林里骏庐有条密道今天开放，带上广角——洞口只有半米宽，出去就是整片梯田。', audio: 'assets/audios/pretrip/zhang/maganglong.mp3' }
        ]
      },
      // 导游推荐数据
      guides: [
        { id: 'wangjianguo', name: '王建国 AI', avatar: 'assets/guides/wangjianguo.jpg', matchScore: 98, rating: 4.9, serviceCount: 1240, tags: ['建筑专家', '摄影师', '历史达人'], bio: '前建筑师，擅长从结构力学与建造工艺角度解读碉楼。会带你去普通游客找不到的机位拍日出，也能讲清楚每一扇窗楣背后的华侨故事。', specialties: ['建筑摄影', '历史讲解', '日出机位推荐', '材料演变'] },
        { id: 'chenyue', name: '陈月 AI', avatar: 'assets/guides/chenyue.jpg', matchScore: 92, rating: 4.8, serviceCount: 890, tags: ['摄影师', '光影魔术师', '夜景达人'], bio: '国家地理签约摄影师，专攻建筑与乡土人文。她熟悉碉楼一天中每个时刻的光线变化，知道哪扇窗在下午三点会有最美的阴影。', specialties: ['建筑摄影', '光影构图', '无人机航拍', '夜景长曝光'] },
        { id: 'liweimin', name: '李伟民 AI', avatar: 'assets/guides/liweimin.jpg', matchScore: 88, rating: 4.7, serviceCount: 2100, tags: ['历史达人', '华侨故事', '口述史'], bio: '开平本地 historian，走访过 300 多座碉楼，采访过 50 多位碉楼后人。他讲的故事不是书本上的，是爷爷奶奶亲口说的。', specialties: ['华侨历史', '口述史', '村落探访', '家谱溯源'] },
        { id: 'zhangxiaoya', name: '张晓雅 AI', avatar: 'assets/guides/zhangxiaoya.jpg', matchScore: 85, rating: 4.8, serviceCount: 1560, tags: ['美食家', '生活家', '本地通'], bio: '土生土长的开平姑娘，熟知每一家藏在巷子里的老字号。她能告诉你哪家黄鳝饭最正宗，哪间咖啡店的露台能看到最美的碉楼剪影。', specialties: ['本地美食', '咖啡探店', '生活美学', '手作体验'] },
        { id: 'liuwenshan', name: '刘文山 AI', avatar: 'assets/guides/liuwenshan.jpg', matchScore: 82, rating: 4.6, serviceCount: 670, tags: ['自然教育', '植物专家', '亲子友好'], bio: '生态学博士，研究方向是珠三角乡土植物。他知道马降龙竹林里每一种鸟叫声，也能教你怎么在稻田边辨认 20 种野草。', specialties: ['自然教育', '植物观察', '鸟类辨识', '生态摄影'] },
        { id: 'zhoumingxuan', name: '周明轩 AI', avatar: 'assets/guides/zhoumingxuan.jpg', matchScore: 78, rating: 4.7, serviceCount: 930, tags: ['文化学者', '艺术评论', '策展人'], bio: '当代艺术策展人，长期关注华侨建筑与身份认同议题。他能从一座碉楼的装饰细节，聊到全球化早期的文化流动与本土抵抗。', specialties: ['艺术评论', '文化研究', '展览导览', '当代视角'] }
      ],
      // 行程卡片的定制数据
      itinerary: {
        title: '📷 开平碉楼 · 2 天 1 夜建筑摄影深度版',
        hotel: { name: '赤坎侨小馆酒店（骑楼景观大床房）', price: '¥380/晚 × 1晚', note: '含早 | 花砖地板 · 百叶木窗' },
        train: [
          { label: '去程 G6048', detail: '深圳北 07:15 → 开平南 09:10' },
          { label: '返程 G6047', detail: '开平南 18:05 → 深圳北 20:42' }
        ],
        ticket: { desc: '开平碉楼联票 ×1 成人', price: '¥220 · 2 日有效', note: '含：自力村 + 立园 + 马降龙 + 锦江里' },
        route: [
          { day: 'Day1 周六', detail: '自力村(早) → 立园(午) → 赤坎夜景' },
          { day: 'Day2 周日', detail: '马降龙(早) → 锦江里(午) → 古镇咖啡 → 返程' }
        ],
        checklist: [
          '身份证', '充电宝 ×2', '广角镜头', 'ND 滤镜',
          '三脚架', '雨伞', '驱蚊液', '备用存储卡'
        ]
      }
    },

    // ── 行中：建筑细节深度讲解 ──
    during: {
      guideMode: 'ai',
      agentName: '王建国 AI',
      guideTag: '开平碉楼 · 场景 01 讲解中',
      stops: [
        { name: '自力村碉楼群', time: '09:00', range: '09:00 – 11:30', detail: '聚落布局 → 材料演变 → 防御构造 → 铭石楼登顶' },
        { name: '碉楼人家农庄', time: '11:30', range: '11:30 – 13:30', detail: '旧居楼改造餐厅 · 黄鳝饭 · 未开发居楼' },
        { name: '立园', time: '13:30', range: '13:30 – 14:40', detail: '中西合璧园林 · 谢维立手稿 · 空水池故事' },
        { name: '马降龙碉楼群', time: '14:40', range: '14:40 – 16:00', detail: '竹林隐匿 · 骏庐通道 · 隐匿式肌理' },
        { name: '返程', time: '16:00', range: '16:00 –', detail: '结束今日行程，返程' }
      ],
      facilities: [
        { stopId: 'zili', title: '附近服务 · 情侣打卡', personaTag: '情侣慢游', items: [
          { id: 'photo-mingshi', name: '铭石楼东侧仰角机位', desc: '上午9点前青砖与云天对比最干净', image: 'assets/images/during/facility-zhang-photo.jpg', audio: 'assets/audios/during/zhang/facility-zili.mp3' }
        ]},
        // 当前版本不需要：附近服务 · 休憩咖啡（立园旁露台咖啡）
        // { stopId: 'ligarden', title: '附近服务 · 休憩咖啡', personaTag: '情侣慢游', items: [
        //   { id: 'coffee-terrace', name: '立园旁露台咖啡', desc: '园林逛完歇脚', image: 'assets/images/during/facility-zhang-coffee.jpg', audio: 'assets/audios/during/zhang/facility-ligarden.mp3' }
        // ]},
        { stopId: 'maganglong', title: '附近服务 · 骑行探索', personaTag: '情侣慢游', items: [
          { id: 'bike-bamboo', name: '竹林绿道双人骑行', desc: '约3公里竹影与碉楼交替', image: 'assets/images/during/facility-zhang-bike.jpg', audio: 'assets/audios/during/zhang/facility-maganglong.mp3' }
        ]}
      ],
      culturePopup: {
        title: '把开平带回家', subtitle: '摄影纪念 · 景区官方文创',
        heroImage: 'assets/images/during/culture-souvenir-hero.jpg',
        products: ['kp02', 'kp03', 'kp06'],
        introText: '今天的光线和角度都很出片，带几样小心意回去。',
        audio: 'assets/audios/during/zhang/culture-end.mp3'
      },
      // 行中对话由 assets/content/during/zhang-chapters.json + 章节 .txt 注入（勿在此维护 chatData）
    },

    // ── 收获 ──
    harvest: {
      stats: { trips: 4, knowledge: 73, cities: 12, chats: 189 },
      trips: [
        { thumb: '碉', name: '开平碉楼深度一日游', date: '2025.05.20 · 5 个点位 · 31 知识点', current: true },
        { thumb: '🏛', name: '西安古城墙 + 碑林', date: '2025.04.05 · 3 个点位 · 18 知识点' },
        { thumb: '🎋', name: '苏州园林艺匠之旅', date: '2025.03.12 · 4 个点位 · 24 知识点' }
      ],
      currentTrip: {
        name: '开平碉楼深度一日游',
        date: '2025.05.20 · 王建国 AI 陪同',
        timeline: [
          { time: '09:00 — 11:30', place: '自力村碉楼群', desc: '聚落布局 · 材料演变 · 防御构造 · 铭石楼登顶' },
          { time: '11:30 — 13:30', place: '碉楼人家农庄', desc: '旧居楼改造餐厅 · 黄鳝饭 · 未开发居楼' },
          { time: '13:30 — 14:40', place: '立园', desc: '中西合璧园林 · 谢维立手稿 · 空水池故事' },
          { time: '14:40 — 16:00', place: '马降龙碉楼群', desc: '竹林隐匿 · 骏庐通道 · 隐匿式肌理' }
        ],
        tags: ['华侨建筑','防御工事','中西合璧','竹林隐匿','园林设计','材料演变','全球拼贴','本土化翻译','聚落布局','功能主义','契约精神','手工温度'],
        hotTags: ['华侨建筑','防御工事','中西合璧'],
        nextRec: {
          title: '🎯 下一站推荐',
          desc: '您今天深入了解了「园林动线设计」与「建筑本土化翻译」，关联推荐：<b>苏州园林</b>（咫尺山林的动线艺术）与 <b>澳门历史城区</b>（中西建筑对话）。'
        }
      }
    }
  },

  lin: {
    id: 'lin',
    name: '林女士',
    avatarLabel: '林',
    // ── 行前：两大一小亲子 · 2.5 天 ──
    pretrip: {
      agentName: '旅行专属定制师',
      script: [
        { type: 'ai', content: '你好呀～我是你的旅行专属定制师！🙋‍♀️<br><br>从路线规划、门票预订、交通住宿到行李清单，我都能帮你安排得妥妥当当的！<br><br>先告诉我，你想去哪里旅行呢？' },

        { type: 'user', content: '我想去开平碉楼' },
        { type: 'ai', content: '好嘞！开平碉楼可是广东唯一的世界文化遗产，碉楼群 scattered 在稻田和村落之间，特别有电影感～🎬<br><br>给你快速划重点：<br>· <b>瑞石楼</b>——「开平第一楼」，9 层高，中西合璧的巅峰之作<br>· <b>立园</b>——华侨谢维立的私家花园，既有苏州园林的雅致，又有西洋喷泉的浪漫<br>· <b>赤坎古镇</b>——烟火气十足的骑楼老街，晚上灯光一亮超有氛围<br><br>作为你的旅行专属定制师，接下来我会一步步带你完成 <b>7 项出行准备</b>，确保你的旅程顺畅又省心～<br><br>咱们先从「住哪里」开始好不好？' },
        { type: 'card', subtype: 'checklist' },

        { type: 'user', content: '好呀' },
        { type: 'ai', content: '太棒了！先问下这次出行几个人呀？有没有小朋友？这样我可以帮你挑更合适的房型和床位～' },

        { type: 'user', content: '两大人带一小孩，小孩8岁' },
        { type: 'ai', content: '了解！8 岁的小朋友正是好奇心旺盛的时候，开平碉楼对他来说是超棒的「活历史课堂」～<br><br>那我给你找有亲子友好设施的民宿，比如有露台可以看星星、或者离稻田近能观察农耕的。<br><br>接下来问你两个小问题：<br><br>1. 你打算哪天入住、住几晚呀？<br>2. 更想住<b>古镇里的特色民宿</b>（早上推开窗就是骑楼街），还是<b>景区附近的亲子酒店</b>（有家庭房、停车宽敞）？' },

        { type: 'user', content: '周五晚上到，住两晚，想住有特色一点的' },
        { type: 'ai', content: '收到！那我重点给你看开平两家高口碑住宿，都特别适合亲子家庭👇' },
        { type: 'card', subtype: 'hotel' },
        { type: 'ai', content: '我个人更推荐 <b>竹下民宿</b>（上面第一家），藏在塘口镇的竹林里，天台可以直接眺望自力村碉楼群，小朋友站在高处看碉楼，视野特别震撼。而且民宿主人是本地通，能给孩子讲很多碉楼背后的华侨故事，比导游词生动多了～<br><br>你觉得呢？需要我帮你先锁一间吗？' },

        { type: 'user', content: '选 B 吧' },
        { type: 'ai', content: '好眼光！✨ 我帮你锁定 <b>竹下民宿，周五/周六两晚</b>（家庭房，含儿童洗漱用品），保留 15 分钟。<br><br>订单号稍后一起汇总到行程卡里。<br><br>接下来咱们看「怎么去」～<br><br>你从哪里出发呀？高铁、飞机还是自驾？我可以直接帮你查实时班次和路况。' },

        { type: 'user', content: '从深圳出发，高铁方便吗？' },
        { type: 'ai', content: '超方便！深圳北 → 开平南，每天 <b>6 趟车次</b>，我帮你看了下周五傍晚的：' },
        { type: 'card', subtype: 'train' },
        { type: 'ai', content: '建议你搭 <b>G6048</b>，到开平南后打车 20 分钟到赤坎古镇，刚好赶得上民宿入住（他们前台到 21:00）。<br><br>如果你需要，我还可以帮你预约开平南站的接站车（平台合作司机，<b>¥40 一口价</b>，比出租车省 ¥10，而且提供儿童安全座椅）。<br><br>需要我把这趟车加入行程吗？' },

        { type: 'user', content: '好的，加入吧' },
        { type: 'ai', content: '搞定！🚄 <b>G6048 已标记</b>。<br><br>接站车也帮你预留了名额（含儿童安全座椅），出发前 2 小时会短信确认司机电话。<br><br>接下来是「门票」，这个我熟，帮你省点钱～<br><br>开平碉楼的景点比较分散，我给你拆一下：<br><br><b>必去核心区</b>（世界遗产地）：<br>· 自力村碉楼群（¥78）——《让子弹飞》取景地，最经典的碉楼聚落<br>· 立园（¥100）——私家园林+碉楼，值得慢慢逛 2 小时<br>· 马降龙碉楼群（¥60）——竹林掩映，游客少，适合拍照<br><br><b>我的省钱建议：</b><br>平台有「碉楼联票」，上面三个点 + 锦江里碉楼打包只要 <b>¥220</b>，比单买省 ¥68。而且联票 2 日内有效，可以分两天慢慢逛，不用赶。<br><br>另外赤坎古镇目前是 <b>免费</b> 的，晚上去逛最舒服～<br><br>需要我帮你订这套联票吗？' },

        { type: 'user', content: '订联票吧' },
        { type: 'ai', content: '好嘞！<b>开平碉楼联票 ×1 份，¥220，已加入购物车</b>。<br><br>提醒一下：立园和自力村都需要<b>分时段预约</b>，我建议约周六上午 9:00-11:00 去自力村（光线好、人少），周日下午去立园。<br><br>时段我帮你标在后面的行程里了。<br><br>下一个超实用的——「景区人流预测」，帮你避开旅行团大军！<br><br>你计划周六、周日两天逛景区对吧？我调了平台的历史人流数据和本周预约趋势，给你做个「错峰指南」👇' },
        { type: 'card', subtype: 'crowd' },
        { type: 'ai', content: '按这个节奏，你的行程我会排成「早鸟 + 傍晚」模式，拍照不排队，体验感拉满～<br><br>接下来我帮你把每天的路线串起来！' },

        { type: 'user', content: '好，看看路线' },
        { type: 'ai', content: '基于你「周五晚到、周日傍晚返程」的时间，我排了一个 <b>2.5 天亲子慢逛版</b> 路线，节奏很松，小朋友不会累：' },
        { type: 'card', subtype: 'route' },
        { type: 'ai', content: '对了，这次行程支持「组团同路」——同一条路线，每位旅伴都能收到专属定制讲解。试听一下你和乐乐的专属版本：' },
        { type: 'card', subtype: 'group' },
        { type: 'ai', content: '这个节奏你觉得 OK 吗？有想调整的地方随时说，比如周日想多留半天去锦江里，或者周六中午想回民宿让小朋友睡个午觉？' },

        { type: 'user', content: '挺好的，就按这个来' },
        { type: 'ai', content: '收到！路线已锁定～<br><br>接下来给你列「行李清单」，然后结合天气给你些穿衣提醒。<br><br>开平 5-6 月的天气我帮你查了：白天 28-32°C，闷热多雨，而且碉楼景区很多都是露天步行+楼梯 climb，我按亲子场景给你列：<br><br><b>🎒 亲子行李清单</b><br><br><b>穿搭：</b>轻薄透气长袖 ×2、速干长裤/长裙 ×1、舒适防滑运动鞋、遮阳帽 + 墨镜<br><b>实用：</b>小瓶驱蚊液 + 驱蚊贴、便携雨伞/雨衣、充电宝 + 小风扇、双肩小背包<br><b>亲子专属：</b>儿童防晒帽、便携零食、湿巾、备用袜子<br><b>加分项：</b>相机/手机广角（碉楼仰拍超震撼）<br><b>应急包：</b>创可贴、碘伏棉签、退烧药（小朋友备用）<br><br>有缺什么我可以提醒你到民宿后附近哪里买～小朋友的驱蚊贴和防晒帽建议多备一份，古镇小店里不一定有合适的尺寸。' },

        { type: 'user', content: '没问题，继续' },
        { type: 'ai', content: '这两天天气超适合亲子出行👇<br><br>周六 <b>25-31°C 晴朗少云</b>，阳光充足但不算毒辣，碉楼天台的视野会特别通透；周日 <b>24-30°C 多云微风</b>，体感凉爽舒适，傍晚在古镇散步正合适。记得带好防晒和雨伞，随时准备应对一场南方的阵雨～' },
        { type: 'card', subtype: 'weather' },
        { type: 'ai', content: '行程都安排得差不多了～最后一步，先选择你的行中导游服务类型，全程带领讲解：' },
        { type: 'card', subtype: 'guide-tier' },
        { type: 'user', content: '就选这个吧' },
        { type: 'ai', content: '好～接下来为你推荐几位匹配度超高的 AI 导游分身，特别适合带小朋友的家庭：', _branch: 'ai' },
        { type: 'card', subtype: 'guide', _branch: 'ai' },
        { type: 'user', content: '就选TA吧', _branch: 'ai' },
        { type: 'ai', content: '好的！已为你锁定 <b>{name}</b>。{name} 是 {tag}，{brief}。出发当天会提前在景区入口等你们，有任何想调整的节奏随时沟通～<br><br>另外，你的 <b>高铁票、民宿、接站车、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你，包含所有确认号、地址、联系人，可以一键分享给同行朋友或家人。<br><br>还有什么不放心的吗？比如小朋友 dietary restrictions、或者想加购一份旅行意外险？', _branch: 'ai' },
        { type: 'ai', content: '搞定！已为你预约 <b>陈大嘴</b> 老师——高级真人远程导游，<b>¥128/天</b>（原价 ¥298，比景区讲解省一半）。他会在景区入口用视频连线等你们，专讲亲子互动和任务卡式讲解——「乐乐，这碉楼比城堡还结实，土匪来了都得排队」。<br><br>另外，你的 <b>高铁票、民宿、接站车、联票</b> 我都已汇总好，等一下会生成一张「行程卡片」给你。<br><br>还有什么不放心的吗？比如小朋友 dietary restrictions、或者想加购一份旅行意外险？', _branch: 'human' },

        { type: 'user', content: '没有了，谢谢' },
        { type: 'ai', content: '不客气呀～祝小朋友在开平玩得开心，碉楼的夕阳和天台的晚风都在等你们！🌾<br><br>有任何突发状况，随时回来找我，24h 在线～<br><br>你的专属行程卡已生成！👇' },
        { type: 'card', subtype: 'itinerary' },
        { type: 'scroll-hint', content: '— 对话结束 · 24h 定制师在线支持 —' }
      ],
      checklistMap: {
        show: 5,
        active0: 5, done0: 13,
        active1: 13, done1: 19,
        active2: 19, done2: 23,
        active3: 23, done3: 31,
        active4: 31, done4: 37
      },
      guideTier: null,
      guideTiers: PRETIP_GUIDE_TIERS.map(function(t) {
        if (t.id === 'human-remote') return Object.assign({}, t, { witty: PRETIP_HUMAN_GUIDE.pitchByUser.lin.witty });
        return t;
      }),
      humanGuide: PRETIP_HUMAN_GUIDE,
      groupTour: {
        title: '组团同路 · 你的专属讲解',
        subtitle: '同一条路，不同旅伴听到不同故事',
        sharedRouteImage: 'assets/images/pretrip/group-tour-shared.jpg',
        stops: [
          { id: 'zili', name: '自力村碉楼群', sharedNote: '世界遗产核心聚落 · 全员同站', personalizedText: '乐乐，自力村是我们的第一站！记得找碉楼四角像燕子窝的小阳台，找到了就能盖第一个印章哦。', audio: 'assets/audios/pretrip/lin/zili.mp3' },
          { id: 'ligarden', name: '立园', sharedNote: '中西合璧园林 · 全员同站', personalizedText: '立园像一座藏着喷泉秘密的花园，妈妈可以在这里休息，乐乐去找圆圆的石景，那是以前小朋友玩捉迷藏的地方。', audio: 'assets/audios/pretrip/lin/ligarden.mp3' },
          { id: 'maganglong', name: '马降龙碉楼群', sharedNote: '竹林秘境 · 全员同站', personalizedText: '马降龙竹林里藏着会躲猫猫的碉楼，咱们慢慢走，不赶时间，听见鸟叫就停下来猜一猜是哪种鸟。', audio: 'assets/audios/pretrip/lin/maganglong.mp3' }
        ]
      },
      // 导游推荐数据
      guides: [
        { id: 'liuwenshan', name: '刘文山 AI', avatar: 'assets/guides/liuwenshan.jpg', matchScore: 97, rating: 4.6, serviceCount: 670, tags: ['亲子故事王', '自然教育', '植物专家'], bio: '生态学博士，会把碉楼变成孩子的「自然寻宝图」。他知道马降龙竹林里每一种鸟叫声，也能让 8 岁小朋友在稻田边认出 10 种野草。', specialties: ['亲子自然课', '植物观察', '鸟类辨识', '稻田研学'] },
        { id: 'zhangxiaoya', name: '张晓雅 AI', avatar: 'assets/guides/zhangxiaoya.jpg', matchScore: 93, rating: 4.8, serviceCount: 1560, tags: ['趣味历史', '美食家', '本地通'], bio: '土生土长的开平姑娘，擅长把华侨故事讲成冒险童话。她知道哪家黄鳝饭小朋友最爱吃，哪间咖啡店的露台有最好的碉楼剪影。', specialties: ['儿童故事', '本地美食', '手作体验', '生活美学'] },
        { id: 'liweimin', name: '李伟民 AI', avatar: 'assets/guides/liweimin.jpg', matchScore: 89, rating: 4.7, serviceCount: 2100, tags: ['历史达人', '华侨故事', '口述史'], bio: '开平本地 historian，走访过 300 多座碉楼。他会蹲下来跟孩子讲：「你看这扇铁门，当年是为了防土匪的，但花纹是不是很像你绘本里的城堡？」', specialties: ['华侨历史', '口述史', '村落探访', '互动讲解'] },
        { id: 'wangjianguo', name: '王建国 AI', avatar: 'assets/guides/wangjianguo.jpg', matchScore: 84, rating: 4.9, serviceCount: 1240, tags: ['建筑专家', '摄影师', '历史达人'], bio: '前建筑师，虽然专业术语多，但特别会「降维」给孩子讲结构。他会用积木比喻碉楼的防御体系，让小朋友秒懂为什么窗户那么小。', specialties: ['建筑启蒙', '结构游戏', '历史讲解', '摄影入门'] },
        { id: 'chenyue', name: '陈月 AI', avatar: 'assets/guides/chenyue.jpg', matchScore: 80, rating: 4.8, serviceCount: 890, tags: ['摄影师', '光影魔术师', '生活家'], bio: '国家地理签约摄影师，擅长用照片讲故事。她会教孩子怎么用妈妈的手机拍出「碉楼大片」，还会准备一份「小小摄影师任务卡」。', specialties: ['儿童摄影课', '光影游戏', '任务卡设计', '亲子拍照'] },
        { id: 'zhoumingxuan', name: '周明轩 AI', avatar: 'assets/guides/zhoumingxuan.jpg', matchScore: 76, rating: 4.7, serviceCount: 930, tags: ['文化学者', '艺术评论', '策展人'], bio: '当代艺术策展人，会带孩子用「找不同」的方式观察中西合璧的装饰细节。他准备了一套碉楼图案贴纸，讲完故事就发一张。', specialties: ['艺术启蒙', '图案观察', '贴纸游戏', '文化对比'] }
      ],
      itinerary: {
        title: '🧳 开平碉楼 · 2.5 天亲子定制行程卡',
        hotel: { name: '竹下民宿（亲子天台景观房）', price: '¥520/晚 × 2晚', note: '含儿童洗漱用品' },
        train: [
          { label: '去程 G6048', detail: '深圳北 17:38 → 开平南 20:23' },
          { label: '返程 G6047', detail: '开平南 18:05 → 深圳北 20:42' }
        ],
        ticket: { desc: '开平碉楼联票 ×2 大 1 小', price: '¥220 · 2 日有效', note: '小孩 8 岁免门票（1.2m 以下）' },
        route: [
          { day: 'Day1 周五', detail: '抵达 → 民宿 → 天台夜景' },
          { day: 'Day2 周六', detail: '自力村(早) → 午休 → 马降龙 → 赤坎夜游' },
          { day: 'Day3 周日', detail: '立园(早) → 古镇午餐 → 返程' }
        ],
        checklist: [
          '儿童防晒帽', '驱蚊液/贴', '小风扇', '创可贴',
          '备用袜子', '紧急联系卡', '便携零食', '湿巾'
        ]
      }
    },

    // ── 行中：亲子出行（占位数据，待生成） ──
    during: {
      guideMode: 'ai',
      agentName: '张雅芳AI',
      guideTag: '开平碉楼 · 亲子导览模式',
      stops: [
        { name: '自力村碉楼群', time: '09:00', range: '09:00 – 11:30', detail: '亲子寻宝任务 → 材料观察游戏 → 登顶挑战' },
        { name: '碉楼人家农庄', time: '11:30', range: '11:30 – 13:30', detail: '乡村午餐 · 稻田漫步 · 昆虫观察' },
        { name: '立园', time: '13:30', range: '13:30 – 14:40', detail: '园林捉迷藏 · 中西建筑找不同 · 喷泉许愿' },
        { name: '马降龙碉楼群', time: '14:40', range: '14:40 – 16:00', detail: '竹林探险 · 声音地图 · 自然手作' },
        { name: '返程', time: '16:00', range: '16:00 –', detail: '结束今日行程，返程' }
      ],
      facilities: [
        { stopId: 'zili', title: '亲子服务 · 休息安全', personaTag: '带娃出行', items: [
          { id: 'shade-rest', name: '铭石楼旁遮阳亭', desc: '有座椅和洗手台', image: 'assets/images/during/facility-lin-rest.jpg', audio: 'assets/audios/during/lin/facility-zili.mp3' }
        ]},
        { stopId: 'rest', title: '亲子服务 · 午间休整', personaTag: '带娃出行', items: [
          { id: 'nap-room', name: '民宿亲子午休角', desc: '适合乐乐睡午觉', image: 'assets/images/during/facility-lin-rest.jpg', audio: 'assets/audios/during/lin/facility-zili.mp3' }
        ]},
        { stopId: 'meal', title: '午餐前 · 煲仔饭故事', personaTag: '带娃出行', items: [
          { id: 'claypot-story', name: '碉楼农庄煲仔饭', desc: '瓦煲现做，开平非遗手艺', image: 'assets/images/during/facility-lin-meal.jpg', audio: 'assets/audios/during/lin/facility-meal.mp3' }
        ]},
        { stopId: 'chikan', title: '夜游 · 亲子友好', personaTag: '带娃出行', items: [
          { id: 'night-snack', name: '骑楼小吃街', desc: '豆腐花、双皮奶适合小朋友', image: 'assets/images/during/facility-lin-night.jpg', audio: 'assets/audios/during/lin/facility-chikan.mp3' }
        ]}
      ],
      culturePopup: {
        title: '把开平带回家', subtitle: '亲子纪念 · 景区官方文创',
        heroImage: 'assets/images/during/culture-souvenir-hero.jpg',
        products: ['kp03', 'kp06', 'kp04'],
        introText: '乐乐今天集齐了印章，挑几样小纪念品回去吧。',
        audio: 'assets/audios/during/lin/culture-end.mp3'
      },
      chatData: [
        { sender: 'ai', text: '早上好呀，欢迎来开平！今天咱们是「亲子探索模式」，我会用小朋友听得懂的方式，把碉楼的故事讲成一场冒险～\n\n先跟你们同步今日景区消息：瑞石楼因检测暂停开放，但铭石楼可以登顶；马降龙竹林刚清完路，特别适合带小朋友去探险。咱们今天的路线会穿插「寻宝任务」和「观察游戏」，让小朋友边玩边学！', time: '09:15' },
        { sender: 'system', text: '— 定位到已抵达自力村入口 —', time: '09:16' },
        { sender: 'ai', text: '好啦，小朋友看这里！👋 我们今天要完成的第一个任务是「碉楼侦探」——找一找，这些楼房和我们家住的楼房有什么不一样？\n\n给你三个小线索：\n1️⃣ 墙上有很多小小的洞洞（那是枪眼哦）\n2️⃣ 楼顶有一圈像城堡一样的墙（那叫女儿墙）\n3️⃣ 有的楼房一半是中式、一半是西式（像拼积木一样）\n\n找到一样就告诉我，好不好？', time: '09:16' },
        { sender: 'user', text: '我找到了！楼顶真的有城堡墙！', time: '09:17' },
        { sender: 'ai', text: '太棒了！侦探小助手上线！🕵️‍♂️\n\n那个「城堡墙」其实叫<b>女儿墙</b>，是以前的人们站在上面观察外面有没有坏人来袭的。你想上去看看吗？从上面可以看到整个村子，稻田像一块块绿色的地毯，超级漂亮！', time: '09:17' },
        { sender: 'ai', text: '接下来我们玩一个「材料摸摸看」的游戏。你摸摸这面墙，是滑滑的还是粗粗的？', time: '09:20' },
        { sender: 'user', text: '粗粗的，有点扎手', time: '09:21' },
        { sender: 'ai', text: '对啦！这是「夯土墙」，用泥土、沙子、还有稻草混在一起，一层一层压实的。一百多年前，这里没有水泥搅拌机，全靠人和牛一起踩呀踩、压呀压，可比现在辛苦多啦！\n\n来，再摸摸这个窗框，是铁的，是不是凉凉的？这是从很远很远的外国坐船运回来的哦。那时候没有飞机，这一趟船要坐好几个月呢！', html: '<div class="know-card"><b>亲子知识卡 · 碉楼的材料</b>开平碉楼用了「本地材料 + 进口材料」的混搭：夯土、青砖来自附近的山和田；钢筋、水泥、铁门窗则由海外华侨从国外运回，体现了「乡土中国」与「全球贸易」的奇妙相遇。</div>', time: '09:22' },
        { sender: 'ai', text: '现在我们上楼顶啦！小心台阶哦，有点陡，爸爸妈妈牵好小朋友的手～\n\n哇，你看！那边的楼顶上也有小朋友在张望呢。以前没有电话、没有微信，村里的小朋友就站在楼顶上挥手、喊叫，互相打招呼。你觉得他们会在楼上喊什么？', time: '09:30' },
        { sender: 'user', text: '吃饭啦——！', time: '09:31' },
        { sender: 'ai', text: '哈哈哈太对了！「回家吃饭」肯定是喊得最多的！🍚\n\n其实碉楼不只是用来「看风景」和「躲坏人」的，它也是一家人的家。楼里有厨房、有卧室、有存放粮食的地方，就像一个「垂直的小村庄」，所有生活都在这一栋楼里完成。', time: '09:32' }
      ]
    },

    // ── 收获 ──
    harvest: {
      stats: { trips: 3, knowledge: 56, cities: 8, chats: 142 },
      trips: [
        { thumb: '碉', name: '开平碉楼亲子探索之旅', date: '2025.05.20 · 5 个点位 · 24 知识点', current: true },
        { thumb: '🏖', name: '厦门鼓浪屿家庭漫游', date: '2025.02.08 · 4 个点位 · 19 知识点' },
        { thumb: '🌾', name: '阳朔田园骑行之旅', date: '2024.11.15 · 3 个点位 · 13 知识点' }
      ],
      currentTrip: {
        name: '开平碉楼亲子探索之旅',
        date: '2025.05.20 · 王建国 AI 亲子导览',
        timeline: [
          { time: '09:00 — 11:30', place: '自力村碉楼群', desc: '亲子寻宝任务 · 材料观察游戏 · 登顶挑战' },
          { time: '11:30 — 13:30', place: '碉楼人家农庄', desc: '乡村午餐 · 稻田漫步 · 昆虫观察' },
          { time: '13:30 — 14:40', place: '立园', desc: '园林捉迷藏 · 中西建筑找不同 · 喷泉许愿' },
          { time: '14:40 — 16:00', place: '马降龙碉楼群', desc: '竹林探险 · 声音地图 · 自然手作' }
        ],
        tags: ['华侨建筑','亲子教育','防御工事','中西合璧','竹林生态','材料科学','乡土中国','海外贸易','垂直村落','儿童观察','自然手作','声音地图'],
        hotTags: ['华侨建筑','亲子教育','中西合璧'],
        nextRec: {
          title: '🎯 下一站亲子推荐',
          desc: '您和孩子今天深入体验了「建筑观察」与「自然探索」，关联推荐：<b>福建土楼</b>（圆形围屋的家族故事）与 <b>丹霞山地质研学</b>（红色岩石的科学课堂）。'
        }
      }
    }
  }
};

// 当前用户状态（持久化到 localStorage）
function getCurrentUserId() {
  try { return localStorage.getItem('hx_current_user') || 'zhang'; }
  catch (e) { return 'zhang'; }
}

function setCurrentUserId(id) {
  try { localStorage.setItem('hx_current_user', id); }
  catch (e) { /* noop */ }
}

function getCurrentUser() {
  return USER_DB[getCurrentUserId()];
}
