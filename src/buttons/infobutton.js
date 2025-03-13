import L from 'leaflet';
import 'leaflet-easybutton';

const popupHtml = `
     <b><span id="info-title">Welcome to estuve.eu!</span></b>
     <br>
     <span id="info-content">Here you can explore your GPX tracks interactively.</span>
`

export const addInfoButton = (map, i18next) => {
     L.easyButton('fa-info-circle', function (btn, map) {
          L.popup()
               .setLatLng(map.getCenter())
               .setContent(popupHtml)
               .openOn(map);

          if(i18next.isInitialized) {
               document.getElementById("info-title").innerText = i18next.t("info.title")
               document.getElementById("info-content").innerText = i18next.t("info.content")
          }

     }).addTo(map);
}