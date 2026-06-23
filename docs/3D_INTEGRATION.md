# 3D 閽堢伕 路 鍓嶅悗绔垎绂昏鏄?
## 鏋舵瀯姒傝

| 绔?| 璺敱 | 鍔熻兘 |
|----|------|------|
| **鐢ㄦ埛绔紙鍓嶇锛?* | `/` | 鍙 3D 浜轰綋妯″瀷 + 绌翠綅锛涘乏涓婅閮ㄤ綅涓嬫媺锛涚偣鍑荤┐浣嶅脊绐?|
| **绠＄悊绔紙鍚庣 UI锛?* | `/admin` | 褰曞叆/缂栬緫/鍒犻櫎绌翠綅锛屽潗鏍囧井璋冿紝楠ㄥ害鍒嗗灏虹瓑 |
| **API 鏈嶅姟** | `http://localhost:3001` | REST 鎺ュ彛锛屾暟鎹瓨浜?`data/acupoints.json` |

**绌翠綅鍧愭爣宸叉爣瀹氬浐瀹?*锛岀敤鎴风涓嶄細淇敼鍧愭爣锛涚鐞嗙璇疯皑鎱庤皟鏁淬€?
## 鏈湴杩愯

```bash
# 瀹夎渚濊禆
npm install

# 鍚屾椂鍚姩 API + 鍓嶇
npm run dev:all
```

- 鐢ㄦ埛绔細http://localhost:5173/
- 绠＄悊鍚庡彴锛歨ttp://localhost:5173/admin
- API锛歨ttp://localhost:3001/api/acupoints

## 鎺ュ叆鍒板ぇ浣滀笟椤圭洰

### 鏂瑰紡涓€锛氬祵鍏ョ敤鎴风缁勪欢

灏嗕互涓嬬洰褰?鏂囦欢澶嶅埗鎴栦綔涓哄瓙妯″潡寮曠敤锛?
- `src/components/AcupointViewer.vue` 鈥?鍙 3D  viewer
- `src/config/bodyPartViews.js` 鈥?閮ㄤ綅鐩告満棰勮
- `src/api/acupoints.js` 鈥?API 瀹㈡埛绔?- `src/utils/acupointSurface.js` 鈥?濡傞渶绠＄悊绔创闈?- `public/models/` 鈥?3D 浜轰綋妯″瀷
- `server/` 鈥?鐙珛 API 鏈嶅姟

鍦ㄥぇ浣滀笟 Vue 椤圭洰涓細

```vue
<script setup>
import AcupointViewer from '@/modules/3d-zhenjiu/AcupointViewer.vue'
</script>

<template>
  <AcupointViewer api-base="https://浣犵殑鍩熷悕/api/acupoints" />
</template>
```

鎴栭€氳繃鐜鍙橀噺锛?
```env
VITE_API_BASE_URL=https://浣犵殑鍩熷悕/api/acupoints
```

### 鏂瑰紡浜岋細鐙珛閮ㄧ讲 + iframe

1. `npm run build` 鏋勫缓鍓嶇
2. `node server/index.js` 杩愯 API
3. 鍦ㄥぇ浣滀笟椤甸潰 iframe 宓屽叆 viewer 椤甸潰

### 鏂瑰紡涓夛細浠呭鐢?API

绠＄悊绔彲鍦ㄦ湰浠撳簱 `/admin` 缁存姢绌翠綅锛涘ぇ浣滀笟椤圭洰鍙皟鐢?API 灞曠ず锛?
```
GET    /api/acupoints       鑾峰彇鍏ㄩ儴绌翠綅
GET    /api/acupoints/:id   鑾峰彇鍗曚釜
POST   /api/acupoints       鏂板缓锛堢鐞嗙锛?PUT    /api/acupoints/:id   鏇存柊锛堢鐞嗙锛?DELETE /api/acupoints/:id   鍒犻櫎锛堢鐞嗙锛?GET    /api/health          鍋ュ悍妫€鏌?```

## 鐢ㄦ埛绔氦浜?
1. **宸︿笂瑙掍笅鎷?*锛氬叏閮?/ 鑳歌吂 / 鑳岄儴 / 涓婅偄 / 涓嬭偄
2. 閫夋嫨閮ㄤ綅 鈫?鐩告満骞虫粦瀹氫綅鍒板搴斿尯鍩燂紝骞跺彧鏄剧ず璇ラ儴浣嶇┐浣?3. **鍗曞嚮绌翠綅** 鈫?鍙充笂瑙掑崱鐗囨樉绀虹┐鍚嶃€佹墍灞為儴浣嶃€佸畾浣嶄笌鍔熸晥

## 绠＄悊绔?
- 鎵撶偣妯″紡锛氬弻鍑绘ā鍨嬫坊鍔犵┐浣?- 缂栬緫鍒楄〃涓殑绌翠綅鍚嶇О銆侀儴浣嶃€佷粙缁嶃€侀鑹层€佸潗鏍?- 鏁版嵁閫氳繃 API 鎸佷箙鍖栧埌 `data/acupoints.json`

## 鐢熶骇鏋勫缓

```bash
npm run build    # 杈撳嚭 dist/
npm run server   # 鍗曠嫭杩愯 API
```

鍓嶇闈欐€佹枃浠堕渶鑷閰嶇疆 Nginx 绛夛紱`/api` 鍙嶅悜浠ｇ悊鍒?Express 鏈嶅姟銆?
