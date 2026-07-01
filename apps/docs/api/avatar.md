# 头像 API

## `GET /avatar/:name/:size`

根据名称生成字母或中文首字圆形头像（SVG）。

### 参数

| 参数 | 位置 | 说明 |
|------|------|------|
| name | path | 用户名，支持中文 URL 编码 |
| size | path | 10–4000 像素 |
| bg | query | 背景色 hex |
| fg | query | 文字色 hex，默认 `ffffff` |

### 示例

```html
<img src="http://localhost:3000/avatar/张三/128" />
<img src="http://localhost:3000/avatar/John/64?bg=6366f1" />
```

### 规则

- 中文：取第一个字符
- 英文：取首字母大写
- 同色名 deterministic（基于 name hash）
