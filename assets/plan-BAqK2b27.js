import{L as c,T as E,a as I,i as C,w as B,_ as G,b as w}from"./maps-C6izXzfY.js";const P=()=>{const e=new Map;let o=0;const i=async(t,n,l)=>{const m=(await E().parseGpxTrackInWorker(t)).data;if(!m||m.length===0)throw new Error("No valid track points found in GPX file");const $=m.map(A=>[A.lat,A.lon]),k=c.polyline($,{color:"#3388FF",weight:10,fillOpacity:.2});o++;const h=t.name.replace(".gpx","")||`Track ${o}`,g=e.has(h)?`${h} (${o})`:h,L=k.getBounds(),v={layer:k,bounds:L,metadata:{name:g,fileName:t.name,pointCount:m.length,addedAt:new Date}};return e.set(g,v),k.addTo(n),l.addOverlay(k,g),document.dispatchEvent(new CustomEvent("gpxTrackAdded",{detail:{trackName:g,trackInfo:v}})),v},r=(t,n,l)=>{const s=e.get(t);return s?(n.removeLayer(s.layer),l.removeLayer(s.layer),e.delete(t),document.dispatchEvent(new CustomEvent("gpxTrackRemoved",{detail:{trackName:t}})),!0):!1},d=()=>Array.from(e.keys());return{addGpxTrack:i,removeGpxTrack:r,getAllTrackNames:d,getTrackInfo:t=>e.get(t)||null,removeAllTracks:(t,n)=>{d().forEach(s=>r(s,t,n))},fitAllTracks:t=>{if(e.size===0)return;const n=c.latLngBounds([]);e.forEach(l=>{n.extend(l.bounds)}),t.fitBounds(n)}}},N="fa-upload",D=(e,o,i,r)=>{const d=async f=>{const a=f.target.files;if(!a.length)return;let t=0,n=0;const l=[];for(let s of a)try{await o.addGpxTrack(s,e,i),t++}catch(T){n++,l.push(`${s.name}: ${T.message}`),console.error(`Error uploading ${s.name}:`,T)}if(t>0&&n===0){const s=r.t("plan.upload.success",{count:t});S(s,"success"),o.fitAllTracks(e)}else if(n>0){let s=r.t("plan.upload.partial",{success:t,failed:n});l.length>0&&(s+=`

`+l.join(`
`)),alert(s),t>0&&o.fitAllTracks(e)}f.target.value=""},u=document.getElementById("planGpxFileInput");return u.addEventListener("change",d),c.easyButton(N,()=>{u.click()},r.t("plan.upload.button")).addTo(e)},S=(e,o="info")=>{console.log(`[${o.toUpperCase()}] ${e}`)},q="fa-trash-alt",O=(e,o,i,r)=>{const d=a=>{if(o.removeGpxTrack(a,e,i)){const n=document.querySelector(`[data-track-name="${a}"]`);n&&n.closest("li").remove(),o.getAllTrackNames().length===0&&e.closePopup()}},u=()=>{const a=o.getAllTrackNames();if(a.length===0){alert(r.t("plan.delete.noTracks"));return}const t=`
            <section id="plan-delete-section">
                <h3>${r.t("plan.delete.title")}</h3>
                <p>${r.t("plan.delete.text")}</p>
                <ul id="plan-tracks-list">
                    ${a.map(n=>(o.getTrackInfo(n),`
                            <li>
                                <span>${n}</span>
                                <button data-track-name="${n}" class="remove-track-btn" title="${r.t("plan.delete.removeTitle")}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </li>
                        `)).join("")}
                </ul>
                <div style="margin-top: 10px;">
                    <button id="delete-all-tracks-btn" class="delete-all-btn">
                        ${r.t("plan.delete.removeAll")}
                    </button>
                </div>
            </section>
        `;c.popup({id:"plan-delete-popup"}).setLatLng(e.getCenter()).setContent(t).openOn(e)},f=()=>{document.querySelectorAll(".remove-track-btn").forEach(t=>{t.addEventListener("click",n=>{const l=t.getAttribute("data-track-name");d(l)})});const a=document.getElementById("delete-all-tracks-btn");a&&a.addEventListener("click",()=>{confirm(r.t("plan.delete.confirmAll"))&&(o.removeAllTracks(e,i),e.closePopup())})};return e.on("popupopen",function(a){var n;((n=a.popup.options)==null?void 0:n.id)==="plan-delete-popup"&&f()}),c.easyButton(q,function(a,t){u()},r.t("plan.delete.button")).addTo(e)},p=c.map("map").setView([41.53289317099601,2.104000992549118],4),b=I(p),y=P();C.then(()=>{D(p,y,b,w),O(p,y,b,w)}).catch(e=>{console.error("Error loading i18n:",e)});navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(e){const o=new c.LatLng(e.coords.latitude,e.coords.longitude);p.panTo(o)});const U=new B({provider:new G,style:"bar",showMarker:!1});p.addControl(U);window.i18next=w;window.map=p;window.gpxManager=y;
