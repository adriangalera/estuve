import{L as p,T as I,o as C,c as b,e as $,a as P,b as G,i as N,w as D,_ as S,d as y}from"./maps-CKZF-6Ic.js";const q=()=>{const e=new Map;let a=0;const i=async(t,n,r)=>{const f=(await I().parseGpxTrackInWorker(t)).data;if(!f||f.length===0)throw new Error("No valid track points found in GPX file");const L=f.map(A=>[A.lat,A.lon]),k=p.polyline(L,{color:"#3388FF",weight:10,fillOpacity:.2});a++;const T=t.name.replace(/\.gpx$/i,"")||`Track ${a}`,g=e.has(T)?`${T} (${a})`:T,B=k.getBounds(),h={layer:k,bounds:B,metadata:{name:g,fileName:t.name,pointCount:f.length,addedAt:new Date}};return e.set(g,h),k.addTo(n),r.addOverlay(k,g),document.dispatchEvent(new CustomEvent("gpxTrackAdded",{detail:{trackName:g,trackInfo:h}})),h},s=(t,n,r)=>{const o=e.get(t);return o?(n.removeLayer(o.layer),r.removeLayer(o.layer),e.delete(t),document.dispatchEvent(new CustomEvent("gpxTrackRemoved",{detail:{trackName:t}})),!0):!1},d=()=>Array.from(e.keys());return{addGpxTrack:i,removeGpxTrack:s,getAllTrackNames:d,getTrackInfo:t=>e.get(t)||null,removeAllTracks:(t,n)=>{d().forEach(o=>s(o,t,n))},fitAllTracks:t=>{if(e.size===0)return;const n=p.latLngBounds([]);e.forEach(r=>{n.extend(r.bounds)}),t.fitBounds(n)}}},O="fa-upload",U=(e,a,i,s)=>{const d=async l=>{const c=l.target.files;if(!c.length)return;let t=0,n=0;const r=[];for(let o of c)try{await a.addGpxTrack(o,e,i),t++}catch(v){n++,r.push(`${o.name}: ${v.message}`),console.error(`Error uploading ${o.name}:`,v)}if(t>0&&n===0){const o=s.t("plan.upload.success",{count:t});j(o,"success"),a.fitAllTracks(e)}else if(n>0){let o=s.t("plan.upload.partial",{success:t,failed:n});r.length>0&&(o+=`

`+r.join(`
`)),alert(o),t>0&&a.fitAllTracks(e)}l.target.value=""},m=document.getElementById("planGpxFileInput");return m.addEventListener("change",d),p.easyButton(O,()=>{m.click()},s.t("plan.upload.button")).addTo(e)},j=(e,a="info")=>{console.log(`[${a.toUpperCase()}] ${e}`)},x="fa-trash-alt",z=(e,a,i,s)=>{const d=l=>{if(a.removeGpxTrack(l,e,i)){const t=document.querySelector(`[data-track-name="${l}"]`);t&&t.closest("li").remove(),a.getAllTrackNames().length===0&&b()}},m=()=>{const l=a.getAllTrackNames();if(l.length===0){alert(s.t("plan.delete.noTracks"));return}const c=l.map(n=>`
            <li class="layer-list-item">
                <span class="layer-list-name">${$(n)}</span>
                <button data-track-name="${$(n)}" class="remove-track-btn" title="${s.t("plan.delete.removeTitle")}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </li>
        `).join(""),t=`
            <div class="popup-panel">
                <div class="popup-panel-header">
                    <div class="popup-panel-title">${s.t("plan.delete.title")}</div>
                </div>
                <section id="plan-delete-section">
                    <ul id="plan-tracks-list" class="layer-list">
                        ${c}
                    </ul>
                </section>
                <div class="popup-panel-footer">
                    <button id="delete-all-tracks-btn" class="btn-danger">
                        ${s.t("plan.delete.removeAll")}
                    </button>
                </div>
            </div>
        `;P("plan-delete-popup",t)};return C("plan-delete-popup",()=>{document.querySelectorAll(".remove-track-btn").forEach(c=>{c.addEventListener("click",()=>{d(c.getAttribute("data-track-name"))})});const l=document.getElementById("delete-all-tracks-btn");l&&l.addEventListener("click",()=>{confirm(s.t("plan.delete.confirmAll"))&&(a.removeAllTracks(e,i),b())})}),p.easyButton(x,()=>{m()},s.t("plan.delete.button")).addTo(e)},u=p.map("map").setView([41.53289317099601,2.104000992549118],4),E=G(u),w=q();N.then(()=>{U(u,w,E,y),z(u,w,E,y)}).catch(e=>{console.error("Error loading i18n:",e)});navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(e){const a=new p.LatLng(e.coords.latitude,e.coords.longitude);u.panTo(a)});const F=new D({provider:new S,style:"bar",showMarker:!1});u.addControl(F);window.i18next=y;window.map=u;window.gpxManager=w;
