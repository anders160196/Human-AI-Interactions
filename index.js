const myUrl = new URL(window.location.toLocaleString());
const urlParams = myUrl.searchParams;
const mode = urlParams.get('mode');
console.log(mode);


if (sessionStorage.getItem("genres") === null || mode == 'reset') {
  page1.style.display='block';
}
else {
  page2.style.display='block';
}


function save() {
  var checkboxSelections = document.querySelectorAll('input[type="checkbox"]:checked');

  if (checkboxSelections.length == 0) {
    alert("Please select your age and favorite music genres.");
    return;
  }

  var genres = [];
  for (var element of checkboxSelections) {
    genres.push(element.id);
  }
  
  console.log(genres);
  sessionStorage.setItem("genres", genres);

  page1.style.display='none';
  page2.style.display='block';
}