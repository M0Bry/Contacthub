var allContacts = [];
var lastId = 0;
var editId = null;
var tempAvatar = "";
var myModal = null;
var NAME_RULE  = /^[A-Za-z\u0600-\u06FF\s]{2,50}$/;
var PHONE_RULE = /^(?:\+20|0020|0)?1[0125]\d{8}$/;
var EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeId() {
  lastId = lastId + 1;
  localStorage.setItem("last_id", String(lastId));
  return "contact_" + lastId;
}

function shortName(nameText) {
  if (!nameText || !nameText.trim()) return "?";

  var parts = nameText.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return parts[0].charAt(0).toUpperCase();
}

function saveData() {
  localStorage.setItem("contacts", JSON.stringify(allContacts));
}

function loadData() {
  var saved = localStorage.getItem("contacts");

  if (saved) {
    allContacts = JSON.parse(saved);
  } else {
    allContacts = [];
  }

  var savedId = localStorage.getItem("last_id");
  if (savedId) {
    lastId = Number(savedId);
  } else {
    lastId = allContacts.length;
  }
}

function addContact(formData) {
  var item = {
    id: makeId(),
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    notes: formData.notes,
    group: formData.group,
    avatar: formData.avatar,
    isFavorite: formData.isFavorite,
    isEmergency: formData.isEmergency,
  };

  allContacts.push(item);
  saveData();
  return item;
}

function updateContact(idText, formData) {
  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].id === idText) {
      allContacts[i].name = formData.name;
      allContacts[i].phone = formData.phone;
      allContacts[i].email = formData.email;
      allContacts[i].address = formData.address;
      allContacts[i].notes = formData.notes;
      allContacts[i].group = formData.group;
      allContacts[i].avatar = formData.avatar;
      allContacts[i].isFavorite = formData.isFavorite;
      allContacts[i].isEmergency = formData.isEmergency;
      saveData();
      return allContacts[i];
    }
  }

  return null;
}

function deleteContact(idText) {
  var newList = [];

  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].id !== idText) newList.push(allContacts[i]);
  }

  allContacts = newList;
  saveData();
}

function findContact(idText) {
  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].id === idText) return allContacts[i];
  }

  return null;
}

function searchContacts(word) {
  if (!word || !word.trim()) return allContacts;

  var query = word.toLowerCase();
  var result = [];

  for (var i = 0; i < allContacts.length; i++) {
    var item = allContacts[i];
    var hitName = item.name.toLowerCase().indexOf(query) !== -1;
    var hitPhone = item.phone.indexOf(word) !== -1;
    var hitEmail = item.email.toLowerCase().indexOf(query) !== -1;

    if (hitName || hitPhone || hitEmail) result.push(item);
  }

  return result;
}

function getFavorites() {
  var result = [];

  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].isFavorite) result.push(allContacts[i]);
  }

  return result;
}

function getEmergency() {
  var result = [];

  for (var i = 0; i < allContacts.length; i++) {
    if (allContacts[i].isEmergency) result.push(allContacts[i]);
  }

  return result;
}

function avatarBox(item, sizeText) {
  var boxSize;

  if (sizeText === "small") {
    boxSize = "Avatar_Small";
  } else {
    boxSize = "Avatar_Large";
  }

  if (item.avatar) {
    return '<div class="' + boxSize + '"><img class="Avatar_Img" src="' + item.avatar + '" alt="' + item.name + '"></div>';
  }

  var letters = shortName(item.name);
  var colorNum = (item.name.length % 8) + 1;
  return '<div class="' + boxSize + ' Avatar_C' + colorNum + '">' + letters + "</div>";
}

function groupTag(groupText) {
  if (!groupText) return "";

  var low = groupText.toLowerCase();
  var cls = "Tag_Other";

  if (low === "family") cls = "Tag_Family";
  if (low === "friends") cls = "Tag_Friends";
  if (low === "work") cls = "Tag_Work";
  if (low === "school") cls = "Tag_School";

  return '<span class="Group_Tag text-capitalize ' + cls + '">' + groupText + "</span>";
}

function contactCard(item) {
  var favBtn;
  if (item.isFavorite) {
    favBtn = "Btn_Fav_On";
  } else {
    favBtn = "Btn_Fav";
  }

  var favIcon;
  if (item.isFavorite) {
    favIcon = '<i class="fa-solid fa-star"></i>';
  } else {
    favIcon = '<i class="fa-regular fa-star"></i>';
  }

  var emergBtn;
  if (item.isEmergency) {
    emergBtn = "Btn_Emerg_On";
  } else {
    emergBtn = "Btn_Emerg";
  }

  var emergIcon;
  if (item.isEmergency) {
    emergIcon = '<i class="fa-solid fa-heart-pulse"></i>';
  } else {
    emergIcon = '<i class="fa-regular fa-heart"></i>';
  }

  var emergLabel;
  if (item.isEmergency) {
    emergLabel = '<span class="Emerg_Tag"><i class="fa-solid fa-heart-pulse"></i> Emergency</span>';
  } else {
    emergLabel = "";
  }

  var groupLabel = groupTag(item.group);

  var tagPart;
  if (groupLabel || emergLabel) {
    tagPart = '<div class="Tag_Row">' + groupLabel + emergLabel + "</div>";
  } else {
    tagPart = "";
  }

  var face = avatarBox(item, "large");

  var dotE;
  if (item.isEmergency) {
    dotE = '<div class="Dot_Emerg"><i class="fa-solid fa-heart-pulse"></i></div>';
  } else {
    dotE = "";
  }

  var dotF;
  if (item.isFavorite) {
    dotF = '<div class="Dot_Fav"><i class="fa-solid fa-star"></i></div>';
  } else {
    dotF = "";
  }

  var mailRow;
  if (item.email) {
    mailRow = '<div class="Info_Row"><div class="Info_Icon Icon_Violet"><i class="fa-solid fa-envelope"></i></div><span class="Info_Text text-truncate">' +
      item.email +
      "</span></div>";
  } else {
    mailRow = "";
  }

  var homeRow;
  if (item.address) {
    homeRow = '<div class="Info_Row"><div class="Info_Icon Icon_Green"><i class="fa-solid fa-location-dot"></i></div><span class="Info_Text text-truncate">' +
      item.address +
      "</span></div>";
  } else {
    homeRow = "";
  }

  var mailBtn;
  if (item.email) {
    mailBtn = '<a class="Action_Btn Btn_Mail text-decoration-none" href="mailto:' + item.email + '"><i class="fa-solid fa-envelope"></i></a>';
  } else {
    mailBtn = "";
  }

  var html = "";
  html += '<div class="col-12 col-sm-6">';
  html += '<div class="card Contact_Card">';
  html += '<div class="Card_Top">';
  html += '<div class="d-flex align-items-start gap-3">';
  html += '<div class="Avatar_Wrap">' + face + dotE + dotF + "</div>";
  html += '<div class="flex-grow-1 overflow-hidden pt-1">';
  html += '<h3 class="Contact_Name text-truncate">' + item.name + "</h3>";
  html +=
    '<div class="Info_Row"><div class="Info_Icon Icon_Sky Icon_Small"><i class="fa-solid fa-phone"></i></div><span class="Contact_Phone text-truncate">' +
    item.phone +
    "</span></div>";
  html += "</div></div>";
  html += mailRow + homeRow + tagPart;
  html += "</div>";
  html += '<div class="Action_Bar">';
  html += '<div class="d-flex gap-2">';
  html += '<a class="Action_Btn Btn_Call text-decoration-none" href="tel:' + item.phone + '"><i class="fa-solid fa-phone"></i></a>';
  html += mailBtn;
  html += "</div>";
  html += '<div class="d-flex gap-2">';
  html += '<button class="Action_Btn ' + favBtn + '" type="button" onclick="changeFav(\'' + item.id + '\')">' + favIcon + "</button>";
  html += '<button class="Action_Btn ' + emergBtn + '" type="button" onclick="changeEmerg(\'' + item.id + '\')">' + emergIcon + "</button>";
  html += '<button class="Action_Btn Btn_Gray" type="button" onclick="editItem(\'' + item.id + '\')"><i class="fa-solid fa-pen"></i></button>';
  html += '<button class="Action_Btn Btn_Gray" type="button" onclick="deleteItem(\'' + item.id + '\')"><i class="fa-solid fa-trash"></i></button>';
  html += "</div></div></div></div>";

  return html;
}

function showContacts(listData) {
  var box = document.getElementById("Contact_List");
  if (!box) return;

  if (listData.length === 0) {
    box.innerHTML =
      '<div class="col-12"><div class="Empty_Box text-center"><div class="Empty_Icon"><i class="fa-solid fa-address-book"></i></div><p class="Empty_Title">No contacts found</p><p class="Empty_Sub">Click Add Contact</p></div></div>';
    return;
  }

  var allHtml = "";
  for (var i = 0; i < listData.length; i++) allHtml += contactCard(listData[i]);
  box.innerHTML = allHtml;
}

function showFavorites() {
  var listData = getFavorites();
  var desk = document.getElementById("Fav_List");
  var mob = document.getElementById("Fav_List_Mobile");
  if (!desk || !mob) return;

  var empty = '<p class="Side_Empty text-center col-12">No favorites yet</p>';
  if (listData.length === 0) {
    desk.innerHTML = empty;
    mob.innerHTML = empty;
    return;
  }

  var deskHtml = "";
  var mobHtml = "";

  for (var i = 0; i < listData.length; i++) {
    var item = listData[i];
    var face = avatarBox(item, "small");

    deskHtml += '<div class="Side_Row">' + face;
    deskHtml += '<div class="flex-grow-1 overflow-hidden"><h4 class="Side_Name text-truncate">' + item.name + '</h4><p class="Side_Phone text-truncate">' + item.phone + "</p></div>";
    deskHtml += '<a class="Side_Call Call_Green text-decoration-none" href="tel:' + item.phone + '"><i class="fa-solid fa-phone"></i></a></div>';

    mobHtml += '<a class="Side_Row Mob_Card text-decoration-none col-12 col-sm-6" href="tel:' + item.phone + '">';
    mobHtml += '<div class="Mob_Face">' + face + '</div><div class="flex-grow-1 overflow-hidden"><h4 class="Side_Name Mob_Name text-truncate">' + item.name + '</h4><p class="Side_Phone Mob_Phone text-truncate">' + item.phone + '</p></div>';
    mobHtml += '<span class="Side_Call Mob_Call Call_Green"><i class="fa-solid fa-phone"></i></span></a>';
  }

  desk.innerHTML = deskHtml;
  mob.innerHTML = mobHtml;
}

function showEmergency() {
  var listData = getEmergency();
  var desk = document.getElementById("Emerg_List");
  var mob = document.getElementById("Emerg_List_Mobile");
  if (!desk || !mob) return;

  var empty = '<p class="Side_Empty text-center col-12">No emergency contacts</p>';
  if (listData.length === 0) {
    desk.innerHTML = empty;
    mob.innerHTML = empty;
    return;
  }

  var deskHtml = "";
  var mobHtml = "";

  for (var i = 0; i < listData.length; i++) {
    var item = listData[i];
    var face = avatarBox(item, "small");

    deskHtml += '<div class="Side_Row Side_Row_Rose">' + face;
    deskHtml += '<div class="flex-grow-1 overflow-hidden"><h4 class="Side_Name text-truncate">' + item.name + '</h4><p class="Side_Phone text-truncate">' + item.phone + "</p></div>";
    deskHtml += '<a class="Side_Call Call_Rose text-decoration-none" href="tel:' + item.phone + '"><i class="fa-solid fa-phone"></i></a></div>';

    mobHtml += '<a class="Side_Row Mob_Card Side_Row_Rose text-decoration-none col-12 col-sm-6" href="tel:' + item.phone + '">';
    mobHtml += '<div class="Mob_Face">' + face + '</div><div class="flex-grow-1 overflow-hidden"><h4 class="Side_Name Mob_Name text-truncate">' + item.name + '</h4><p class="Side_Phone Mob_Phone text-truncate">' + item.phone + '</p></div>';
    mobHtml += '<span class="Side_Call Mob_Call Call_Rose"><i class="fa-solid fa-phone"></i></span></a>';
  }

  desk.innerHTML = deskHtml;
  mob.innerHTML = mobHtml;
}

function showNumbers() {
  var total = document.getElementById("Total_Num");
  var fav = document.getElementById("Fav_Num");
  var emerg = document.getElementById("Emerg_Num");
  var count = document.getElementById("Count_Text");
  if (!total || !fav || !emerg || !count) return;

  total.innerHTML = String(allContacts.length);
  fav.innerHTML = String(getFavorites().length);
  emerg.innerHTML = String(getEmergency().length);
  count.innerHTML = allContacts.length + " contacts";
}

function normalizePhone(phone) {
  var p = String(phone).replace(/[\s\-()]/g, "");
  if (p.indexOf("+20") === 0)  p = "0" + p.slice(3);
  return p;
}

function refreshAll() {
  showContacts(allContacts);
  showFavorites();
  showEmergency();
  showNumbers();
}

function openAdd() {
  editId = null;
  tempAvatar = "";

  document.getElementById("Modal_Title").innerHTML = "Add New Contact";
  document.getElementById("Contact_Form").reset();
  document.getElementById("Contact_Id").value = "";
  document.getElementById("Avatar_Path").value = "";
  document.getElementById("Avatar_Preview").innerHTML = '<i class="fa-solid fa-user"></i>';
  document.getElementById("Name_Error").classList.add("d-none");
  document.getElementById("Phone_Error").classList.add("d-none");
  document.getElementById("Email_Error").classList.add("d-none");
  myModal.show();
}

function openEdit(idText) {
  var item = findContact(idText);
  if (!item) return;

  editId = idText;
  document.getElementById("Modal_Title").innerHTML = "Edit Contact";
  document.getElementById("Contact_Id").value = item.id;
  document.getElementById("Contact_Name").value = item.name;
  document.getElementById("Contact_Phone").value = item.phone;
  document.getElementById("Contact_Email").value = item.email;
  document.getElementById("Contact_Address").value = item.address;
  document.getElementById("Contact_Notes").value = item.notes;
  document.getElementById("Contact_Group").value = item.group;
  document.getElementById("Avatar_Path").value = item.avatar;

  tempAvatar = item.avatar;
  document.getElementById("Contact_Fav").checked = !!item.isFavorite;
  document.getElementById("Contact_Emerg").checked = !!item.isEmergency;

  var faceBox = document.getElementById("Avatar_Preview");

  if (item.avatar) {
    faceBox.innerHTML = '<img src="' + item.avatar + '" alt="Avatar">';
  } else {
    faceBox.innerHTML = shortName(item.name);
  }

  myModal.show();
}

function submitForm(event) {
  event.preventDefault();

  var nameText = document.getElementById("Contact_Name").value.trim();
  var phoneText = document.getElementById("Contact_Phone").value.trim();
  var emailText = document.getElementById("Contact_Email").value.trim();
  var homeText = document.getElementById("Contact_Address").value.trim();
  var notesText = document.getElementById("Contact_Notes").value.trim();
  var groupText = document.getElementById("Contact_Group").value;
  var favCheck = document.getElementById("Contact_Fav").checked;
  var emergCheck = document.getElementById("Contact_Emerg").checked;

  if (!nameText) {
    alert("Please enter a name for the contact.");
    return;
  }

  if (!NAME_RULE.test(nameText)) {
    alert("Name should contain only letters and spaces (2-50 characters)");
    return;
  }

  if (!phoneText) {
    alert("Please enter a phone number.");
    return;
  }

  if (!PHONE_RULE.test(phoneText)) {
    alert("Please enter a valid Egyptian phone number (e.g., 01012345678)");
    return;
  }

  var cleanNew = normalizePhone(phoneText);

  for (var i = 0; i < allContacts.length; i++) {
    var row = allContacts[i];
    var cleanOld = normalizePhone(row.phone);
    var samePhone = cleanOld === cleanNew;
    var sameRow = !!(editId && row.id === editId);

    if (samePhone && !sameRow) {
      alert("A contact with this phone number already exists: " + row.name);
      return;
    }
  }

  if (emailText && !EMAIL_RULE.test(emailText)) {
    alert("Please enter a valid email address");
    return;
  }

  var formData = {
    name: nameText,
    phone: phoneText,
    email: emailText,
    address: homeText,
    notes: notesText,
    group: groupText,
    avatar: tempAvatar,
    isFavorite: favCheck,
    isEmergency: emergCheck,
  };

  if (editId) {
    updateContact(editId, formData);
    alert("Contact has been updated successfully.");
  } else {
    addContact(formData);
    alert("Contact has been added successfully.");
  }

  myModal.hide();
  refreshAll();
}

function readAvatar(event) {
  var fileData = event.target.files[0];
  if (!fileData) return;

  var reader = new FileReader();
  reader.onload = function () {
    tempAvatar = reader.result;
    document.getElementById("Avatar_Path").value = tempAvatar;
    document.getElementById("Avatar_Preview").innerHTML = '<img src="' + tempAvatar + '" alt="Avatar">';
  };
  reader.readAsDataURL(fileData);
}

function doSearch(event) {
  var word = event.target.value.trim();
  showContacts(searchContacts(word));
}

function changeFav(idText) {
  var item = findContact(idText);
  if (!item) return;

  item.isFavorite = !item.isFavorite;
  saveData();
  refreshAll();
}

function changeEmerg(idText) {
  var item = findContact(idText);
  if (!item) return;

  item.isEmergency = !item.isEmergency;
  saveData();
  refreshAll();
}

function editItem(idText) {
  openEdit(idText);
}

function deleteItem(idText) {
  var item = findContact(idText);
  if (!item) return;

  var sure = confirm("Are you sure you want to delete " + item.name + "?");
  if (!sure) return;

  deleteContact(idText);
  refreshAll();
  alert("Contact has been deleted.");
}

function checkName() {
  var box = document.getElementById("Contact_Name");
  var msg = document.getElementById("Name_Error");
  var text = box.value.trim();

  if (!text || NAME_RULE.test(text)) {
    msg.classList.add("d-none");
    box.style.borderColor = "#e5e7eb";
  } else {
    msg.classList.remove("d-none");
    box.style.borderColor = "red";
  }
}

function checkPhone() {
  var box = document.getElementById("Contact_Phone");
  var msg = document.getElementById("Phone_Error");
  var text = box.value.trim();

  if (!text || PHONE_RULE.test(text)) {
    msg.classList.add("d-none");
    box.style.borderColor = "#e5e7eb";
  } else {
    msg.classList.remove("d-none");
    box.style.borderColor = "red";
  }
}

function checkEmail() {
  var box = document.getElementById("Contact_Email");
  var msg = document.getElementById("Email_Error");
  var text = box.value.trim();

  if (!text || EMAIL_RULE.test(text)) {
    msg.classList.add("d-none");
    box.style.borderColor = "#e5e7eb";
  } else {
    msg.classList.remove("d-none");
    box.style.borderColor = "red";
  }
}

function startApp() {
  loadData();
  refreshAll();

  var modalBox = document.getElementById("Contact_Modal");
  myModal = new bootstrap.Modal(modalBox);

  document.getElementById("Add_Btn").addEventListener("click", openAdd);
  document.getElementById("Contact_Form").addEventListener("submit", submitForm);
  document.getElementById("Avatar_Input").addEventListener("change", readAvatar);
  document.getElementById("Search_Input").addEventListener("input", doSearch);
  document.getElementById("Contact_Name").addEventListener("input", checkName);
  document.getElementById("Contact_Phone").addEventListener("input", checkPhone);
  document.getElementById("Contact_Email").addEventListener("input", checkEmail);
}

window.changeFav = changeFav;
window.changeEmerg = changeEmerg;
window.editItem = editItem;
window.deleteItem = deleteItem;

startApp();