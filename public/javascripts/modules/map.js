import axios from 'axios';
import { $ } from './bling'

const mapOptions = {
  center: { lat: 43.2, lng: -79.8},
  zoom: 12
}

function loadPlaces(map, lat=43.2, lng=-79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const places = res.data;
      if (!places.length) {
          alert('no places found there'); 
          console.log('no places found');
      }

      //create a bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position); 
        const marker = new google.maps.Marker({
          map: map,
          position: position
        });
        marker.place = place;
        return marker;
      });
      //when someone clicks on a marker, show the details
      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class='popup'>
            <a href='/store/${this.place.slug}'>
              <img src='/uploads/${this.place.photo || 'https://i.pinimg.com/736x/e4/97/f8/e497f8ee0640fb63afaf2067c5a3f551--victoria-british-british-columbia.jpg'} alt='${this.place.name}' />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));
      // zoom the map to fit all the markers perfectly
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    });
  
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  //make our map!
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  console.log(input);
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    console.log(place);
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  })
}

export default makeMap;

// navigator.geolocation.getCurrentPosition from day 21 of JS30