
// Global variables
let currentUser = null
let isAdmin = false
const notifications = []

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    initializeApp()
    setupEventListeners()
})

function initializeApp() {
    console.log("Initializing app...")
    
    // Initialize sample users if not exists
    if (!localStorage.getItem("users")) {
        console.log("Creating sample users...")
        const sampleUsers = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                phone: "1234567890",
                password: "password123",
                joinDate: new Date().toISOString(),
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "0987654321",
                password: "password123",
                joinDate: new Date().toISOString(),
            },
        ]
        localStorage.setItem("users", JSON.stringify(sampleUsers))
        console.log("Sample users created:", sampleUsers)
    }

    // Initialize admin user
    if (!localStorage.getItem("admin")) {
        console.log("Creating admin user...")
        const admin = {
            email: "admin@college.edu",
            password: "admin123",
        }
        localStorage.setItem("admin", JSON.stringify(admin))
        console.log("Admin user created:", admin)
    }

    // Initialize empty arrays for data
    if (!localStorage.getItem("lostItems")) {
        localStorage.setItem("lostItems", JSON.stringify([]))
    }
    if (!localStorage.getItem("marketplaceItems")) {
        localStorage.setItem("marketplaceItems", JSON.stringify([]))
    }
    if (!localStorage.getItem("notes")) {
        localStorage.setItem("notes", JSON.stringify([]))
    }
    if (!localStorage.getItem("notifications")) {
        localStorage.setItem("notifications", JSON.stringify([]))
    }

    // Initialize sample data
    initializeSampleData()

    // Check if user is logged in
    const savedUser = localStorage.getItem("currentUser")
    const savedIsAdmin = localStorage.getItem("isAdmin")

    console.log("Checking saved login:", { savedUser, savedIsAdmin })

    if (savedUser) {
        currentUser = JSON.parse(savedUser)
        isAdmin = savedIsAdmin === "true"
        console.log("User already logged in:", { currentUser, isAdmin })
        showDashboard()
    }
}

function setupEventListeners() {
    // Navigation
    document.getElementById("hamburger").addEventListener("click", toggleMobileMenu)

    // Forms
    document.getElementById("loginForm").addEventListener("submit", handleLogin)
    document.getElementById("signupForm").addEventListener("submit", handleSignup)
    document.getElementById("postLostItemForm").addEventListener("submit", handlePostLostItem)
    document.getElementById("postSaleItemForm").addEventListener("submit", handlePostSaleItem)
    document.getElementById("uploadNotesForm").addEventListener("submit", handleUploadNotes)

    // Contact form
    const contactForm = document.getElementById("contactForm")
    if (contactForm) {
        contactForm.addEventListener("submit", handleContactForm)
    }

    // FAQ toggle functionality
    setupFAQToggles()

    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none"
        }
    })
}

function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll(".faq-question")
    faqQuestions.forEach((question) => {
        question.addEventListener("click", () => {
            const faqItem = question.parentElement
            const answer = faqItem.querySelector(".faq-answer")
            const icon = question.querySelector("i")

            // Toggle answer visibility
            if (answer.style.display === "block") {
                answer.style.display = "none"
                icon.style.transform = "rotate(0deg)"
            } else {
                answer.style.display = "block"
                icon.style.transform = "rotate(180deg)"
            }
        })
    })
}

function handleContactForm(e) {
    e.preventDefault()

    const firstName = document.getElementById("contactFirstName").value
    const lastName = document.getElementById("contactLastName").value
    const email = document.getElementById("contactEmail").value
    const subject = document.getElementById("contactSubject").value
    const message = document.getElementById("contactMessage").value

    // Simulate form submission
    alert(`Thank you ${firstName}! Your message has been sent successfully. We'll get back to you within 24 hours.`)

    // Reset form
    e.target.reset()
}

// Navigation functions
function toggleMobileMenu() {
    const navMenu = document.getElementById("nav-menu")
    navMenu.classList.toggle("active")
}

function showLogin() {
    document.getElementById("loginModal").style.display = "block"
    closeModal("signupModal")
}

function showSignup() {
    document.getElementById("signupModal").style.display = "block"
    closeModal("loginModal")
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none"
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value.trim()
    const password = document.getElementById("loginPassword").value.trim()
    const adminLogin = document.getElementById("isAdmin").checked

    console.log("Login attempt:", { email, adminLogin })

    if (!email || !password) {
        alert("Please enter both email and password")
        return
    }

    if (adminLogin) {
        const admin = JSON.parse(localStorage.getItem("admin"))
        console.log("Admin credentials:", admin)
        if (email === admin.email && password === admin.password) {
            isAdmin = true
            currentUser = { name: "Admin", email: admin.email }
            localStorage.setItem("currentUser", JSON.stringify(currentUser))
            localStorage.setItem("isAdmin", "true")
            console.log("Admin login successful, showing dashboard")
            try {
                showDashboard()
                closeModal("loginModal")
                addNotification("Admin logged in", "system")
            } catch (error) {
                console.error("Error showing dashboard:", error)
                alert("Error loading dashboard. Please try again.")
            }
        } else {
            alert("Invalid admin credentials. Please use:\nEmail: admin@college.edu\nPassword: admin123")
        }
    } else {
        const users = JSON.parse(localStorage.getItem("users"))
        const user = users.find((u) => u.email === email && u.password === password)

        console.log("User login attempt:", { email, foundUser: !!user })

        if (user) {
            isAdmin = false
            currentUser = user
            localStorage.setItem("currentUser", JSON.stringify(currentUser))
            localStorage.setItem("isAdmin", "false")
            console.log("User login successful, showing dashboard")
            try {
                showDashboard()
                closeModal("loginModal")
                addNotification(`${user.name} logged in`, "system")
            } catch (error) {
                console.error("Error showing dashboard:", error)
                alert("Error loading dashboard. Please try again.")
            }
        } else {
            alert("Invalid credentials. Please use:\nEmail: john@example.com\nPassword: password123")
        }
    }
}

function handleSignup(e) {
    e.preventDefault()

    const name = document.getElementById("signupName").value
    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value
    const phone = document.getElementById("signupPhone").value

    const users = JSON.parse(localStorage.getItem("users"))

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
        alert("User already exists with this email")
        return
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        joinDate: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    addNotification(`New user registered: ${name}`, "user")
    alert("Account created successfully! Please login.")
    closeModal("signupModal")
    showLogin()
}

function logout() {
    if (currentUser) {
        addNotification(`${currentUser.name} logged out`, "system")
    }
    currentUser = null
    isAdmin = false
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isAdmin")

    // Hide dashboards and show home
    const userDashboard = document.getElementById("userDashboard")
    const adminDashboard = document.getElementById("adminDashboard")
    const navbar = document.querySelector(".navbar")
    const hero = document.querySelector(".hero")
    const features = document.querySelector(".features")
    const about = document.querySelector(".about")
    const contact = document.querySelector(".contact")

    if (userDashboard) userDashboard.style.display = "none"
    if (adminDashboard) adminDashboard.style.display = "none"
    if (navbar) navbar.style.display = "block"
    if (hero) hero.style.display = "block"
    if (features) features.style.display = "block"
    if (about) about.style.display = "block"
    if (contact) contact.style.display = "block"
}

function showDashboard() {
    try {
        // Hide all main sections
        const hero = document.querySelector(".hero")
        const features = document.querySelector(".features")
        const about = document.querySelector(".about")
        const contact = document.querySelector(".contact")
        const navbar = document.querySelector(".navbar")

        if (hero) hero.style.display = "none"
        if (features) features.style.display = "none"
        if (about) about.style.display = "none"
        if (contact) contact.style.display = "none"
        if (navbar) navbar.style.display = "none"

        if (isAdmin) {
            const adminDashboard = document.getElementById("adminDashboard")
            const userDashboard = document.getElementById("userDashboard")
            
            if (adminDashboard) adminDashboard.style.display = "flex"
            if (userDashboard) userDashboard.style.display = "none"
            loadAdminDashboard()
            updateNotificationBadge()
        } else {
            const userDashboard = document.getElementById("userDashboard")
            const adminDashboard = document.getElementById("adminDashboard")
            const userName = document.getElementById("userName")
            
            if (userDashboard) userDashboard.style.display = "flex"
            if (adminDashboard) adminDashboard.style.display = "none"
            if (userName && currentUser) userName.textContent = currentUser.name
            loadUserDashboard()
        }
    } catch (error) {
        console.error("Error showing dashboard:", error)
        alert("Error loading dashboard. Please try refreshing the page.")
    }
}

// Tab functions
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll(".tab-content")
    tabContents.forEach((tab) => tab.classList.remove("active"))

    // Remove active class from all nav items
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => item.classList.remove("active"))

    // Show selected tab
    document.getElementById(tabName).classList.add("active")

    // Add active class to clicked nav item
    event.target.classList.add("active")

    // Load specific tab data
    if (tabName === "lost-found-user") {
        loadLostFoundItems()
    } else if (tabName === "marketplace-user") {
        loadMarketplaceItems()
    } else if (tabName === "notes-user") {
        loadNotes()
    } else if (tabName === "users-management") {
        loadUsersManagement()
    } else if (tabName === "pending-approvals") {
        loadPendingApprovals()
    } else if (tabName === "content-management") {
        loadContentManagement()
    }
}

// User Dashboard functions
function loadUserDashboard() {
    updateUserStats()
    loadLostFoundItems()
    loadMarketplaceItems()
    loadNotes()
}

function updateUserStats() {
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const marketplaceItems = JSON.parse(localStorage.getItem("marketplaceItems"))
    const notes = JSON.parse(localStorage.getItem("notes"))

    const userLostItems = lostItems.filter((item) => item.userId === currentUser.id)
    const userSaleItems = marketplaceItems.filter((item) => item.userId === currentUser.id)
    const userNotes = notes.filter((note) => note.userId === currentUser.id)

    document.getElementById("userLostItems").textContent = userLostItems.length
    document.getElementById("userSaleItems").textContent = userSaleItems.length
    document.getElementById("userNotes").textContent = userNotes.length
}

// Lost & Found functions
function showPostLostItem() {
    document.getElementById("postLostItemModal").style.display = "block"
}

function handlePostLostItem(e) {
    e.preventDefault()

    const title = document.getElementById("lostItemTitle").value
    const description = document.getElementById("lostItemDescription").value
    const location = document.getElementById("lostItemLocation").value
    const imageFile = document.getElementById("lostItemImage").files[0]

    const lostItems = JSON.parse(localStorage.getItem("lostItems"))

    const newItem = {
        id: Date.now(),
        title,
        description,
        location,
        userId: currentUser.id,
        userName: currentUser.name,
        userContact: currentUser.phone,
        status: "pending",
        datePosted: new Date().toISOString(),
        image: imageFile ? URL.createObjectURL(imageFile) : null,
    }

    lostItems.push(newItem)
    localStorage.setItem("lostItems", JSON.stringify(lostItems))

    // Add notification for admin
    addNotification(`New lost item reported: ${title}`, "lost-found", newItem.id)

    alert("Item posted successfully! Waiting for admin approval.")
    closeModal("postLostItemModal")
    document.getElementById("postLostItemForm").reset()
    updateUserStats()
}

function loadLostFoundItems() {
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const approvedItems = lostItems.filter((item) => item.status === "approved")

    const container = document.getElementById("lostItemsList")
    container.innerHTML = ""

    if (approvedItems.length === 0) {
        container.innerHTML = '<p class="text-center">No lost items found.</p>'
        return
    }

    approvedItems.forEach((item) => {
        const itemCard = createItemCard(item, "lost")
        container.appendChild(itemCard)
    })
}

function searchLostItems() {
    const searchTerm = document.getElementById("lostItemSearch").value.toLowerCase()
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const filteredItems = lostItems.filter(
        (item) =>
            item.status === "approved" &&
            (item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)),
    )

    const container = document.getElementById("lostItemsList")
    container.innerHTML = ""

    if (filteredItems.length === 0) {
        container.innerHTML = '<p class="text-center">No items found matching your search.</p>'
        return
    }

    filteredItems.forEach((item) => {
        const itemCard = createItemCard(item, "lost")
        container.appendChild(itemCard)
    })
}

// Marketplace functions
function showPostSaleItem() {
    document.getElementById("postSaleItemModal").style.display = "block"
}

function handlePostSaleItem(e) {
    e.preventDefault()

    const title = document.getElementById("saleItemTitle").value
    const description = document.getElementById("saleItemDescription").value
    const price = document.getElementById("saleItemPrice").value
    const contact = document.getElementById("saleItemContact").value
    const imageFile = document.getElementById("saleItemImage").files[0]

    const marketplaceItems = JSON.parse(localStorage.getItem("marketplaceItems"))

    const newItem = {
        id: Date.now(),
        title,
        description,
        price: Number.parseFloat(price),
        contact,
        userId: currentUser.id,
        userName: currentUser.name,
        datePosted: new Date().toISOString(),
        image: imageFile ? URL.createObjectURL(imageFile) : null,
    }

    marketplaceItems.push(newItem)
    localStorage.setItem("marketplaceItems", JSON.stringify(marketplaceItems))

    alert("Item posted successfully!")
    closeModal("postSaleItemModal")
    document.getElementById("postSaleItemForm").reset()
    updateUserStats()
    loadMarketplaceItems()
}

function loadMarketplaceItems() {
    const marketplaceItems = JSON.parse(localStorage.getItem("marketplaceItems"))

    const container = document.getElementById("marketplaceList")
    container.innerHTML = ""

    if (marketplaceItems.length === 0) {
        container.innerHTML = '<p class="text-center">No items for sale.</p>'
        return
    }

    marketplaceItems.forEach((item) => {
        const itemCard = createItemCard(item, "marketplace")
        container.appendChild(itemCard)
    })
}

function searchMarketplace() {
    const searchTerm = document.getElementById("marketplaceSearch").value.toLowerCase()
    const marketplaceItems = JSON.parse(localStorage.getItem("marketplaceItems"))
    const filteredItems = marketplaceItems.filter(
        (item) => item.title.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm),
    )

    const container = document.getElementById("marketplaceList")
    container.innerHTML = ""

    if (filteredItems.length === 0) {
        container.innerHTML = '<p class="text-center">No items found matching your search.</p>'
        return
    }

    filteredItems.forEach((item) => {
        const itemCard = createItemCard(item, "marketplace")
        container.appendChild(itemCard)
    })
}

// Notes functions
function showUploadNotes() {
    document.getElementById("uploadNotesModal").style.display = "block"
}

function handleUploadNotes(e) {
    e.preventDefault()

    const title = document.getElementById("notesTitle").value
    const subject = document.getElementById("notesSubject").value
    const semester = document.getElementById("notesSemester").value
    const description = document.getElementById("notesDescription").value
    const file = document.getElementById("notesFile").files[0]

    if (!file) {
        alert("Please select a file to upload.")
        return
    }

    const notes = JSON.parse(localStorage.getItem("notes"))

    const newNote = {
        id: Date.now(),
        title,
        subject,
        semester,
        description,
        userId: currentUser.id,
        userName: currentUser.name,
        status: "pending",
        dateUploaded: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
    }

    notes.push(newNote)
    localStorage.setItem("notes", JSON.stringify(notes))

    // Add notification for admin
    addNotification(`New notes uploaded: ${title}`, "notes", newNote.id)

    alert("Notes uploaded successfully! Waiting for admin approval.")
    closeModal("uploadNotesModal")
    document.getElementById("uploadNotesForm").reset()
    updateUserStats()
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("notes"))
    const approvedNotes = notes.filter((note) => note.status === "approved")

    const container = document.getElementById("notesList")
    container.innerHTML = ""

    if (approvedNotes.length === 0) {
        container.innerHTML = '<p class="text-center">No notes available.</p>'
        return
    }

    approvedNotes.forEach((note) => {
        const noteCard = createItemCard(note, "notes")
        container.appendChild(noteCard)
    })
}

function filterNotes() {
    const semester = document.getElementById("semesterFilter").value
    const subject = document.getElementById("subjectFilter").value.toLowerCase()

    const notes = JSON.parse(localStorage.getItem("notes"))
    let filteredNotes = notes.filter((note) => note.status === "approved")

    if (semester) {
        filteredNotes = filteredNotes.filter((note) => note.semester === semester)
    }

    if (subject) {
        filteredNotes = filteredNotes.filter(
            (note) => note.subject.toLowerCase().includes(subject) || note.title.toLowerCase().includes(subject),
        )
    }

    const container = document.getElementById("notesList")
    container.innerHTML = ""

    if (filteredNotes.length === 0) {
        container.innerHTML = '<p class="text-center">No notes found matching your criteria.</p>'
        return
    }

    filteredNotes.forEach((note) => {
        const noteCard = createItemCard(note, "notes")
        container.appendChild(noteCard)
    })
}

// Admin Dashboard functions
function loadAdminDashboard() {
    updateAdminStats()
    loadUsersManagement()
    loadPendingApprovals()
    loadContentManagement()
    loadRecentNotifications()
}

function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem("users"))
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const notes = JSON.parse(localStorage.getItem("notes"))

    const pendingItems = lostItems.filter((item) => item.status === "pending").length
    const pendingNotes = notes.filter((note) => note.status === "pending").length
    const approvedItems =
        lostItems.filter((item) => item.status === "approved").length +
        notes.filter((note) => note.status === "approved").length

    document.getElementById("totalUsers").textContent = users.length
    document.getElementById("pendingApprovals").textContent = pendingItems + pendingNotes
    document.getElementById("approvedItems").textContent = approvedItems

    // Update pending count badge
    const pendingCount = pendingItems + pendingNotes
    document.getElementById("pendingCount").textContent = pendingCount

    if (pendingCount > 0) {
        document.getElementById("pendingCount").style.display = "block"
    } else {
        document.getElementById("pendingCount").style.display = "none"
    }
}

function loadUsersManagement() {
    const users = JSON.parse(localStorage.getItem("users"))
    const tbody = document.getElementById("usersTableBody")
    tbody.innerHTML = ""

    users.forEach((user) => {
        const row = document.createElement("tr")
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${new Date(user.joinDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `
        tbody.appendChild(row)
    })
}

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        const users = JSON.parse(localStorage.getItem("users"))
        const user = users.find((u) => u.id === userId)
        const updatedUsers = users.filter((user) => user.id !== userId)
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        addNotification(`User deleted: ${user.name}`, "user")
        loadUsersManagement()
        updateAdminStats()
    }
}

function loadPendingApprovals() {
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const notes = JSON.parse(localStorage.getItem("notes"))

    const pendingLostItems = lostItems.filter((item) => item.status === "pending")
    const pendingNotes = notes.filter((note) => note.status === "pending")

    // Update counts
    document.getElementById("pendingLostCount").textContent = `${pendingLostItems.length} pending`
    document.getElementById("pendingNotesCount").textContent = `${pendingNotes.length} pending`

    // Load pending lost items
    const lostItemsContainer = document.getElementById("pendingLostItems")
    lostItemsContainer.innerHTML = ""

    if (pendingLostItems.length === 0) {
        lostItemsContainer.innerHTML = "<p>No pending lost items.</p>"
    } else {
        pendingLostItems.forEach((item) => {
            const approvalCard = createApprovalCard(item, "lostItem")
            lostItemsContainer.appendChild(approvalCard)
        })
    }

    // Load pending notes
    const notesContainer = document.getElementById("pendingNotes")
    notesContainer.innerHTML = ""

    if (pendingNotes.length === 0) {
        notesContainer.innerHTML = "<p>No pending notes.</p>"
    } else {
        pendingNotes.forEach((note) => {
            const approvalCard = createApprovalCard(note, "note")
            notesContainer.appendChild(approvalCard)
        })
    }
}

function loadContentManagement() {
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    const notes = JSON.parse(localStorage.getItem("notes"))

    // Load all lost items
    const lostItemsContainer = document.getElementById("allLostItems")
    lostItemsContainer.innerHTML = ""

    if (lostItems.length === 0) {
        lostItemsContainer.innerHTML = "<p>No lost items.</p>"
    } else {
        lostItems.forEach((item) => {
            const contentCard = createContentCard(item, "lostItem")
            lostItemsContainer.appendChild(contentCard)
        })
    }

    // Load all notes
    const notesContainer = document.getElementById("allNotes")
    notesContainer.innerHTML = ""

    if (notes.length === 0) {
        notesContainer.innerHTML = "<p>No notes.</p>"
    } else {
        notes.forEach((note) => {
            const contentCard = createContentCard(note, "note")
            notesContainer.appendChild(contentCard)
        })
    }
}

// Approval functions
function approveItem(itemId, type) {
    if (type === "lostItem") {
        const lostItems = JSON.parse(localStorage.getItem("lostItems"))
        const item = lostItems.find((item) => item.id === itemId)
        if (item) {
            item.status = "approved"
            localStorage.setItem("lostItems", JSON.stringify(lostItems))
            addNotification(`Lost item approved: ${item.title}`, "approval")
        }
    } else if (type === "note") {
        const notes = JSON.parse(localStorage.getItem("notes"))
        const note = notes.find((note) => note.id === itemId)
        if (note) {
            note.status = "approved"
            localStorage.setItem("notes", JSON.stringify(notes))
            addNotification(`Notes approved: ${note.title}`, "approval")
        }
    }

    loadPendingApprovals()
    updateAdminStats()
    updateNotificationBadge()
    alert("Item approved successfully!")
}

function rejectItem(itemId, type) {
    if (type === "lostItem") {
        const lostItems = JSON.parse(localStorage.getItem("lostItems"))
        const item = lostItems.find((item) => item.id === itemId)
        if (item) {
            item.status = "rejected"
            localStorage.setItem("lostItems", JSON.stringify(lostItems))
            addNotification(`Lost item rejected: ${item.title}`, "approval")
        }
    } else if (type === "note") {
        const notes = JSON.parse(localStorage.getItem("notes"))
        const note = notes.find((note) => note.id === itemId)
        if (note) {
            note.status = "rejected"
            localStorage.setItem("notes", JSON.stringify(notes))
            addNotification(`Notes rejected: ${note.title}`, "approval")
        }
    }

    loadPendingApprovals()
    updateAdminStats()
    updateNotificationBadge()
    alert("Item rejected successfully!")
}

function deleteItem(itemId, type) {
    if (confirm("Are you sure you want to delete this item?")) {
        if (type === "lostItem") {
            const lostItems = JSON.parse(localStorage.getItem("lostItems"))
            const item = lostItems.find((item) => item.id === itemId)
            const updatedItems = lostItems.filter((item) => item.id !== itemId)
            localStorage.setItem("lostItems", JSON.stringify(updatedItems))
            addNotification(`Lost item deleted: ${item.title}`, "system")
        } else if (type === "note") {
            const notes = JSON.parse(localStorage.getItem("notes"))
            const note = notes.find((note) => note.id === itemId)
            const updatedNotes = notes.filter((note) => note.id !== itemId)
            localStorage.setItem("notes", JSON.stringify(updatedNotes))
            addNotification(`Notes deleted: ${note.title}`, "system")
        }

        loadContentManagement()
        updateAdminStats()
        alert("Item deleted successfully!")
    }
}

// Notification functions
function addNotification(message, type, itemId = null) {
    const notifications = JSON.parse(localStorage.getItem("notifications"))
    const notification = {
        id: Date.now(),
        message,
        type,
        itemId,
        timestamp: new Date().toISOString(),
        read: false,
    }

    notifications.unshift(notification)

    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.splice(50)
    }

    localStorage.setItem("notifications", JSON.stringify(notifications))
    updateNotificationBadge()
}

function updateNotificationBadge() {
    if (!isAdmin) return

    const notifications = JSON.parse(localStorage.getItem("notifications"))
    const unreadCount = notifications.filter((n) => !n.read).length

    const notificationDot = document.getElementById("adminNotificationDot")
    if (unreadCount > 0) {
        notificationDot.style.display = "block"
    } else {
        notificationDot.style.display = "none"
    }
}

function showNotifications() {
    const notifications = JSON.parse(localStorage.getItem("notifications"))
    const modal = document.getElementById("notificationModal")
    const list = document.getElementById("notificationList")

    list.innerHTML = ""

    if (notifications.length === 0) {
        list.innerHTML = "<p class='text-center'>No notifications</p>"
    } else {
        notifications.slice(0, 10).forEach((notification) => {
            const item = document.createElement("div")
            item.className = `activity-item ${!notification.read ? "unread" : ""}`
            item.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${notification.message}</div>
                    <div class="activity-time">${formatTimeAgo(notification.timestamp)}</div>
                </div>
            `
            list.appendChild(item)
        })
    }

    // Mark all as read
    notifications.forEach((n) => (n.read = true))
    localStorage.setItem("notifications", JSON.stringify(notifications))
    updateNotificationBadge()

    modal.style.display = "block"
}

function loadRecentNotifications() {
    const notifications = JSON.parse(localStorage.getItem("notifications"))
    const container = document.getElementById("recentNotifications")

    container.innerHTML = ""

    if (notifications.length === 0) {
        container.innerHTML = "<p class='text-center'>No recent activity</p>"
        return
    }

    notifications.slice(0, 5).forEach((notification) => {
        const item = document.createElement("div")
        item.className = "activity-item"
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${notification.message}</div>
                <div class="activity-time">${formatTimeAgo(notification.timestamp)}</div>
            </div>
        `
        container.appendChild(item)
    })
}

function getNotificationIcon(type) {
    switch (type) {
        case "lost-found":
            return "search-location"
        case "notes":
            return "graduation-cap"
        case "user":
            return "user"
        case "approval":
            return "check-circle"
        case "system":
            return "cog"
        default:
            return "bell"
    }
}

function formatTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Helper functions to create cards
function createItemCard(item, type) {
    const card = document.createElement("div")
    card.className = "item-card"

    let cardContent = ""

    if (type === "lost") {
        cardContent = `
            <div class="item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-image fa-3x"></i>'}
            </div>
            <div class="item-content">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-meta">
                    <span>📍 ${item.location}</span>
                    <span>📅 ${new Date(item.datePosted).toLocaleDateString()}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-sm" onclick="contactUser('${item.userContact}', '${item.userName}')">
                        <i class="fas fa-phone"></i> Contact
                    </button>
                </div>
            </div>
        `
    } else if (type === "marketplace") {
        cardContent = `
            <div class="item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-image fa-3x"></i>'}
            </div>
            <div class="item-content">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price">₹${item.price}</div>
                <div class="item-meta">
                    <span>👤 ${item.userName}</span>
                    <span>📅 ${new Date(item.datePosted).toLocaleDateString()}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-sm" onclick="contactUser('${item.contact}', '${item.userName}')">
                        <i class="fas fa-phone"></i> Contact Seller
                    </button>
                </div>
            </div>
        `
    } else if (type === "notes") {
        cardContent = `
            <div class="item-image">
                <i class="fas fa-file-pdf fa-3x"></i>
            </div>
            <div class="item-content">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description || "No description provided"}</div>
                <div class="item-meta">
                    <span>📚 ${item.subject}</span>
                    <span>🎓 Semester ${item.semester}</span>
                    <span>👤 ${item.userName}</span>
                    <span>📅 ${new Date(item.dateUploaded).toLocaleDateString()}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-sm" onclick="downloadFile('${item.fileUrl}', '${item.fileName}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `
    }

    card.innerHTML = cardContent
    return card
}

function createApprovalCard(item, type) {
    const card = document.createElement("div")
    card.className = "approval-item"

    let cardContent = ""

    if (type === "lostItem") {
        cardContent = `
            <div class="approval-header">
                <div class="approval-info">
                    <h4>${item.title}</h4>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Posted by:</strong> ${item.userName}</p>
                    <p><strong>Date:</strong> ${new Date(item.datePosted).toLocaleDateString()}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-success btn-sm" onclick="approveItem(${item.id}, 'lostItem')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectItem(${item.id}, 'lostItem')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `
    } else if (type === "note") {
        cardContent = `
            <div class="approval-header">
                <div class="approval-info">
                    <h4>${item.title}</h4>
                    <p><strong>Subject:</strong> ${item.subject}</p>
                    <p><strong>Semester:</strong> ${item.semester}</p>
                    <p><strong>Description:</strong> ${item.description || "No description"}</p>
                    <p><strong>Uploaded by:</strong> ${item.userName}</p>
                    <p><strong>Date:</strong> ${new Date(item.dateUploaded).toLocaleDateString()}</p>
                    <p><strong>File:</strong> ${item.fileName}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-success btn-sm" onclick="approveItem(${item.id}, 'note')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectItem(${item.id}, 'note')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `
    }

    card.innerHTML = cardContent
    return card
}

function createContentCard(item, type) {
    const card = document.createElement("div")
    card.className = "approval-item"

    let statusBadge = ""
    if (item.status === "pending") {
        statusBadge = '<span class="status-badge status-pending">Pending</span>'
    } else if (item.status === "approved") {
        statusBadge = '<span class="status-badge status-approved">Approved</span>'
    } else if (item.status === "rejected") {
        statusBadge = '<span class="status-badge status-rejected">Rejected</span>'
    }

    let cardContent = ""

    if (type === "lostItem") {
        cardContent = `
            <div class="approval-header">
                <div class="approval-info">
                    <h4>${item.title} ${statusBadge}</h4>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Posted by:</strong> ${item.userName}</p>
                    <p><strong>Date:</strong> ${new Date(item.datePosted).toLocaleDateString()}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id}, 'lostItem')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
    } else if (type === "note") {
        cardContent = `
            <div class="approval-header">
                <div class="approval-info">
                    <h4>${item.title} ${statusBadge}</h4>
                    <p><strong>Subject:</strong> ${item.subject}</p>
                    <p><strong>Semester:</strong> ${item.semester}</p>
                    <p><strong>Description:</strong> ${item.description || "No description"}</p>
                    <p><strong>Uploaded by:</strong> ${item.userName}</p>
                    <p><strong>Date:</strong> ${new Date(item.dateUploaded).toLocaleDateString()}</p>
                    <p><strong>File:</strong> ${item.fileName}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id}, 'note')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
    }

    card.innerHTML = cardContent
    return card
}

// Utility functions
function contactUser(contact, userName) {
    alert(`Contact ${userName} at: ${contact}`)
}

function downloadFile(fileUrl, fileName) {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Initialize sample data
function initializeSampleData() {
    // Add sample lost items
    const lostItems = JSON.parse(localStorage.getItem("lostItems"))
    if (lostItems.length === 0) {
        const sampleLostItems = [
            {
                id: 1,
                title: "Blue Backpack",
                description: "Navy blue backpack with laptop compartment. Contains important documents.",
                location: "Library - 2nd Floor",
                userId: 1,
                userName: "John Doe",
                userContact: "1234567890",
                status: "approved",
                datePosted: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                image: null,
            },
            {
                id: 2,
                title: "iPhone 12",
                description: "Black iPhone 12 with cracked screen protector. Has a blue case.",
                location: "Cafeteria",
                userId: 2,
                userName: "Jane Smith",
                userContact: "0987654321",
                status: "approved",
                datePosted: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                image: null,
            },
        ]
        localStorage.setItem("lostItems", JSON.stringify(sampleLostItems))
    }

    // Add sample marketplace items
    const marketplaceItems = JSON.parse(localStorage.getItem("marketplaceItems"))
    if (marketplaceItems.length === 0) {
        const sampleMarketplaceItems = [
            {
                id: 1,
                title: "Physics Textbook",
                description: "University Physics 14th Edition. Good condition, minimal highlighting.",
                price: 2500,
                contact: "john@example.com",
                userId: 1,
                userName: "John Doe",
                datePosted: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                image: null,
            },
            {
                id: 2,
                title: "Scientific Calculator",
                description: "Casio FX-991ES Plus. Perfect working condition.",
                price: 800,
                contact: "jane@example.com",
                userId: 2,
                userName: "Jane Smith",
                datePosted: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                image: null,
            },
        ]
        localStorage.setItem("marketplaceItems", JSON.stringify(sampleMarketplaceItems))
    }

    // Add sample notes
    const notes = JSON.parse(localStorage.getItem("notes"))
    if (notes.length === 0) {
        const sampleNotes = [
            {
                id: 1,
                title: "Data Structures Complete Notes",
                subject: "Computer Science",
                semester: "3",
                description: "Comprehensive notes covering all topics including arrays, linked lists, trees, and graphs.",
                userId: 1,
                userName: "John Doe",
                status: "approved",
                dateUploaded: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
                fileName: "data-structures-notes.pdf",
                fileSize: 2048000,
                fileUrl: "#",
            },
            {
                id: 2,
                title: "Calculus Formula Sheet",
                subject: "Mathematics",
                semester: "1",
                description: "Quick reference sheet for all important calculus formulas.",
                userId: 2,
                userName: "Jane Smith",
                status: "approved",
                dateUploaded: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
                fileName: "calculus-formulas.pdf",
                fileSize: 512000,
                fileUrl: "#",
            },
        ]
        localStorage.setItem("notes", JSON.stringify(sampleNotes))
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    })
})

// Add loading states to buttons
function addLoadingState(button) {
    const originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
    button.disabled = true

    setTimeout(() => {
        button.innerHTML = originalText
        button.disabled = false
    }, 1000)
}

// Add click handlers for buttons that need loading states
document.addEventListener("click", (e) => {
    if (e.target.matches(".btn-primary") && e.target.type === "submit") {
        addLoadingState(e.target)
    }
})
