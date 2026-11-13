let s,i,q,w,n,P,evalExpr
P=(m,v,o)=>{if(s[i]=="-"||s[i]=="+")v=(s[i++]=="-"?-1:1)*P(9);else if(s[i]=="(")i++,v=P(1),i++;else for(n="";/[\d.]/.test(s[i]);)v=+(n+=s[i++]);while(q={"+":1,"-":1,"*":2,"/":2}[s[i]],q>=m)o=s[i++],w=P(q+1),v={"+":v+w,"-":v-w,"*":v*w,"/":v/w}[o];return v}
evalExpr=x=>(s=x.replace(/\s/g,""),i=0,P(1))
module.exports={evalExpr}