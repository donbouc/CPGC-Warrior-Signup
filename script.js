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
      
      // Load the current comment if there is one
      loadAdminComment();
    } else {
      alert("Wrong password");
    }
  };  document.getElementById("saveCommentBtn").onclick = async () => {
    const commentElement = document.getElementById("adminComment");
    if (!commentElement) {
      console.error("Comment textarea not found");
      alert("Error: Comment textarea not found");
      return;
    }
    
    const comment = commentElement.value.trim();
    console.log("Comment button clicked, saving:", comment);
    const success = await saveAdminComment(comment);
    
    if (success) {
      alert("Comment saved and displayed successfully!");
      // Force display update
      const commentBanner = document.getElementById("admin-comment-banner");
      const commentText = document.getElementById("admin-comment-text");
      
      if (comment) {
        // Use innerHTML with line break conversion for immediate display
        commentText.innerHTML = comment.replace(/\n/g, '<br>');
        commentBanner.style.display = "block";
      } else {
        commentBanner.style.display = "none";
      }
    }
  };

  document.getElementById("clearCommentBtn").onclick = async () => {
    const commentElement = document.getElementById("adminComment");
    if (commentElement) {
      commentElement.value = "";
    }
    await saveAdminComment("");
    alert("Comment cleared!");
    
    // Hide the banner
    const commentBanner = document.getElementById("admin-comment-banner");
    if (commentBanner) {
      commentBanner.style.display = "none";
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

// Function to save admin comment to Firestore
async function saveAdminComment(comment) {
  try {
    console.log("Saving comment:", comment);
    await setDoc(doc(db, "config", "comment"), { comment });
    console.log("Comment saved to Firestore");
    displayAdminComment(comment);
    return true;
  } catch (error) {
    console.error("Error saving comment:", error);
    alert("Error saving comment: " + error.message);
    return false;
  }
}

// Function to load admin comment from Firestore
async function loadAdminComment() {
  const commentDoc = await getDoc(doc(db, "config", "comment"));
  if (commentDoc.exists()) {
    const comment = commentDoc.data().comment;
    document.getElementById("adminComment").value = comment;
    displayAdminComment(comment);
  }
}

// Function to display the admin comment
function displayAdminComment(comment) {
  const commentBanner = document.getElementById("admin-comment-banner");
  const commentText = document.getElementById("admin-comment-text");
  
  // Debug output to console to verify the comment values
  console.log("Displaying comment:", comment);
  console.log("Comment elements:", commentBanner, commentText);
  
  if (comment && comment.trim() !== "") {
    // Use innerHTML to preserve line breaks
    commentText.innerHTML = comment.replace(/\n/g, '<br>');
    commentBanner.style.display = "block";
  } else {
    commentBanner.style.display = "none";
  }
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
  
  // Load admin comment - moved this part to ensure it loads properly
  try {
    const commentDoc = await getDoc(doc(db, "config", "comment"));
    console.log("Comment doc:", commentDoc.exists() ? commentDoc.data() : "No comment doc exists");
    if (commentDoc.exists()) {
      const comment = commentDoc.data().comment;
      // Set the textarea value if admin is logged in
      const adminComment = document.getElementById("adminComment");
      if (adminComment) adminComment.value = comment;
      
      // Display the comment
      displayAdminComment(comment);
    }
    
    // Validate comment elements regardless of whether a comment exists
    validateCommentElements();
  } catch (error) {
    console.error("Error loading comment:", error);
  }
  
  renderSlots();
  renderSignups();
}

// Function to validate comment UI elements
function validateCommentElements() {
  const banner = document.getElementById("admin-comment-banner");
  const text = document.getElementById("admin-comment-text");
  
  console.log("Validating UI elements:");
  console.log("- Banner exists:", !!banner);
  console.log("- Text element exists:", !!text);
  
  if (!banner) {
    console.error("Admin comment banner element is missing!");
  }
  
  if (!text) {
    console.error("Admin comment text element is missing!");
  }
}


// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadData();
});
