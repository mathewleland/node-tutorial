function autocomplete(input, latInput, lngInput) {
  if(!input) return; //skip if there's no input on page

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
    console.log(place);
  })
  //if someone hits enter in the address field, don't try to submit the form
  input.on('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  })
}

export default autocomplete;
