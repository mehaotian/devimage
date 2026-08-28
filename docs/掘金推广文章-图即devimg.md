# 组件库文档里的 40 张占位图,加载了 12 秒——于是我自己写了个国内的占位图 CDN

> 说明:文中所有 `【配图 N】` 是我留给自己的截图位,发布前替换成真实截图并删掉这些提示行。

## 起因是一个很蠢的 bug

去年年底,我在给团队维护一个内部的 Vue 组件库。事情本身不复杂,组件写完,配一份文档站,每个组件下面挂几个 demo。

麻烦出在图上。

`Card`、`Avatar`、`Image`、`List`、`Carousel`……这几个组件的示例,不放图根本看不出效果。一个纯色 div 写着「这里是图片」,评审的时候产品直接问我:"这跟没做有什么区别?"

于是我做了所有人都会做的事:上 picsum.photos。

```html
<img src="https://picsum.photos/800/600" />
<img src="https://picsum.photos/seed/card-1/400/300" />
```

在我本地跑得挺好——因为我挂着代理。

真正的问题是某天下午,一个同事在群里 @我:"你那文档站是不是挂了?打开一片空白,转半天。"

我关掉代理,自己打开一遍。首屏 40 多个 demo,每个 demo 一到两张图,Network 面板里一整列 picsum 的请求排着队 pending,最慢的一条卡了 8 秒才回来,还有三四条直接超时变红。整个文档首屏,从点进去到图全部出来,12 秒。

【配图 1】截图内容:Chrome DevTools 的 Network 面板,筛选 Img,能看到一列第三方图片请求耗时很长 / 超时飘红的样子。(可以关掉代理复现一次再截)

那一刻我意识到一件事:我做的是给团队内部用的组件库,使用者是公司里所有前端。我不能在 README 里写一句「请先配置代理再查看文档」。

## 后来发现,坑不止一个

顺着这条线往下查,问题越来越多。

**第一,不只是慢,是不稳定。** 慢还能忍,最恶心的是时快时慢。同一个页面刷新三次,三次布局都不一样,因为有的图加载出来了有的没有,页面高度一直跳。

**第二,CI 直接崩了。** 我们的组件库跑了视觉回归测试,用 Playwright 截图跟基线快照对比。图片来自第三方,又是随机图,每次跑出来的截图都不一样,快照对比全红。我一开始以为是我的组件写崩了,查了两个小时,最后发现是图的问题。当时挺想砸键盘的。

**第三,一个占位图的需求,我引了三个境外域名。** 大家应该都很熟悉这套组合:

- 占位色块 → placehold.co
- 用户头像 → DiceBear 的 API
- 列表假数据 → JSONPlaceholder

三个服务,三个域名,全在境外。CSP 白名单要写三条,内网环境要挨个申请放行,而且它们的路径风格、参数命名、缓存策略互不相同,我得同时记三套 API。

**第四,假数据全是英文。** JSONPlaceholder 返回的是 `Leanne Graham`、`Sincere@april.biz`、`Gwenborough`。我要验证的是中文姓名换行、超长中文标题截断、中文地址在窄屏下的表现。拿英文数据测中文排版,等于没测。上线以后果然出问题:两个字的名字和四个字的名字在同一行里,对不齐。

那段时间我搜了很久有没有国内的替代品。找到的东西大致三类:个人搭的小服务,能用,但哪天没续费就消失了;只做单一功能的,占位图归占位图,头像还得另找;还有一些要注册、要申请 Key、要在请求头里带 token——我只是想在 `<img src>` 里写一个地址而已,不想为这个引一个 SDK。

找了一圈没找到顺手的,就自己写了。

## 就是它:图即 devimg

网站在这儿:<https://devimg.cn>

一句话概括:**国内开发者在写页面的时候,需要的所有临时素材,都在同一个域名下,直接写进 `<img src>` 就能用。不注册,不要 Key,没有 SDK。**

【配图 2】截图内容:devimg.cn 首页 Hero 区域,带在线调宽高的那块演示。

我给自己定的第一条原则是:**这东西必须比查文档还快**。任何需要「先安装、先注册、先看文档」的设计都砍掉。所以最终的形态就是一条 URL。

第二条原则是:**同一条 URL,永远返回同一张图。** 这条是被 CI 那两个小时逼出来的。带 `seed` 的接口全部走 `Cache-Control: immutable`,你截一百次快照,拿到的都是同一张。

## 怎么用

下面的地址复制到浏览器地址栏里就能看到效果,不用做任何准备工作。

### 占位图

最基本的用法,给个宽高就完事:

```html
<img src="https://cdn.devimg.cn/800/600" />
<img src="https://cdn.devimg.cn/400/300?text=Banner&bg=409eff&fg=ffffff" />
```

需要画面固定不变的,走 `seed`,同一个 seed 配色永远一样:

```html
<img src="https://cdn.devimg.cn/seed/my-app/800/600" />
```

如果你以前用 placehold.co,那种 `800x600` 的写法和路径配色也照样认:

```html
<img src="https://cdn.devimg.cn/800x600?text=Banner" />
<img src="https://cdn.devimg.cn/800/600/409eff/ffffff" />
```

默认返回 SVG,体积小、缩放不糊。小程序里必须要位图的,加个 `.webp` / `.png` 后缀就行。

【配图 3】截图内容:文档站「占位图 API」页面的在线试玩组件,能看到调参数、URL 实时变化那块。

### 头像:支持中文首字

这个是我个人最想要的功能。DiceBear 那套风格很好看,但它不认中文,`张三` 进去出来是空白或者乱码。

```html
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128" />
<img src="https://cdn.devimg.cn/avatar/lorelei/Luna/128" />
<img src="https://cdn.devimg.cn/avatar/devimg/张三/128?bg=3b5bdb&fg=ffffff&shape=square" />
```

除了自己做的中文首字头像,也把 DiceBear、Jdenticon、Minidenticons 的开源风格接了进来,加起来 50 多种。同一个 style 加同一个名字,永远是同一张脸——做用户列表的时候特别省事,不用自己维护一份头像映射表。

风格太多记不住的话,`GET /avatar/styles` 会返回完整目录,带每种风格的许可信息。

【配图 4】截图内容:头像 API 页面的风格墙 / 在线试玩,最好能同时出现中文首字头像和几个卡通风格。

### 真实照片:按用途取图,而不是按 ID 抽奖

picsum 的图很漂亮,但它是随机的。我要做一个电商商品卡,抽到一张森林风景,那这个 demo 就白做了。

所以照片接口是按**用途**取的:

```html
<img src="https://cdn.devimg.cn/photo/400/400?scene=product&seed=p-1" />
<img src="https://cdn.devimg.cn/photo/1200/400?scene=banner&seed=hero" />
<img src="https://cdn.devimg.cn/photo/640/480?cat=美食&seed=food-1" />
```

`scene` 目前有十几种:`product` 商品、`food` 餐饮、`news` 资讯、`travel` 出行、`hotel` 住宿、`banner` 轮播、`education` 课程、`realestate` 房源等等。做电商列表就传 `product`,做资讯流就传 `news`,出来的图跟你的业务是搭的。

带 `seed` 就固定,不带就每次随机,看你的场景选。

【配图 5】截图内容:同一个页面里用不同 `scene` 取出来的照片对比(比如商品 / 美食 / 房产各一张),能体现「按用途取图」这件事。

### 骨架屏和空状态

这两个东西,以前我都是自己手写 SVG 或者拿 div 拼,写一次要十几分钟,而且换个尺寸就得重来。

```html
<img src="https://cdn.devimg.cn/skeleton/350/120?type=card" />
<img src="https://cdn.devimg.cn/skeleton/800/600?type=grid&cols=3&animate=1" />
<img src="https://cdn.devimg.cn/404" />
<img src="https://cdn.devimg.cn/scene/empty?theme=dark&title=购物车是空的" />
```

骨架屏有 `page` / `card` / `row` / `grid` 四种布局,支持明暗主题和 shimmer 动画。空状态有 404、空数据、断网、搜索无结果四种,标题副标题都能自己改成中文。

【配图 6】截图内容:骨架屏几种 type 的效果 + 场景图 404 / empty 的效果,拼一张。

### 伪二维码

这个功能是我做收银台页面的时候顺手加的。当时需要在页面上放一个二维码占位,拿真的二维码生成库生成一个吧,又怕测试同学真拿手机去扫。

```html
<img src="https://cdn.devimg.cn/qr/checkout/128" />
<img src="https://cdn.devimg.cn/barcode/sku-mock/320/80" />
```

生成的是**长得像**二维码和条形码的图案,不可扫描,响应头里带 `X-DevImage-Pseudo-Code` 标明身份。纯粹用来占位,不会有人误用。

### 中文 Mock 数据

路径风格照着 JSONPlaceholder 来的,前缀换成 `/mock`:

```javascript
const users = await fetch('https://cdn.devimg.cn/mock/users?_page=1&_limit=10').then(r => r.json());
const post = await fetch('https://cdn.devimg.cn/mock/posts/1').then(r => r.json());
```

返回的是中文数据,姓名是「张三」,地址是「上海」,文章标题是像样的中文句子。用户、文章、商品三类资源,各 100 条,同一个 id 每次返回一样的内容。

顺带一提,返回里的 `avatar`、`cover`、`image` 字段本身就指向 devimg 的图片接口,所以你 fetch 一次 `/mock/posts`,拿到的数据直接就能渲染成一个带封面图的完整列表,不用再自己补图。

【配图 7】截图内容:`/mock/posts` 的 JSON 返回结果,能看到中文字段和里面的图片 URL。

## 从 picsum / placehold 迁过来,基本就是改个域名

这是我做兼容的时候花心思最多的地方。已经写在项目里的代码,没人愿意为了换个图床全局重构。

| 你原来写的 | 换成 |
| ------ | ------ |
| `picsum.photos/800/600` | `cdn.devimg.cn/photo/800/600` |
| `picsum.photos/seed/x/800/600` | `cdn.devimg.cn/seed/x/800/600` |
| `picsum.photos/id/1/800/600` | `cdn.devimg.cn/id/1/800/600` |
| `placehold.co/800x600` | `cdn.devimg.cn/800x600` |
| `jsonplaceholder.../users` | `cdn.devimg.cn/mock/users` |

有一处需要注意:在 devimg 里 `/800/600` 返回的是**合成色块**,不是照片。想要照片得走 `/photo/800/600`。这是故意分开的,合成图和真照片本来就是两种需求,混在一起你没法控制拿到的是什么。

## 几个我自己比较满意的点

**全部默认 SVG。** 占位图、头像、骨架屏、场景图、码形占位都是服务端合成 SVG,一张几 KB,不用等图片解码,随便放大也不糊。真的需要位图再加 `.webp` 后缀转码。

**seed 一致性是贯穿的。** 占位图、头像、照片、二维码全都支持 seed,相同参数必定相同结果,而且响应头是 `max-age=31536000, immutable`。CI 视觉回归、UI 走查、设计对稿,都不会再出现「图变了」这种事。这条是我踩过坑之后最坚持的设计。

**不用注册,不用 Key,没有 SDK。** 打开就能用。默认限额 1000 次/分钟/IP,栅格转码 60 次/分钟/IP,正常开发怎么用都够。

**部署在国内。** 腾讯云 + COS + CDN,这是这个项目存在的全部理由。上面所有功能,别的服务或多或少都有,唯一的差别是打开的时候不用等。

**中文是一等公民。** 头像认中文首字、Mock 数据是中文、照片题材用中文标注、场景图文案能换成中文。这些细节单拎出来都很小,但拼在一起,你测中文排版的时候会舒服很多。

【配图 8】截图内容:文档站「快速开始」或「功能一览」页面,能看到接口全貌。

## 说点不好的

有些东西还没做完,先讲清楚,免得你抱着期待点进去然后失望:

- **场景图目前还是文案 SVG,不是插画。** 就是配色加一行标题的那种,能用,但不好看。插画版在做了。
- **照片图库还在扩。** 目前是 CC0 精选包,量不算大,某些冷门题材翻几页就重复了。
- **Mock 只有三类资源,而且是只读的。** `POST` / `PUT` / `DELETE` 还没支持,嵌套资源(比如文章的评论)也还没有。
- **一个人在做。** 前端、后端、运维、文档全是我自己,所以更新节奏取决于我最近加不加班。

## 最后

这个项目一开始纯粹是为了解决我自己的问题——让组件库文档在不挂代理的情况下,能在一秒内打开。做着做着发现,顺手能解决的问题还挺多,就一路做成了现在这样。

如果你也在被同样的事情烦,或者你有想要但现在还没有的功能(图标?Lottie?更多 Mock 资源?),欢迎来提。

- 网站:<https://devimg.cn>
- CDN:<https://cdn.devimg.cn>
- 交流反馈群:**166188735**

群里我基本都在,有 bug 直接扔进来,有需求也直接说,能做的我尽量排上。
