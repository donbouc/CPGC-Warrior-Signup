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
    
    // Create slot header container
    const slotHeader = document.createElement("div");
    slotHeader.className = "slot-header";
      const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = slot;
    checkbox.id = slot;
    
    // Add event listener to show/hide bird options when slot is checked/unchecked
    checkbox.addEventListener('change', function() {
      const birdOptions = this.closest('.slot').querySelector('.bird-options');
      if (this.checked) {
        birdOptions.style.display = 'flex';
      } else {
        birdOptions.style.display = 'none';
        // Uncheck all bird options when slot is unchecked
        document.querySelectorAll(`input[name="bird-${slot}"]`).forEach(cb => {
          cb.checked = false;
        });
      }
    });
    
    const label = document.createElement("label");
    label.htmlFor = slot;
    label.textContent = slot;
    
    slotHeader.appendChild(checkbox);
    slotHeader.appendChild(label);
    div.appendChild(slotHeader);
    
    // Add bird options container
    const birdOptionsDiv = document.createElement("div");
    birdOptionsDiv.className = "bird-options";
    birdOptionsDiv.style.display = 'none'; // Hidden by default
    
    // Create bird options (2-5)
    for (let i = 2; i <= 5; i++) {
      const birdDiv = document.createElement("div");
      birdDiv.className = "bird-option";
      
      const birdCheckbox = document.createElement("input");
      birdCheckbox.type = "checkbox";
      birdCheckbox.name = `bird-${slot}`;
      birdCheckbox.value = `${i} Bird`;
      birdCheckbox.id = `${slot}-${i}bird`;
      birdCheckbox.dataset.slot = slot;
      
      // Add event listener to ensure only one bird option can be selected per slot
      birdCheckbox.addEventListener('change', function() {
        if(this.checked) {
          // Uncheck all other bird options for this slot
          document.querySelectorAll(`input[name="bird-${slot}"]`).forEach(cb => {
            if (cb !== this) cb.checked = false;
          });
        }
      });
      
      const birdLabel = document.createElement("label");
      birdLabel.htmlFor = `${slot}-${i}bird`;
      birdLabel.textContent = `${i} Bird`;
      
      birdDiv.appendChild(birdCheckbox);
      birdDiv.appendChild(birdLabel);
      birdOptionsDiv.appendChild(birdDiv);
    }
    
    div.appendChild(birdOptionsDiv);
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
        slotTd.textContent = slot;        const nameTd = document.createElement("td");
        nameTd.textContent = entry.name;
        const birdTd = document.createElement("td");
        // Extract just the number from the bird option (e.g., "2 Bird" -> "2")
        if (entry.birdOption) {
          birdTd.textContent = entry.birdOption.split(" ")[0]; // Just get the number
        } else {
          birdTd.textContent = "";
        }
        const removeTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "Remove";
        btn.onclick = () => {
          signups[slot] = signups[slot].filter(e => e.name !== entry.name);
          updateDoc(doc(db, "signups", "data"), { data: signups });
          renderSignups();
        };        removeTd.appendChild(btn);
        const timeTd = document.createElement("td");
        
        // Handle both formats: full timestamp from older entries and date-only from newer entries
        if (entry.time && entry.time.includes(' ')) {
          // If it's the old format (contains spaces like in a full timestamp), extract just the date part
          const dateParts = entry.time.split(',')[0].split('/');
          if (dateParts.length >= 3) {
            timeTd.textContent = dateParts[0] + '/' + dateParts[1] + '/' + dateParts[2];
          } else {
            timeTd.textContent = entry.time; // Fallback to original if parsing fails
          }
        } else {
          // Already in the new date-only format or unknown
          timeTd.textContent = entry.time || '';
        }
        
        // Add columns in the requested order
        row.appendChild(slotTd);
        row.appendChild(nameTd);
        row.appendChild(birdTd);     // Bird Tee column moved right after Name
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
      td.colSpan = 5; // Column span remains 5 as we still have 5 columns
      td.className = "slot-divider";
      spacer.appendChild(td);
      signupList.appendChild(spacer);
    }
  }
  emptyMessage.style.display = anySignups ? "none" : "block";
}

function setupEventListeners() {  document.getElementById("submitSignup").onclick = async () => {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("Enter your name");
    
    // Check if any slots are selected
    const selectedSlots = document.querySelectorAll(".slot input[type=checkbox]:checked");
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot");
      return;
    }
      const currentDate = new Date();
    // Format the date as MM/DD/YYYY (without time)
    const dateStr = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
    
    selectedSlots.forEach(cb => {
      const slot = cb.value;
      if (!signups[slot]) signups[slot] = [];
      
      // Find if any bird option is selected for this slot
      let birdOption = null;
      document.querySelectorAll(`input[name="bird-${slot}"]:checked`).forEach(birdCb => {
        birdOption = birdCb.value;
      });
      
      signups[slot].push({ name, time: dateStr, birdOption });
    });
    
    await setDoc(doc(db, "signups", "data"), { data: signups });
    renderSignups();
    
    // Reinitialize the form after successful submission
    document.getElementById("name").value = ""; // Clear the name field
    
    // Uncheck all slot checkboxes
    document.querySelectorAll(".slot input[type=checkbox]:checked").forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Hide all bird option sections
    document.querySelectorAll(".bird-options").forEach(birdSection => {
      birdSection.style.display = 'none';
    });
    
    // Uncheck all bird option checkboxes
    document.querySelectorAll(".bird-option input[type=checkbox]:checked").forEach(birdCheckbox => {
      birdCheckbox.checked = false;
    });
    
    // Show success message
    alert("Signup submitted successfully!");
  };  document.getElementById("adminLoginBtn").onclick = () => {
    const pass = document.getElementById("adminPass").value;
    if (pass === "golf2025") {
      document.getElementById("admin-panel").style.display = "block";
      document.getElementById("adminLoginArea").style.display = "none";
      
      // Load the current comment if there is one
      loadAdminComment();
      
      // Update the slots textarea placeholder
      document.getElementById("slotsInput").placeholder = "Enter new slots to add, one per line";
      
      // Render the slot management interface
      renderSlotManager();
      
      // Add event handler for the sort slots button
      document.getElementById("sortSlotsBtn").onclick = async function() {
        if (slots.length <= 1) {
          alert("No slots to sort or only one slot available.");
          return;
        }
        
        // Sort the slots alphabetically
        slots.sort();
        
        // Save to database
        await setDoc(doc(db, "config", "slots"), { slots });
        
        // Update UI
        renderSlots();
        renderSignups();
        renderSlotManager();
        
        alert("Slots sorted alphabetically.");
      };
    } else {
      alert("Wrong password");
    }
  };document.getElementById("saveCommentBtn").onclick = async () => {
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
  };  document.getElementById("applyChangesBtn").onclick = async () => {
    const week = document.getElementById("weekInput").value;
    if (week) {
      document.getElementById("heading").textContent = `Warrior Tee Time Signups for the Week of ${week}`;
      await setDoc(doc(db, "config", "week"), { week });
      
      // Also check if there are any new slots to add
      const newSlotInput = document.getElementById("slotsInput").value.trim();
      if (newSlotInput) {
        const newSlots = newSlotInput.split("\n").map(s => s.trim()).filter(Boolean);
        if (newSlots.length > 0) {
          // Create a Set to remove any duplicates when combining existing and new slots
          const uniqueSlots = new Set([...slots, ...newSlots]);
          slots = Array.from(uniqueSlots);
          
          // Save to database
          await setDoc(doc(db, "config", "slots"), { slots });
          
          // Update UI
          renderSlots();
          renderSignups();
          renderSlotManager();
          
          // Clear the input field
          document.getElementById("slotsInput").value = "";
        }
      }
      
      alert("Changes applied successfully!");
    } else {
      alert("Please enter a week date.");
    }
  };
    // Add new slots button - adds slots without clearing existing ones
  document.getElementById("addSlotsBtn").onclick = async () => {
    const newSlotInput = document.getElementById("slotsInput").value.trim();
    if (!newSlotInput) {
      alert("Please enter slot dates to add");
      return;
    }
    
    const newSlots = newSlotInput.split("\n").map(s => s.trim()).filter(Boolean);
    if (newSlots.length > 0) {
      // Create a Set to remove any duplicates when combining existing and new slots
      const uniqueSlots = new Set([...slots, ...newSlots]);
      slots = Array.from(uniqueSlots);
      
      // Save to database
      await setDoc(doc(db, "config", "slots"), { slots });
      
      // Update UI
      renderSlots();
      renderSignups();
      renderSlotManager();
      
      // Clear the input field
      document.getElementById("slotsInput").value = "";
      
      alert(`${newSlots.length} slot(s) added successfully!`);
    }
  };
  
  // Clear all slots button
  document.getElementById("clearSlotsBtn").onclick = async () => {
    const confirmed = confirm("Are you sure you want to clear ALL slot dates? This cannot be undone.");
    if (confirmed) {
      slots = [];
      await setDoc(doc(db, "config", "slots"), { slots });
      renderSlots();
      renderSignups();
      renderSlotManager();
      alert("All slots have been cleared.");
    }
  };
  
  // Render the slot management interface
  function renderSlotManager() {
    const slotList = document.getElementById("slotList");
    if (!slotList) return; // Not in admin mode
    
    slotList.innerHTML = "";
    
    if (slots.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-slot-list";
      emptyMessage.textContent = "No slots defined yet. Add slots using the form above.";
      slotList.appendChild(emptyMessage);
      return;
    }
    
    // Create slot items
    slots.forEach((slotText, index) => {
      const slotItem = document.createElement("div");
      slotItem.className = "slot-item";
      slotItem.dataset.index = index;
      slotItem.draggable = true;
      
      // Drag events for reordering
      slotItem.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', index);
        this.classList.add('dragging');
      });
      
      slotItem.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
      
      slotItem.addEventListener('dragover', function(e) {
        e.preventDefault();
      });
      
      slotItem.addEventListener('drop', async function(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(this.dataset.index);
        
        if (fromIndex !== toIndex) {
          // Reorder the slots array
          const movedSlot = slots[fromIndex];
          slots.splice(fromIndex, 1);
          slots.splice(toIndex, 0, movedSlot);
          
          // Save to database
          await setDoc(doc(db, "config", "slots"), { slots });
          
          // Update UI
          renderSlots();
          renderSignups();
          renderSlotManager();
        }
      });
      
      // Drag handle
      const dragHandle = document.createElement("div");
      dragHandle.className = "slot-drag-handle";
      dragHandle.innerHTML = "&#9776;"; // Unicode hamburger menu icon
      slotItem.appendChild(dragHandle);
      
      // Slot name (editable)
      const slotName = document.createElement("div");
      slotName.className = "slot-name";
      slotName.textContent = slotText;
      slotName.title = "Click to edit";
      
      // Make slot name editable on click
      slotName.addEventListener('click', function() {
        this.contentEditable = true;
        this.classList.add('editing');
        this.focus();
      });
        slotName.addEventListener('blur', async function() {
        this.contentEditable = false;
        this.classList.remove('editing');
        
        const newValue = this.textContent.trim();
        if (newValue && newValue !== slotText) {
          // Check if the new slot name already exists
          if (slots.includes(newValue)) {
            alert(`A slot named "${newValue}" already exists. Please choose a different name.`);
            this.textContent = slotText; // Restore original
            return;
          }
          
          // Transfer any existing signups to the new slot name
          if (signups[slotText] && signups[slotText].length > 0) {
            const confirmed = confirm(`Do you want to transfer existing signups to the renamed slot? If you choose "Cancel", signups for this slot will be deleted.`);
            
            if (confirmed) {
              // Transfer signups to the new slot name
              signups[newValue] = [...(signups[slotText] || [])];
            }
            
            // Always delete the old slot signups
            delete signups[slotText];
            
            // Update signups in the database
            await setDoc(doc(db, "signups", "data"), { data: signups });
          }
          
          // Update the slot name in the slots array
          slots[index] = newValue;
          
          // Save updated slots to database
          await setDoc(doc(db, "config", "slots"), { slots });
          
          // Update UI
          renderSlots();
          renderSignups();
          renderSlotManager();
        } else {
          this.textContent = slotText; // Restore original if empty
        }
      });
      
      slotName.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.blur();
        }
      });
      
      slotItem.appendChild(slotName);
      
      // Action buttons container
      const actions = document.createElement("div");
      actions.className = "slot-actions";
      
      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "slot-edit-btn";
      editBtn.innerHTML = "✎"; // Unicode edit icon
      editBtn.title = "Edit";
      editBtn.onclick = function() {
        slotName.click(); // Trigger the click event on slotName
      };
      actions.appendChild(editBtn);
      
      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "slot-delete-btn";
      deleteBtn.innerHTML = "✕"; // Unicode X icon
      deleteBtn.title = "Delete";      deleteBtn.onclick = async function() {
        // Check if the slot has any signups
        const hasSignups = signups[slotText] && signups[slotText].length > 0;
        
        let confirmMessage = `Are you sure you want to delete slot "${slotText}"?`;
        if (hasSignups) {
          confirmMessage += `\n\nThis slot has ${signups[slotText].length} signup(s) that will also be deleted.`;
        }
        
        const confirmed = confirm(confirmMessage);
        if (confirmed) {
          // Remove the slot from the slots array
          slots.splice(index, 1);
          
          // Also remove any associated signups
          if (hasSignups) {
            delete signups[slotText];
            // Update signups in the database
            await setDoc(doc(db, "signups", "data"), { data: signups });
          }
          
          // Save updated slots to database
          await setDoc(doc(db, "config", "slots"), { slots });
          
          // Update UI
          renderSlots();
          renderSignups();
          renderSlotManager();
        }
      };
      actions.appendChild(deleteBtn);
      
      slotItem.appendChild(actions);
      slotList.appendChild(slotItem);
    });
  }

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
    
  // If admin panel is visible, update the slot management interface
  if (document.getElementById("admin-panel").style.display === "block") {
    document.getElementById("slotsInput").placeholder = "Enter new slots to add, one per line";
    renderSlotManager();
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
  
  // Add event handlers for drag and drop to enable slot reordering
  document.addEventListener('dragover', function(e) {
    e.preventDefault(); // Allow drop
  });
});
