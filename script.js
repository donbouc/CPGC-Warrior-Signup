import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkzOIxvCGnyL24kVT6GwJT_yicPbVh48A",
  authDomain: "cpgc-warrior-signups.firebaseapp.com",
  projectId: "cpgc-warrior-signups",
  storageBucket: "cpgc-warrior-signups.appspot.com",
  messagingSenderId: "904508301160",
  appId: "1:904508301160:web:16a551caeabee2ebf140dd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let slots = [];
let signups = {};

function renderSlots() {
  const slotSection = document.getElementById("slot-section");
  slotSection.innerHTML = "";
  slots.forEach(slot => {
    const div = document.createElement("div");
    div.className = "slot";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = slot;
    checkbox.id = slot;
    const label = document.createElement("label");
    label.htmlFor = slot;
    label.textContent = slot;
    div.appendChild(checkbox);
    div.appendChild(label);
    slotSection.appendChild(div);
  });
}

function renderSignups() {
  const signupList = document.getElementById("signupList");
  const emptyMessage = document.getElementById("emptyMessage");
  
  signupList.innerHTML = "";
  let anySignups = false;
  for (const slot of slots) {
    let rowsAdded = false;
    if (signups[slot]) {
      signups[slot].forEach(entry => {
        const row = document.createElement("tr");
        const slotTd = document.createElement("td");
        slotTd.textContent = slot;
        const nameTd = document.createElement("td");
        nameTd.textContent = entry.name;
        const removeTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "Remove";
        btn.onclick = () => {
          signups[slot] = signups[slot].filter(e => e.name !== entry.name);
          updateDoc(doc(db, "signups", "data"), { data: signups });
          renderSignups();
        };
        removeTd.appendChild(btn);
        const timeTd = document.createElement("td");
        timeTd.textContent = entry.time;
        row.appendChild(slotTd);
        row.appendChild(nameTd);
        row.appendChild(removeTd);
        row.appendChild(timeTd);
        signupList.appendChild(row);
        rowsAdded = true;
        anySignups = true;
      });
    }
    if (rowsAdded) {
      const spacer = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.className = "slot-divider";
      spacer.appendChild(td);
      signupList.appendChild(spacer);
    }
  }
  emptyMessage.style.display = anySignups ? "none" : "block";
}

function setupEventListeners() {
  document.getElementById("submitSignup").onclick = async () => {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("Enter your name");
    const now = new Date().toLocaleString();
    document.querySelectorAll("input[type=checkbox]:checked").forEach(cb => {
      if (!signups[cb.value]) signups[cb.value] = [];
      signups[cb.value].push({ name, time: now });
    });
    await setDoc(doc(db, "signups", "data"), { data: signups });
    renderSignups();
  };

  document.getElementById("adminLoginBtn").onclick = () => {
    const pass = document.getElementById("adminPass").value;
    if (pass === "golf2025") {
      document.getElementById("admin-panel").style.display = "block";
      document.getElementById("adminLoginArea").style.display = "none";
    } else {
      alert("Wrong password");
    }
  };

  document.getElementById("applyChangesBtn").onclick = async () => {
    const week = document.getElementById("weekInput").value;
    const newSlots = document.getElementById("slotsInput").value.trim().split("\n").map(s => s.trim()).filter(Boolean);
    if (week) {
      document.getElementById("heading").textContent = `Warrior Tee Time Signups for the Week of ${week}`;
      await setDoc(doc(db, "config", "week"), { week });
    }
    if (newSlots.length > 0) {
      slots = newSlots;
      await setDoc(doc(db, "config", "slots"), { slots });
      renderSlots();
      renderSignups();
    }
  };

  document.getElementById("deleteAllBtn").onclick = async () => {
    const confirmed = confirm("Are you sure you want to delete all signups?");
    if (!confirmed) return;
    signups = {};
    await setDoc(doc(db, "signups", "data"), { data: signups });
    renderSignups();
    alert("All signups deleted.");
  };
}

async function loadData() {
  const weekDoc = await getDoc(doc(db, "config", "week"));
  if (weekDoc.exists()) {
    const week = weekDoc.data().week;
    document.getElementById("heading").textContent = `Warrior Tee Time Signups for the Week of ${week}`;
    document.getElementById("weekInput").value = week;
  }
  const slotDoc = await getDoc(doc(db, "config", "slots"));
  if (slotDoc.exists()) {
    slots = slotDoc.data().slots;
  } else {
    slots = [];
  }
  const signupDoc = await getDoc(doc(db, "signups", "data"));
  if (signupDoc.exists()) {
    signups = signupDoc.data().data || {};
  }
  renderSlots();
  renderSignups();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadData();
});
