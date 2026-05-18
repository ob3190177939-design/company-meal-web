# 公司餐登记台部署说明

这个项目现在是一个纯静态网页，已经适配：

- `Vercel`
- `Netlify`

## 目录里的关键文件

- `index.html`
- `script.js`
- `styles.css`
- `vercel.json`
- `netlify.toml`

## 方案一：Vercel

1. 打开 [Vercel](https://vercel.com/)
2. 登录后选择 `Add New Project`
3. 把当前项目目录上传，或者先传到 GitHub 再从 GitHub 导入
4. Framework Preset 选 `Other`
5. 不需要改 Build Command
6. Output Directory 留空
7. 点击 `Deploy`

部署完成后会得到一个公网链接。

## 方案二：Netlify

1. 打开 [Netlify](https://www.netlify.com/)
2. 登录后选择 `Add new site`
3. 直接拖拽当前项目目录，或者从 Git 导入
4. Build command 留空
5. Publish directory 填 `.`
6. 点击发布

部署完成后也会得到一个公网链接。

## 微信上怎么用

1. 把部署后得到的网址发到微信群或收藏到企业微信
2. 门店人员在微信里直接打开
3. 填写后可以使用：
   - `保存当前截图`
   - `保存总览截图`
   - 单条记录里的 `保存截图`

## 当前版本的保存方式

现在记录保存到当前浏览器本地。

这意味着：

- 同一部手机、同一个微信内打开，记录通常还在
- 换手机、清缓存、换浏览器后记录不会同步

如果下一步要给多家门店长期正式使用，建议继续做：

1. 云端数据库保存
2. 登录或门店身份区分
3. 后台导出 Excel
