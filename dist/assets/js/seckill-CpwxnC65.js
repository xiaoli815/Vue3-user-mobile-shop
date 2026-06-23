import{r as t}from"./request-BETsyR3e.js";const s=()=>t.get("/seckill/list"),a=e=>t.get("/seckill/detail",{params:{seckillId:e}}).then(l=>l.data);export{a,s as g};
