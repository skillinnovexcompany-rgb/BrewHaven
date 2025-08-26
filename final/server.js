const express = require("express");
const session = require("express-session");
const path = require("path");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // ✅ For unique Order ID

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
    secret: "BrewHavenKeysix",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MongoDB Connection
const uri = "mongodb+srv://skillinnovexcompany:pNhAgafvgkb36P2K@cluster0.pie4x6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let collection;
async function mongo() {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected!");
        const database = client.db("BrewHaven");
        collection = database.collection("Users");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed", err);
    }
}
mongo();

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html")); // first page = login/register
});

app.get("/cafe", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "cafe.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/order", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "order.html"));
    } else {
        res.redirect("/");
    }
});
// Register API
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await collection.findOne({ email });
    if (user) {
        return res.json({ success: false, message: "User already exists" });
    }
    await collection.insertOne({ name, email, password, orders: [] });
    req.session.user = { name, email };
    res.json({ success: true });
});

// Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await collection.findOne({ email, password });
    if (!user) {
        return res.json({ success: false, message: "Invalid email or password" });
    }
    req.session.user = { name: user.name, email: user.email };
    res.json({ success: true });
});

// ✅ Checkout API with Order ID + Status
app.post("/checkout", async (req, res) => {
    if (!req.session.user) {
        return res.json({ success: false, message: "Not logged in" });
    }

    const { cart } = req.body;
    if (!cart || cart.length === 0) {
        return res.json({ success: false, message: "Cart is empty" });
    }

    try {
        const orderId = uuidv4(); // Unique Order ID
        const order = {
            orderId,
            items: cart,
            date: new Date(),
            status: "Out for Delivery"  // Default status
        };

        await collection.updateOne(
            { email: req.session.user.email },
            { $push: { orders: order } }
        );

        res.json({ success: true, message: "Order placed successfully!", orderId });
    } catch (err) {
        console.error("Checkout error:", err);
        res.json({ success: false, message: "Error placing order" });
    }
});

// ✅ API to view all orders of logged in user
app.get("/orders", async (req, res) => {
    if (!req.session.user) {
        return res.json({ success: false, message: "Not logged in" });
    }

    try {
        const user = await collection.findOne(
            { email: req.session.user.email },
            { projection: { orders: 1, _id: 0 } } // Only return orders
        );

        if (!user || !user.orders) {
            return res.json({ success: true, orders: [] });
        }

        res.json({ success: true, orders: user.orders });
    } catch (err) {
        console.error("❌ Error fetching orders:", err);
        res.json({ success: false, message: "Error fetching orders" });
    }
});



// ✅ API to mark order as Delivered
app.post("/deliver/:orderId", async (req, res) => {
    if (!req.session.user) {
        return res.json({ success: false, message: "Not logged in" });
    }

    const { orderId } = req.params;

    try {
        await collection.updateOne(
            { email: req.session.user.email, "orders.orderId": orderId },
            { $set: { "orders.$.status": "Delivered" } }
        );

        res.json({ success: true, message: "Order marked as Delivered" });
    } catch (err) {
        console.error("Delivery update error:", err);
        res.json({ success: false, message: "Error updating order status" });
    }
});






// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
